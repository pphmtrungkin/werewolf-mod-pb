import { useState, useEffect, useContext } from "react";
import pbService from "../services/pbService";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router";
import UserContext from "../components/UserContext";
import useGames from "../hooks/useGames";

const JoinGame = () => {
  const { user } = useContext(UserContext);
  const { joinGame } = useGames();
  const [localGames, setLocalGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [authCode, setAuthCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const POLL_INTERVAL_MS = 5000; // poll every 5 seconds

  useEffect(() => {
    let mounted = true;
    const fetchLocalGames = async () => {
      try {
        setLoading(true);
        const items = await pbService.getWaitingGames();
        if (!mounted) return;
        setLocalGames(items || []);
      } catch (err) {
        console.error("Error fetching local games", err);
        if (mounted) setLocalGames([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial fetch, then poll every POLL_INTERVAL_MS
    fetchLocalGames();
    const intervalId = setInterval(() => {
      fetchLocalGames();
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleClickOpen = (game) => {
    setSelectedGame(game);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGame(null);
    setAuthCode("");
    setAuthError("");
  };

  const handleJoinGame = async () => {
    if (!selectedGame) return;
    if (!authCode) {
      setAuthError("Please enter the game code.");
      return;
    }
    if (!user && !name.trim()) {
      setAuthError("Please enter a name to join as a guest.");
      return;
    }

    try {
      setIsJoining(true);
      setAuthError("");
      if (user) {
        console.log("User:", user);
      }
      const finalUsername = user ? user.name : name;

      const result = await joinGame(selectedGame.id, authCode, finalUsername);

      if (result && result.success) {
        navigate(`/game/${selectedGame.id}`);
      }
    } catch (error) {
      const message = error.data?.message || error.message || "Failed to join game.";
      setAuthError(message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Box className="my-20 mx-auto max-w-3xl">
      <Typography variant="h4" gutterBottom align="center">
        Join a game
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Locally hosted games</Typography>
        {loading && localGames.length === 0 ? (
          <Box className="flex justify-center items-center" sx={{ my: 3 }}>
            <Spinner />
            <Typography sx={{ ml: 2 }}>Searching for local games...</Typography>
          </Box>
        ) : localGames.length === 0 ? (
          <Typography>No local games found on your LAN.</Typography>
        ) : (
          <List>
            {localGames.map((l) => (
              <ListItem key={l.id} divider>
                <ListItemText
                  primary={`${l.name}`}
                  secondary={l.expand?.moderator?.name ? `Host: ${l.expand.moderator.name}` : ""}
                />
                <Button variant="outlined" onClick={() => handleClickOpen(l)} disabled={loading}>
                  Select
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Dialog
        closeAfterTransition={false}
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            handleJoinGame();
          },
        }}
      >
        <DialogTitle>Enter game code to join</DialogTitle>
        <DialogContent>
          {!user && (
            <>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1">
                  You haven't been logged in. Enter a name to join as a guest.
                </Typography>
                <TextField
                  label="Guest Name"
                  fullWidth
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  inputProps={{ maxLength: 20 }}
                  sx={{ mt: 1 }}
                  required
                />
              </Box>
            </>
          )}
          <DialogContentText>
            {selectedGame
              ? `${selectedGame.name} — enter the game code to authenticate access.`
              : ""}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="game Code"
            fullWidth
            value={authCode}
            onChange={(e) => {
              setAuthCode(e.target.value.toUpperCase());
              setAuthError("");
            }}
            error={!!authError}
            helperText={authError}
            inputProps={{ maxLength: 8 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isJoining}>
            {isJoining ? "Joining..." : "Join"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JoinGame;
