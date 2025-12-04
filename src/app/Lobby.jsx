import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router';
import useLobbies from '../hooks/useLobbies';
import UserContext from '../components/UserContext';
import { useNavigate } from 'react-router';
import pb from '../pocketbase.js';
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
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// When the user closes the tab or navigates away we should remove them from the lobby_players
import useJoinedPlayers from '../hooks/useJoinedPlayers';

export default function LobbyDetails() {
  const { lobbyId } = useParams();
  const { fetchLobby, lobby, loading, error, leaveLobby } = useLobbies(lobbyId);
  const { joinedPlayers, loading: playersLoading } = useJoinedPlayers(lobbyId);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [subError, setSubError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    // register unload / visibility handlers
    const handleBeforeUnload = (e) => {
      // best-effort: try to call leaveLobby (async, fire-and-forget)
      try { leaveLobby(lobbyId, user); } catch (_) {}
    };

    const handleVisibility = () => {
      if (document.hidden) {
        try { leaveLobby(lobbyId, user); } catch (_) {}
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [leaveLobby, lobbyId, user]);

  // realtime subscription to lobby_players
  useEffect(() => {
    if (!lobbyId) return;
    let mounted = true;

    const loadInitial = async () => {
      try {
        const items = await pb.collection('lobby_players').getFullList({
          filter: `lobby = "${lobbyId}"`,
          expand: 'player',
          sort: 'created'
        });
        if (mounted) setPlayers(items || []);
      } catch (err) {
        console.error('Failed to load players:', err);
        if (mounted) setSubError(err.message || 'Failed to load players');
      }
    };

    const subscribe = async () => {
      try {
        await pb.collection('lobby_players').subscribe('*', async (e) => {
          // Only consider events for this lobby
          const rec = e?.record;
          if (!rec || rec.lobby !== lobbyId) return;

          if (e.action === 'create') {
            // Fetch with expanded player data
            try {
              const fullRecord = await pb.collection('lobby_players').getOne(rec.id, { expand: 'player' });
              if (mounted) {
                setPlayers((prev) => {
                  // Avoid duplicates
                  if (prev.some(p => p.id === fullRecord.id)) return prev;
                  return [...prev, fullRecord];
                });
              }
            } catch (err) {
              console.error('Error fetching new player:', err);
            }
          } else if (e.action === 'update') {
            try {
              const fullRecord = await pb.collection('lobby_players').getOne(rec.id, { expand: 'player' });
              if (mounted) {
                setPlayers((prev) => prev.map((p) => (p.id === fullRecord.id ? fullRecord : p)));
              }
            } catch (err) {
              console.error('Error fetching updated player:', err);
            }
          } else if (e.action === 'delete') {
            if (mounted) {
              setPlayers((prev) => prev.filter((p) => p.id !== rec.id));
            }
          }
        }, { expand: 'player' });
      } catch (err) {
        console.error('Realtime subscription failed:', err);
        if (mounted) setSubError(err.message || 'Realtime subscription failed');
      }
    };

    loadInitial();
    subscribe();

    return () => {
      mounted = false;
      try { pb.collection('lobby_players').unsubscribe('*'); } catch (_) {}
    };
  }, [lobbyId]);

  const isModerator = lobby && user && lobby.moderator === user.id;

  const handleAddManualPlayer = async () => {
    if (!manualName.trim()) {
      setAddError('Player name is required');
      return;
    }
    try {
      setAddError('');
      const ipPrefix = localStorage.getItem('lanPrefix') || '192.168.1.';
      
      await pb.collection('lobby_players').create({
        lobby: lobbyId,
        player: manualName,   gue: true,
        alive: true,
        ip_prefix: ipPrefix,
        ip_address: null
      });
      setManualName('');
      setAddOpen(false);
    } catch (err) {
      console.error('Failed to add player:', err);
      setAddError(err.message || 'Failed to add player');
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!isModerator) return;
    try {
      await pb.collection('lobby_players').delete(playerId);
    } catch (err) {
      console.error('Error removing player:', err);
    }
  };

  const handleCopyCode = () => {
    if (lobby && lobby.code) {
      navigator.clipboard.writeText(lobby.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
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
      {/* Lobby Info Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            {lobby.name || 'Game Lobby'}
          </Typography>
          {isModerator && (
            <Chip label="Moderator" color="primary" />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body1" fontWeight="bold">Lobby Code:</Typography>
            <Chip label={lobby.code} variant="outlined" size="medium" />
            <IconButton size="small" onClick={handleCopyCode} title="Copy code">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            {copySuccess && (
              <Typography variant="caption" color="success.main">Copied!</Typography>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Share this code with players to let them join
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          Please wait for other players to join. You can start the game once all players are present.
        </Typography>

        {lobby.expand?.deck && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Deck:</strong> {lobby.expand.deck.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Players needed:</strong> {lobby.expand.deck.number_of_players}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Players Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Players ({players.length}{lobby.expand?.deck?.number_of_players ? `/${lobby.expand.deck.number_of_players}` : ''})
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
          <Alert severity="error" sx={{ mb: 2 }}>{subError}</Alert>
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
              const displayName = p.player_name || p.expand?.player?.name || p.player || 'Unknown';
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
                    <Avatar sx={{ bgcolor: p.connected ? 'success.main' : 'grey.500' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={displayName}
                    secondary={
                      <Box component="span" display="flex" gap={1} alignItems="center" mt={0.5}>
                        <Chip
                          label={p.connected ? 'Connected' : 'Disconnected'}
                          size="small"
                          color={p.connected ? 'success' : 'default'}
                        />
                        {isManual && (
                          <Chip label="Manual" size="small" variant="outlined" />
                        )}
                      </Box>
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
          setManualName('');
          setAddError('');
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
              setAddError('');
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
              setManualName('');
              setAddError('');
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
