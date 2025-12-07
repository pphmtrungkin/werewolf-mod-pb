import { useState, useEffect, useContext } from "react";
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
} from "@mui/material";
import UserContext from "../components/UserContext";
import pb from "../pocketbase";

export default function Game() {
  const { lobbyId } = useParams();
  const { user } = useContext(UserContext);
  const [lobby, setLobby] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const lobbyData = await pb.collection("lobbies").getOne(lobbyId, {
          expand: "deck",
        });
        setLobby(lobbyData);

        const playersData = await pb.collection("lobby_players").getFullList({
          filter: `lobby = "${lobbyId}"`,
        });
        setPlayers(playersData);
      } catch (err) {
        setError("Failed to load game data. Please try again.");
        console.error("Error fetching game data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [lobbyId]);

  // Subscribe to the lobby record for live status/phase changes
  useEffect(() => {
    if (!lobbyId) return;
    let mounted = true;

    const subscribeLobby = async () => {
      try {
        await pb.collection("lobbies").subscribe(lobbyId, (e) => {
          if (!mounted) return;
          const rec = e?.record;
          if (!rec) return;

          // Keep local lobby state in sync (status, phase, etc.)
          setLobby(rec);
        });
      } catch (err) {
        console.error("Failed to subscribe to lobby in Game:", err);
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

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  const handleConfirmAction = () => {
    if (!selectedPlayer) return;
    // TODO: Implement action logic based on the user's role
    console.log(`Action confirmed for player: ${selectedPlayer.player}`);
    setSelectedPlayer(null);
  };

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

  if (error) {
    return (
      <Box className="my-20 mx-auto max-w-3xl">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const currentPlayer = players.find((p) => p.player === user.name);

  return (
    <Box className="mx-auto max-w-4xl my-10" sx={{ px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {lobby.name} - Game in Progress
        </Typography>
        <Divider sx={{ my: 2 }} />
        {currentPlayer && (
          <Box>
            <Typography variant="h6">Your Role</Typography>
            <Chip label={currentPlayer.role || "Villager"} color="primary" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {/* TODO: Display role description and abilities */}
              Here is a description of your role and what you can do.
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" mb={2}>
          Players
        </Typography>
        <List>
          {players.map((p) => (
            <ListItem
              key={p.id}
              divider
              button
              selected={selectedPlayer && selectedPlayer.id === p.id}
              onClick={() => handlePlayerSelect(p)}
            >
              <ListItemText primary={p.player} />
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
            Confirm Action
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
