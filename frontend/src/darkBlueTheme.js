import { alpha, createTheme } from '@mui/material/styles';

const tokens = {
  night: '#06101d',
  panel: 'rgba(10, 22, 40, 0.78)',
  panelStrong: 'rgba(8, 18, 34, 0.9)',
  line: 'rgba(148, 163, 184, 0.16)',
  lineStrong: 'rgba(125, 176, 255, 0.24)',
  text: '#f5f9ff',
  textSoft: '#c6d4eb',
  textMuted: '#8ea2c0',
  primary: '#5ea2ff',
  primaryStrong: '#2f7bf6',
  cyan: '#64d5ff',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  violet: '#8b7cff'
};

const getTheme = () =>
  createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: tokens.primary,
        light: tokens.cyan,
        dark: tokens.primaryStrong,
        contrastText: '#03101f'
      },
      secondary: {
        main: tokens.violet,
        light: '#b7a9ff',
        dark: '#6e5ce6',
        contrastText: tokens.text
      },
      success: { main: tokens.emerald },
      warning: { main: tokens.amber },
      error: { main: tokens.rose },
      info: { main: tokens.cyan },
      background: {
        default: tokens.night,
        paper: tokens.panel
      },
      text: {
        primary: tokens.text,
        secondary: tokens.textSoft,
        disabled: tokens.textMuted
      },
      divider: tokens.line
    },
    shape: {
      borderRadius: 24
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif',
      h1: { fontWeight: 800, color: tokens.text, letterSpacing: '-0.05em' },
      h2: { fontWeight: 800, color: tokens.text, letterSpacing: '-0.05em' },
      h3: { fontWeight: 800, color: tokens.text, letterSpacing: '-0.04em' },
      h4: { fontWeight: 700, color: tokens.text, letterSpacing: '-0.03em' },
      h5: { fontWeight: 700, color: tokens.text, letterSpacing: '-0.02em' },
      h6: { fontWeight: 700, color: tokens.textSoft },
      subtitle1: { color: tokens.textSoft },
      subtitle2: { color: tokens.textSoft, fontWeight: 600 },
      body1: { color: tokens.textSoft },
      body2: { color: tokens.textMuted },
      button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.01em' },
      caption: { color: tokens.textMuted }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: 'dark'
          },
          body: {
            background: `
              radial-gradient(circle at 0% 0%, rgba(94, 162, 255, 0.18), transparent 30%),
              radial-gradient(circle at 100% 0%, rgba(100, 213, 255, 0.14), transparent 24%),
              radial-gradient(circle at 50% 100%, rgba(139, 124, 255, 0.16), transparent 28%),
              linear-gradient(180deg, #0a1422 0%, #08111d 46%, #060d16 100%)
            `,
            minHeight: '100vh'
          },
          '#root': {
            minHeight: '100vh'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(6, 13, 24, 0.68)',
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 24px 48px rgba(2, 6, 23, 0.34)',
            backdropFilter: 'blur(22px)'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: `
              linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%),
              ${tokens.panel}
            `,
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 22px 48px rgba(2, 6, 23, 0.28)',
            backdropFilter: 'blur(20px)',
            backgroundImage: 'none'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: `
              linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%),
              ${tokens.panel}
            `,
            border: `1px solid ${tokens.line}`,
            boxShadow: '0 24px 54px rgba(2, 6, 23, 0.24)',
            backdropFilter: 'blur(20px)',
            transition: 'transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: tokens.lineStrong,
              boxShadow: '0 28px 62px rgba(2, 6, 23, 0.34)'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            padding: '11px 20px',
            boxShadow: 'none'
          },
          contained: {
            background: 'linear-gradient(135deg, #72b4ff 0%, #2f7bf6 55%, #1860d8 100%)',
            color: '#f8fbff',
            boxShadow: '0 18px 34px rgba(47, 123, 246, 0.34)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8ac3ff 0%, #3d87fb 55%, #246ae1 100%)',
              boxShadow: '0 20px 38px rgba(47, 123, 246, 0.42)'
            }
          },
          outlined: {
            color: tokens.text,
            borderColor: alpha(tokens.primary, 0.35),
            background: 'rgba(7, 16, 31, 0.34)',
            '&:hover': {
              borderColor: alpha(tokens.cyan, 0.6),
              background: alpha(tokens.primary, 0.1)
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            color: tokens.text,
            background: 'rgba(94, 162, 255, 0.14)',
            border: `1px solid ${alpha(tokens.primary, 0.24)}`
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            color: tokens.text,
            borderRadius: 18,
            background: 'rgba(7, 15, 29, 0.45)',
            '& fieldset': {
              borderColor: 'rgba(148, 163, 184, 0.2)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(125, 176, 255, 0.34)'
            },
            '&.Mui-focused fieldset': {
              borderColor: tokens.primary
            }
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: tokens.textMuted,
            '&.Mui-focused': {
              color: tokens.primary
            }
          }
        }
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 999,
            backgroundColor: tokens.primary
          }
        }
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: tokens.textMuted,
            '&.Mui-selected': {
              color: tokens.text
            }
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: tokens.textSoft,
            borderBottom: `1px solid ${tokens.line}`
          },
          head: {
            color: tokens.text,
            fontWeight: 700,
            background: alpha(tokens.text, 0.03)
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: `
              linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%),
              ${tokens.panelStrong}
            `,
            border: `1px solid ${tokens.lineStrong}`,
            backdropFilter: 'blur(24px)'
          }
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            background: 'rgba(10, 22, 40, 0.84)',
            border: `1px solid ${tokens.line}`
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: `
              linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%),
              ${tokens.panelStrong}
            `,
            border: `1px solid ${tokens.line}`,
            backdropFilter: 'blur(22px)'
          }
        }
      }
    }
  });

export const darkBlueTheme = {
  light: getTheme(),
  dark: getTheme()
};
