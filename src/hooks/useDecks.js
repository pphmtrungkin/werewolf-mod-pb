import { useCallback } from "react";
import { useContext, useEffect, useState } from "react";
import pbService from "../services/pbService";
import UserContext from "../components/UserContext";

function useDecks() {
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [numberOfPlayers, setNumberOfPlayers] = useState(null);
    const [timer, setTimer] = useState(300); // default 5 minutes

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
            const list = items || [];
            const defaultDeck = list.find(d => d && d.name && d.name.toLowerCase().includes('default'));
            setSelectedDeck(defaultDeck || list[0] || null);
            // initial sync here is fine but we'll also sync on selectedDeck change below
            setNumberOfPlayers(defaultDeck?.number_of_players ?? 0);
            setTimer(defaultDeck?.timer ?? 300);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchDecks();
        }
    }, [user, fetchDecks]);

    // keep numberOfPlayers & timer in sync when selectedDeck is changed elsewhere
    useEffect(() => {
      if (selectedDeck) {
        setNumberOfPlayers(selectedDeck.number_of_players ?? 0);
        setTimer(selectedDeck.timer ?? 300);
      }
    }, [selectedDeck, setNumberOfPlayers, setTimer]);

    return {
        decks,
        selectedDeck,
        setSelectedDeck,
        numberOfPlayers,
        setNumberOfPlayers,
        timer,
        setTimer,
        loading,
        error,
        refresh: fetchDecks
    };
}

export default useDecks;