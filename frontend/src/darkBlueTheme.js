import { createTheme } from '@mui/material/styles';

// Dark Blue Glassmorphism Theme - Complete
export const darkBlueTheme = {
  light: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0A66FF',
        light: '#1E90FF',
        dark: '#0A66FF',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#00C6FF',
        light: '#4FACFE',
        dark: '#0099CC',
        contrastText: '#FFFFFF',
      },
      background: {
        default: '#0F172A',
        paper: 'rgba(17,24,39,0.8)',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E5E7EB',
        disabled: '#9CA3AF',
      },
      success: {
        main: '#22C55E',
        light: '#4ADE80',
        dark: '#16A34A',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      info: {
        main: '#0A66FF',
        light: '#1E90FF',
        dark: '#0A66FF',
      },
      divider: '#1F2937',
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", "Segoe UI", sans-serif',
      h1: { fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, color: '#FFFFFF' },
      h4: { fontWeight: 700, color: '#FFFFFF' },
      h5: { fontWeight: 600, color: '#E5E7EB' },
      h6: { fontWeight: 600, color: '#E5E7EB' },
      button: { textTransform: 'none', fontWeight: 600 },
      body1: { color: '#E5E7EB' },
      body2: { color: '#9CA3AF' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)',
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            padding: '10px 24px',
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
            boxShadow: '0 4px 20px rgba(0,102,255,0.3)',
            '&:hover': {
              boxShadow: '0 6px 25px rgba(0,102,255,0.5)',
              transform: 'translateY(-2px)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #00C6FF, #4FACFE)',
            boxShadow: '0 4px 20px rgba(0,198,255,0.3)',
            '&:hover': {
              boxShadow: '0 6px 25px rgba(0,198,255,0.5)',
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            borderColor: '#1E90FF',
            borderWidth: '1.5px',
            '&:hover': {
              borderColor: '#00C6FF',
              background: 'rgba(30,144,255,0.1)',
              transform: 'translateY(-2px)',
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 15px 35px rgba(0,102,255,0.3)',
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
            borderRadius: 24,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #1F2937',
            color: '#E5E7EB',
          },
          head: {
            fontWeight: 700,
            color: '#FFFFFF',
            backgroundColor: 'rgba(15,23,42,0.6)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
          },
          colorPrimary: {
            background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
            color: '#FFFFFF',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            background: 'rgba(15,23,42,0.9)',
            backdropFilter: 'blur(8px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: 'rgba(15,23,42,0.95)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(30,144,255,0.2)',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: 'rgba(15,23,42,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(30,144,255,0.2)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(15,23,42,0.98))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(30,144,255,0.2)',
            borderRadius: 28,
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
        paper: 'rgba(2,6,23,0.8)',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E5E7EB',
        disabled: '#9CA3AF',
      },
      success: { main: '#22C55E' },
      error: { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      divider: '#1F2937',
    },
    shape: { borderRadius: 20 },
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
