import { createTheme } from '@mui/material/styles';

// Dark Blue Glassmorphism Theme
export const darkBlueTheme = {
  light: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0A66FF',      // Bright Blue
        light: '#1E90FF',
        dark: '#0A66FF',
        gradient: 'linear-gradient(135deg, #0A66FF, #00C6FF)'
      },
      secondary: {
        main: '#00C6FF',      // Neon Blue Glow
        light: '#4FACFE',
        dark: '#0099CC',
        gradient: 'linear-gradient(135deg, #00C6FF, #4FACFE)'
      },
      background: {
        default: '#0F172A',   // Dark Navy
        paper: '#111827',      // Slightly lighter
        gradient: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E5E7EB',
        muted: '#9CA3AF',
      },
      success: {
        main: '#22C55E',
        light: '#4ADE80',
      },
      divider: '#1F2937',
    },
    shape: {
      borderRadius: 20,
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
            borderRadius: 20,
            padding: '10px 24px',
            textTransform: 'none',
            fontWeight: 600,
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
            boxShadow: '0 4px 20px rgba(0,102,255,0.3)',
            '&:hover': {
              boxShadow: '0 6px 25px rgba(0,102,255,0.4)',
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            borderColor: '#1E90FF',
            '&:hover': {
              borderColor: '#00C6FF',
              background: 'rgba(30,144,255,0.1)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            borderBottom: '1px solid rgba(30,144,255,0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(30,144,255,0.15)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 30px rgba(0,102,255,0.3)',
              border: '1px solid rgba(30,144,255,0.3)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
            backdropFilter: 'blur(12px)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0A66FF',
        light: '#1E90FF',
        dark: '#0099CC',
      },
      secondary: {
        main: '#00C6FF',
        light: '#4FACFE',
        dark: '#0088CC',
      },
      background: {
        default: '#020617',
        paper: '#0F172A',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E5E7EB',
      },
      success: {
        main: '#22C55E',
      },
    },
    shape: {
      borderRadius: 20,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(30,144,255,0.1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(2,6,23,0.9)',
            backdropFilter: 'blur(12px)',
          },
        },
      },
    },
  }),
};
