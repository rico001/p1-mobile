// src/components/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction, SvgIcon } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PrinterIcon from '../assets/printer-icon.svg?react';
import BookIcon from '@mui/icons-material/Book';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper elevation={3} sx={{ position: 'sticky', bottom: 0 }}>
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_, newValue) => navigate(newValue)}
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
          label="Logs" 
          value="/log" 
          icon={<BookIcon />} 
        />
      </BottomNavigation>
    </Paper>
  );
}
