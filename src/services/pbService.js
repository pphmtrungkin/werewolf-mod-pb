import pb from '../pocketbase';

/**
 * Cards Service
 */
export async function getCards() {
  // returns an array of records
  const items = await pb.collection('cards').getFullList({ sort: '+card_order' });
  return items;
}

/**
 * Sides Service
 */
export async function getSides() {
  const items = await pb.collection('sides').getFullList({ sort: 'hex_color' });
  return items;
}

/**
 * Decks Service
 */
export async function getDeck(userId) {
  return pb.collection('decks').getFullList({ filter: `owner = "${userId}"` });
}

export async function getSelectedCards(deckId) {
  const items = await pb.collection('decks_cards').getFullList({
    filter: `deck = "${deckId}"`,
    expand: 'card',
  });
  return items.map(item => item.expand.card);
}

export async function deleteSelectedCard(deckId, cardId) {
  const items = await pb.collection('decks_cards').getFullList({
    filter: `deck = "${deckId}" && card = "${cardId}"`,
  });
  if (items.length > 0) {
    await pb.collection('decks_cards').delete(items[0].id);
  }
}

export async function addSelectedCard(deckId, cardId) {
  const record = await pb.collection('decks_cards').create({
    deck: deckId,
    card: cardId,
  });
  return record;
}

/**
 * Users Service
 */
export async function registerUser(data) {
  return pb.collection('users').create(data);
}

export async function loginUser(email, password) {
  return pb.collection('users').authWithPassword(email, password);
}

export async function requestOTP(email) {
  return pb.collection('users').requestOTP(email);
}

export async function authWithOTP(otpId, code, options) {
  return pb.collection('users').authWithOTP(otpId, code, options);
}

export async function refreshAuthToken() {
  return pb.collection('users').authRefresh();
}

export async function getUserProfile(userId) {
  return pb.collection('users').getOne(userId);
}

export async function updateUserProfile(userId, data) {
  return pb.collection('users').update(userId, data);
}

/**
 * Lobbies Service
 */
export async function getWaitingLobbies() {
  return pb.collection('lobbies').getFullList({
    filter: 'status = "waiting"',
  });
}

export async function getLobbyById(lobbyId, options = {}) {
  return pb.collection('lobbies').getOne(lobbyId, options);
}

export async function createLobby(data) {
  return pb.collection('lobbies').create(data);
}

export async function updateLobby(lobbyId, data) {
  return pb.collection('lobbies').update(lobbyId, data);
}

export async function deleteLobby(lobbyId) {
  return pb.collection('lobbies').delete(lobbyId);
}

export function subscribeLobby(lobbyId, callback) {
  return pb.collection('lobbies').subscribe(lobbyId, callback);
}

export function unsubscribeLobby(lobbyId) {
  return pb.collection('lobbies').unsubscribe(lobbyId);
}

/**
 * Lobby Players Service
 */
export async function getLobbyPlayers(lobbyId, options = {}) {
  return pb.collection('lobby_players').getFullList({
    filter: `lobby = "${lobbyId}"`,
    ...options,
  });
}

export async function createLobbyPlayer(data) {
  return pb.collection('lobby_players').create(data);
}

export async function deleteLobbyPlayer(playerId) {
  return pb.collection('lobby_players').delete(playerId);
}

export function subscribeLobbyPlayers(callback) {
  return pb.collection('lobby_players').subscribe('*', callback);
}

export function unsubscribeLobbyPlayers() {
  return pb.collection('lobby_players').unsubscribe('*');
}

/**
 * Helper function to get base URL for file URLs
 */
export function getFileUrl(collectionId, recordId, filename) {
  return `${pb.baseUrl}/api/files/${collectionId}/${recordId}/${filename}`;
}

const pbService = {
  // Cards
  getCards,
  getSides,
  // Decks
  getDeck,
  getSelectedCards,
  deleteSelectedCard,
  addSelectedCard,
  // Users
  registerUser,
  loginUser,
  requestOTP,
  authWithOTP,
  refreshAuthToken,
  getUserProfile,
  updateUserProfile,
  // Lobbies
  getWaitingLobbies,
  getLobbyById,
  createLobby,
  updateLobby,
  deleteLobby,
  subscribeLobby,
  unsubscribeLobby,
  // Lobby Players
  getLobbyPlayers,
  createLobbyPlayer,
  deleteLobbyPlayer,
  subscribeLobbyPlayers,
  unsubscribeLobbyPlayers,
  // Helpers
  getFileUrl,
};

export default pbService;
