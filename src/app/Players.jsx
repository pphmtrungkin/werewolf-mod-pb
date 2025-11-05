import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "../supabase";
import UserContext from "../components/UserContext";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Players() {
  const [showModal, setShowModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [numberOfPlayers, setNumberOfPlayers] = useState(0);
  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();

  const fetchPlayers = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
  
      if (error) {
        console.log("Error fetching players: ", error.message);
      } else {
        setPlayers(data);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    async function fetchNumberOfPlayers() {
      if (user) {
        const { data, error } = await supabase
          .from("decks")
          .select("number_of_players")
          .eq("id", user.id);
  
        if (error) {
          console.log("Error fetching number of players: ", error.message);
        } else {
          setNumberOfPlayers(data[0]?.number_of_players || 0);
        }
      }
    }

    fetchNumberOfPlayers();
  }, [user]);

  const handleRemovePlayer = useCallback(async (index) => {
    const player = players[index];
    const { error: deleteError } = await supabase.storage
      .from("players")
      .remove([`${user.id}/${player.name}.png`]);

    const { data, error } = await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    if (deleteError) {
      console.log("Error deleting player avatar: ", deleteError.message);
    }
    if (error) {
      console.log("Error deleting player: ", error.message);
    } else {
      console.log("Player deleted successfully: ", data);
      fetchPlayers(); // Refresh players list
    }
  }, [players, user.id, fetchPlayers]);

  const createGame = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase.from("games").insert({ deck_id: user.id }).select("id");

      if (error) {
        console.log("Error creating game: ", error.message);
      } else {
        console.log("Game created successfully: ", data);
      }

      const { data: nightData, error: nightError } = await supabase.from("nights").insert({
        game_id: data[0].id
      });

      if (nightError) {
        console.log("Error creating night: ", nightError.message);
      }
    }
  }, [user]);

  const handleStartGame = useCallback(async () => {
    if (players.length < numberOfPlayers && numberOfPlayers != null) {
      alert("Please add more players or you can change the number of players in the set up page");
      return;
    } else if (players.length > numberOfPlayers) {
      alert("Please remove some players or you can change the number of players in the set up page");
      return;
    } else {
      await createGame();
      navigate("/game");
    }
  }, [players.length, numberOfPlayers, createGame, navigate]);

  return (
    <div>
      <div>
        <Outlet />
        {showModal && (
          <Modal setShowModal={setShowModal} fetchPlayers={fetchPlayers} />
        )}
        <div className="my-20 mx-60">
          <h2 className="text-4xl font-semibold text-center">Players ({players.length}/{numberOfPlayers})</h2>
          <p className="text-2xl font-semibold text-center my-4">
            Please enter your players
          </p>
          <div className=" my-20 grid grid-cols-4 gap-y-20">
            {players.map((player, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center justify-center space-y-4"
              >
                <div className="relative overflow-hidden">
                  <button
                    type="button"
                    className="absolute top-0 right-0 p-2 bg-red-500 rounded-full hover:bg-red-600"
                    onClick={() => handleRemovePlayer(index)}
                  >
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
                        d="M6 18 17.94 6M18 18 6.06 6"
                      />
                    </svg>
                  </button>
                  <img
                    src={player.avatar_url}
                    alt="player"
                    className="w-60 h-60 object-cover rounded-full p-2"
                  />
                </div>
                <p className="text-lg font-semibold mt-4">{player.name}</p>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center">
              <button
                className=" w-52 h-52 rounded-full bg-gray-800 flex items-center justify-center"
                onClick={() => setShowModal(true)}
              >
                <svg
                  className="w-12 h-12 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <p className="text-lg font-semibold mt-4">Add Player</p>
            </div>
          </div>
          <div className="flex items-center justify-center my-20">
            <button
              className="w-1/3 h-12 bg-gray-500 text-white rounded-lg hover:bg-white hover:text-gray-800 text-lg font-semibold"
              onClick={handleStartGame}
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Modal = ({ setShowModal, fetchPlayers }) => {
  const { user } = React.useContext(UserContext);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const handleChange = (e) => {
    // handle file upload
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleAddPlayer = async () => {
    if (!playerName) {
      alert("Please enter player name");
      return;
    }

    if (file) {
      const { data, error } = await supabase.storage
        .from("players")
        .upload(`${user.id}/${playerName}.png`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.log("Error uploading image: ", error.message);
        return;
      }

      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("players")
        .getPublicUrl(`${user.id}/${playerName}.png`);

      if (publicUrlError) {
        console.log("Error getting public URL: ", publicUrlError.message);
        return;
      }

      const avatarUrl = publicUrlData.publicUrl;

      const { data: insertData, error: insertError } = await supabase
        .from("players")
        .insert([
          { user_id: user.id, name: playerName, avatar_url: avatarUrl },
        ]);

      if (insertError) {
        console.log("Error inserting player: ", insertError.message);
      } else {
        console.log("Player added successfully: ", insertData);
        setFile(null);
        setPreviewImage(null);
        setPlayerName("");
        setShowModal(false);
        fetchPlayers(); // Refresh players list
      }
    }

    if (previewImage && previewImage.startsWith("https")) {
      const { data: insertData, error: insertError } = await supabase
        .from("players")
        .insert([
          { user_id: user.id, name: playerName, avatar_url: previewImage },
        ]);

      if (insertError) {
        console.log("Error inserting player: ", insertError.message);
      } else {
        console.log("Player added successfully: ", insertData);
        setFile(null);
        setPreviewImage(null);
        setPlayerName("");
        setShowModal(false);
        fetchPlayers(); // Refresh players list
      }
    }
  };

  const profileImages = {
    1: "https://zdgmsalocmsmmwnlamyk.supabase.co/storage/v1/object/public/icons/profiles/man-profile.png",
    2: "https://zdgmsalocmsmmwnlamyk.supabase.co/storage/v1/object/public/icons/profiles/woman-profile.png",
  };

  const profileImageUrls = Object.values(profileImages);

  return (
    <div className="fixed inset-0 bg-[#231F20] bg-opacity-60 flex items-center justify-center z-40">
      <div className="flex flex-col items-center justify-center w-2/5 border-2 bg-[#231F20] dark:border-gray-600 rounded-lg z-50 p-8">
        <button
          className="self-end text-gray-500 dark:text-gray-400"
          onClick={() => setShowModal(false)}
        >
          <svg
            class="w-12 h-12 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              strokeWidth="2"
              d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </button>
        <div>
          {previewImage !== null ? (
            <div className="w-80 h-80 rounded-full overflow-hidden my-8">
              <img
                src={previewImage}
                alt="preview"
                className="w-80 h-80 object-cover rounded-lg"
              />
            </div>
          ) : (
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-80 h-80 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          )}
        </div>
        <div>
          <div className="flex items-center justify-center">
            {profileImageUrls.map((image, index) => (
              <button
                type="button"
                key={index}
                className="m-4 opacity-50 hover:opacity-100"
                onClick={() => setPreviewImage(image)}
              >
                <img
                  src={image}
                  alt="profile"
                  key={index}
                  className="w-20 h-20 object-cover rounded-full mx-2"
                />
              </button>
            ))}
            <button
              type="button"
              className="m-4 opacity-50 hover:opacity-100 w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center"
              onClick={() => setPreviewImage(null)}
            >
              <svg
                class="w-12 h-12 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  strokeWidth="2"
                  d="M5 12h14m-7 7V5"
                />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-96 h-12 mb-8 px-4 border-2 border-gray-300 rounded-lg dark:bg-[#231F20] dark:border-gray-600"
          />
        </div>
        {previewImage && (
          <div>
            <button
              className="w-96 h-12 mb-4 bg-gray-500 text-white rounded-lg hover:bg-white hover:text-gray-800 text-lg font-semibold"
              onClick={handleAddPlayer}
            >
              Add Player
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
