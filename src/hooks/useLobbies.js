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
      console.log('Joined lobby successfully:', createdPlayer);
    } catch (error) {
      console.error('Error joining lobby:', error);
      throw error;
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
    return new Promise((resolve) => {
      const rtc = new RTCPeerConnection({ iceServers: [] });

      rtc.createDataChannel("dummy");

      rtc.onicecandidate = (event) => {
        console.log('ICE candidate:', event.candidate);
        if (!event.candidate) return;

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/(\d{1,3}(\.\d{1,3}){3})/);
        console.log('Candidate IP match:', ipMatch);
        if (ipMatch) {
            const ip = ipMatch[1];
            resolve(ip);
            console.log('Resolved LAN IP address:', ip);
        }
      };

      rtc.createOffer().then((offer) => rtc.setLocalDescription(offer));
      setTimeout(() => resolve(null), 1000);
    })
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
      joinLobby
  };
}
