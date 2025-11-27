import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router';
import useLobbies from '../hooks/useLobbies';
import UserContext from '../components/UserContext';
import { useNavigate } from 'react-router';

// When the user closes the tab or navigates away we should remove them from the lobby_players
import useJoinedPlayers from '../hooks/useJoinedPlayers';

export default function LobbyDetails() {
  const { lobbyId } = useParams();
  const { fetchLobby, lobby, loading, error, leaveLobby } = useLobbies(lobbyId);
  const { joinedPlayers, loading: playersLoading } = useJoinedPlayers(lobbyId);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

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

  return (
    <div>
      <h1>Lobby Component</h1>
      {/* Lobby UI goes here */}
      <h1>Your Lobby</h1>
      <h4>Please wait for other players to join and you can start the game once all of players are present</h4>
      {lobby && (<div>
        <p>Lobby ID: {lobby.id}</p>
        <p>Players:</p>
        {playersLoading ? (
          <p>Loading players...</p>
        ) : (
          <ul>
            {joinedPlayers.map((player) => (
              <li key={player.id}>{player.expand.player.name}</li>
            ))}
          </ul>
        )}
      </div>
      )}
    </div>
  );
}
