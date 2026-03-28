import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import './main.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5b9bd5',
      light: '#7db8e8',
      dark: '#3a7bbf',
    },
    secondary: {
      main: '#7c4dff',
      light: '#b388ff',
      dark: '#651fff',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.92)',
      secondary: 'rgba(255, 255, 255, 0.55)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    action: {
      hover: 'rgba(91, 155, 213, 0.08)',
      selected: 'rgba(91, 155, 213, 0.16)',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, fontSize: '0.9rem' },
    subtitle2: { fontWeight: 500, letterSpacing: '0.02em' },
    body2: { color: 'rgba(255, 255, 255, 0.65)' },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#161b22',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(91, 155, 213, 0.3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#1c2333',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(91, 155, 213, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.45)',
          '&.Mui-selected': {
            color: '#5b9bd5',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        bar: {
          borderRadius: 4,
          backgroundImage: 'linear-gradient(90deg, #3a7bbf, #5b9bd5, #7db8e8)',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#161b22',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            margin: '4px 0',
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          '&.Mui-selected': {
            backgroundColor: 'rgba(91, 155, 213, 0.2)',
            color: '#7db8e8',
            borderColor: 'rgba(91, 155, 213, 0.4)',
            '&:hover': {
              backgroundColor: 'rgba(91, 155, 213, 0.3)',
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1c2333',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.75rem',
        },
      },
    },
  },
});

const queryClient = new QueryClient();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    queryClient.invalidateQueries();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);