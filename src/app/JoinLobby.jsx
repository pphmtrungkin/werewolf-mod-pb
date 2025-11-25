import { useState, useEffect, useContext } from 'react';
import pb from '../pocketbase';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import { useNavigate } from 'react-router';
import UserContext from '../components/UserContext';
import useLobbies from '../hooks/useLobbies';

const JoinLobby = () => {
  const { user } = useContext(UserContext);
  const { joinLobby } = useLobbies();
  const [localLobbies, setLocalLobbies] = useState([]);
  const [code, setCode] = useState('');
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load lanPrefix from localStorage or fallback
  const getLanPrefix = () => {
    try {
      const cached = localStorage.getItem('lanPrefix');
      if (cached) return cached;
    } catch (_) {}
    return '192.168.1.';
  };

  useEffect(() => {
    let mounted = true;
    const fetchLocalLobbies = async () => {
      setLoading(true);
      try {
        const lanPrefix = getLanPrefix();
        // Query pocketbase for lobbies on same ip_prefix
        const items = await pb.collection('lobbies').getFullList({ filter: `ip_prefix = "${lanPrefix}" && status = \"waiting\"` , expand: 'moderator' });
        console.log('Fetched local lobbies:', items);
        if (!mounted) return;
        // getFullList might return an array directly depending on SDK
        setLocalLobbies(items || []);
      } catch (err) {
        console.error('Error fetching local lobbies', err);
        setLocalLobbies([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLocalLobbies();
    return () => { mounted = false; };
  }, []);


  return (
    <Box className="my-20 mx-auto max-w-3xl">
      <Typography variant="h4" gutterBottom align="center">Join a Lobby</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Locally hosted lobbies</Typography>
        {loading && localLobbies.length === 0 ? (
          <Typography>Loading...</Typography>
        ) : localLobbies.length === 0 ? (
          <Typography>No local lobbies found on your LAN.</Typography>
        ) : (
          <List>
            {localLobbies.map((l) => (
              <ListItem key={l.id} divider>
                <ListItemText primary={`${l.name}`} secondary={l.expand.moderator.name ? `Host: ${l.expand.moderator.name}` : ''} />
                <Button variant="outlined" onClick={() => { setSelectedLobby(l); setAuthCode(''); setAuthError(''); }} disabled={loading}>Select</Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
        <Dialog open={!!selectedLobby} onClose={() => setSelectedLobby(null)}>
          <DialogTitle>Enter lobby code to join</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>{selectedLobby ? `${selectedLobby.name} — enter the lobby code to authenticate access.` : ''}</DialogContentText>
            <TextField
              autoFocus
              label="Lobby Code"
              fullWidth
              value={authCode}
              onChange={(e) => { setAuthCode(e.target.value.toUpperCase()); setAuthError(''); }}
              error={!!authError}
              helperText={authError}
              inputProps={{ maxLength: 8 }}
              onKeyDown={async (ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  // reuse same join logic as the Join button
                  if (!selectedLobby) return;
                  if (!authCode) { setAuthError('Please enter the lobby code'); return; }
                  if (authCode !== (selectedLobby.code || '').toUpperCase()) {
                    setAuthError('Invalid code for this lobby');
                    return;
                  }
                  try {
                    setLoading(true);
                    await joinLobby(selectedLobby.id, user);
                    setSelectedLobby(null);
                    navigate('/lobby/' + selectedLobby.id);
                  } catch (err) {
                    console.error('Could not join', err);
                    setAuthError(err.message || 'Could not join lobby');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedLobby(null)} color="secondary">Cancel</Button>
            <Button onClick={async () => {
              if (!selectedLobby) return;
              if (!authCode) { setAuthError('Please enter the lobby code'); return; }
              if (authCode !== (selectedLobby.code || '').toUpperCase()) {
                setAuthError('Invalid code for this lobby');
                return;
              }
              // codes match; attempt to join
              try {
                setLoading(true);
                await joinLobby(selectedLobby.id, user);
                setSelectedLobby(null);
                navigate('/lobby/' + selectedLobby.id);
              } catch (err) {
                console.error('Could not join', err);
                setAuthError(err.message || 'Could not join lobby');
              } finally {
                setLoading(false);
              }
            }} variant="contained">Join</Button>
          </DialogActions>
        </Dialog>

    </Box>
  );
};

export default JoinLobby;
