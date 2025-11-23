import pb from '../pocketbase'; // Adjust the import path as necessary
import { useEffect, useState } from 'react';

export default function useLobbies(user, selectedDeckId) {
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lobby, setLobby] = useState(null);

  // Join an existing lobby
  async function joinLobby(lobbyId, user) {
    const lobby = await pb.collection('lobbies').getOne(lobbyId, { expand: 'deck' });
    
    if (lobby.players.length >= lobby.expand.deck.number_of_players) {
      throw new Error('Lobby is full');
    }

    try {
      const updatedPlayers = [...lobby.players, user.id];

      const updatedLobby = await pb.collection('lobbies').update(lobbyId, {
        players: updatedPlayers,
      });

      return updatedLobby;
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
        if (!event.candidate || prefixResolved) return;

        const candidate = event.candidate.candidate;
        const ipMatch = candidate.match(/(\d{1,3}(\.\d{1,3}){3})/);

        if (ipMatch) {
            const ip = ipMatch[1];

            // Extract prefix: "192.168.1."
            const parts = ip.split(".");
            const prefix = `${parts[0]}.${parts[1]}.${parts[2]}.`;

            prefixResolved = true;
            resolve(prefix);
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

  async function hostLobby(user, selectedDeckId) {
    const roomCodeLength = 6;
    const lanPrefix = await getLanPrefix();

    // Cache fallback for future runs
    try {
        localStorage.setItem("lanPrefix", lanPrefix);
    } catch (_) {}

    const roomCode = generateRoomCode(roomCodeLength);

    const record = await pb.collection("lobbies").create({
        name: user.name + "'s Lobby", 
        code: roomCode,
        status: "waiting",
        ip_prefix: lanPrefix,
        moderator: user.id,
        deck: selectedDeckId,
        current_day: 0,
        current_night: 0
    });

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
