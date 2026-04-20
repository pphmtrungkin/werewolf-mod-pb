import { useMemo, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { useContext } from "react";
import UserContext from "../components/UserContext";
import useGameState from "../hooks/useGameState";
import GameAdmin from "../components/GameAdmin";

export default function Game() {
  const { lobbyId } = useParams();
  const { user } = useContext(UserContext);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Moderator workflow state (UI-only; persistence requires backend support)
  const [modModeEnabled, setModModeEnabled] = useState(false);
  const [modCardIndex, setModCardIndex] = useState(0);
  const [modAssignments, setModAssignments] = useState({}); // { [roleTitleLower]: { holderId: string|null, targetId: string|null } }

  const {
    lobby,
    game,
    players,
    loading,
    error,
    currentPlayer,
    canAct,
    selectablePlayers,
    phaseDescription,
    timeRemaining,
    playersInActionOrder,
    currentActivePlayer,
    hasPlayerActed,
    getRoleActions,
    submitAction,
  } = useGameState(lobbyId, user);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  const handleConfirmAction = async () => {
    if (!selectedPlayer || !canAct) return;

    try {
      await submitAction(selectedPlayer);
      setSelectedPlayer(null);
    } catch (err) {
      console.error("Failed to submit action:", err);
    }
  };

  const isModerator = useMemo(() => {
    // Best-effort moderator detection. If your lobby/game schema differs, adjust these checks.
    if (!user) return false;
    if (lobby?.moderator && user?.id && lobby.moderator === user.id) return true;
    if (game?.moderator && user?.id && game.moderator === user.id) return true;
    if (user?.role && String(user.role).toLowerCase() === "moderator") return true;
    return false;
  }, [user, lobby?.moderator, game?.moderator]);

  const rolesInGame = useMemo(() => {
    // Derive a stable list of "cards" from the roles currently assigned to players.
    // Sorted using the already-computed action order so moderators walk in night resolution order.
    const seen = new Set();
    const orderedRoles = [];

    (playersInActionOrder || []).forEach((p) => {
      const role = (p?.role || "Villager").trim();
      const key = role.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        orderedRoles.push({ title: role, key });
      }
    });

    // Ensure "Villager" appears last if present (usually has no actionable targeting).
    const villagersIndex = orderedRoles.findIndex((r) => r.key === "villager");
    if (villagersIndex >= 0 && villagersIndex !== orderedRoles.length - 1) {
      const [villagerRole] = orderedRoles.splice(villagersIndex, 1);
      orderedRoles.push(villagerRole);
    }

    return orderedRoles;
  }, [playersInActionOrder]);

  const currentModRole = rolesInGame[modCardIndex] || null;

  const getPlayerName = (id) => {
    const p = players.find((x) => x.id === id);
    return p?.player || "Unknown";
  };

  const setModHolder = (roleKey, holderId) => {
    setModAssignments((prev) => ({
      ...prev,
      [roleKey]: {
        holderId: holderId || null,
        targetId: prev?.[roleKey]?.targetId || null,
      },
    }));
  };

  const setModTarget = (roleKey, targetId) => {
    setModAssignments((prev) => ({
      ...prev,
      [roleKey]: {
        holderId: prev?.[roleKey]?.holderId || null,
        targetId: targetId || null,
      },
    }));
  };

  const modNextCard = () => {
    setModCardIndex((i) => Math.min(i + 1, Math.max(rolesInGame.length - 1, 0)));
  };

  const modPrevCard = () => {
    setModCardIndex((i) => Math.max(i - 1, 0));
  };

  const modJumpToFirstIncomplete = () => {
    const idx = rolesInGame.findIndex((r) => {
      const a = modAssignments[r.key];
      // Consider complete if holder chosen; target optional for roles that don't need it
      return !a?.holderId;
    });
    if (idx >= 0) setModCardIndex(idx);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const modProgress = useMemo(() => {
    if (!rolesInGame.length) return { complete: 0, total: 0 };
    const complete = rolesInGame.reduce((acc, r) => {
      const a = modAssignments[r.key];
      return acc + (a?.holderId ? 1 : 0);
    }, 0);
    return { complete, total: rolesInGame.length };
  }, [rolesInGame, modAssignments]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="my-20 mx-auto max-w-3xl">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const hasCurrentPlayerActed =
    currentPlayer && hasPlayerActed(currentPlayer.id, game?.phase, game?.current_night);

  return (
    <Box className="mx-auto max-w-4xl my-10" sx={{ px: 2 }}>
      {/* Game Status Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {lobby?.name} - Night {game?.current_night || 1}
        </Typography>

        {/* Phase Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {phaseDescription}
          </Typography>

          {game?.phase === "voting" && timeRemaining > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Time remaining: {formatTime(timeRemaining)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, (timeRemaining / 300) * 100))}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Moderator: card-by-card assignment workflow */}
        {isModerator && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Moderator Tools</Typography>
              <Button
                variant={modModeEnabled ? "contained" : "outlined"}
                color="secondary"
                onClick={() => {
                  setModModeEnabled((v) => !v);
                  setSelectedPlayer(null);
                }}
              >
                {modModeEnabled ? "Exit Moderator Card Entry" : "Enter Moderator Card Entry"}
              </Button>
            </Stack>

            {modModeEnabled && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                {rolesInGame.length === 0 ? (
                  <Alert severity="info">
                    No roles detected yet. Start the game / assign roles first so I can build the
                    card list.
                  </Alert>
                ) : (
                  <>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography variant="subtitle1">
                          Card {modCardIndex + 1} of {rolesInGame.length}:{" "}
                          <strong>{currentModRole?.title}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Progress: {modProgress.complete}/{modProgress.total} cards assigned
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button variant="outlined" onClick={modJumpToFirstIncomplete}>
                          First Incomplete
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={modPrevCard}
                          disabled={modCardIndex === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="contained"
                          onClick={modNextCard}
                          disabled={modCardIndex >= rolesInGame.length - 1}
                        >
                          Next
                        </Button>
                      </Stack>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel id="mod-holder-label">Who has this card?</InputLabel>
                        <Select
                          labelId="mod-holder-label"
                          label="Who has this card?"
                          value={modAssignments[currentModRole.key]?.holderId || ""}
                          onChange={(e) => setModHolder(currentModRole.key, e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Unassigned</em>
                          </MenuItem>
                          {players.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.player}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel id="mod-target-label">Target (optional)</InputLabel>
                        <Select
                          labelId="mod-target-label"
                          label="Target (optional)"
                          value={modAssignments[currentModRole.key]?.targetId || ""}
                          onChange={(e) => setModTarget(currentModRole.key, e.target.value)}
                          disabled={!modAssignments[currentModRole.key]?.holderId}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {players
                            .filter((p) => p.id !== modAssignments[currentModRole.key]?.holderId)
                            .map((p) => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.player}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <Alert severity="warning">
                        This moderator entry is currently <strong>UI-only</strong> and does not get
                        saved to the server yet. To persist it, the backend needs a place to store
                        “card holder” and “target” per night/phase (e.g. a dedicated collection or
                        writing to <code>games_actions</code> with a moderator actor).
                      </Alert>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      Summary (this night)
                    </Typography>
                    <List dense>
                      {rolesInGame.map((r) => {
                        const a = modAssignments[r.key];
                        const holder = a?.holderId ? getPlayerName(a.holderId) : "—";
                        const target = a?.targetId ? getPlayerName(a.targetId) : "—";
                        return (
                          <ListItem key={r.key} divider>
                            <ListItemText
                              primary={`${r.title}`}
                              secondary={`Holder: ${holder} • Target: ${target}`}
                            />
                            <Chip
                              size="small"
                              label={a?.holderId ? "Assigned" : "Unassigned"}
                              color={a?.holderId ? "success" : "default"}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </>
                )}
              </Paper>
            )}
          </Box>
        )}

        {/* Player Role Info */}
        {currentPlayer && (
          <Box>
            <Typography variant="h6">Your Role</Typography>
            <Chip label={currentPlayer.role || "Villager"} color="primary" sx={{ mb: 2 }} />

            {game?.phase === "night" && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Available Actions: {getRoleActions(currentPlayer.role).join(", ")}
                </Typography>
                {hasCurrentPlayerActed && (
                  <Chip label="Action Complete" color="success" size="small" sx={{ mt: 1 }} />
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Night Phase Action Order */}
      {game?.phase === "night" && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" component="h2" mb={2}>
            Night Phase Progress
          </Typography>
          <List dense>
            {playersInActionOrder.map((player) => {
              const hasPlayerCompleted = hasPlayerActed(player.id, "night", game?.current_night);
              const isCurrentTurn = currentActivePlayer?.id === player.id;

              return (
                <ListItem key={player.id}>
                  <ListItemText
                    primary={`${player.player} (${player.role || "Villager"})`}
                    secondary={isCurrentTurn ? "Current turn" : ""}
                  />
                  <Chip
                    label={hasPlayerCompleted ? "Complete" : "Waiting"}
                    color={hasPlayerCompleted ? "success" : isCurrentTurn ? "warning" : "default"}
                    size="small"
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}

      {/* Player Selection */}
      {canAct && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" mb={2}>
            {game?.phase === "voting" ? "Vote to Eliminate" : "Select Target"}
          </Typography>

          {!hasCurrentPlayerActed ? (
            <>
              <List>
                {selectablePlayers.map((p) => (
                  <ListItem
                    key={p.id}
                    divider
                    button
                    selected={selectedPlayer && selectedPlayer.id === p.id}
                    onClick={() => handlePlayerSelect(p)}
                  >
                    <ListItemText
                      primary={p.player}
                      secondary={game?.phase === "voting" ? `Role: ${p.role || "Villager"}` : ""}
                    />
                  </ListItem>
                ))}
              </List>

              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirmAction}
                  disabled={!selectedPlayer}
                >
                  {game?.phase === "voting" ? "Cast Vote" : "Confirm Action"}
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="success">
              Your {game?.phase === "voting" ? "vote has been cast" : "night action is complete"}.
              Waiting for other players...
            </Alert>
          )}
        </Paper>
      )}

      {/* Observer Mode */}
      {!canAct && game?.phase !== "waiting" && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" mb={2}>
            Players
          </Typography>
          <List>
            {players.map((p) => (
              <ListItem key={p.id} divider>
                <ListItemText primary={p.player} secondary={`Role: ${p.role || "Villager"}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Game Admin Panel (for development/testing) */}
      <GameAdmin lobbyId={lobbyId} user={user} />

      {/* Game Actions (for testing/admin) */}
      {game?.phase === "waiting" && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" mb={2}>
            Game Controls
          </Typography>
          <Alert severity="info">
            Game is waiting to start. Host can begin the first night phase when ready.
          </Alert>
        </Paper>
      )}
    </Box>
  );
}
