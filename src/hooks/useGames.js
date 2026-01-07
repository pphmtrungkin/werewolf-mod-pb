import pb from "../pocketbase.js";
import pbService from "../services/pbService";
import { useEffect, useState, useContext } from "react";
import UserContext from "../components/UserContext";
import useDecks from "./useDecks";

export default function useGames(gameId = null) {
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [game, setGame] = useState(null);
  // read user from context if not passed
  const user = useContext(UserContext).user;
  const selectedDeckId = useDecks().selectedDeck?.id;

  async function fetchGame(gameId) {
    setLoading(true);
    setError(null);
    try {
      const gameDetails = await pbService.getGameById(gameId, { expand: "deck" });
      setGame(gameDetails);
      return gameDetails;
    } catch (error) {
      console.error("Error fetching game:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  // Fetch game details on mount or when gameId changes
  useEffect(() => {
    if (gameId) {
      fetchGame(gameId);
    }
  }, [gameId]);
  // Join an existing game
  async function joinGame(gameId, authCode, username) {
    try {
      const result = await pb.send("/api/joinGame", {
        method: "POST",
        body: {
          gameId,
          authCode,
          username,
        },
      });

      // store the created record id locally so we can remove it on unload if needed
      if (result.record && result.record.id) {
        try {
          localStorage.setItem("game_player_id", result.record.id);
        } catch (_) {}
      }

      return {
        record: result.record,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error("Error joining game:", error);
      throw error;
    }
  }

  // Leave a game: remove the game_players record for this user and game
  async function leaveGame(gameIdArg = null, userArg = null) {
    const targetGameId = gameIdArg || (game && game.id) || null;
    const targetUser = userArg || user;
    if (!targetGameId) return { ok: false, message: "missing game" };

    try {
      // Use stored game_player_id to delete the specific record
      const storedId = (() => {
        try {
          return localStorage.getItem("game_player_id");
        } catch (_) {
          return null;
        }
      })();
      if (storedId) {
        try {
          await pbService.deleteGamePlayer(storedId);
          try {
            localStorage.removeItem("game_player_id");
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
      console.error("Error leaving game:", error);
      return { ok: false, error };
    }
  }

  // Host a new game

  async function hostGame(customTitle = "") {
    const deckIdToUse = selectedDeckId;

    const roomCodeLength = 6;

    const roomCode = generateRoomCode(roomCodeLength);

    console.log("deckIdToUse:", deckIdToUse);

    console.log("roomCodeLength:", roomCodeLength);

    console.log("roomCode:", roomCode);

    // Guards for missing user or deck

    if (!user || typeof user !== "object") {
      const err = new Error("Cannot host game: missing user");

      setError(err);

      return { ok: false, error: "Missing user. Please log in and try again." };
    }

    if (!deckIdToUse) {
      const err = new Error("Cannot host game: no deck selected");

      setError(err);

      return { ok: false, error: "No deck selected. Please choose a deck before hosting." };
    }

    const fallbackName = (user?.name || user?.username || "Host") + "'s Game";

    const nameToSend = customTitle?.trim() ? customTitle.trim() : fallbackName;

    try {
      const response = await pb.send("/api/createGame", {
        method: "POST",

        body: {
          name: nameToSend,
          code: roomCode,
          deck: deckIdToUse,
        },
      });

      setGame(response);
      return {
        ok: true,

        gameId: response.id,

        roomCode,
      };
    } catch (err) {
      console.error("Error creating game:", err);

      setError(err);

      return { ok: false, error: "Failed to create game. Please try again." };
    }
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
    game,
    loading,
    error,
    hostGame,
    joinGame,
    leaveGame,
  };
}
