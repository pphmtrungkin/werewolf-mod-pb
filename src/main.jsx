import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  BrowserRouter,
  RouterProvider,
  Routes, Route
} from "react-router-dom";
import Welcome from './app/Welcome';
import SignUp from './app/SignUp';
import Login from './app/Login';
import SetUp from './app/SetUp';
import Nav from './components/Nav';
import Account from './app/Account';
import ErrorPage from './components/ErrorPage';
import Game from './app/Game'
import Players from './app/Players'
import {DeckProvider} from './components/DeckContext'
import { UserProvider } from './components/UserContext';
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Welcome />,
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/setup",
      element: <SetUp />,
      children: [
        {
          path: "",
          element: <Nav />,
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
      element: <Account />,
      children: [
        {
          path: "",
          element: <Nav />,
        },
      ],
    }, {
      path: '/game',
      element: <Game />
    },
    {
      path: "*",
      errorElement: <ErrorPage />,
    }
  ]);

  return (
    <React.StrictMode>
      <UserProvider>
        <DeckProvider>
          <RouterProvider router={router} />
        </DeckProvider>
      </UserProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);