import pb from '../pocketbase';
/**
 * Small wrapper around the pocketbase client.
 * Keep this thin and predictable so it can be mocked in tests.
 */
export async function getCards() {
  // returns an array of records
  const items = await pb.collection('cards').getFullList({ sort: '+card_order' });
  return items;
}

export async function getSides() {
  const items = await pb.collection('sides').getFullList({ sort: 'hex_color' });
  return items;
}

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
  console.log('Deleting card', cardId, 'from deck', deckId);
  const items = await pb.collection('decks_cards').getFullList({
    filter: `deck = "${deckId}" && card = "${cardId}"`,
  });
  if (items.length > 0) {
    await pb.collection('decks_cards').delete(items[0].id);
  }
}

export async function addSelectedCard(deckId, cardId) {
  console.log('Adding card', cardId, 'to deck', deckId);
  const record = await pb.collection('decks_cards').create({
    deck: deckId,
    card: cardId,
  });
  return record;
}

const pbService = {
  getCards,
  getSides,
  getDeck,
  getSelectedCards,
  deleteSelectedCard,
  addSelectedCard,
};

export default pbService;
