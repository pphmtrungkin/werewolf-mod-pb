# Werewolf Moderator — Project Context

## Stack
- **FE**: React 19, Vite 6, TailwindCSS 4, MUI 6, react-router 7
- **BE**: PocketBase 0.26 (Go binary in `pocketbase/`)
- **Auth**: PB email/password + OTP, JWT auto-refresh every 2 min
- **Testing**: Vitest + jsdom

## Directory structure
```
src/
  main.jsx            — Router setup
  pocketbase.js       — PB client singleton (baseUrl: VITE_POCKETBASE_URL)
  app/                — Route-level page components
    Game.jsx            — Pre-game lobby (join code, player list)
    GameProgress.jsx    — In-progress game view (moderator card entry, night/vote UI)
    SetUp.jsx           — Deck builder, card selection, timer config
    JoinGame.jsx        — Join via room code
    Welcome.jsx         — Landing page
    Account.jsx         — Profile/password settings
    auth/               — Login, SignUp, OTP
  components/         — Shared UI
    GameAdmin.jsx       — Phase management panel (start night, day, voting, resolve)
    Nav.jsx             — Top bar with theme toggle + profile
    Card.jsx            — Role card with PB file image
    UserContext.jsx     — Auth state (register, login, OTP verify, logout)
    ThemeContext.jsx    — Dark/light via CSS vars + MUI theme
    ErrorContext.jsx    — Error queue → Toast/Snackbar
  hooks/
    useGameState.js     — Game data, moderator_entries, phase mgmt
    useGames.js         — Create/join/leave game
    useDecks.js         — Fetch user decks, selected deck state
    useSelectedCards.js — Card select/unselect for deck building
    useCards.js         — All role cards
    useSides.js         — All factions
    useJoinedPlayers.js — Players in a game
  services/
    pbService.js        — All PB CRUD + custom endpoint wrappers
pocketbase/
  pocketbase            — Go binary (run: ./pocketbase serve)
  pb_migrations/        — Schema versioning (JS, not linted)
  pb_hooks/             — Custom API endpoints (JS, not linted)
```

## Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Welcome | Landing page |
| `/auth/login` | Login | Email/password + OTP |
| `/auth/signup` | SignUp | Registration |
| `/auth/otp` | OTP | Verify OTP code |
| `/setup` | SetUp (with Nav) | Deck builder |
| `/account` | Account (with Nav) | Profile settings |
| `/joinGame` | JoinGame | Enter room code |
| `/game/:gameId` | Game (lobby) | Pre-game: show code, player list, start |
| `/game/:gameId/play` | GameProgress | In-progress: moderator tools, phase UI |

## PocketBase Collections

### `games` (pbc_1618490516)
Fields: `id, code, ip_prefix, ip_address, name, status, deck, moderator, current_day, current_night, phase, phase_timer, created, updated`
- `status`: "waiting" | "in_progress" | "completed"
- `phase`: "waiting" | "night" | "day" | "voting" | "completed"
- `phase_timer`: ISO date for voting countdown

### `game_players` (pbc_2655066279)
Fields: `id, game, player, connected, alive, ip_prefix, ip_address, player_id, role, created, updated`
- `player`: display name (text)
- `role`: role title assigned by moderator
- `connected`: heartbeat status
- `alive`: player status

### `moderator_entries` (pbc_2808137583) — SOURCE OF TRUTH
Fields: `id, game, night_number, phase, role_key, holder, target, action_type, created, updated`
- `phase`: "night" | "voting"
- `role_key`: lowercase role name (e.g. "werewolf", "seer")
- `holder` → `game_players`: the player who has this role
- `target` → `game_players`: the player targeted
- `action_type`: free text (e.g. "kill", "protect", "view", "vote")
- Uniqueness: one entry per (game, night_number, phase, role_key) via `upsertModeratorEntry`

### `cards` (pbc_3481593366)
Fields: `id, title, side, score, card_limit, description, img, number_of_targets, actions, card_order`
- `side` → `sides`
- `actions`: JSON array of action types

### Other collections
- `sides`: faction definitions (name, hex_color)
- `decks`: named card sets (number_of_players, timer, owner)
- `decks_cards`: join table between decks and cards
- `games_actions`: **legacy** — do not use for new features

## Key Code Patterns

### pbService.js — always use this, never raw `pb.collection()`
```js
import pbService from "../services/pbService";
await pbService.getGameById(id, { expand: "deck" });
await pbService.getGamePlayers(gameId);
await pbService.upsertModeratorEntry({ game, night_number, phase, role_key, holder, target, action_type });
await pbService.startNightPhase(gameId, nightNumber);
await pbService.startVotingPhase(gameId);  // sets 5-min timer
```

### useGameState(gameId, user) — central game hook
Returns: `{ game, players, actions (entries), cards, loading, error, currentPlayer, canAct, phaseDescription, timeRemaining, playersInActionOrder, currentActivePlayer, getPlayerById, getRoleActions, hasPlayerActed, submitNightEntry, submitVote, submitAction, startGame, advancePhase, refresh }`
- `actions` = `moderator_entries` for current game+night
- `hasPlayerActed(playerId, phase, nightNumber)` checks entries
- `submitNightEntry(roleKey, holderId, targetId)` persists via upsert
- Phase flow: `startGame()` → night → `advancePhase()` → day → `advancePhase()` → voting → `advancePhase()` → next night

### Moderator UI pattern
```jsx
const isModerator = game?.moderator === user?.id;
{isModerator && <ModeratorTools />}
```

### Real-time subscriptions
Subscribe in `useGameState` via `pbService.subscribeGame` + `pbService.subscribeModeratorEntries`. Unsubscribe on cleanup.

### Game flow
1. SetUp → Host Game (`/api/createGame`) → navigates to `/game/:gameId`
2. Players join with room code (POST `/api/joinGame`)
3. Moderator clicks Start → status=in_progress, night 1 → navigates to `/game/:gameId/play`
4. Moderator walks roles in action order, assigns holder+target → Save Entry persists to `moderator_entries`
5. Phase advances: night → day → voting (timer) → next night

### Styling
- TailwindCSS utility classes + MUI components (prefer MUI `sx` for complex styling)
- CSS custom properties: `--text`, `--background`, `--primary`, `--secondary`, `--accent` (synced from ThemeContext)

### Linting
- ESLint flat config (`eslint.config.js`): double quotes, 2-space indent, semicolons, trailing commas
- Run: `npx eslint . --report-unused-disable-directives --max-warnings 0`
- No `console.log` allowed (warn-only for `console.warn`/`console.error`)
