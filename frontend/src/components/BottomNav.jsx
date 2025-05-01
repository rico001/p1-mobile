// src/components/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import PrintIcon from '@mui/icons-material/Print';
// import BookIcon from '@mui/icons-material/Book';

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
          icon={<PrintIcon />}
        />
        {/* <BottomNavigationAction label="Logbuch" value="/logbuch" icon={<BookIcon />} /> */}
      </BottomNavigation>
    </Paper>
  );
}
