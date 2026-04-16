import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => {
  const isDark = mode === 'dark';
  const backgroundDefault = '#07111f';
  const backgroundPaper = isDark ? 'rgba(12, 20, 36, 0.82)' : 'rgba(16, 24, 40, 0.78)';
  const surfaceBorder = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(191, 219, 254, 0.18)';
  const hoverSurface = isDark ? 'rgba(18, 28, 48, 0.92)' : 'rgba(22, 31, 54, 0.88)';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#4f8cff',
        light: '#7db0ff',
        dark: '#2e6df6',
        contrastText: '#f8fbff',
      },
      secondary: {
        main: '#8fb8ff',
        light: '#bfd5ff',
        dark: '#5f8fe8',
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: '#e8eefc',
        secondary: '#9aa9c3',
      },
      divider: surfaceBorder,
      success: { main: '#60a5fa' },
      warning: { main: '#7db0ff' },
      error: { main: '#f87171' },
      info: { main: '#4f8cff' },
    },
    shape: {
      borderRadius: 20,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", sans-serif',
      h1: { fontWeight: 800, color: '#f8fbff', letterSpacing: '-0.04em' },
      h2: { fontWeight: 800, color: '#f8fbff', letterSpacing: '-0.04em' },
      h3: { fontWeight: 700, color: '#f1f6ff', letterSpacing: '-0.03em' },
      h4: { fontWeight: 700, color: '#f1f6ff', letterSpacing: '-0.03em' },
      h5: { fontWeight: 700, color: '#f1f6ff' },
      h6: { fontWeight: 700, color: '#f1f6ff' },
      button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: `
              radial-gradient(circle at top left, rgba(79, 140, 255, 0.18), transparent 28%),
              radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 24%),
              linear-gradient(180deg, #0a1426 0%, #08111d 48%, #060d18 100%)
            `,
            color: '#e8eefc',
          },
          '#root': {
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            padding: '11px 22px',
            boxShadow: 'none',
          },
          contained: {
            background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
            color: '#f8fbff',
            boxShadow: '0 18px 34px rgba(37, 99, 235, 0.28)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7db0ff 0%, #2e6df6 100%)',
              boxShadow: '0 20px 38px rgba(37, 99, 235, 0.34)',
            },
          },
          outlined: {
            borderColor: 'rgba(148, 163, 184, 0.26)',
            color: '#dce8ff',
            background: 'rgba(15, 23, 42, 0.32)',
            '&:hover': {
              borderColor: 'rgba(125, 176, 255, 0.45)',
              background: 'rgba(37, 99, 235, 0.12)',
            },
          },
          text: {
            color: '#dce8ff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(8, 14, 26, 0.58)',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            boxShadow: '0 20px 45px rgba(2, 6, 23, 0.35)',
            backdropFilter: 'blur(18px)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            background: backgroundPaper,
            border: `1px solid ${surfaceBorder}`,
            boxShadow: '0 24px 60px rgba(2, 6, 23, 0.28)',
            backdropFilter: 'blur(18px)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: 'rgba(125, 176, 255, 0.24)',
              boxShadow: '0 28px 70px rgba(2, 6, 23, 0.34)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: backgroundPaper,
            border: `1px solid ${surfaceBorder}`,
            backdropFilter: 'blur(18px)',
            backgroundImage: 'none',
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: 'xl',
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              background: 'rgba(9, 16, 30, 0.58)',
              borderRadius: 16,
              '& fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.18)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(125, 176, 255, 0.34)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4f8cff',
              },
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          },
          head: {
            color: '#dce8ff',
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.03)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            background: 'rgba(96, 165, 250, 0.14)',
            color: '#dce8ff',
            border: '1px solid rgba(125, 176, 255, 0.18)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: hoverSurface,
            border: `1px solid ${surfaceBorder}`,
            backdropFilter: 'blur(20px)',
          },
        },
      },
    },
  });
};

export const brownTheme = {
  light: getTheme('light'),
  dark: getTheme('dark'),
};
