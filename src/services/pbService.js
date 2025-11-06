import pb from '../pocketbase';

/**
 * Small wrapper around the pocketbase client.
 * Keep this thin and predictable so it can be mocked in tests.
 */
export async function getCards() {
  // returns an array of records
  const items = await pb.collection('cards').getFullList({ sort: '-card_order' });
  return items;
}

export async function getSides() {
  const items = await pb.collection('sides').getFullList({ sort: 'id' });
  return items;
}

export async function getDeck(deckId) {
  return pb.collection('decks').getOne(deckId);
}

export default {
  getCards,
  getSides,
  getDeck,
};
