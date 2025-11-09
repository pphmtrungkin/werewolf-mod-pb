import { useState, useContext, useEffect } from "react";
import SideButton from "../components/SideButton";
import Card from "../components/Card";
import { useNavigate, Outlet } from "react-router";
import UserContext from "../components/UserContext";
import Spinner from "../components/Spinner";
import { useCards } from "../hooks/useCards";
import { useSides } from "../hooks/useSides";
import useDecks from "../hooks/useDecks";
import useSelectedCards from "../hooks/useSelectedCards";
import { FormControl, InputLabel, Select, MenuItem, IconButton, Alert, Collapse, Slide } from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function SetUp() {
  // cards and sides are provided by hooks (encapsulate fetching + state)
  const { cards, loading: cardsLoading, error: cardsError } = useCards();
  const { sides, loading: sidesLoading, error: sidesError } = useSides();
  const {
    decks,
    numberOfPlayers,
    setNumberOfPlayers,
    timer,
    setTimer,
    selectedDeck,
    setSelectedDeck,
    loading: decksLoading,
    error: decksError,
  } = useDecks();

  const navigate = useNavigate();

  const [filteredCards, setFilteredCards] = useState([]);

  const [selectedSideButton, setSelectedSideButton] = useState(null);

  const handleSideButtonClick = (id) => {
    setSelectedSideButton(id);
  };

  
  const {
    selectedCards,
    loadedSelectedCards,
    saveSelectedCards,
    handleCardSelect,
    getCardCount,
    total,
    loadSelectedCards,
    isLoading: selectedCardsLoading,
    error: selectedCardsError,
    showMaxPlayersAlert,
    setShowMaxPlayersAlert
  } = useSelectedCards(numberOfPlayers);
  
  useEffect(() => {
    if (selectedDeck) {
     console.log(selectedDeck); 
      setNumberOfPlayers(selectedDeck.number_of_players);
      setTimer(selectedDeck.timer || 300);
      loadSelectedCards(selectedDeck.id);
    }
  }, [selectedDeck]);

  useEffect(() => {
    if (!sides) return;
    setSelectedSideButton(sides[0]?.id || null);
  }, [sides]);

  // Add useEffect to filter cards when side is selected or cards change
  useEffect(() => {
    if (!cards) return;

    const filtered = cards.filter((card) => card.side === selectedSideButton);
    setFilteredCards(filtered);
  }, [selectedSideButton, cards]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
  return (
    <>
      <div className="my-28">
        {/* Add this alert near the top of your content */}
        <Slide
          direction="down"
          in={showMaxPlayersAlert}
          mountOnEnter
          unmountOnExit
          timeout={300}
        >
          <Alert 
            severity="warning"
            variant="filled"
            onClose={() => setShowMaxPlayersAlert(false)}
            sx={{ 
              position: 'fixed', 
              top: '80px', 
              width: '60%',
              zIndex: 20,
            }}
          >
            Maximum number of players ({numberOfPlayers}) reached. Remove cards to add different ones.
          </Alert>
        </Slide>

        <div className="text-4xl font-semibold text-center">Set Up</div>
        {/* Select Deck */}
        {
          decksLoading ? (
            <div className="flex justify-center items-center">
              <Spinner />
            </div>
          ) : decksError ? (
            <div className="text-red-500 text-center">
              Error loading decks: {decksError.message}
            </div>
          ) : (
            <FormControl fullWidth sx={{ marginBlock: '48px' }}>
              <InputLabel id="deck-select-label" sx={{fontWeight: '600', fontSize: '18px', color: 'var(--secondary)', '&.Mui-focused': { color: 'var(--secondary)' }, }}>Select Deck</InputLabel>
              <Select
                labelId="deck-select-label"
                value={selectedDeck ? selectedDeck.id : ''}
                label="Select Deck"
                onChange={(e) => {
                  const deck = decks.find((d) => d.id === e.target.value);
                  setSelectedDeck(deck);
                }}
                sx = {{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: '2px',
                      },
                    }}
                 >
                {decks.map((deck) => (
                  <MenuItem key={deck.id} value={deck.id}>
                    {deck.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        }
        <div className="flex justify-around items-center">
          <IconButton
            onClick={() => setNumberOfPlayers((prev) => Math.max(1, prev - 1))}
            sx={{
              backgroundColor: 'rgba(75, 85, 99, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(75, 85, 99, 1)',
              },
              color: 'white',
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <p className="text-center text-2xl font-semibold">
            Players: {numberOfPlayers}
          </p>
          
          <IconButton
            onClick={() => setNumberOfPlayers((prev) => prev + 1)}
            sx={{
              backgroundColor: 'rgba(75, 85, 99, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(75, 85, 99, 1)',
              },
              color: 'white',
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </div>
        <hr className="w-4/5 mx-auto my-4 border-1 rounded-sm md:my-8" style={{borderColor: 'var(--primary)'}} />

        <p className="text-center text-2xl font-semibold">Total: {total}</p>
        <hr className="w-4/5 mx-auto my-4 border-1 rounded-sm md:my-8" style={{borderColor: 'var(--primary)'}} />
        {/* Display number of selected cards*/}
        <p className="text-center text-lg font-medium mb-4">
            Selected Cards: {(selectedCards?.length ?? 0) + (loadedSelectedCards?.length ?? 0)}
        </p>

        <div className="flex justify-around items-center my-8">
          {sides.map((side) => (
            <SideButton
              key={side.id}
              id={side.id}
              name={side.name}
              hex_color={side.hex_color}
              selected={selectedSideButton === side.id}
              onClick={handleSideButtonClick}
            />
          ))}
        </div>

        {selectedCardsLoading ? (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                {...card}
                onSelect={() => handleCardSelect(card)}
                count={getCardCount(card)}
                // check if card is selected
                selected={getCardCount(card) > 0}
              />
            ))}
          </div>
        )}
        <hr className="w-4/5 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-8 dark:bg-gray-700" />
        <h1 className="text-4xl text-center font-semibold">Timer</h1>
        <div className="flex justify-around items-center my-8">
          <IconButton
            onClick={() => setTimer(timer - 1)}
            sx={{
              backgroundColor: 'rgba(75, 85, 99, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(75, 85, 99, 1)',
              },
              color: 'white',
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <h2 className="text-center text-6xl font-normal">
            {formatTime(timer)}
          </h2>
          <IconButton
            onClick={() => setTimer(timer + 1)}
            sx={{
              backgroundColor: 'rgba(75, 85, 99, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(75, 85, 99, 1)',
              },
              color: 'white',
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </div>
        <div className="flex justify-center mt-14">
          <button
            className="w-1/3 h-12 bg-gray-500 text-white rounded-lg hover:bg-white hover:text-gray-800 text-lg font-semibold"
            onClick={() => saveSelectedCards()}
          >
            Next Step
          </button>
        </div>
      </div>
    </>
  );
}
