import { useState, useCallback } from "react";
import pbService from "../services/pbService";

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
        if (cardCount > 0) {
          handleCardUnSelect(card);
        } else {
          setShowMaxPlayersAlert(true);
          setTimeout(() => setShowMaxPlayersAlert(false), 3000);
        }
      } else {
        if (cardCount < limit) {
          if (removedCards.find((removedCard) => removedCard.id === card.id)) {
            setRemovedCards((prev) => prev.filter((removedCard) => removedCard.id !== card.id));
            setLoadedSelectedCards((prev) => [...prev, card]);
          } else {
            setSelectedCards((prev) => [...prev, card]);
          }
          setTotal((prev) => prev + card.score);
        } else if (cardCount === limit) {
          handleCardUnSelect(card);
        }
      }
    },
    [selectedCards, numberOfPlayers, getCardCount, handleCardUnSelect, loadedSelectedCards, removedCards],
  );

  const handleCardUnSelect = useCallback(
    (card) => {
      const cardCount = getCardCount(card);
      try {
        const isInDatabase = loadedSelectedCards.find((loadedCard) => loadedCard.id === card.id);
        if (isInDatabase) {
          const numberOfCards = loadedSelectedCards.filter(
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
    [selectedCards, loadedSelectedCards, getCardCount],
  );

  /**
   * Load selected cards for a given deck ID
   * @param {string} deckId
   */
  const loadSelectedCards = useCallback(async (deckId) => {
    if (!deckId) {return;}

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
      if (!deckId) {return;}

      setIsLoading(true);
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
