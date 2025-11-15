import { useCallback, useEffect, useState } from 'react';
import pbService from '../services/pbService';

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await pbService.getCards();
      // pb returns an array of records (PocketBase JS client)
      setCards(items || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { cards, loading, error, refresh: fetch };
}

export default useCards;
