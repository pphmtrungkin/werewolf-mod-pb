import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import useLobbies from '../hooks/useLobbies';
import  UserContext from '../components/UserContext';
import { useContext } from 'react';
import useJoinedPlayers from '../hooks/useJoinedPlayers';

export default function LobbyDetails() {
  const { lobbyId } = useParams();
  const { fetchLobby, lobby, loading, error } = useLobbies(lobbyId);
  const { joinedPlayers, loading: playersLoading } = useJoinedPlayers(lobbyId);

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
