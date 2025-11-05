import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";

function Welcome() {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  
  //Retrieve previous session
  return (
    <div className="relative w-full h-full">
      <img
        width={480}
        height='auto'
        src="https://img.freepik.com/premium-vector/silhouette-wolf-howling-full-moon-vector-illustration-pagan-totem-wiccan-familiar-spirit-art_726692-254.jpg"
        className="bg-[#231F20] h-auto mx-auto animate__animated animate__fadeIn"
      />
      <h2 className="text-5xl text-center font-bold tracking-wide animate__animated animate__slideInLeft">
        Werewolf Game
      </h2>
      <div className="flex justify-center mt-10">
        <button
          className="bg-white px-5 py-3 rounded-full relative sanimate__pulse animate__delay-2s animate__repeat-3"
          onClick={() => {
            {
              !user ? navigate("/login") : navigate("/setup");
            }
          }}
        >
          <h2 className="text-black text-2xl font-semibold p-1 px-2">
            Press to continue
          </h2>
        </button>
      </div>
    </div>
  );
}
export default Welcome;
