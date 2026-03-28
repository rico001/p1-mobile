// src/components/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, SvgIcon } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PrinterIcon from '../assets/printer.svg?react';
import BookIcon from '@mui/icons-material/Book';
import VideocamIcon from '@mui/icons-material/Videocam';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(13, 17, 23, 0.85) 0%, rgba(13, 17, 23, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(91, 155, 213, 0.1)',
      }}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_, newValue) => navigate(newValue)}
        sx={{
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.03em',
            mt: 0.25,
            '&.Mui-selected': {
              fontSize: '0.65rem',
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Modelle"
          value="/models"
          icon={<ViewInArIcon />}
        />
        <BottomNavigationAction
          label="Drucker"
          value="/printer"
          icon={
            <SvgIcon component={PrinterIcon} inheritViewBox sx={{ width: 24, height: 24, color: 'currentColor' }} />
          }

        />
        <BottomNavigationAction
          label="AMS"
          value="/ams"
          icon={<AccountTreeIcon />}
        />
        <BottomNavigationAction
          label="Timelapse"
          value="/timelapse"
          icon={<VideocamIcon />}
        />
        <BottomNavigationAction
          label="Logs"
          value="/log"
          icon={<BookIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}
