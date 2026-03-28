import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import './main.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Glassmorphism style tokens
const glass = {
  bg: 'rgba(255, 255, 255, 0.05)',
  bgHover: 'rgba(255, 255, 255, 0.08)',
  bgStrong: 'rgba(255, 255, 255, 0.07)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderHover: '1px solid rgba(255, 255, 255, 0.18)',
  borderAccent: '1px solid rgba(45, 212, 170, 0.3)',
  blur: 'blur(20px)',
  blurStrong: 'blur(30px)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  shadowHover: '0 12px 40px rgba(0, 0, 0, 0.4)',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2dd4aa',
      light: '#5eead4',
      dark: '#14b88e',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.92)',
      secondary: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    action: {
      hover: 'rgba(255, 255, 255, 0.06)',
      selected: 'rgba(45, 212, 170, 0.12)',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, fontSize: '0.9rem' },
    subtitle2: { fontWeight: 500, letterSpacing: '0.02em' },
    body2: { color: 'rgba(255, 255, 255, 0.55)' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: glass.bg,
          backdropFilter: glass.blur,
          WebkitBackdropFilter: glass.blur,
          border: glass.border,
          boxShadow: glass.shadow,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: glass.bgHover,
            border: glass.borderAccent,
            boxShadow: glass.shadowHover,
          },
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(12, 18, 15, 0.82)',
          backdropFilter: glass.blurStrong,
          WebkitBackdropFilter: glass.blurStrong,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          borderRadius: 16,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.05rem',
          fontWeight: 600,
          letterSpacing: '0.01em',
          color: 'rgba(255, 255, 255, 0.92)',
          padding: '16px 24px 12px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          color: 'rgba(255, 255, 255, 0.8)',
        },
        dividers: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 10,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2dd4aa',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.5)',
            '&.Mui-focused': {
              color: '#2dd4aa',
            },
          },
          '& .MuiInputBase-input': {
            color: 'rgba(255, 255, 255, 0.9)',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.5)',
          '&.Mui-focused': {
            color: '#2dd4aa',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2dd4aa',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 4,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 0',
          '&.Mui-selected': {
            backgroundColor: 'rgba(45, 212, 170, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(45, 212, 170, 0.18)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            backgroundColor: '#2dd4aa',
            height: 2,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.5)',
          '&.Mui-selected': {
            color: '#5eead4',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 10,
          backdropFilter: 'blur(10px)',
        },
        contained: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
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
          color: 'rgba(255, 255, 255, 0.4)',
          '&.Mui-selected': {
            color: '#5eead4',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          height: 6,
        },
        bar: {
          borderRadius: 6,
          backgroundImage: 'linear-gradient(90deg, #059669, #2dd4aa, #5eead4)',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: glass.bg,
          backdropFilter: glass.blur,
          WebkitBackdropFilter: glass.blur,
          border: glass.border,
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
            backgroundColor: 'rgba(45, 212, 170, 0.15)',
            color: '#5eead4',
            borderColor: 'rgba(45, 212, 170, 0.35)',
            '&:hover': {
              backgroundColor: 'rgba(45, 212, 170, 0.22)',
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(15, 20, 35, 0.8)',
          backdropFilter: glass.blur,
          WebkitBackdropFilter: glass.blur,
          border: glass.border,
          fontSize: '0.75rem',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(15, 20, 35, 0.85)',
          backdropFilter: glass.blurStrong,
          WebkitBackdropFilter: glass.blurStrong,
          border: glass.border,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
        },
        icon: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 4px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(45, 212, 170, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(45, 212, 170, 0.18)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.3)',
          '&.Mui-checked': {
            color: '#2dd4aa',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#2dd4aa',
            '& + .MuiSwitch-track': {
              backgroundColor: 'rgba(45, 212, 170, 0.5)',
            },
          },
        },
        track: {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
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