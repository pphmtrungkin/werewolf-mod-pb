import { useState, useEffect } from 'react';
import pb from '../pocketbase';

const useJoinedPlayers = (lobbyId) => {
  const [joinedPlayers, setJoinedPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchJoinedPlayers = async (lobbyId) => {
      try {
        setLoading(true);
        // Query pocketbase for players in the given lobby
        const items = await pb.collection('lobby_players').getFullList({ filter: `lobby= "${lobbyId}"`, expand: 'player' });
        console.log('Fetched joined players:', items);
        if (!mounted) return;
        setJoinedPlayers(items || []);
      } catch (err) {
        console.error('Error fetching joined players', err);
        if (mounted) setJoinedPlayers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchJoinedPlayers(lobbyId);

    return () => {
      mounted = false;
    };
  }, [lobbyId]);

  return { joinedPlayers, loading };
};

export default useJoinedPlayers;
