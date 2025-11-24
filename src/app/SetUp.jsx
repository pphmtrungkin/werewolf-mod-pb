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
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Collapse,
  Slide,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AlertDialog from "../components/AlertDialog";
import useLobbies from "../hooks/useLobbies";

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

  const [open, setOpen] = useState(false);
  const { user } = useContext(UserContext);
  const { lobby, hostLobby } = useLobbies(
    user,
    selectedDeck ? selectedDeck.id : null
  );

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
    setShowMaxPlayersAlert,
  } = useSelectedCards(numberOfPlayers);

  useEffect(() => {
    if (selectedDeck) {
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
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCreateLobby = async () => {
    try {
      setOpen(false);
      const result = await hostLobby(user, selectedDeck.id);
      if (result && result.lobbyId) {
        navigate("/lobby/" + result.lobbyId);
      } else {
        console.error("Failed to host lobby", result);
      }
    } catch (err) {
      console.error("Error hosting lobby", err);
    }
  };

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
              position: "fixed",
              top: "80px",
              width: "60%",
              zIndex: 20,
            }}
          >
            Maximum number of players ({numberOfPlayers}) reached. Remove cards
            to add different ones.
          </Alert>
        </Slide>

        <div className="text-4xl font-semibold text-center">Set Up</div>
        {/* Select Deck */}
        {decksLoading ? (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        ) : decksError ? (
          <div className="text-red-500 text-center">
            Error loading decks: {decksError.message}
          </div>
        ) : (
          <FormControl
            sx={{
              width: "80%",
              display: "flex",
              marginInline: "auto",
              marginBlock: "48px",
            }}
          >
            <InputLabel
              id="deck-select-label"
              sx={{
                fontWeight: "600",
                color: "var(--accent)",
                "&.Mui-focused": { borderColor: "var(--accent)" },
              }}
            >
              Select Deck
            </InputLabel>
            <Select
              labelId="deck-select-label"
              value={selectedDeck ? selectedDeck.id : ""}
              label="Select Deck"
              onChange={(e) => {
                const deck = decks.find((d) => d.id === e.target.value);
                setSelectedDeck(deck);
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "var(--background)",
                    color: "var(--accent)",
                  },
                },
              }}
              sx={{
                color: "var(--text)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderWidth: "2px",
                  borderColor: "var(--secondary)",
                },
                ":hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--secondary)",
                },
                "& .MuiSvgIcon-root": { color: "var(--secondary)" },
              }}
            >
              {decks.map((deck) => (
                <MenuItem
                  key={deck.id}
                  value={deck.id}
                  sx={{ color: "var(--text)" }}
                >
                  {deck.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <div className="flex justify-around items-center">
          <IconButton
            color="primary"
            size="large"
            onClick={() => setNumberOfPlayers((prev) => Math.max(1, prev - 1))}
          >
            <KeyboardArrowLeftIcon fontSize="inherit" />
          </IconButton>
          <p className="text-center text-xl font-semibold">
            Players: {numberOfPlayers}
          </p>

          <IconButton
            color="primary"
            size="large"
            onClick={() => setNumberOfPlayers((prev) => prev + 1)}
          >
            <KeyboardArrowRightIcon fontSize="inherit" />
          </IconButton>
        </div>
        <hr
          className="w-4/5 h-1 mx-auto my-4 border-0 rounded-sm md:my-8"
          style={{ backgroundColor: "var(--secondary" }}
        />

        {/* Display total number of selected cards */}
        <p
          className="text-center text-2xl font-semibold"
          style={{ color: "var(--text)" }}
        >
          Total: {total}
        </p>
        <hr
          className="w-4/5 h-1 mx-auto my-4 border-0 rounded-sm md:my-8"
          style={{ backgroundColor: "var(--secondary" }}
        />

        {/* Display number of selected cards*/}
        <p
          className="text-center text-lg font-medium mb-4"
          style={{ color: "var(--text)" }}
        >
          Selected Cards:{" "}
          {(selectedCards?.length ?? 0) + (loadedSelectedCards?.length ?? 0)}
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
        <hr
          className="w-4/5 h-1 mx-auto my-4 border-0 rounded-sm md:my-8"
          style={{ backgroundColor: "var(--secondary" }}
        />

        <h1 className="text-4xl text-center font-semibold">Timer</h1>
        <div className="flex justify-around items-center my-8">
          <IconButton onClick={() => setTimer(timer - 1)} size="large">
            <KeyboardArrowLeftIcon fontSize="inherit" />
          </IconButton>
          <h2 className="text-center text-6xl font-normal">
            {formatTime(timer)}
          </h2>
          <IconButton onClick={() => setTimer(timer + 1)} size="large">
            <KeyboardArrowRightIcon fontSize="inherit" />
          </IconButton>
        </div>
        <div className="flex justify-center mt-14">
          <button
            type="button"
            className="w-1/3 h-12 bg-gray-500 text-white rounded-lg hover:bg-white hover:text-gray-800 text-lg font-semibold transition-colors duration-200"
            onClick={() => saveSelectedCards(selectedDeck.id)}
          >
            Save the setup
          </button>
        </div>
        <div className="flex justify-center mt-8">
          <AlertDialog
            open={open}
            setOpen={setOpen}
            openButtonTitle="Host a Game"
            handleConfirm={handleCreateLobby}
            title="Confirm Setup"
            message="Are you sure you want to start hosting a game with the current setup?"
          />
        </div>
      </div>
    </>
  );
}
