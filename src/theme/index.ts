import { createTheme, type ThemeOptions } from '@mui/material/styles';

// Custom color palette - Pastel blue with soft violet accents
const palette = {
  primary: {
    main: '#93C5FD',
    light: '#BFDBFE',
    dark: '#60A5FA',
    contrastText: '#1E3A8A',
  },
  secondary: {
    main: '#C4B5FD',
    light: '#DDD6FE',
    dark: '#A78BFA',
    contrastText: '#4C1D95',
  },
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
  },
  warning: {
    main: '#ED6C02',
    light: '#FF9800',
    dark: '#E65100',
  },
  info: {
    main: '#0288D1',
    light: '#03A9F4',
    dark: '#01579B',
  },
  success: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
  },
};

// Common theme options
const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: 'clamp(1.375rem, 3.5vw, 1.75rem)',
    },
    h4: {
      fontWeight: 600,
      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
    },
    h5: {
      fontWeight: 600,
      fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
    },
    h6: {
      fontWeight: 600,
      fontSize: 'clamp(1rem, 2vw, 1rem)',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 600,
          '@media (max-width: 600px)': {
            padding: '8px 16px',
            fontSize: '0.875rem',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          '@media (max-width: 600px)': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
        root: {
          '@media (max-width: 600px)': {
            padding: '12px 8px',
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          '@media (max-width: 600px)': {
            borderRadius: 0,
            margin: 16,
            maxHeight: 'calc(100% - 32px)',
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '16px',
            fontSize: '1.25rem',
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '16px',
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '16px',
            gap: '8px',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'light',
    ...palette,
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2027',
      secondary: '#637381',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    ...palette,
    primary: {
      main: '#7DD3FC',
      light: '#BAE6FD',
      dark: '#38BDF8',
      contrastText: '#0C4A6E',
    },
    secondary: {
      main: '#A78BFA',
      light: '#C4B5FD',
      dark: '#8B5CF6',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A1929',
      paper: '#132F4C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B2BAC2',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
});
