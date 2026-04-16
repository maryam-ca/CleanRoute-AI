import { createTheme } from '@mui/material/styles';

// PURE DARK THEME - NO ORANGE, NO BEIGE
export const darkBlueTheme = {
  light: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0A66FF',
        light: '#00C6FF',
        dark: '#0057DB',
      },
      secondary: {
        main: '#00C6FF',
        light: '#67E8F9',
        dark: '#0891B2',
      },
      background: {
        default: '#020617',
        paper: '#0F172A',
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
    shape: { borderRadius: 20 },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 600,
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2F7DFF, #3FD7FF)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(10, 102, 255, 0.2)',
            borderRadius: 20,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(10, 102, 255, 0.3)',
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#0A66FF', light: '#00C6FF', dark: '#0057DB' },
      secondary: { main: '#00C6FF', light: '#67E8F9', dark: '#0891B2' },
      background: { default: '#020617', paper: '#0F172A' },
      text: { primary: '#FFFFFF', secondary: '#E5E7EB', disabled: '#9CA3AF' },
      success: { main: '#22C55E' },
      error: { main: '#EF4444' },
      warning: { main: '#F59E0B' },
    },
    shape: { borderRadius: 20 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(10, 102, 255, 0.2)',
          },
        },
      },
    },
  }),
};
