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
import useLobbies from "../hooks/useLobbies";

const JoinLobby = () => {
  const { user } = useContext(UserContext);
  const { joinLobby } = useLobbies();
  const [localLobbies, setLocalLobbies] = useState([]);
  const [selectedLobby, setSelectedLobby] = useState(null);
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
    const fetchLocalLobbies = async () => {
      try {
        setLoading(true);
        const items = await pbService.getWaitingLobbies();
        if (!mounted) return;
        setLocalLobbies(items || []);
      } catch (err) {
        console.error("Error fetching local lobbies", err);
        if (mounted) setLocalLobbies([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial fetch, then poll every POLL_INTERVAL_MS
    fetchLocalLobbies();
    const intervalId = setInterval(() => {
      fetchLocalLobbies();
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleClickOpen = (lobby) => {
    setSelectedLobby(lobby);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedLobby(null);
    setAuthCode("");
    setAuthError("");
  };

  const handleJoinLobby = async () => {
    if (!selectedLobby) return;
    if (!authCode) {
      setAuthError("Please enter the lobby code.");
      return;
    }
    if (!user && !name.trim()) {
      setAuthError("Please enter a name to join as a guest.");
      return;
    }

    try {
      setIsJoining(true);
      setAuthError("");

      const finalUsername = user ? user.name : name;

      await joinLobby(selectedLobby.id, authCode, finalUsername);
    } catch (error) {
      const message =
        error.data?.message || error.message || "Failed to join lobby.";
      setAuthError(message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Box className="my-20 mx-auto max-w-3xl">
      <Typography variant="h4" gutterBottom align="center">
        Join a Lobby
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Locally hosted lobbies</Typography>
        {loading && localLobbies.length === 0 ? (
          <Box className="flex justify-center items-center" sx={{ my: 3 }}>
            <Spinner />
            <Typography sx={{ ml: 2 }}>
              Searching for local lobbies...
            </Typography>
          </Box>
        ) : localLobbies.length === 0 ? (
          <Typography>No local lobbies found on your LAN.</Typography>
        ) : (
          <List>
            {localLobbies.map((l) => (
              <ListItem key={l.id} divider>
                <ListItemText
                  primary={`${l.name}`}
                  secondary={
                    l.expand?.moderator?.name
                      ? `Host: ${l.expand.moderator.name}`
                      : ""
                  }
                />
                <Button
                  variant="outlined"
                  onClick={() => handleClickOpen(l)}
                  disabled={loading}
                >
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
            handleJoinLobby();
          },
        }}
      >
        <DialogTitle>Enter lobby code to join</DialogTitle>
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
            {selectedLobby
              ? `${selectedLobby.name} — enter the lobby code to authenticate access.`
              : ""}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Lobby Code"
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

export default JoinLobby;
