import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import useGameState from "../hooks/useGameState";

export default function GameAdmin({ lobbyId, user }) {
  const {
    lobby,
    game,
    players,
    actions,
    loading,
    error,
    phaseDescription,
    timeRemaining,
    playersInActionOrder,
    currentActivePlayer,
    hasPlayerActed,
    startGame,
    advancePhase,
  } = useGameState(lobbyId, user);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography>Loading game admin...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  const handleStartGame = async () => {
    try {
      await startGame();
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  const handleAdvancePhase = async () => {
    try {
      await advancePhase();
    } catch (err) {
      console.error("Failed to advance phase:", err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const getPhaseActions = () => {
    if (!game) return { nightActions: [], votingActions: [] };

    const nightActions = actions.filter(
      (a) => a.action_type !== "vote" && a.night_number === game.current_night,
    );
    const votingActions = actions.filter(
      (a) => a.action_type === "vote" && a.night_number === game.current_night,
    );

    return { nightActions, votingActions };
  };

  const { nightActions, votingActions } = getPhaseActions();

  const allNightActionsComplete = () => {
    if (game?.phase !== "night") return false;

    const playersWithActions = playersInActionOrder.filter((player) => {
      // For simplicity, assume all players with non-villager roles have night actions
      return player.role && player.role.toLowerCase() !== "villager";
    });

    return playersWithActions.every((player) =>
      hasPlayerActed(player.id, "night", game.current_night),
    );
  };

  const allVotingComplete = () => {
    if (game?.phase !== "voting") return false;

    return players.every((player) => hasPlayerActed(player.id, "voting", game.current_night));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Game Administration
        </Typography>

        {/* Current Game State */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current State
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`Phase: ${game?.phase || "Unknown"}`}
                    color="primary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`Night: ${game?.current_night || 0}`}
                    color="secondary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {phaseDescription}
                </Typography>
                {timeRemaining > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Time remaining: {formatTime(timeRemaining)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <CardActions sx={{ p: 0, flexDirection: "column", gap: 1 }}>
                  {(!game || game?.phase === "waiting") && (
                    <Button variant="contained" color="success" onClick={handleStartGame} fullWidth>
                      Start Game (Begin Night 1)
                    </Button>
                  )}

                  {game?.phase === "night" && allNightActionsComplete() && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAdvancePhase}
                      fullWidth
                    >
                      Advance to Day Phase
                    </Button>
                  )}

                  {game?.phase === "day" && (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleAdvancePhase}
                      fullWidth
                    >
                      Start Voting Phase
                    </Button>
                  )}

                  {game?.phase === "voting" && (allVotingComplete() || timeRemaining <= 0) && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleAdvancePhase}
                      fullWidth
                    >
                      Resolve Vote & Next Night
                    </Button>
                  )}
                </CardActions>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Progress */}
        {game?.phase === "night" && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Night Phase Progress
              </Typography>
              <Grid container spacing={2}>
                {playersInActionOrder.map((player) => {
                  const hasCompleted = hasPlayerActed(player.id, "night", game.current_night);
                  const isCurrent = currentActivePlayer?.id === player.id;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={player.id}>
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: isCurrent ? "warning.main" : "grey.300",
                          borderRadius: 1,
                          backgroundColor: hasCompleted ? "success.light" : "background.paper",
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {player.player}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {player.role || "Villager"}
                        </Typography>
                        <Chip
                          label={hasCompleted ? "Complete" : isCurrent ? "Acting" : "Waiting"}
                          color={hasCompleted ? "success" : isCurrent ? "warning" : "default"}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Voting Progress */}
        {game?.phase === "voting" && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Voting Progress
              </Typography>
              <Grid container spacing={2}>
                {players.map((player) => {
                  const hasVoted = hasPlayerActed(player.id, "voting", game.current_night);
                  const vote = votingActions.find((a) => a.actor === player.id);

                  return (
                    <Grid item xs={12} sm={6} md={4} key={player.id}>
                      <Box
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: hasVoted ? "success.main" : "grey.300",
                          borderRadius: 1,
                          backgroundColor: hasVoted ? "success.light" : "background.paper",
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {player.player}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hasVoted
                            ? `Voted for: ${players.find((p) => p.id === vote?.target)?.player || "Unknown"}`
                            : "Not voted"}
                        </Typography>
                        <Chip
                          label={hasVoted ? "Voted" : "Waiting"}
                          color={hasVoted ? "success" : "default"}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Actions Log */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Actions
            </Typography>
            {actions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No actions yet this night.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                {actions
                  .filter((a) => a.night_number === game?.current_night)
                  .sort((a, b) => new Date(b.created) - new Date(a.created))
                  .map((action) => {
                    const actor = players.find((p) => p.id === action.actor);
                    const target = players.find((p) => p.id === action.target);

                    return (
                      <Box
                        key={action.id}
                        sx={{ mb: 1, p: 1, backgroundColor: "grey.50", borderRadius: 1 }}
                      >
                        <Typography variant="body2">
                          <strong>{actor?.player}</strong> used <em>{action.action_type}</em> on{" "}
                          <strong>{target?.player}</strong>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, color: "text.secondary" }}
                          >
                            ({action.action_type === "vote" ? "voting" : "night"} phase)
                          </Typography>
                        </Typography>
                      </Box>
                    );
                  })}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Warnings/Alerts */}
        {game?.phase === "night" && !allNightActionsComplete() && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Waiting for{" "}
            {
              playersInActionOrder.filter((p) => !hasPlayerActed(p.id, "night", game.current_night))
                .length
            }{" "}
            players to complete their night actions.
          </Alert>
        )}

        {game?.phase === "voting" && !allVotingComplete() && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Waiting for{" "}
            {players.filter((p) => !hasPlayerActed(p.id, "voting", game.current_night)).length}{" "}
            players to vote.
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
