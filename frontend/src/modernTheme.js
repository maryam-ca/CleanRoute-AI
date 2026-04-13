import { createTheme } from '@mui/material/styles';

// Modern Purple-Red color scheme
export const modernTheme = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#7C3AED',      // Vibrant Purple
        light: '#A78BFA',
        dark: '#5B21B6',
        gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
      },
      secondary: {
        main: '#EC4899',      // Pink
        light: '#F472B6',
        dark: '#BE185D',
        gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)'
      },
      accent: {
        main: '#F59E0B',      // Amber
        light: '#FBBF24',
        dark: '#D97706',
      },
      background: {
        default: '#FAF5FF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
          },
          contained: {
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            },
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#A78BFA',
        light: '#C4B5FD',
        dark: '#8B5CF6',
      },
      secondary: {
        main: '#F472B6',
        light: '#F9A8D4',
        dark: '#EC4899',
      },
      background: {
        default: '#1E1B2E',
        paper: '#2D2A3E',
      },
      text: {
        primary: '#F3F4F6',
        secondary: '#9CA3AF',
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: 'linear-gradient(135deg, #2D2A3E 0%, #1E1B2E 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #2D2A3E 0%, #1E1B2E 100%)',
          },
        },
      },
    },
  }),
};
