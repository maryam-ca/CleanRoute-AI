import { createTheme } from '@mui/material/styles';

// Light Theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A66FF',
      light: '#1E90FF',
      dark: '#0A66FF',
    },
    secondary: {
      main: '#00C6FF',
      light: '#4FACFE',
      dark: '#0099CC',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    success: { main: '#22C55E' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, textTransform: 'none' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 20 },
      },
    },
  },
});

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A66FF',
      light: '#1E90FF',
      dark: '#0A66FF',
    },
    secondary: {
      main: '#00C6FF',
      light: '#4FACFE',
      dark: '#0099CC',
    },
    background: {
      default: '#0F172A',
      paper: '#1E293B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      disabled: '#9CA3AF',
    },
    success: { main: '#22C55E' },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, textTransform: 'none' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 20, background: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' },
      },
    },
  },
});

export const getTheme = (mode) => mode === 'light' ? lightTheme : darkTheme;
