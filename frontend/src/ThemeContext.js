import React, { useState, useEffect, createContext, useContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = {
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  };

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#10B981' },
      secondary: { main: '#3B82F6' },
      background: { default: '#F3F4F6', paper: '#FFFFFF' },
    },
    shape: { borderRadius: 12 },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#10B981' },
      secondary: { main: '#3B82F6' },
      background: { default: '#121212', paper: '#1E1E1E' },
    },
    shape: { borderRadius: 12 },
  });

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
