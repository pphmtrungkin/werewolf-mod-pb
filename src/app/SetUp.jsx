import React, { useEffect } from "react";
import { useState, useContext } from "react";
import SideButton from "../components/SideButton";
import Card from "../components/Card";
import { useNavigate, Outlet } from "react-router";
import UserContext from "../components/UserContext";
import Spinner from "../components/Spinner";
import { useCards } from "../hooks/useCards";
import { useSides } from "../hooks/useSides";
import useDecks from "../hooks/useDecks";
import useSelectedCards from "../hooks/useSelectedCards";
import { FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

export default function SetUp() {
  // cards and sides are provided by hooks (encapsulate fetching + state)
  const { cards, loading: cardsLoading, error: cardsError } = useCards();
  const { sides, loading: sidesLoading, error: sidesError } = useSides();
  const {
    decks,
    selectedDeck,
    setSelectedDeck,
    loading: decksLoading,
    error: decksError,
  } = useDecks();

  const navigate = useNavigate();

  const [filteredCards, setFilteredCards] = useState([]);

  const { user } = useContext(UserContext);

  const [numberOfPlayers, setNumberOfPlayers] = useState(1);
  const [timer, setTimer] = useState(300); // default 5 minutes

  const [selectedSideButton, setSelectedSideButton] = useState(1);

  const handleSideButtonClick = (id) => {
    setSelectedSideButton(id);
  };

  useEffect(() => {
    if (selectedDeck) {
     setNumberOfPlayers(selectedDeck.number_of_players);
    }
  }, [selectedDeck]);

  const {
    selectedCards,
    handleCardSelect,
    getCardCount,
    total,
    loadSelectedCards,
    isLoading: selectedCardsLoading,
    error: selectedCardsError,
    updateSelectedCards,
  } = useSelectedCards();

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  useEffect(() => {
    if (selectedDeck) {
      setNumberOfPlayers(selectedDeck.number_of_players);
      setTimer(selectedDeck.timer || 300);
    }
  }, [selectedDeck]);

  return (
    <>
      <Outlet />
      <div className="my-20 mx-60">
        <div className="text-4xl font-semibold text-center">Set Up</div>
        <hr className="w-4/5 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-8 dark:bg-gray-700" />
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
            <FormControl fullWidth sx={{ marginBottom: '20px' }}>
              <InputLabel id="deck-select-label" sx={{ color: 'white' }}>Select Deck</InputLabel>
              <Select
                labelId="deck-select-label"
                value={selectedDeck ? selectedDeck.id : ''}
                label="Select Deck"
                onChange={(e) => {
                  const deck = decks.find((d) => d.id === e.target.value);
                  setSelectedDeck(deck);
                }}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
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
            onClick={() => setNumberOfPlayers(numberOfPlayers - 1)}
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
            onClick={() => setNumberOfPlayers(numberOfPlayers + 1)}
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
        <hr className="w-4/5 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-8 dark:bg-gray-700" />

        <p className="text-center text-2xl font-semibold">Total: {total}</p>
        <hr className="w-4/5 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-8 dark:bg-gray-700" />

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
            {cards.map((card) => (
              <Card
                key={card.id}
                {...card}
                onSelect={() => handleCardSelect(card)}
                count={getCardCount(card)}
                selected={selectedCards.some(
                  (selectedCard) => selectedCard.id === card.id
                )}
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
            onClick={() => updateSelectedCards(selectedCards)}
          >
            Next Step
          </button>
        </div>
      </div>
    </>
  );
}
