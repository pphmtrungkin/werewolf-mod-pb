import { useCallback, useEffect, useState } from 'react';
import pbService from '../services/pbService';

export function useSides() {
  const [sides, setSides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await pbService.getSides();
      setSides(items || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { sides, loading, error, refresh: fetch };
}

export default useSides;
