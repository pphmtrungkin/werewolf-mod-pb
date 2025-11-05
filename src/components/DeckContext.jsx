import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import UserContext from './UserContext';
import { get } from 'lodash';
// Create a context
export const DeckContext = createContext();

// Create the provider
export const DeckProvider = ({ children }) => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedCardsLoading, setSelectedCardsLoading] = useState(true);
  const { user } = useContext(UserContext);
  const [deckId, setDeckId] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    async function getSelectedCards() {
      const { data, error } = await supabase
        .from("decks_cards")
        .select(`deck_card_id, cards (*)`)
        .eq("deck_id", user.id);

      if (error) {
        console.log("Error fetching selected cards: ", error);
        return;
      }

      if (data) {
        console.log("Data: ", data);
        const allSelectedCards = data.map((item) => {
          if (item.deck_card_id && item.cards) {
            return {
              ...item.cards,
              deck_card_id: item.deck_card_id,
            };
          }
          return null;
        }).filter(item => item !== null); // Filter out any null values
        setSelectedCards(allSelectedCards);
        console.log("Selected cards: ", allSelectedCards);
      }
      setSelectedCardsLoading(false);
    }

    async function getTotalValue() {
      const { data, error } = await supabase
        .from("decks_cards")
        .select("cards(score)")
        .eq("deck_id", user.id);
      
      if (error) {
        console.log("Error fetching total value: ", error);
        return;
      }

      if(data) {
        // console.log(data[0].cards.score);
        const total = data.reduce((acc, curr) => {
          // console.log("Acc: ", acc);
          return acc + curr.cards.score;
        }, 0);
        setTotal(total);
        console.log("Total: ", total);
      }
    }

    async function getNumberOfPlayers() {
      const { data, error } = await supabase
        .from("decks")
        .select("number_of_players")
        .eq("id", user.id);

      if (error) {
        console.log("Error fetching number of players: ", error);
        return;
      }

      if (data) {
        setNumberOfPlayers(data[0].number_of_players);
        console.log("Number of players: ", numberOfPlayers);
      }
    }

    async function getTimer(){
      const { data, error } = await supabase
        .from("decks")
        .select("timer")
        .eq("id", user.id);

      if (error) {
        console.log("Error fetching timer: ", error);
        return;
      }

      if (data) {
        console.log("Timer: ", data);
        setTimer(data[0].timer);
      }
    }
    if (user?.id) {
      getSelectedCards();
      getTotalValue(); 
      getNumberOfPlayers();
      getTimer();
    }
  }, [user?.id]);
  return (
    <DeckContext.Provider value={{ selectedCards, setSelectedCards, selectedCardsLoading, numberOfPlayers, setNumberOfPlayers, total, setTotal, timer, setTimer }}>
      {children}
    </DeckContext.Provider>
  );
};
export default DeckContext;

