/**
 * Hook to manage card selection, count, and total score
 * @param {number} numberOfPlayers - Maximum number of players/cards to select
 */
import { useState, useCallback } from 'react';
import pbService from '../services/pbService';
import useDecks from './useDecks';

/**
 * Hook to manage card selection, count, and total score
 * @returns hook for managing selected cards tied to the currently selected deck
 */
export function useSelectedCards(numberOfPlayers = 0) {
  const [selectedCards, setSelectedCards] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMaxPlayersAlert, setShowMaxPlayersAlert] = useState(false);

  const getCardCount = useCallback((card) => {
    return selectedCards.filter(
      (selectedCard) => selectedCard.id === card.id
    ).length;
  }, [selectedCards]);

  const handleCardSelect = useCallback((card) => {
    const cardCount = getCardCount(card);
    const totalSelectedCards = selectedCards.length;
    const limit = card.card_limit > numberOfPlayers ? numberOfPlayers : card.card_limit;

    if (totalSelectedCards === numberOfPlayers) {
      // Only allow unselecting cards
      if (cardCount > 0) {
        const newSelectedCards = selectedCards.filter(
          (selectedCard) => selectedCard.id !== card.id
        );
        setSelectedCards(newSelectedCards);
        setTotal(prev => prev - card.score * cardCount);
      } else {
        // Show alert when trying to add more cards at max players
        setShowMaxPlayersAlert(true);
        // Auto-hide alert after 3 seconds
        setTimeout(() => setShowMaxPlayersAlert(false), 3000);
      }
    } else {
      // Allow selecting and unselecting cards
      if (cardCount < limit) {
        setSelectedCards([...selectedCards, card]);
        setTotal(prev => prev + card.score);
      } else if (cardCount === limit) {
        const newSelectedCards = selectedCards.filter(
          (selectedCard) => selectedCard.id !== card.id
        );
        setSelectedCards(newSelectedCards);
        setTotal(prev => prev - card.score * cardCount);
      }
    }
  }, [selectedCards, numberOfPlayers, getCardCount]);

  const loadSelectedCards = useCallback(async (deckId) => {
    if (!deckId) return;
    
    setIsLoading(true);
    try {
      const items = await pbService.getSelectedCards(deckId);
      setSelectedCards(items || []);
      const newTotal = (items || []).reduce((acc, card) => acc + card.score, 0);
      setTotal(newTotal);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty deps array since it doesn't depend on any external values

  /**
   * Save selected cards and optionally override the number of players
   * @param {string} userId
   * @param {number} [overrideNumberOfPlayers]
   */
  const saveSelectedCards = useCallback(async (userId, overrideNumberOfPlayers) => {
    try {
      setIsLoading(true);
      setError(null);
      const payloadPlayers = typeof overrideNumberOfPlayers === 'number' ? overrideNumberOfPlayers : numberOfPlayers;
      const result = await pbService.updateDeckCards({
        userId,
        selectedCards,
        numberOfPlayers: payloadPlayers
      });
      return { success: true, data: result };
    } catch (err) {
      console.error('Error saving selected cards:', err);
      setError(err.message);
      return { 
        success: false, 
        error: err?.message || 'Failed to save selected cards'
      };
    } finally {
      setIsLoading(false);
    }
  }, [selectedCards, numberOfPlayers]);

  return {
    selectedCards,
    total,
    isLoading,
    error,
    getCardCount,
    handleCardSelect,
    loadSelectedCards,
    saveSelectedCards,
    showMaxPlayersAlert,
    setShowMaxPlayersAlert
  };
}

export default useSelectedCards;