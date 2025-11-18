import pb from '../pocketbase'; // Adjust the import path as necessary
import { useEffect, useState } from 'react';

export async function createLobby(deckid, username) {
  const lobbyData = {
    deck: deckid,
    players: [],
    status: 'waiting',
    name: '' + username + "'s Lobby",
  };

  try {
    const createdLobby = await pb.collection('lobbies').create(lobbyData);
    return createdLobby;
  } catch (error) {
    console.error('Error creating lobby:', error);
    throw error;
  }
}

export async function joinLobby(lobbyId, user) {
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

