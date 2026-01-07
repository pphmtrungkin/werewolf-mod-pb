import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router";
import useGames from "../hooks/useGames";
import UserContext from "../components/UserContext";
import { useNavigate } from "react-router";
import pbService from "../services/pbService";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

// When the user closes the tab or navigates away we should remove them from the game_players
import useJoinedPlayers from "../hooks/useJoinedPlayers";
import AlertDialog from "../components/AlertDialog";
import useSelectedCards from "../hooks/useSelectedCards";

export default function Game() {
  const { gameId } = useParams();
  const { fetchGame, game, loading, error, leaveGame } = useGames(gameId);
  const { joinedPlayers, loading: playersLoading } = useJoinedPlayers(gameId);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [subError, setSubError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [addError, setAddError] = useState("");
  const [isModerator, setIsModerator] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  // track if game has started from game.status
  const [gameStarted, setGameStarted] = useState(false);
  const [startAlertOpen, setStartAlertOpen] = useState(false);

  useEffect(() => {
    if (game && user) {
      setIsModerator(game.moderator === user.id);

      if (game.status === "in_progress") {
        setGameStarted(true);
      }
    }
  }, [game, user]);

  // realtime subscription to game_players
  useEffect(() => {
    if (!gameId) return;
    let mounted = true;

    // Load initial list of joined players
    const loadInitial = async () => {
      try {
        const items = await pbService.getGamePlayers(gameId, { sort: "created" });
        if (mounted) setPlayers(items || []);
      } catch (err) {
        console.error("Failed to load players:", err);
        if (mounted) setSubError(err.message || "Failed to load players");
      }
    };

    loadInitial();

    // Subscribe to changes in any record in the collection.
    // ListRule on the collection should already scope what we see;
    // we still filter by gameId on the client.
    pbService
      .subscribeGamePlayers((e) => {
        if (!mounted) return;
        const rec = e?.record;
        if (!rec || rec.game !== gameId) return;

        if (e.action === "create") {
          setPlayers((prev) => {
            // Avoid duplicates
            if (prev.some((p) => p.id === rec.id)) return prev;
            return [...prev, rec];
          });
        } else if (e.action === "update") {
          setPlayers((prev) => prev.map((p) => (p.id === rec.id ? rec : p)));
        } else if (e.action === "delete") {
          setPlayers((prev) => prev.filter((p) => p.id !== rec.id));
        }
      })
      .catch((err) => {
        console.error("Realtime subscription failed:", err);
        if (mounted) setSubError(err.message || "Realtime subscription failed");
      });

    // unsubscribe
    return () => {
      mounted = false;
      try {
        pbService.unsubscribeGameActions();
      } catch (_) {}
    };
  }, [gameId]);

  useEffect(() => {
    if (!gameStarted) return;

    if (!isModerator) {
      const timeout = setTimeout(() => {
        navigate(`/game/${gameId}`);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [gameStarted, isModerator, gameId, navigate]);

  const handleAddManualPlayer = async () => {
    if (!manualName.trim()) {
      setAddError("Player name is required");
      return;
    }
    try {
      setAddError("");
      const ipPrefix = localStorage.getItem("lanPrefix") || "192.168.1.";
      if (game.expand.deck.number_of_players == players.length) {
        throw new Error("Cannot add more players. game is full.");
      }
      await pbService.createGamePlayer({
        game: gameId,
        player: manualName,
        connected: true,
        alive: true,
        ip_prefix: ipPrefix,
        ip_address: null,
      });
      setManualName("");
      setAddOpen(false);
    } catch (err) {
      console.error("Failed to add player:", err);
      setAddError(err.message || "Failed to add player");
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!isModerator) return;
    try {
      await pbService.deleteGamePlayer(playerId);
    } catch (err) {
      console.error("Error removing player:", err);
    }
  };

  const handleCopyCode = () => {
    if (game && game.code) {
      navigator.clipboard.writeText(game.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleLeaveGameConfirm = async () => {
    try {
      if (isModerator) {
        await pbService.deleteGame(gameId);
      } else {
        await leaveGame(gameId, user);
      }
    } catch (err) {
      console.error("Failed to leave game via dialog:", err);
    } finally {
      navigate("/");
    }
  };

  // Moderator starts the game: update game status so all clients see it
  const handleStartGame = async () => {
    if (!isModerator) return;

    try {
      await pbService.updateGame(gameId, {
        status: "in_progress",
      });

      // Moderator navigates immediately
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !game) {
    return (
      <Box className="my-20 mx-auto max-w-3xl">
        <Alert severity="error">Failed to load game. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box className="mx-auto max-w-4xl my-10" sx={{ px: 2 }}>
      {/* Game start alert banner */}
      {gameStarted && startAlertOpen && (
        <Box mb={2}>
          <Alert severity="info" onClose={() => setStartAlertOpen(false)}>
            The moderator has started the game! Redirecting...
          </Alert>
        </Box>
      )}

      {/* game Info Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            {game.name || "Game game"}
          </Typography>
          {isModerator && <Chip label="Moderator" color="primary" />}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body1" fontWeight="bold">
              game Code:
            </Typography>
            <Chip label={game.code} variant="outlined" size="medium" />
            <IconButton size="small" onClick={handleCopyCode} title="Copy code">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            {copySuccess && (
              <Typography variant="caption" color="success.main">
                Copied!
              </Typography>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Share this code with players to let them join
          </Typography>
        </Box>

        <Typography variant="body1">
          Please wait for other players to join. You can start the game once all players are
          present.
        </Typography>

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          {isModerator && (
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                As moderator, you can end the game for everyone.
              </Typography>
            </Box>
          )}
          <AlertDialog
            open={leaveDialogOpen}
            setOpen={setLeaveDialogOpen}
            openButtonTitle={isModerator ? "End game & Leave" : "Leave game"}
            title={isModerator ? "End game and leave?" : "Leave game?"}
            message={
              isModerator
                ? "You are the moderator. Ending the game will remove it and disconnect all players. Are you sure you want to continue?"
                : "You will leave this game and be removed from the player list. Are you sure you want to continue?"
            }
            handleConfirm={handleLeaveGameConfirm}
          />
        </Box>

        {isModerator && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartGame}
            >
              Start Game
            </Button>
          </Box>
        )}

        {game.expand?.deck && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Deck:</strong> {game.expand.deck.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Players needed:</strong> {game.expand.deck.number_of_players}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Players Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Players ({players.length}
            {game.expand?.deck?.number_of_players ? `/${game.expand.deck.number_of_players}` : ""})
          </Typography>
          {isModerator && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add Player
            </Button>
          )}
        </Box>

        {subError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {subError}
          </Alert>
        )}

        {playersLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : !players || players.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No players joined yet. Waiting for players to join...
            </Typography>
          </Box>
        ) : (
          <List>
            {players.map((p, index) => {
              const displayName = p.player_name || p.player || "Unknown";
              const isManual = !!p.player_name;

              return (
                <ListItem
                  key={p.id}
                  divider={index < players.length - 1}
                  secondaryAction={
                    isModerator && (
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => handleRemovePlayer(p.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: p.connected ? "success.main" : "grey.500",
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={displayName}
                    slotProps={{ secondary: { component: "span" } }}
                    secondary={
                      <span className="inline-flex gap-1 items-center mt-1">
                        <Chip
                          label={p.connected ? "Connected" : "Disconnected"}
                          size="small"
                          color={p.connected ? "success" : "default"}
                        />
                        {isManual && <Chip label="Manual" size="small" variant="outlined" />}
                      </span>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Add Player Dialog */}
      <Dialog
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setManualName("");
          setAddError("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Player Manually</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Add a player name manually for offline or guest players
          </Typography>
          <TextField
            autoFocus
            label="Player Name"
            fullWidth
            value={manualName}
            onChange={(e) => {
              setManualName(e.target.value);
              setAddError("");
            }}
            error={!!addError}
            helperText={addError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddOpen(false);
              setManualName("");
              setAddError("");
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddManualPlayer}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
