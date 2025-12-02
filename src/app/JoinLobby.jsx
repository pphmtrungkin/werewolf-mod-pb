import { useState, useEffect, useContext } from 'react';
import pb from '../pocketbase';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Button, TextField, Paper, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import Spinner from '../components/Spinner';
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  // Load lanPrefix from localStorage or fallback
  const getLanPrefix = () => {
    try {
      const cached = localStorage.getItem('lanPrefix');
      if (cached) return cached;
    } catch (_) {}
    return '192.168.1.';
  };

  const POLL_INTERVAL_MS = 5000; // poll every 10 seconds

  useEffect(() => {
    let mounted = true;
    const fetchLocalLobbies = async () => {
      // avoid overlapping fetches
      try {
        setLoading(true);
        const lanPrefix = getLanPrefix();
        // Query pocketbase for lobbies on same ip_prefix
        const items = await pb.collection('lobbies').getFullList({ filter: `ip_prefix = "${lanPrefix}" && status = \"waiting\"` , expand: 'moderator' });
        if (!mounted) return;
        console.log('Fetched local lobbies', items);
        setLocalLobbies(items || []);
      } catch (err) {
        console.error('Error fetching local lobbies', err);
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
    setAuthCode('');
    setAuthError('');
  }

  const handleJoinLobby = async () => {
    if (!selectedLobby) return;
    if (!authCode) { setAuthError('Please enter the lobby code'); return; }
    if (authCode !== (selectedLobby.code || '').toUpperCase()) {
      setAuthError('Invalid code for this lobby');
      return;
    }
    
    if (!user) {
      setAuthError('You must be signed in to join a lobby');
      return;
    }

      setLoading(true);
      setAuthError('');
      const result = await joinLobby(selectedLobby.id, user);
      if (result.error) {
        setAuthError(`Failed to join: ${result.error.message}`);
        setLoading(false);
        return;
      } else {
        handleClose();
        navigate('/lobby/' + selectedLobby.id);
      }
  };

  const handleCreateGuest = async () => {
    if (!name) return;
    try {
      setLoading(true);
      const guestUser = await pb.collection('users').createGuest({ name });
      // set user in context
      pb.authStore.save(guestUser, '');
      navigate('/lobby/' + selectedLobby.id);
    } catch (err) {
      console.error('Could not create guest user', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="my-20 mx-auto max-w-3xl">
      <Typography variant="h4" gutterBottom align="center">Join a Lobby</Typography>

      <div className="flex flex-row items-center justify-center my-8">
        <Typography variant="h6" sx={{ mr: 2, mt: 1 }}>Searching for local lobbies...</Typography>
        <Spinner />
      </div>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">
          Locally hosted lobbies
        </Typography>
        {loading && localLobbies.length === 0 ? (
          <Box className="flex justify-center items-center" sx={{ my: 3 }}>
            <Spinner />
            <Typography sx={{ ml: 2 }}>Searching for local lobbies...</Typography>
          </Box>
        ) : localLobbies.length === 0 ? (
          <Typography>No local lobbies found on your LAN.</Typography>
        ) : (
          <List>
            {localLobbies.map((l) => (
              <ListItem key={l.id} divider>
                <ListItemText primary={`${l.name}`} secondary={l.expand?.moderator?.name ? `Host: ${l.expand.moderator.name}` : ''} />
                <Button variant="outlined" onClick={() => handleClickOpen(l)} disabled={loading}>Select</Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
        <Dialog closeAfterTransition={false} open={open} onClose={handleClose}>
          <DialogTitle>Enter lobby code to join</DialogTitle>
          <DialogContent>
            {
              !user && (
                <>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="h3">You haven't been logged in. You can either go to login or continue with a guest account</Typography>
                    <Button variant="outlined" sx={{ mr: 2 }} onClick={() => {
                      navigate('/login');
                    }}>Go to Login</Button>
                    <TextField
                      label="Guest Name"
                      fullWidth
                      value={name}
                      onChange={(e) => { setName(e.target.value); }}
                      inputProps={{ maxLength: 20 }}
                    >
                      {' '}
                      <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreateGuest}>Continue as Guest</Button>
                      
                    </TextField>
                  </Box>
                </>
              )
            }
            <DialogContentText >{selectedLobby ? `${selectedLobby.name} — enter the lobby code to authenticate access.` : ''}</DialogContentText>
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
                  await handleJoinLobby();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Cancel</Button>
            <Button onClick={handleJoinLobby} variant="contained">Join</Button>
          </DialogActions>
        </Dialog>

    </Box>
  );
};

export default JoinLobby;
