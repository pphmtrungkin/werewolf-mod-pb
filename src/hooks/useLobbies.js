import pb from "../pocketbase.js";
import pbService from "../services/pbService";
import { useEffect, useState, useContext } from "react";
import UserContext from "../components/UserContext";
import useDecks from "./useDecks";

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
      const lobbyDetails = await pbService.getLobbyById(lobbyId, { expand: "deck" });
      setLobby(lobbyDetails);
      return lobbyDetails;
    } catch (error) {
      console.error("Error fetching lobby:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  // Fetch lobby details on mount or when lobbyId changes
  useEffect(() => {
    if (lobbyId) {
      console.log("Fetching lobby with ID:", lobbyId);
      fetchLobby(lobbyId);
    }
  }, [lobbyId]);
  // Join an existing lobby
  async function joinLobby(lobbyId, authCode, username) {
    console.log("lobbyId: ", lobbyId);
    console.log(`Attempting to join lobby ${authCode} as ${username}`);
    try {
      const result = await pb.send("/api/joinLobby", {
        method: "POST",
        body: {
          lobbyId,
          authCode,
          username,
        },
      });

      // store the created record id locally so we can remove it on unload if needed
      if (result.record && result.record.id) {
        try {
          localStorage.setItem("lobby_player_id", result.record.id);
        } catch (_) {}
      }

      console.log("Joined lobby successfully:", result);
      return result.record;
    } catch (error) {
      console.error("Error joining lobby:", error);
      console.error("Error details:", error.response || error.data || error);
      throw error;
    }
  }

  // Leave a lobby: remove the lobby_players record for this user and lobby
  async function leaveLobby(lobbyIdArg = null, userArg = null) {
    const targetLobbyId = lobbyIdArg || (lobby && lobby.id) || null;
    const targetUser = userArg || user;
    if (!targetLobbyId) return { ok: false, message: "missing lobby" };

    try {
      // Use stored lobby_player_id to delete the specific record
      const storedId = (() => {
        try {
          return localStorage.getItem("lobby_player_id");
        } catch (_) {
          return null;
        }
      })();
      if (storedId) {
        try {
          await pbService.deleteLobbyPlayer(storedId);
          try {
            localStorage.removeItem("lobby_player_id");
          } catch (_) {}
          return { ok: true };
        } catch (err) {
          console.warn("Failed to delete by stored id", err);
          return { ok: false, error: err };
        }
      } else {
        // No stored id, cannot leave safely
        return { ok: false, message: "no stored player record id" };
      }
    } catch (error) {
      console.error("Error leaving lobby:", error);
      return { ok: false, error };
    }
  }

  // Host a new lobby
  async function hostLobby() {
    const hostUser = user;
    const deckIdToUse = selectedDeckId;
    const roomCodeLength = 6;
    const roomCode = generateRoomCode(roomCodeLength);

    const record = await pbService.createLobby({
      name: hostUser.name + "'s Lobby",
      code: roomCode,
      status: "waiting",
      moderator: hostUser.id,
      deck: deckIdToUse,
      current_day: 0,
      current_night: 0,
    });

    setLobby(record);

    return {
      ok: true,
      lobbyId: record.id,
      roomCode,
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
  };

  return {
    lobby,
    loading,
    error,
    hostLobby,
    joinLobby,
    leaveLobby,
  };
}
