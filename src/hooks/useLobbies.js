import pb from '../pocketbase.js'; // Adjust the import path as necessary
import { useEffect, useState, useContext } from 'react';
import UserContext from '../components/UserContext';
import useDecks from './useDecks';

export default function useLobbies(lobbyId = null) {
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lobby, setLobby] = useState(null);
  // read user from context if not passed
  const user = useContext(UserContext).user;
  const selectedDeckId = useDecks().selectedDeck?.id;

  async function fetchLobby(lobbyId) {
    setLoading(true);
    setError(null);
    try {
      const lobbyDetails = await pb.collection('lobbies').getOne(lobbyId, { expand: 'deck' });
      setLobby(lobbyDetails);
      return lobbyDetails;
    } catch (error) {
      console.error('Error fetching lobby:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  // Fetch lobby details on mount or when lobbyId changes 
  useEffect(() => {
    if (lobbyId) {
      console.log('Fetching lobby with ID:', lobbyId);
      fetchLobby(lobbyId);
    }
  }, [lobbyId]);
  // Join an existing lobby
  async function joinLobby(lobbyId, user) {
    const ipPrefix = await getLanPrefix();
    const ipAddress = await getLanIpAddress();
    
    const data = {
      lobby: lobbyId,
      player: user.id,
      connected: true,
      alive: true,
      ip_prefix: ipPrefix,
      ip_address: ipAddress
    }

    try {
      const createdPlayer = await pb.collection('lobby_players').create(data);
      // store the created record id locally so we can remove it on unload if needed
      try { localStorage.setItem('lobby_player_id', createdPlayer.id); } catch (_) {}
      console.log('Joined lobby successfully:', createdPlayer);
      return createdPlayer;
    } catch (error) {
      console.error('Error joining lobby:', error);
      throw error;
    }
  }

  // Leave a lobby: remove the lobby_players record for this user and lobby
  async function leaveLobby(lobbyIdArg = null, userArg = null) {
    const targetLobbyId = lobbyIdArg || (lobby && lobby.id) || null;
    const targetUser = userArg || user;
    if (!targetLobbyId || !targetUser) return { ok: false, message: 'missing lobby or user' };

    try {
      // Try to use stored lobby_player_id first
      const storedId = (() => {
        try { return localStorage.getItem('lobby_player_id'); } catch (_) { return null; }
      })();
      if (storedId) {
        try {
          await pb.collection('lobby_players').delete(storedId);
          try { localStorage.removeItem('lobby_player_id'); } catch (_) {}
          return { ok: true };
        } catch (err) {
          // fallthrough to search by filter
          console.warn('Failed to delete by stored id, falling back to query', err);
        }
      }

      // find any lobby_players records matching lobby + player
      const records = await pb.collection('lobby_players').getFullList({ filter: `lobby = "${targetLobbyId}" && player = \"${targetUser.id}\"` });
      if (!records || records.length === 0) return { ok: false, message: 'no records found' };
      for (const r of records) {
        try { await pb.collection('lobby_players').delete(r.id); } catch (err) { console.warn('Failed to delete lobby_player', r.id, err); }
      }
      try { localStorage.removeItem('lobby_player_id'); } catch (_) {}
      return { ok: true };
    } catch (error) {
      console.error('Error leaving lobby:', error);
      return { ok: false, error };
    }
  }

  // Get lan prefix for LAN lobbies
  async function getLanPrefix() {
    return new Promise((resolve) => {
      let prefixResolved = false;

      const rtc = new RTCPeerConnection({ iceServers: [] });

      rtc.createDataChannel("dummy");

      rtc.onicecandidate = (event) => {
        console.log('ICE candidate:', event.candidate);
        if (!event.candidate || prefixResolved) return;

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/(\d{1,3}(\.\d{1,3}){3})/);
        console.log('Candidate IP match:', ipMatch);
        if (ipMatch) {
            const ip = ipMatch[1];

            // Extract prefix: "192.168.1."
            const parts = ip.split(".");
            const prefix = `${parts[0]}.${parts[1]}.${parts[2]}.`;

            prefixResolved = true;
            resolve(prefix);
            console.log('Resolved LAN prefix:', prefix);
        }
      };

      rtc.createOffer().then((offer) => rtc.setLocalDescription(offer));

      // Fallback after 1s
      setTimeout(() => {
          if (!prefixResolved) {
              resolve(getLanPrefixFallback());
          }
      }, 1000);
    });
  }

  // --- Fallback LAN Prefix from localStorage or default ---
  const getLanPrefixFallback = () => {
      try {
          const cached = localStorage.getItem("lanPrefix");
          if (cached) return cached;
      } catch (_) {}

      // best-effort fallback
      return "192.168.1.";
  }

  const getLanIpAddress = async () => {
    // Promise-based IP discovery using RTCPeerConnection
    return new Promise((resolve) => {
      try {
        const ip_dups = {};
        const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if (!RTCPeerConnection) {
          resolve(null);
          return;
        }

        const servers = { iceServers: [{ urls: 'stun:stun.services.mozilla.com' }] };
        const pc = new RTCPeerConnection(servers);
        let resolved = false;

        function cleanup() {
          try { pc.onicecandidate = null; pc.close(); } catch (_) {}
        }

        function handleCandidate(candidate) {
          const ip_regex = /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})/i;
          const match = ip_regex.exec(candidate);
          if (!match) return;
          const ip = match[1];
          if (ip_dups[ip]) return;
          ip_dups[ip] = true;

          // prefer local/private addresses
          const localRegex = /^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/;
          if (!resolved && localRegex.test(ip)) {
            resolved = true;
            cleanup();
            resolve(ip);
          }
        }

        pc.onicecandidate = (event) => {
          if (event && event.candidate && event.candidate.candidate) {
            handleCandidate(event.candidate.candidate);
          }
        };

        try { pc.createDataChannel(''); } catch (_) {}

        pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => {});

        // fallback: inspect localDescription after a short delay
        setTimeout(() => {
          try {
            if (pc.localDescription && pc.localDescription.sdp) {
              const lines = pc.localDescription.sdp.split('\n');
              for (const line of lines) {
                if (line.indexOf('a=candidate:') === 0) handleCandidate(line);
              }
            }

            if (!resolved) {
              const ips = Object.keys(ip_dups);
              const local = ips.find(ip => /^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/.test(ip));
              cleanup();
              resolve(local || (ips.length ? ips[0] : null));
            }
          } catch (err) {
            cleanup();
            resolve(null);
          }
        }, 1000);
      } catch (err) {
        console.warn('getLanIpAddress failed', err);
        resolve(null);
      }
    });
  };
  
  // Host a new lobby
  async function hostLobby() {
    const hostUser = user;
    const deckIdToUse = selectedDeckId;
    const roomCodeLength = 6;
    const lanPrefix = await getLanPrefix();

    // Cache fallback for future runs
    try {
        localStorage.setItem("lanPrefix", lanPrefix);
    } catch (_) {}

    const roomCode = generateRoomCode(roomCodeLength);

    const record = await pb.collection("lobbies").create({
      name: hostUser.name + "'s Lobby", 
      code: roomCode,
      status: "waiting",
      ip_prefix: lanPrefix,
      moderator: hostUser.id,
      deck: deckIdToUse,
      current_day: 0,
      current_night: 0
    });

    setLobby(record);

    return {
      ok: true,
      lobbyId: record.id,
      roomCode,
      lanPrefix
    };
  }

  // Generate a random room code
  const generateRoomCode = (len = 5) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  return {
      lobby,
      loading,
      error,
      hostLobby,
      joinLobby,
      leaveLobby
  };
}
