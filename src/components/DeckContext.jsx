import React, { createContext, useContext, useEffect, useState } from 'react';
import UserContext from './UserContext';
import pbService from '../services/pbService';

// Create a context
export const DeckContext = createContext();

// Create the provider
export const DeckProvider = ({ children }) => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedCardsLoading, setSelectedCardsLoading] = useState(true);
  const { user } = useContext(UserContext);
  const [deckId, setDeckId] = useState(0);
  const [decks, setDecks] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    async function fetchUserDeck() {
      if (user && user.id) {
        const resultList = await pb.collection('decks').getFullList(1, { filter: `owner = "${user.id}"` });
        if (resultList.status === 400) {
          console.error('Error fetching decks:', resultList);
          return;
        } else {
          console.log('Fetched decks:', resultList.items);
          setDecks(resultList.items);
          if (resultList.items.length > 0) {
            setDeckId(resultList.items[0].id);
          }
        }
      }
    }

    async function fetchSelectedCards() {
      if (deckId) {
        setSelectedCardsLoading(true);
        const resultList = await pb.collection('decks_cards').getFullList(1, { filter: `deck = "${deckId}"` });
        if (resultList.status === 400) {
          console.error('Error fetching selected cards:', resultList);
          setSelectedCardsLoading(false);
          return;
        } else {
          setSelectedCards(resultList.items);
          setSelectedCardsLoading(false);
        }
      }
    }

    fetchUserDeck();
    fetchSelectedCards();
  }, [user]);
  return (
    <DeckContext.Provider value={{ selectedCards, setSelectedCards, selectedCardsLoading, numberOfPlayers, setNumberOfPlayers, total, setTotal, timer, setTimer }}>
      {children}
    </DeckContext.Provider>
  );
};
export default DeckContext;
