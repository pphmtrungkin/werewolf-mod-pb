import { useState, useCallback, useEffect } from "react";
import pbService from "../services/pbService";
import useDecks from "./useDecks";

/**
 * Hook to manage card selection, count, and total score
 * @returns hook for managing selected cards tied to the currently selected deck
 */
export function useSelectedCards(numberOfPlayers = 0) {
  // State variables
  const [loadedSelectedCards, setLoadedSelectedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [removedCards, setRemovedCards] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMaxPlayersAlert, setShowMaxPlayersAlert] = useState(false);

  // Get the count of a specific card in both loaded and selected cards
  const getCardCount = useCallback(
    (card) => {
      let count = 0;
      if (loadedSelectedCards.length > 0) {
        count += loadedSelectedCards.filter((loadedCard) => loadedCard.id === card.id).length;
      }
      count += selectedCards.filter((selectedCard) => selectedCard.id === card.id).length;
      return count;
    },
    [loadedSelectedCards, selectedCards],
  );

  // Handle selecting a card
  const handleCardSelect = useCallback(
    (card) => {
      const cardCount = getCardCount(card);
      const totalSelectedCards = selectedCards.length + loadedSelectedCards.length;
      const limit = card.card_limit > numberOfPlayers ? numberOfPlayers : card.card_limit;

      if (totalSelectedCards >= numberOfPlayers) {
        // Only allow unselecting cards because max players reached
        if (cardCount > 0) {
          // Unselect the card
          handleCardUnSelect(card);
        } else {
          // Show alert when trying to add more cards at max players
          setShowMaxPlayersAlert(true);
          // Auto-hide alert after 3 seconds
          setTimeout(() => setShowMaxPlayersAlert(false), 3000);
        }
      } else {
        // Allow selecting and unselecting cards
        if (cardCount < limit) {
          if (removedCards.find((removedCard) => removedCard.id === card.id)) {
            // If the card was previously removed, restore it
            setRemovedCards((prev) => prev.filter((removedCard) => removedCard.id !== card.id));
            setLoadedSelectedCards((prev) => [...prev, card]);
          } else {
            // Otherwise, add it to selected cards
            setSelectedCards((prev) => [...prev, card]);
          }
          setTotal((prev) => prev + card.score);
        } else if (cardCount === limit) {
          handleCardUnSelect(card);
        }
      }
    },
    [selectedCards, numberOfPlayers, getCardCount],
  );

  const handleCardUnSelect = useCallback(
    (card) => {
      const cardCount = getCardCount(card);
      try {
        // Check if the card exists in loadedSelectedCards
        const isInDatabase = loadedSelectedCards.find((loadedCard) => loadedCard.id === card.id);
        if (isInDatabase) {
          let numberOfCards = loadedSelectedCards.filter(
            (loadedCard) => loadedCard.id === card.id,
          ).length;
          setRemovedCards((prev) => [...prev, ...Array(numberOfCards).fill(card)]);
          setLoadedSelectedCards((prev) => prev.filter((loadedCard) => loadedCard.id !== card.id));
          if (cardCount > numberOfCards) {
            const newSelectedCards = selectedCards.filter(
              (selectedCard) => selectedCard.id !== card.id,
            );
            setSelectedCards(newSelectedCards);
          }
        } else {
          const newSelectedCards = selectedCards.filter(
            (selectedCard) => selectedCard.id !== card.id,
          );
          setSelectedCards(newSelectedCards);
        }
        setTotal((prev) => prev - card.score * cardCount);
      } catch (err) {
        console.error("Error unselecting card:", err);
      }
    },
    [selectedCards, loadedSelectedCards, removedCards],
  );

  /**
   * Load selected cards for a given deck ID
   * @param {string} deckId
   */
  const loadSelectedCards = useCallback(async (deckId) => {
    if (!deckId) return;

    setIsLoading(true);
    try {
      const items = await pbService.getSelectedCards(deckId);
      setLoadedSelectedCards(items || []);
      const newTotal = (items || []).reduce((acc, card) => acc + card.score, 0);
      setTotal(newTotal);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty deps array since it doesn't depend on any external values

  // Save selected cards to the backend for a given deck ID
  // Remove cards in the removedCards array and add cards in the selectedCards array
  // Then clear both arrays
  const saveSelectedCards = useCallback(
    async (deckId, deckInfo) => {
      if (!deckId) return;

      setIsLoading(true);
      console.log("Saving selected cards");
      console.log("Deck ID and info:", deckId, deckInfo);
      try {
        // Remove cards
        for (const card of removedCards) {
          await pbService.deleteSelectedCard(deckId, card.id);
        }
        setRemovedCards([]);

        // Add selected cards
        for (const card of selectedCards) {
          await pbService.addSelectedCard(deckId, card.id);
          setLoadedSelectedCards((prev) => [...prev, card]);
        }
        setSelectedCards([]);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }

      try {
        await pbService.updateDeck(deckId, deckInfo);
      } catch (err) {
        setError(err);
      }
    },
    [removedCards, selectedCards],
  );

  return {
    selectedCards,
    total,
    isLoading,
    error,
    getCardCount,
    handleCardSelect,
    loadSelectedCards,
    loadedSelectedCards,
    saveSelectedCards,
    showMaxPlayersAlert,
    setShowMaxPlayersAlert,
  };
}

export default useSelectedCards;
