import { createTheme } from '@mui/material/styles';

// Brown & White Theme - Warm, Earthy, Professional
export const brownTheme = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#795548',      // Brown
        light: '#A1887F',
        dark: '#5D4037',
        gradient: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)'
      },
      secondary: {
        main: '#D7CCC8',      // Light Brown / Beige
        light: '#EFEBE9',
        dark: '#BCAAA4',
        gradient: 'linear-gradient(135deg, #D7CCC8 0%, #BCAAA4 100%)'
      },
      accent: {
        main: '#8D6E63',      // Warm Brown
        light: '#A1887F',
        dark: '#6D4C41',
      },
      background: {
        default: '#FAF7F2',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#3E2723',
        secondary: '#795548',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
      h1: { fontWeight: 800, color: '#3E2723' },
      h2: { fontWeight: 800, color: '#3E2723' },
      h3: { fontWeight: 700, color: '#3E2723' },
      h4: { fontWeight: 700, color: '#3E2723' },
      h5: { fontWeight: 600, color: '#3E2723' },
      h6: { fontWeight: 600, color: '#3E2723' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
            boxShadow: '0 4px 14px rgba(121,85,72,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(121,85,72,0.4)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #D7CCC8 0%, #BCAAA4 100%)',
            color: '#3E2723',
            boxShadow: '0 4px 14px rgba(215,204,200,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(215,204,200,0.4)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#A1887F',
        light: '#BCAAA4',
        dark: '#8D6E63',
      },
      secondary: {
        main: '#5D4037',
        light: '#795548',
        dark: '#4E342E',
      },
      background: {
        default: '#1A110E',
        paper: '#2D1F1A',
      },
      text: {
        primary: '#EFEBE9',
        secondary: '#D7CCC8',
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
            background: 'linear-gradient(135deg, #2D1F1A 0%, #1A110E 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #2D1F1A 0%, #1A110E 100%)',
          },
        },
      },
    },
  }),
};
