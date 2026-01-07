import { useState } from "react";
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
} from "@mui/material";
import { useContext } from "react";
import UserContext from "../components/UserContext";
import useGameState from "../hooks/useGameState";
import GameAdmin from "../components/GameAdmin";

export default function Game() {
  const { lobbyId } = useParams();
  const { user } = useContext(UserContext);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const {
    lobby,
    game,
    players,
    actions,
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

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
