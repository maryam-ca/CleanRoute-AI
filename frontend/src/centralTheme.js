// Centralized Theme Configuration - ONE FILE TO RULE THEM ALL
import { createTheme } from '@mui/material/styles';

// Color System
const colors = {
  // Backgrounds
  bgMain: '#020617',
  bgSecondary: '#0F172A',
  bgCard: 'rgba(255, 255, 255, 0.05)',
  bgNavbar: 'rgba(2, 6, 23, 0.8)',
  
  // Primary Blues
  primary: '#0A66FF',
  primaryLight: '#00C6FF',
  secondary: '#2F80ED',
  
  // Accent Glow
  accent: '#38BDF8',
  glow: 'rgba(0, 198, 255, 0.4)',
  
  // Text Colors
  textMain: '#FFFFFF',
  textSecondary: '#E5E7EB',
  textMuted: '#9CA3AF',
  
  // Status Colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Borders
  borderLight: 'rgba(255, 255, 255, 0.08)',
  borderMedium: 'rgba(255, 255, 255, 0.12)',
};

// Gradients
const gradients = {
  primary: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
  navbar: 'linear-gradient(135deg, #020617, #0F172A)',
  card: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
  glow: 'radial-gradient(circle at 50% 50%, rgba(0,198,255,0.15), transparent)',
};

// Glassmorphism Effect
const glassEffect = {
  background: colors.bgCard,
  backdropFilter: 'blur(12px)',
  borderRadius: '20px',
  border: `1px solid ${colors.borderLight}`,
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

// Glow Hover Effect
const glowHover = {
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 0 25px ${colors.glow}`,
    transform: 'translateY(-2px)',
  },
};

export const darkBlueTheme = {
  light: createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: colors.primary,
        light: colors.primaryLight,
        dark: colors.secondary,
      },
      secondary: {
        main: colors.primaryLight,
        light: colors.accent,
        dark: colors.secondary,
      },
      background: {
        default: colors.bgMain,
        paper: colors.bgSecondary,
      },
      text: {
        primary: colors.textMain,
        secondary: colors.textSecondary,
        disabled: colors.textMuted,
      },
      success: { main: colors.success },
      error: { main: colors.error },
      warning: { main: colors.warning },
      divider: colors.borderLight,
    },
    shape: { borderRadius: 20 },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
      h1: { fontWeight: 800, color: colors.textMain },
      h2: { fontWeight: 800, color: colors.textMain },
      h3: { fontWeight: 700, color: colors.textMain },
      h4: { fontWeight: 700, color: colors.textMain },
      h5: { fontWeight: 600, color: colors.textSecondary },
      h6: { fontWeight: 600, color: colors.textSecondary },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: `radial-gradient(circle at 10% 20%, ${colors.bgSecondary}, ${colors.bgMain})`,
            minHeight: '100vh',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: colors.bgNavbar,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            borderBottom: `1px solid ${colors.borderLight}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '999px',
            padding: '10px 24px',
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          },
          containedPrimary: {
            background: gradients.primary,
            boxShadow: `0 0 20px ${colors.glow}`,
            '&:hover': {
              boxShadow: `0 0 30px ${colors.glow}`,
              transform: 'translateY(-2px)',
            },
          },
          outlined: {
            borderColor: colors.primary,
            borderWidth: '1.5px',
            '&:hover': {
              borderColor: colors.primaryLight,
              background: 'rgba(10,102,255,0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            ...glassEffect,
            ...glowHover,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            ...glassEffect,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${colors.borderLight}`,
            color: colors.textSecondary,
          },
          head: {
            color: colors.textMain,
            fontWeight: 700,
            backgroundColor: 'rgba(15,23,42,0.6)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            fontWeight: 600,
          },
          colorPrimary: {
            background: gradients.primary,
            color: colors.textMain,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: colors.bgNavbar,
            backdropFilter: 'blur(10px)',
            borderRight: `1px solid ${colors.borderLight}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...glassEffect,
            borderRadius: '28px',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            ...glassEffect,
            borderRadius: '16px',
          },
        },
      },
    },
  }),
};

// Export colors for use in inline styles
export const themeColors = colors;
export const themeGradients = gradients;
export const themeEffects = { glassEffect, glowHover };
