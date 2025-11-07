import React, {useState, useEffect, useMemo} from 'react'
import ReactDOM from 'react-dom/client'
import '../style.css'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
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
        <MuiThemeWrapper>
          <RouterProvider router={router} />
        </MuiThemeWrapper>
      </UserProvider>
    </React.StrictMode>
  );
}

function MuiThemeWrapper({ children }) {
  const [mode, setMode] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const obs = new MutationObserver(() => {
      const m = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setMode(m);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const theme = useMemo(() => createTheme({
    palette: (() => {
      // Read CSS variables at runtime and pass concrete color strings to MUI
      const getVar = (name, fallback) => {
        try {
          if (typeof document === 'undefined') return fallback || name;
          const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
          return v || fallback || name;
        } catch (e) {
          return fallback || name;
        }
      };

      const primary = getVar('--primary', '#acb7c9');
      const secondary = getVar('--secondary', '#48849d');
      const background = getVar('--background', '#dedad9');
      const text = getVar('--text', '#1f0d0a');

      return {
        mode,
        primary: { main: primary },
        secondary: { main: secondary },
        background: { default: background, paper: background },
        text: { primary: text },
      };
    })(),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'var(--background)',
            color: 'var(--text)'
          }
        }
      }
    }
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

// Prevent double createRoot during HMR: reuse existing root if present
const container = document.getElementById('root');
if (window.__react_root__) {
  window.__react_root__.render(<App />);
} else {
  window.__react_root__ = ReactDOM.createRoot(container);
  window.__react_root__.render(<App />);
}