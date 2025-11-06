import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  BrowserRouter,
  RouterProvider,
  Routes, Route
} from "react-router";
import Welcome from './app/Welcome';
import SignUp from './app/auth/SignUp';
import Login from './app/auth/Login';
import SetUp from './app/SetUp';
import Nav from './components/Nav';
import Account from './app/Account';
import ErrorPage from './components/ErrorPage';
import Game from './app/Game'
import Players from './app/Players'
import {DeckProvider} from './components/DeckContext'
import { UserProvider } from './components/UserContext';
import AuthLayout from './app/auth/AuthLayout';

function App() {
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
      ],
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