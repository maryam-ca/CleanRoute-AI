import { createTheme } from '@mui/material/styles';

// Pure Dark Theme - Professional Dark Mode
export const darkTheme = createTheme({
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
    success: {
      main: '#22C55E',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    divider: '#1F2937',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
    h1: { fontWeight: 800, color: '#FFFFFF' },
    h2: { fontWeight: 800, color: '#FFFFFF' },
    h3: { fontWeight: 700, color: '#FFFFFF' },
    h4: { fontWeight: 700, color: '#FFFFFF' },
    h5: { fontWeight: 600, color: '#E5E7EB' },
    h6: { fontWeight: 600, color: '#E5E7EB' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E90FF, #4FACFE)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))',
          border: '1px solid rgba(10,102,255,0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(10,102,255,0.3)',
        },
      },
    },
  },
});
