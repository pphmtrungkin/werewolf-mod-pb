import React from "react";
import ReactDOM from "react-dom/client";
import "../style.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Welcome from "./app/Welcome";
import SignUp from "./app/auth/SignUp";
import Login from "./app/auth/Login";
import SetUp from "./app/SetUp";
import Nav from "./components/Nav";
import Account from "./app/Account";
import ErrorPage from "./components/ErrorPage";
import Game from "./app/Game";
import Players from "./app/Players";
import { UserProvider } from "./components/UserContext";
import AuthLayout from "./app/auth/AuthLayout";
import { ThemeProvider } from "./components/ThemeContext";
import { ErrorProvider } from "./components/ErrorContext";
import Toast from "./components/Toast";
import Lobby from "./app/Lobby";
import JoinLobby from "./app/JoinLobby";
import OTP from "./app/auth/OTP";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      { path: "signup", element: <SignUp /> },
      { path: "login", element: <Login /> },
      { path: "otp", element: <OTP /> },
    ],
  },
  {
    path: "/setup",
    Component: Nav,
    children: [
      {
        path: "",
        element: <SetUp />,
      },
    ],
  },
  {
    path: "/players",
    element: <Players />,
    children: [
      {
        path: "",
        element: <Nav />,
      },
    ],
  },
  {
    path: "/account",
    Component: Nav,
    children: [
      {
        path: "",
        element: <Account />,
      },
    ],
  },
  {
    path: "/joinLobby",
    Component: AuthLayout,
    children: [
      {
        path: "",
        element: <JoinLobby />,
      },
    ],
  },
  {
    path: "/lobby/:lobbyId",
    Component: AuthLayout,
    children: [
      {
        path: "",
        element: <Lobby />,
      },
    ],
  },
  {
    path: "/game/:lobbyId",
    Component: AuthLayout,
    children: [
      {
        path: "",
        element: <Game />,
      },
    ],
  },
  {
    path: "*",
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </UserProvider>
  </React.StrictMode>,
);
