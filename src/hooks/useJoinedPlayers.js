import { useState, useEffect } from "react";
import pb from "../pocketbase";

/**
 * useJoinedPlayers
 * Fetches the list of joined players for a given game via the game_players collection.
 *
 * @param {string} gameId - The ID of the game to fetch players for.
 * @returns {{ joinedPlayers: Array, loading: boolean, error: string|null }}
 */
const useJoinedPlayers = (gameId) => {
  const [joinedPlayers, setJoinedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchJoinedPlayers = async () => {
      if (!gameId) {
        if (mounted) {
          setJoinedPlayers([]);
          setError("Missing gameId");
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const items = await pb.collection("game_players").getFullList({
          filter: `game = "${gameId}"`,
          expand: "player",
        });

        if (!mounted) return;
        setJoinedPlayers(items || []);
      } catch (err) {
        console.error("Error fetching joined players", err);
        if (mounted) {
          setJoinedPlayers([]);
          setError(
            typeof err?.message === "string" ? err.message : "Failed to fetch joined players",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJoinedPlayers();

    return () => {
      mounted = false;
    };
  }, [gameId]);

  return { joinedPlayers, loading, error };
};

export default useJoinedPlayers;
