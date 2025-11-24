import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import useLobbies from '../hooks/useLobbies';
export default function Lobby() {
  
  const { lobby } = useLobbies(null, null);


  return (
    <div>
      <h1>Lobby Component</h1>
      {/* Lobby UI goes here */}
      <h1>Your Lobby</h1>
      <h4>Please wait for other players to join and you can start the game once all of players are present</h4>
      {lobby && (<div>
        <p>Lobby ID: {lobby.id}</p>
        <p>Players:</p>
        <ul>
          {lobby.players.map((playerId) => (
            <li key={playerId}>{playerId}</li>
          ))}
        </ul>
      </div>
      )}
    </div>
  );
}
