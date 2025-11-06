import { useCallback } from "react";
import { useContext, useEffect, useState } from "react";
import pbService from "../services/pbService";
import UserContext from "../components/UserContext";

function useDecks() {
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {user} = useContext(UserContext);

    const fetchDecks = useCallback(async () => {
        if (!user) {
            setError(new Error('User not authenticated'));
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const items = await pbService.getDeck(user.id);
            console.log('Fetched decks in useDecks:', items);
            setDecks(items || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]); // Add user to dependencies

    useEffect(() => {
        if (user) {
            fetchDecks();
        }
    }, [user, fetchDecks]); // Add both user and fetchDecks to dependencies

    return {
        decks,
        selectedDeck,
        setSelectedDeck,
        loading,
        error,
        refresh: fetchDecks
    };
}

export default useDecks;