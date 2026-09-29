import { createTheme } from '@mui/material/styles';

// Palette notes:
// #1C1F1B  - near-black charcoal, primary background for chrome (sidebar/navbar)
// #2E3B2F  - deep olive, primary brand color
// #C97A2B  - signal amber, the one accent used for key actions/alerts
// #F5F4F0  - warm paper background for content areas
// #4B5348  - muted sage, secondary text/borders
// #B23A2E  - ordnance red, reserved for destructive/critical states only

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E3B2F',
      light: '#4B5348',
      dark: '#1C1F1B',
      contrastText: '#F5F4F0',
    },
    secondary: {
      main: '#C97A2B',
      contrastText: '#1C1F1B',
    },
    error: {
      main: '#B23A2E',
    },
    warning: {
      main: '#C97A2B',
    },
    success: {
      main: '#3F6C42',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1F1B',
      secondary: '#4B5348',
    },
    divider: '#DEDCD3',
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    overline: {
      fontFamily: "'IBM Plex Mono', monospace",
      letterSpacing: '0.06em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
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
          boxShadow: 'none',
          borderBottom: '1px solid #DEDCD3',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.72rem',
          letterSpacing: '0.04em',
          color: '#4B5348',
          backgroundColor: '#FAFAFA',
        },
      },
    },
  },
});

export default theme;
