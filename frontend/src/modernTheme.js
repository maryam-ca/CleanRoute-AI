import { createTheme } from '@mui/material/styles';

export const modernTheme = {
  light: createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      },
      secondary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
      },
      accent: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
      },
      background: {
        default: '#F9FAFB',
        paper: '#FFFFFF',
        gradient: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)'
      },
      text: {
        primary: '#111827',
        secondary: '#6B7280',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(16,185,129,0.4)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
      },
      secondary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
      },
      background: {
        default: '#0F172A',
        paper: '#1E293B',
      },
      text: {
        primary: '#F1F5F9',
        secondary: '#94A3B8',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  }),
};
