import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router";
import useLobbies from "../hooks/useLobbies";
import UserContext from "../components/UserContext";
import { useNavigate } from "react-router";
import pb from "../pocketbase.js";
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

// When the user closes the tab or navigates away we should remove them from the lobby_players
import useJoinedPlayers from "../hooks/useJoinedPlayers";
import AlertDialog from "../components/AlertDialog";

export default function LobbyDetails() {
  const { lobbyId } = useParams();
  const { fetchLobby, lobby, loading, error, leaveLobby } = useLobbies(lobbyId);
  const { joinedPlayers, loading: playersLoading } = useJoinedPlayers(lobbyId);
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

  // track if game has started from lobby.status
  const [gameStarted, setGameStarted] = useState(false);
  const [startAlertOpen, setStartAlertOpen] = useState(false);

  useEffect(() => {
    if (lobby && user) {
      setIsModerator(lobby.moderator === user.id);

      if (lobby.status === "in_progress") {
        setGameStarted(true);
      }
    }
  }, [lobby, user]);

  useEffect(() => {
    if (!lobby || !user) return;
    
    const url = import.meta.env.VITE_POCKETBASE_URL + "/api/removePlayer";

    const isMod = lobby.moderator === user.id;

    const handleUnload = () => {
      const payload = JSON.stringify({
        lobbyId: lobby.id,
        playerName: playerName
      })
    }
    

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [lobby, lobbyId, user, leaveLobby]);

  // realtime subscription to lobby_players
  useEffect(() => {
    if (!lobbyId) return;
    let mounted = true;

    // Load initial list of joined players
    const loadInitial = async () => {
      try {
        const items = await pb.collection("lobby_players").getFullList({
          filter: `lobby = "${lobbyId}"`,
          sort: "created",
        });
        if (mounted) setPlayers(items || []);
      } catch (err) {
        console.error("Failed to load players:", err);
        if (mounted) setSubError(err.message || "Failed to load players");
      }
    };

    loadInitial();

    // Subscribe to changes in any record in the collection.
    // ListRule on the collection should already scope what we see;
    // we still filter by lobbyId on the client.
    pb.collection("lobby_players")
      .subscribe("*", (e) => {
        if (!mounted) return;
        const rec = e?.record;
        if (!rec || rec.lobby !== lobbyId) return;

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
        pb.collection("lobby_players").unsubscribe("*");
      } catch (_) {}
    };
  }, [lobbyId]);

  useEffect(() => {
    if (!gameStarted) return;

    if (!isModerator) {
      const timeout = setTimeout(() => {
        navigate(`/game/${lobbyId}`);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [gameStarted, isModerator, lobbyId, navigate]);

  const handleAddManualPlayer = async () => {
    if (!manualName.trim()) {
      setAddError("Player name is required");
      return;
    }
    try {
      setAddError("");
      const ipPrefix = localStorage.getItem("lanPrefix") || "192.168.1.";

      await pb.collection("lobby_players").create({
        lobby: lobbyId,
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
      await pb.collection("lobby_players").delete(playerId);
    } catch (err) {
      console.error("Error removing player:", err);
    }
  };

  const handleCopyCode = () => {
    if (lobby && lobby.code) {
      navigator.clipboard.writeText(lobby.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleLeaveLobbyConfirm = async () => {
    try {
      if (isModerator) {
        await pb.collection("lobbies").delete(lobbyId);
      } else {
        await leaveLobby(lobbyId, user);
      }
    } catch (err) {
      console.error("Failed to leave lobby via dialog:", err);
    } finally {
      navigate("/");
    }
  };

  // Moderator starts the game: update lobby status so all clients see it
  const handleStartGame = async () => {
    if (!isModerator) return;

    try {
      await pb.collection("lobbies").update(lobbyId, {
        status: "in_progress",
      });

      // Moderator navigates immediately
      navigate(`/game/${lobbyId}`);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  // Subscribe to the lobby record itself to react to status/phase changes
  useEffect(() => {
    if (!lobbyId) return;
    let mounted = true;

    const subscribeLobby = async () => {
      try {
        await pb.collection("lobbies").subscribe(lobbyId, (e) => {
          if (!mounted) return;
          const rec = e?.record;
          if (!rec) return;

          // When status flips to in_progress, trigger flag and alert for everyone
          if (rec.status === "in_progress") {
            setGameStarted(true);
            setStartAlertOpen(true);
          }
        });
      } catch (err) {
        console.error("Failed to subscribe to lobby:", err);
      }
    };

    subscribeLobby();

    return () => {
      mounted = false;
      try {
        pb.collection("lobbies").unsubscribe(lobbyId);
      } catch (_) {}
    };
  }, [lobbyId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !lobby) {
    return (
      <Box className="my-20 mx-auto max-w-3xl">
        <Alert severity="error">Failed to load lobby. Please try again.</Alert>
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

      {/* Lobby Info Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" component="h1">
            {lobby.name || "Game Lobby"}
          </Typography>
          {isModerator && <Chip label="Moderator" color="primary" />}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body1" fontWeight="bold">
              Lobby Code:
            </Typography>
            <Chip label={lobby.code} variant="outlined" size="medium" />
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
          Please wait for other players to join. You can start the game once all
          players are present.
        </Typography>

        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {isModerator && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                As moderator, you can end the lobby for everyone.
              </Typography>
            </Box>
          )}
          <AlertDialog
            open={leaveDialogOpen}
            setOpen={setLeaveDialogOpen}
            openButtonTitle={isModerator ? "End Lobby & Leave" : "Leave Lobby"}
            title={isModerator ? "End lobby and leave?" : "Leave lobby?"}
            message={
              isModerator
                ? "You are the moderator. Ending the lobby will remove it and disconnect all players. Are you sure you want to continue?"
                : "You will leave this lobby and be removed from the player list. Are you sure you want to continue?"
            }
            handleConfirm={handleLeaveLobbyConfirm}
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

        {lobby.expand?.deck && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Deck:</strong> {lobby.expand.deck.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Players needed:</strong>{" "}
              {lobby.expand.deck.number_of_players}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Players Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" component="h2">
            Players ({players.length}
            {lobby.expand?.deck?.number_of_players
              ? `/${lobby.expand.deck.number_of_players}`
              : ""}
            )
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
                        {isManual && (
                          <Chip
                            label="Manual"
                            size="small"
                            variant="outlined"
                          />
                        )}
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
