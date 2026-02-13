import { createTheme, type ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    border: { default: string; strong: string };
    table: { header: string; rowHover: string; rowSelected: string };
  }
  interface PaletteOptions {
    border?: { default: string; strong: string };
    table?: { header: string; rowHover: string; rowSelected: string };
  }
  interface TypeBackground {
    elevated?: string;
    sidebar?: string;
    sidebarActive?: string;
  }
  interface TypeText {
    muted?: string;
  }
}

// ERP-optimized color system - low fatigue, 8+ hour usage
const lightPalette = {
  mode: 'light' as const,
  primary: {
    main: '#1D4ED8',
    light: '#E0E7FF',
    dark: '#1E40AF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#1F2937',
    light: '#374151',
    dark: '#111827',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#B91C1C',
    light: '#FEE2E2',
    dark: '#991B1B',
  },
  warning: {
    main: '#B45309',
    light: '#FEF3C7',
    dark: '#92400E',
  },
  info: {
    main: '#0369A1',
    light: '#E0F2FE',
    dark: '#075985',
  },
  success: {
    main: '#15803D',
    light: '#DCFCE7',
    dark: '#166534',
  },
  background: {
    default: '#F4F6F8',
    paper: '#FFFFFF',
    elevated: '#F8FAFC',
    sidebar: '#111827',
    sidebarActive: '#1F2937',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    muted: '#9CA3AF',
    disabled: '#D1D5DB',
  },
  divider: '#E5E7EB',
  border: {
    default: '#E5E7EB',
    strong: '#D1D5DB',
  },
  table: {
    header: '#F1F5F9',
    rowHover: '#EEF2FF',
    rowSelected: '#E0E7FF',
  },
};

const darkPalette = {
  mode: 'dark' as const,
  primary: {
    main: '#3B82F6',
    light: '#E0E7FF',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#1F2937',
    light: '#374151',
    dark: '#111827',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#DC2626',
    light: '#FEE2E2',
    dark: '#B91C1C',
  },
  warning: {
    main: '#D97706',
    light: '#FEF3C7',
    dark: '#B45309',
  },
  info: {
    main: '#0284C7',
    light: '#E0F2FE',
    dark: '#0369A1',
  },
  success: {
    main: '#16A34A',
    light: '#DCFCE7',
    dark: '#15803D',
  },
  background: {
    default: '#0F172A',
    paper: '#111827',
    elevated: '#1F2937',
    sidebar: '#0B1220',
    sidebarActive: '#1F2937',
  },
  text: {
    primary: '#E5E7EB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    disabled: '#6B7280',
  },
  divider: '#1F2937',
  border: {
    default: '#1F2937',
    strong: '#334155',
  },
  table: {
    header: '#1F2937',
    rowHover: '#334155',
    rowSelected: '#1E3A8A',
  },
};

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
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
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
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          '@media (max-width: 600px)': {
            borderRadius: 10,
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
          borderRadius: 12,
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

export const lightTheme = createTheme({
  ...commonOptions,
  palette: lightPalette,
});

export const darkTheme = createTheme({
  ...commonOptions,
  palette: darkPalette,
});
