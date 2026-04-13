import { createTheme } from '@mui/material/styles';

// Modern Red-Cyan color scheme
export const modernTheme = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#EF4444',      // Vibrant Red
        light: '#F87171',
        dark: '#DC2626',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
      },
      secondary: {
        main: '#06B6D4',      // Cyan
        light: '#22D3EE',
        dark: '#0891B2',
        gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'
      },
      accent: {
        main: '#F59E0B',      // Amber
        light: '#FBBF24',
        dark: '#D97706',
      },
      background: {
        default: '#FEF2F2',
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
          containedPrimary: {
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(239,68,68,0.4)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
            boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
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
        main: '#F87171',
        light: '#FCA5A5',
        dark: '#EF4444',
      },
      secondary: {
        main: '#22D3EE',
        light: '#67E8F9',
        dark: '#06B6D4',
      },
      background: {
        default: '#1F1A1A',
        paper: '#2D2222',
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
            background: 'linear-gradient(135deg, #2D2222 0%, #1F1A1A 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #2D2222 0%, #1F1A1A 100%)',
          },
        },
      },
    },
  }),
};
