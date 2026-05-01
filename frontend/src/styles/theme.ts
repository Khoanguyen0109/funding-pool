import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    surface: { main: string };
    chart: {
      grid: string;
      tick: string;
      tooltipBg: string;
      tooltipBorder: string;
      contribution: string;
      expense: string;
      budget: string;
      budgetSpent: string;
      budgetOver: string;
      savings: string;
      balance: string;
    };
    brand: {
      google: string;
      facebook: string;
    };
  }
  interface PaletteOptions {
    surface?: { main: string };
    chart?: Palette['chart'];
    brand?: Palette['brand'];
  }

  interface TypographyVariants {
    label: React.CSSProperties;
    value: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    label?: React.CSSProperties;
    value?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    label: true;
    value: true;
  }
}

const FONT_FAMILY = '"Roboto", "Helvetica", "Arial", sans-serif';

const palette = {
  mode: 'dark' as const,

  primary: {
    main: '#E91E8C',
    light: '#F472B6',
    dark: '#BE185D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#A855F7',
    light: '#C084FC',
    dark: '#7C3AED',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F87171',
    light: '#FCA5A5',
    dark: '#DC2626',
  },
  warning: {
    main: '#FBBF24',
    light: '#FDE68A',
    dark: '#D97706',
  },
  success: {
    main: '#34D399',
    light: '#6EE7B7',
    dark: '#059669',
  },
  info: {
    main: '#60A5FA',
    light: '#93C5FD',
    dark: '#2563EB',
  },

  background: {
    default: '#121218',
    paper: '#1E1E2A',
  },
  surface: {
    main: '#2A2A3C',
  },

  text: {
    primary: '#EDEDF4',
    secondary: '#8B8BA3',
  },
  divider: 'rgba(139, 139, 163, 0.15)',

  chart: {
    grid: 'rgba(139, 139, 163, 0.12)',
    tick: '#8B8BA3',
    tooltipBg: '#2A2A3C',
    tooltipBorder: 'rgba(139, 139, 163, 0.15)',
    contribution: '#34D399',
    expense: '#F472B6',
    budget: '#34D399',
    budgetSpent: '#FBBF24',
    budgetOver: '#F87171',
    savings: '#C084FC',
    balance: '#E91E8C',
  },

  brand: {
    google: '#EA4335',
    facebook: '#1877F2',
  },
};

const BORDER_SUBTLE = `1px solid ${alpha('#8B8BA3', 0.1)}`;
const BORDER_MUTED = alpha('#8B8BA3', 0.2);

const theme = createTheme({
  palette,

  typography: {
    fontFamily: FONT_FAMILY,
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    caption: { fontWeight: 400, fontSize: '0.75rem' },
    overline: { fontWeight: 600, fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { fontWeight: 600, textTransform: 'none' },
    label: { fontFamily: FONT_FAMILY, fontWeight: 400, fontSize: '0.75rem', color: palette.text.secondary },
    value: { fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.2 },
  },

  spacing: 8,

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          color: palette.text.primary,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.secondary.main} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${palette.primary.dark} 0%, ${palette.secondary.dark} 100%)`,
            },
          },
        },
      ],
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backgroundColor: palette.background.paper,
          border: BORDER_SUBTLE,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: BORDER_MUTED,
            },
            '&:hover fieldset': {
              borderColor: alpha(palette.primary.main, 0.5),
            },
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: palette.background.paper,
          borderBottom: BORDER_SUBTLE,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: palette.text.secondary,
          borderColor: BORDER_MUTED,
          '&.Mui-selected': {
            color: palette.primary.light,
            backgroundColor: alpha(palette.primary.main, 0.12),
            borderColor: alpha(palette.primary.main, 0.4),
            '&:hover': {
              backgroundColor: alpha(palette.primary.main, 0.2),
            },
          },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#8B8BA3', 0.15),
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: BORDER_MUTED,
        },
      },
    },

    MuiAlert: {
      variants: [
        {
          props: { variant: 'standard', severity: 'error' },
          style: {
            backgroundColor: alpha(palette.error.main, 0.12),
            color: palette.error.light,
          },
        },
      ],
    },
  },
});

export default theme;
