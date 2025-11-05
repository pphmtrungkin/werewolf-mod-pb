import React, { useState, useEffect, useContext } from "react";
import StyleIcon from "@mui/icons-material/Style";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
const Spinner = () => {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
  );
};
const Nav = () => {
  const { user, avatar, loading } = useContext(UserContext);
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 w-screen min-h-20 z-10 flex items-center justify-between flex-wrap bg-[#241F21] px-40 py-4">
      <div className="px-2">
        <button
          type="button"
          className="hover:scale-125 transition"
          onClick={() => navigate("/setup")}
        >
          <StyleIcon fontSize="large" sx={{ color: "white" }} />
        </button>
      </div>
      <div className="flex">
        <button
          type="button"
          onClick={() => {
            if (user.role == "authenticated") {
              navigate("/account");
            }
          }}
          className="flex flex-row gap-x-2 items-center transition hover:scale-110 bg-white py-2 px-4 rounded-full"
        >
          {loading ? (
            <Spinner />
          ) : (
            <>
              <span aria-hidden="true" className="flex">
                {avatar ? (
                  <img src={avatar} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="black"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <p className="text-black text-base font-semibold">
                {user && user.user_metadata && user.user_metadata.username ? user.user_metadata.username : (user && user.user_metadata && user.user_metadata.fullname ? user.user_metadata.fullname : "Login")}
              </p>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Nav;
