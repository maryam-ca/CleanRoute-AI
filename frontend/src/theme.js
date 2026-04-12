import { createTheme } from '@mui/material/styles';

export const greenTheme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#81C784',
      light: '#A5D6A7',
      dark: '#388E3C',
    },
    success: {
      main: '#00E676',
      light: '#69F0AE',
      dark: '#00C853',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFE082',
      dark: '#F57C00',
    },
    error: {
      main: '#EF5350',
      light: '#FF8A80',
      dark: '#D32F2F',
    },
    background: {
      default: '#F1F8E9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1B5E20',
      secondary: '#4CAF50',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(46,125,50,0.3)',
          },
        },
      },
    },
  },
});
