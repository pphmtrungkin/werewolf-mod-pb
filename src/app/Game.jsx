import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabase";
import DeckContext from "../components/DeckContext";
import UserContext from "../components/UserContext";
import { useNavigate } from "react-router-dom";
import { Select, Option, input } from "@material-tailwind/react";
import Spinner from "../components/Spinner";

const Game = () => {
  const { selectedCards } = useContext(DeckContext);
  const { user } = useContext(UserContext);
  const [currentCard, setCurrentCard] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [chosenPlayers, setChosenPlayers] = useState([]);
  const [cardHolder, setCardHolder] = useState([]);
  const [targetHolder, setTargetHolder] = useState([]);
  const [gameId, setGameId] = useState(0);
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);

  const handleCardHolderChange = useCallback((index, value) => {
    setCardHolder((prev) => {
      const newCardHolder = [...prev];
      newCardHolder[index] = value;
      console.log("Card Holders: " + newCardHolder);
      return newCardHolder;
    });
  }, []);

  const handleTargetHolderChange = useCallback((index, value) => {
    setTargetHolder((prev) => {
      const newTargetHolder = [...prev];
      newTargetHolder[index] = value;
      console.log("Target Holders: " + newTargetHolder);
      return newTargetHolder;
    });
  }, []);

  const fetchPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      console.error("Error fetching players: ", error.message);
      return;
    }
    setPlayers(data);
  }, [user.id]);

  const fetchGameId = useCallback(async () => {
    const { data, error } = await supabase
      .from("games")
      .select("id")
      .eq("deck_id", user.id)
      .order("id", { ascending: false })
      .limit(1);
    if (error) {
      console.error("Error fetching game id: ", error.message);
      return;
    }
    setGameId(data[0].id);
    console.log("Game ID: ", data[0].id);
  }, [user.id]);

  useEffect(() => {
    if (user) {
      fetchPlayers();
      fetchGameId();
    }
  }, [user, fetchPlayers, fetchGameId]);

  // Filter out villager cards
  const filteredCards = useMemo(() => selectedCards.filter((card) => card.id !== 1), [selectedCards]);

  const cardCountMap = useMemo(() => {
    return filteredCards.reduce((acc, card) => {
      acc[card.title] = (acc[card.title] || 0) + 1;
      return acc;
    }, {});
  }, [filteredCards]);

  const uniqueCards = useMemo(() => {
    return Array.from(new Set(filteredCards.map((a) => a.title)))
      .map((title) => {
        return filteredCards.find((a) => a.title === title);
      })
      .sort((a, b) => a.id - b.id);
  }, [filteredCards]);

  const length = uniqueCards.length;

  const handleNext = useCallback(async () => {
    setChosenPlayers([...cardHolder]);

    for (let i = 0; i < cardHolder.length; i++) {
      const { data, error } = await supabase.from("game_cards").insert({
        game_id: gameId,
        card_id: uniqueCards[currentCard].id,
        player_id: cardHolder[i],
        target_id: targetHolder[i],
      });
    }

    for (let i = 0; i < actions.length; i++) {
      setCardHolder([]);
      setTargetHolder([]);
      setCurrentCard((prev) => (prev + 1) % length);
    }
  }, [cardHolder, targetHolder, gameId, uniqueCards, currentCard, actions]);

  const handlePrev = useCallback(() => {
    setCurrentCard((prev) => (prev - 1 + length) % length);
  }, [length]);

  useEffect(() => {
    if (uniqueCards[currentCard] && uniqueCards[currentCard].actions) {
      setActions(uniqueCards[currentCard].actions);
    } else {
      setActions([]);
    }
    console.log("Actions: ", actions);
  }, [currentCard, uniqueCards, actions]);

  const inputBox = (count) => {
    const inputs = [];
    for (let i = 0; i < count; i++) {
      inputs.push(
        <div key={i} className={`flex items-center ${count > 1 ? "mb-4" : ""}`}>
          <PlayerSelect
            selectedCard={cardHolder}
            handleSelectChange={handleCardHolderChange}
            currentCard={uniqueCards[currentCard]}
            players={players}
            index={i}
          />
        </div>
      );
    }
    return inputs;
  };

  const inputTargetBox = (count) => {
    const inputs = [];
    for (let i = 0; i < count; i++) {
      inputs.push(
        <div key={i} className={`flex items-center ${count > 1 ? "mb-4" : ""}`}>
          <div className="">
            <PlayerSelect
              selectedCard={targetHolder}
              handleSelectChange={handleTargetHolderChange}
              currentCard={uniqueCards[currentCard]}
              players={players}
              index={i}
            />
          </div>
          {uniqueCards[currentCard].title === "witch" && i === 0 ? (
            <img
              src="https://zdgmsalocmsmmwnlamyk.supabase.co/storage/v1/object/public/icons/verified.png"
              alt="shield icon"
              className="w-12 h-12 ml-2 bg-white rounded-full p-2"
            />
          ) : uniqueCards[currentCard].title === "witch" && i === 1 ? (
            <img
              src="https://zdgmsalocmsmmwnlamyk.supabase.co/storage/v1/object/public/icons/skull.png"
              alt="skull icon"
              className="w-12 h-12 ml-2"
            />
          ) : null}
        </div>
      );
    }
    return inputs;
  };

  const inputBoxes = uniqueCards[currentCard]
    ? inputBox(cardCountMap[uniqueCards[currentCard].title])
    : null;

  const inputTargetBoxes = uniqueCards[currentCard]
    ? inputTargetBox(uniqueCards[currentCard].number_of_targets || 0)
    : null;

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed z-20 inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#241F21] rounded-lg p-8 w-1/2">
            <div className="flex flex-col justify-center items-center">
              <svg
                className="w-32 h-32 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h1 className="text-2xl font-semibold text-center my-8">
                Do you wish to cancel this game?
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/setup")}
                  className="bg-red-500 text-white px-4 py-2 rounded-sm"
                >
                  Yes, Cancel this game
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="absolute right-12 top-4 p-4">
        <button
          onClick={() => setShowModal(true)}
          className="hover:bg-gray-200 rounded-full font-bold"
        >
          <svg
            className="w-14 h-14 text-gray-800 dark:text-white dark:hover:text-gray-800 p-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col justify-center items-center w-screen h-screen select-none">
        {length > 0 && (
          <div className="flex items-center mb-4">
            {currentCard !== 0 && (
              <button
                onClick={handlePrev}
                className="mr-4 absolute left-1/4 hover:bg-gray-200 rounded-full font-bold"
              >
                <svg
                  className="w-12 h-12 text-gray-800 dark:text-white dark:hover:text-gray-800 p-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m15 19-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {uniqueCards[currentCard] && (
              <div className="text-center">
                <img
                  src={uniqueCards[currentCard].link}
                  alt={uniqueCards[currentCard].title}
                  className="w-96 h-auto mx-20"
                />
                <h2 className="mt-2 font-semibold capitalize text-lg">
                  {uniqueCards[currentCard].title}
                </h2>
              </div>
            )}
            {currentCard !== length - 1 &&
              cardHolder.length > 0 &&
              targetHolder.length > 0 && (
                <button
                  onClick={handleNext}
                  className="ml-4 absolute right-1/4 hover:bg-gray-200 rounded-full font-bold animate__animated animate__pulse animate__repeat-3"
                >
                  <svg
                    className="w-12 h-12 text-gray-800 dark:text-white dark:hover:text-gray-800 p-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m9 5 7 7-7 7"
                    />
                  </svg>
                </button>
              )}
          </div>
        )}
        <div className="flex items-center justify-around gap-x-8">
          {players && <div>{inputBoxes}</div>}
          <div>
            {uniqueCards[currentCard].number_of_targets > 0 && (
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m7 16 4-4-4-4m6 8 4-4-4-4"
                />
              </svg>
            )}
          </div>
          {players && <div>{inputTargetBoxes}</div>}
        </div>
      </div>
    </>
  );
};

const PlayerSelect = ({
  handleSelectChange,
  players,
  index,
  currentCard,
}) => {
  const [selected, setSelected] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(null);

  const handleSelectPlayer = (player) => {
    setPlayerSelected(player);
    handleSelectChange(index, player.id);
    setSelected(false);
  };

  useEffect(() => {
    console.log("Players: ", players);
  }, [players]);

  useEffect(() => {
    setPlayerSelected(null);
  }, [currentCard]);

  return (
    <div className="w-48 relative">
      <div
        onClick={() => setSelected(!selected)}
        className="flex justify-around items-center cursor-pointer text-center border-b border-gray-200 p-2 py-4 rounded-lg hover:bg-gray-800 "
      >
        {playerSelected && (
          <img
            src={playerSelected.avatar_url}
            alt={playerSelected.name}
            className="w-10 h-10 rounded-full object-fill"
          />
        )}
        <h3 className="text-center font-semibold">
          {playerSelected ? playerSelected.name : "Select Player"}
        </h3>
        <div>
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m8 15 4 4 4-4m0-6-4-4-4 4"
            />
          </svg>
        </div>
      </div>
      <div className="">
        <ul
          className={`${
            selected ? "block" : "hidden"
          } absolute bg-white w-48 h-40 overflow-x-hidden overflow-y-auto z-10 rounded-md shadow-lg`}
          style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e0 #edf2f7" }}
        >
          {players.map((player) => (
            <li
              key={player.id}
              onClick={() => handleSelectPlayer(player)}
              className="flex justify-center items-center flex-row gap-x-4 hover:bg-blue-200 py-2 cursor-pointer"
            >
              <img
                src={player.avatar_url}
                alt={player.name}
                className=" w-10 h-10 rounded-full object-fill"
              />
              <span className="text-black">{player.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Game;