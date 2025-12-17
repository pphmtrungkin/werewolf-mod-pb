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
        try {
          const decks = await pbService.getDeck(user.id);
          setDecks(decks || []);
          if (decks && decks.length > 0) {
            setDeckId(decks[0].id);
          }
        } catch (error) {
          console.error('Error fetching decks:', error);
        }
      }
    }

    async function fetchSelectedCards() {
      if (deckId) {
        setSelectedCardsLoading(true);
        try {
          const cards = await pbService.getSelectedCards(deckId);
          setSelectedCards(cards || []);
        } catch (error) {
          console.error('Error fetching selected cards:', error);
        } finally {
          setSelectedCardsLoading(false);
        }
      }
    }

    fetchUserDeck();
    fetchSelectedCards();
  }, [user, deckId]);
  return (
    <DeckContext.Provider value={{ selectedCards, setSelectedCards, selectedCardsLoading, numberOfPlayers, setNumberOfPlayers, total, setTotal, timer, setTimer }}>
      {children}
    </DeckContext.Provider>
  );
};
export default DeckContext;
