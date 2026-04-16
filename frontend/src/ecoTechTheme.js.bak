import { createTheme } from '@mui/material/styles';

// Eco-Tech Theme - Forest Green + Ocean Teal
export const ecoTechTheme = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#2E7D32',      // Forest Green
        light: '#4CAF50',
        dark: '#1B5E20',
        gradient: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)'
      },
      secondary: {
        main: '#00897B',      // Ocean Teal
        light: '#26A69A',
        dark: '#00695C',
        gradient: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)'
      },
      background: {
        default: '#F5F5F5',   // Off-white
        paper: '#FFFFFF',      // Clean White
      },
      surface: {
        main: '#FAFAFA',       // Light Gray for cards
      },
      text: {
        primary: '#263238',    // Dark Slate
        secondary: '#546E7A',  // Cool Gray
      },
      error: {
        main: '#D84315',       // Deep Orange
        light: '#FF8F00',      // Amber
      },
      success: {
        main: '#00ACC1',       // Mint Green
      },
      divider: '#E0E0E0',      // Soft Gray
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
      h1: { fontWeight: 800, color: '#263238' },
      h2: { fontWeight: 800, color: '#263238' },
      h3: { fontWeight: 700, color: '#263238' },
      h4: { fontWeight: 700, color: '#263238' },
      h5: { fontWeight: 600, color: '#263238' },
      h6: { fontWeight: 600, color: '#263238' },
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
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(46,125,50,0.4)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
            boxShadow: '0 4px 14px rgba(0,137,123,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,137,123,0.4)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
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
            backgroundColor: '#FAFAFA',
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#4CAF50',
        light: '#81C784',
        dark: '#2E7D32',
      },
      secondary: {
        main: '#26A69A',
        light: '#4DB6AC',
        dark: '#00897B',
      },
      background: {
        default: '#1a2a1a',
        paper: '#2d3a2d',
      },
      text: {
        primary: '#E0E0E0',
        secondary: '#9E9E9E',
      },
      error: {
        main: '#FF8F00',
      },
      success: {
        main: '#00ACC1',
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
            background: 'linear-gradient(135deg, #2d3a2d 0%, #1a2a1a 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #1a2a1a 0%, #0d1a0d 100%)',
          },
        },
      },
    },
  }),
};
