import { createContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext({ isDarkMode: false, toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const darkTheme = {
    palette: {
      mode: 'dark',
      primary: {
        main: '#c2b2b5',
        contrastText: '#231f20',
      },
      secondary: {
        main: '#364153',
        contrastText: '#f4f1f2',
      },
      divider: '#629db7',
      text: {
        primary: 'rgb(244, 241, 242)',
        secondary: 'rgba(244, 241, 242, 0.6)',
        disabled: 'rgba(244, 241, 242, 0.38)',
        hint: 'rgb(98, 157, 183)',
      },
      background: {
        default: '#231f20',
      },
    },
  };

  const lightTheme = {
    palette: {
      mode: 'light',
      primary: {
        main: '#4d3d40',
        contrastText: '#e0dcdd',
      },
      secondary: {
        main: '#acb7c9',
        contrastText: '#0e0b0c',
      },
      divider: '#48849d',
      text: {
        primary: 'rgb(14, 11, 12)',
        secondary: 'rgba(14, 11, 12, 0.6)',
        disabled: 'rgba(14, 11, 12, 0.38)',
        hint: 'rgb(72, 132, 157)',
      },
      background: {
        default: '#e0dcdd',
      },
    },
  };

  const theme = createTheme(isDarkMode ? darkTheme : lightTheme);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // persist selection
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Apply CSS variables to :root so non-MUI parts (tailwind/CSS vars) update immediately
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--text', '#f4f1f2');
      root.style.setProperty('--background', '#231f20');
      root.style.setProperty('--primary', '#c2b2b5');
      root.style.setProperty('--secondary', '#364153');
      root.style.setProperty('--accent', '#629db7');
    } else {
      root.style.setProperty('--text', '#0e0b0c');
      root.style.setProperty('--background', '#e0dcdd');
      root.style.setProperty('--primary', '#4d3d40');
      root.style.setProperty('--secondary', '#acb7c9');
      root.style.setProperty('--accent', '#48849d');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode: isDarkMode, toggleTheme, theme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;