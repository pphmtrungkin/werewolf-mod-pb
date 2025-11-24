import React, {useState, useEffect, useMemo} from 'react'
import ReactDOM from 'react-dom/client'
import '../style.css'
import { createTheme, CssBaseline } from '@mui/material'
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
import { ThemeProvider } from './components/ThemeContext';
import Lobby from './app/Lobby';


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
      path: '/lobby/:id',
      Component: AuthLayout,
      children: [
        {
          path: '',
          element: <Lobby />,
        },
      ],
    },
    {
      path: "*",
      errorElement: <ErrorPage />,
    }
  ]);

  return (
    <React.StrictMode>
      <UserProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </UserProvider>
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
