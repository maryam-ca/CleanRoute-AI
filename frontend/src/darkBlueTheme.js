import { createTheme } from '@mui/material/styles';

const palette = {
  mode: 'dark',
  primary: {
    main: '#53d769',
    light: '#8df79e',
    dark: '#2fb24c',
  },
  secondary: {
    main: '#36c4ff',
    light: '#74ddff',
    dark: '#148fcb',
  },
  background: {
    default: '#041328',
    paper: '#0b1f3d',
  },
  text: {
    primary: '#f5fbff',
    secondary: '#bdd8eb',
    disabled: '#7d97aa',
  },
  success: { main: '#53d769' },
  error: { main: '#ff6b6b' },
  warning: { main: '#ffd166' },
  info: { main: '#36c4ff' },
};

const commonComponents = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#041328',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(54, 196, 255, 0.22), transparent 28%),
          radial-gradient(circle at 82% 18%, rgba(83, 215, 105, 0.2), transparent 22%),
          radial-gradient(circle at 50% 55%, rgba(255, 235, 160, 0.12), transparent 18%),
          linear-gradient(180deg, #0a2e63 0%, #0a4d87 34%, #11705e 68%, #08182e 100%)
        `,
        backgroundAttachment: 'fixed',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        textTransform: 'none',
        fontWeight: 700,
        letterSpacing: '0.01em',
      },
      containedPrimary: {
        color: '#051626',
        background: 'linear-gradient(135deg, #d8ff72 0%, #53d769 45%, #36c4ff 100%)',
        boxShadow: '0 18px 34px rgba(54, 196, 255, 0.28)',
        '&:hover': {
          background: 'linear-gradient(135deg, #edff99 0%, #79e88c 45%, #60d1ff 100%)',
          boxShadow: '0 20px 40px rgba(54, 196, 255, 0.34)',
        },
      },
      outlinedPrimary: {
        borderColor: 'rgba(116, 221, 255, 0.45)',
        color: '#dff8ff',
        '&:hover': {
          borderColor: '#74ddff',
          backgroundColor: 'rgba(54, 196, 255, 0.08)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        background: 'linear-gradient(180deg, rgba(13, 42, 78, 0.86) 0%, rgba(8, 24, 46, 0.9) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 225, 255, 0.18)',
        borderRadius: 24,
        boxShadow: '0 24px 48px rgba(3, 12, 25, 0.3)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: 'linear-gradient(180deg, rgba(4, 19, 40, 0.94) 0%, rgba(8, 28, 57, 0.88) 100%)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(116, 221, 255, 0.22)',
        boxShadow: '0 10px 32px rgba(3, 12, 25, 0.24)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 999,
        fontWeight: 700,
      },
    },
  },
};

export const darkBlueTheme = {
  light: createTheme({
    palette,
    shape: { borderRadius: 24 },
    typography: {
      fontFamily: '"Space Grotesk", "Manrope", "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.04em' },
      h2: { fontWeight: 800, letterSpacing: '-0.04em' },
      h3: { fontWeight: 800, letterSpacing: '-0.03em' },
      h4: { fontWeight: 800, letterSpacing: '-0.03em' },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: commonComponents,
  }),
  dark: createTheme({
    palette,
    shape: { borderRadius: 24 },
    typography: {
      fontFamily: '"Space Grotesk", "Manrope", "Segoe UI", sans-serif',
    },
    components: commonComponents,
  }),
};
