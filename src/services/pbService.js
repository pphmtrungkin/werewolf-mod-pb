import pb from "../pocketbase";

/**

 * Cards Service

 */

export async function getCards() {
  // returns an array of records

  const items = await pb.collection("cards").getFullList({ sort: "+card_order" });

  return items;
}

/**

 * Sides Service

 */

export async function getSides() {
  const items = await pb.collection("sides").getFullList({ sort: "hex_color" });

  return items;
}

/**

 * Decks Service

 */

export async function getDeck(userId) {
  return pb.collection("decks").getFullList({ filter: `owner = "${userId}"` });
}

export async function createDeck(data) {
  // data should contain at least: { name, owner, number_of_players?, timer? }
  return pb.collection("decks").create(data);
}

export async function getSelectedCards(deckId) {
  const items = await pb.collection("decks_cards").getFullList({
    filter: `deck = "${deckId}"`,

    expand: "card",
  });

  return items.map((item) => item.expand.card);
}

export async function deleteSelectedCard(deckId, cardId) {
  const items = await pb.collection("decks_cards").getFullList({
    filter: `deck = "${deckId}" && card = "${cardId}"`,
  });

  if (items.length > 0) {
    await pb.collection("decks_cards").delete(items[0].id);
  }
}

export async function addSelectedCard(deckId, cardId) {
  const record = await pb.collection("decks_cards").create({
    deck: deckId,

    card: cardId,
  });

  return record;
}

/**

 * Users Service

 */

export async function registerUser(data) {
  return pb.collection("users").create(data);
}

export async function loginUser(email, password) {
  return pb.collection("users").authWithPassword(email, password);
}

export async function requestOTP(email) {
  return pb.collection("users").requestOTP(email);
}

export async function authWithOTP(otpId, code, options) {
  return pb.collection("users").authWithOTP(otpId, code, options);
}

export async function refreshAuthToken() {
  return pb.collection("users").authRefresh();
}

export async function getUserProfile(userId) {
  return pb.collection("users").getOne(userId);
}

export async function updateUserProfile(userId, data) {
  return pb.collection("users").update(userId, data);
}

/**

 * Lobbies Service

 */

export async function getWaitingGames() {
  return pb.collection("games").getFullList({
    filter: 'status = "waiting"',
  });
}

export async function getGameById(gameId, options = {}) {
  return pb.collection("games").getOne(gameId, options);
}

/**

 * Players Service
 */
export async function getGamePlayers(gameId, options = {}) {
  return pb.collection("game_players").getFullList({
    filter: `game = "${gameId}"`,

    ...options,
  });
}

export async function createGamePlayer(data) {
  return pb.collection("game_players").create(data);
}

export async function deleteGamePlayer(playerId) {
  return pb.collection("game_players").delete(playerId);
}

export function subscribeGamePlayers(callback) {
  // Subscribe to all records, caller filters by game in the handler.
  return pb.collection("game_players").subscribe("*", callback);
}

export function unsubscribeGamePlayers() {
  return pb.collection("game_players").unsubscribe("*");
}

export function updateGamePlayer(playerId, data) {
  return pb.collection("game_players").update(playerId, data);
}

/**

 * Moderator Entries Service
 *
 * Moderator is the only source of truth: this replaces using games_actions for night/vote inputs.
 *
 * Expected moderator_entries fields (PocketBase):
 * - game (relation -> games)
 * - night_number (number)
 * - phase (text; e.g. "night" | "voting" | "day")
 * - role_key (text; e.g. "seer", "werewolf")
 * - holder (relation -> game_players or users, depending on your schema)
 * - target (relation -> game_players or users; optional)
 * - action_type (text; optional, if you want to record "kill", "peek", "vote", etc.)
 * - created_by (relation -> users; optional)
 */

export async function createModeratorEntry(data) {
  return pb.collection("moderator_entries").create(data);
}

export async function updateModeratorEntry(entryId, data) {
  return pb.collection("moderator_entries").update(entryId, data);
}

export async function deleteModeratorEntry(entryId) {
  return pb.collection("moderator_entries").delete(entryId);
}

export async function getModeratorEntriesByGame(gameId, options = {}) {
  return pb.collection("moderator_entries").getFullList({
    filter: `game = "${gameId}"`,
    ...options,
  });
}

export async function getModeratorEntriesByGameAndNight(gameId, nightNumber, options = {}) {
  return pb.collection("moderator_entries").getFullList({
    filter: `game = "${gameId}" && night_number = ${nightNumber}`,
    ...options,
  });
}

export async function getModeratorEntriesByGameNightAndPhase(
  gameId,
  nightNumber,
  phase,
  options = {},
) {
  return pb.collection("moderator_entries").getFullList({
    filter: `game = "${gameId}" && night_number = ${nightNumber} && phase = "${phase}"`,
    ...options,
  });
}

/**
 * Upsert helper: ensures one entry per (game, night_number, phase, role_key).
 * If you want different uniqueness (e.g. one per holder), adjust this filter.
 */
export async function upsertModeratorEntry({
  game,
  night_number,
  phase,
  role_key,
  holder = null,
  target = null,
  action_type = null,
  created_by = null,
  ...rest
}) {
  const roleKey = String(role_key || "").toLowerCase();

  const existing = await pb.collection("moderator_entries").getFullList({
    filter: `game = "${game}" && night_number = ${night_number} && phase = "${phase}" && role_key = "${roleKey}"`,
    perPage: 1,
  });

  const payload = {
    game,
    night_number,
    phase,
    role_key: roleKey,
    holder,
    target,
    action_type,
    created_by,
    ...rest,
  };

  if (existing && existing.length > 0) {
    return pb.collection("moderator_entries").update(existing[0].id, payload);
  }

  return pb.collection("moderator_entries").create(payload);
}

export function subscribeModeratorEntries(gameId, callback) {
  return pb.collection("moderator_entries").subscribe("*", (e) => {
    const record = e?.record;
    if (record && record.game === gameId) {
      callback(e);
    }
  });
}

export function unsubscribeModeratorEntries() {
  return pb.collection("moderator_entries").unsubscribe("*");
}

/**

 * Game Actions Service (legacy)
 *
 * This is kept temporarily for compatibility but should be removed
 * once all callers are migrated to moderator_entries.
 */

export async function createGameAction(data) {
  return pb.collection("games_actions").create(data);
}

export async function getGameActionsByGame(gameId, options = {}) {
  return pb.collection("games_actions").getFullList({
    filter: `game = "${gameId}"`,

    ...options,
  });
}

export async function getGameActionsByGameAndNight(gameId, nightNumber, options = {}) {
  return pb.collection("games_actions").getFullList({
    filter: `game = "${gameId}" && night_number = ${nightNumber}`,

    ...options,
  });
}

export async function deleteGameAction(actionId) {
  return pb.collection("games_actions").delete(actionId);
}

export function subscribeGameActions(gameId, callback) {
  return pb.collection("games_actions").subscribe("*", (e) => {
    const record = e?.record;

    if (record && record.game === gameId) {
      callback(e);
    }
  });
}

export function unsubscribeGameActions() {
  return pb.collection("games_actions").unsubscribe("*");
}

/**

 * Games Service

 */

export async function getGameByLobby(lobbyId, options = {}) {
  return pb

    .collection("games")

    .getFullList({
      filter: `name = "${lobbyId}"`,

      ...options,
    })

    .then((games) => games[0] || null);
}

export async function createGame(gameId, deckId, moderatorId) {
  const result = await fetch("/api/createGame", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: gameId,
      deck: deckId,
      moderator: moderatorId,
    }),
  });

  return result.json();
}

export async function updateGame(gameId, data) {
  return pb.collection("games").update(gameId, data);
}

export async function deleteGame(gameId) {
  return pb.collection("games").delete(gameId);
}

export function subscribeGame(gameId, callback) {
  return pb.collection("games").subscribe(gameId, callback);
}

export function unsubscribeGame(gameId) {
  return pb.collection("games").unsubscribe(gameId);
}

/**

 * Game Phase Management

 */

export async function startNightPhase(gameId, nightNumber) {
  const phaseTimer = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  return pb.collection("games").update(gameId, {
    phase: "night",

    current_night: nightNumber,

    phase_timer: phaseTimer.toISOString(),
  });
}

export async function startVotingPhase(gameId) {
  const phaseTimer = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  return pb.collection("games").update(gameId, {
    phase: "voting",

    phase_timer: phaseTimer.toISOString(),
  });
}

export async function startDayPhase(gameId) {
  return pb.collection("games").update(gameId, {
    phase: "day",

    phase_timer: null,
  });
}

export async function advanceToNextNight(gameId, currentNight) {
  return startNightPhase(gameId, (currentNight || 0) + 1);
}

export async function endGame(gameId, winner) {
  return pb.collection("games").update(gameId, {
    phase: "completed",

    phase_timer: null,
  });
}

/**

 * Helper function to get base URL for file URLs

 */

export function getFileUrl(collectionId, recordId, filename) {
  return `${pb.baseUrl}/api/files/${collectionId}/${recordId}/${filename}`;
}

export function updateDeck(deckId, data) {
  console.log("Updating deck");

  console.log("Deck ID and info:", deckId, data);

  return pb.collection("decks").update(deckId, data);
}

const pbService = {
  // Cards

  getCards,

  getSides,

  // Decks

  getDeck,

  createDeck,

  getSelectedCards,

  deleteSelectedCard,

  addSelectedCard,

  updateDeck,

  // Users

  registerUser,

  loginUser,

  requestOTP,

  authWithOTP,

  refreshAuthToken,

  getUserProfile,

  updateUserProfile,

  // Lobbies

  getWaitingGames,
  getGameById,

  // Players
  getGamePlayers,
  createGamePlayer,
  deleteGamePlayer,
  subscribeGamePlayers,
  unsubscribeGamePlayers,
  updateGamePlayer,
  // Games
  getGameByLobby,

  createGame,

  updateGame,

  deleteGame,
  subscribeGame,

  unsubscribeGame,

  // Moderator Entries (source of truth)

  createModeratorEntry,
  updateModeratorEntry,
  deleteModeratorEntry,
  getModeratorEntriesByGame,
  getModeratorEntriesByGameAndNight,
  getModeratorEntriesByGameNightAndPhase,
  upsertModeratorEntry,
  subscribeModeratorEntries,
  unsubscribeModeratorEntries,

  // Game Actions (legacy)

  createGameAction,

  getGameActionsByGame,

  getGameActionsByGameAndNight,

  deleteGameAction,

  subscribeGameActions,

  unsubscribeGameActions,

  // Game Phase Management

  startNightPhase,

  startVotingPhase,

  startDayPhase,

  advanceToNextNight,

  endGame,

  // Helpers

  getFileUrl,
};

export default pbService;
