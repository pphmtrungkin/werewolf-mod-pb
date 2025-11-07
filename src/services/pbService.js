import pb from '../pocketbase';
/**
 * Update deck cards, managing the addition and removal of cards
 */
export async function updateDeckCards({ userId, selectedCards, numberOfPlayers }) {
  // Get current selected cards
  const records = await pb.collection('decks_cards').getList(1, 50, {
    filter: `deck_id = "${userId}"`
  });

  // Remove old cards
  for (const record of records.items) {
    await pb.collection('decks_cards').delete(record.id);
  }

  // Add new selected cards
  for (const card of selectedCards) {
    await pb.collection('decks_cards').create({
      deck_id: userId,
      card_id: card.id
    });
  }

  // Update deck settings
  await pb.collection('decks').update(userId, {
    number_of_players: numberOfPlayers
  });

  return { updated: true };
}


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
  const items = await pb.collection('sides').getFullList({ sort: 'id' });
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
  console.log('Fetched selected cards:', items);
  return items.map(item => item.expand.card);
}


const pbService = {
  getCards,
  getSides,
  getDeck,
  getSelectedCards,
  updateDeckCards
};

export default pbService;
