import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "../components/UserContext";

function Welcome() {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  
  //Retrieve previous session
  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-10 px-4">
      <img
        width={480}
        height='auto'
        src="https://img.freepik.com/premium-vector/silhouette-wolf-howling-full-moon-vector-illustration-pagan-totem-wiccan-familiar-spirit-art_726692-254.jpg"
        className="bg-[#231F20] h-auto mx-auto animate__animated animate__fadeIn"
      />
      <h2 className="text-5xl text-center font-bold tracking-wide animate__animated animate__slideInLeft">
        Werewolf Game
      </h2>
      
        <button
          className="bg-white px-6 py-4 rounded-full animate__animated animate__pulse animate__repeat-3 cursor-pointer"
          onClick={() => {
            {
              !user ? navigate("/auth/login") : navigate("/setup");
            }
          }}
        >
          <h2 className="text-black text-2xl font-semibold">
            Moderator Setup
          </h2>
        </button>
        <button>
          <h2 className="text-white text-2xl font-semibold mt-6 underline animate__animated animate__pulse animate__repeat-3 cursor-pointer"
            onClick={() => {
                navigate("/joinLobby");
            }}
          >
            Join as Player
          </h2>
        </button>
      </div>
  );
}
export default Welcome;
