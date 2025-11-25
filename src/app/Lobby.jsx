import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import useLobbies from '../hooks/useLobbies';
import  UserContext from '../components/UserContext';
import { useContext } from 'react';

export default function Lobby() {
  const { lobbyId } = useParams();
  const { lobby } = useLobbies(lobbyId);
  const [codeVerified, setCodeVerified] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);


  useEffect(() => {
    console.log('Lobby component mounted or lobbyId changed:', lobbyId);
    console.log('Lobby data:', lobby);
  }, [lobby]);

  useEffect(() => {
    if (!user) {
      setError("You must login before joining a lobby. You can either login or continue as a guest by entering your name below.");
    }
  }, [user]);
  
  return (
    <div>
      {!codeVerified ? (
        <JoinLobbyForm
          username={user ? user.name : null}
          setError={setError}
          setCodeVerified={setCodeVerified}
          lobby={lobby}
        />
      ) : (
        <LobbyDetails lobby={lobby} />
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

function LobbyDetails({ lobby }) {
  return (
    <div>
      <h1>Lobby Component</h1>
      {/* Lobby UI goes here */}
      <h1>Your Lobby</h1>
      <h4>Please wait for other players to join and you can start the game once all of players are present</h4>
      {lobby && (<div>
        <p>Lobby ID: {lobby.id}</p>
        <p>Players:</p>
      </div>
      )}
    </div>
  );
}

function JoinLobbyForm({username, setError, setCodeVerified, lobby }) {

  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const handleVerifyCode = (e) => {
    e.preventDefault();
    const lobbyCode = e.target.lobbyCode.value;
    console.log('Verifying lobby code:', lobbyCode);
    if (lobby && lobby.code === lobbyCode) {
      setCodeVerified(true);
    } else {
      alert('Invalid lobby code. Please try again.');
    }
    // Add logic to verify the lobby code
  };

  return (
    <form onSubmit={handleVerifyCode}>
      {username ? (
        <p>Welcome back, {user.name}!</p>
      ) : (
        <>
          <label>
            Enter Your Name:
            <input
              type="text"
              name="playerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </>
      )}
      <label>
        Enter Lobby Code:
        <input type="text" name="lobbyCode" />
      </label>
      <input type="submit" value="Join Lobby" />
    </form>
  );
}
