import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import PrintIcon from '@mui/icons-material/Print';
import BookIcon from '@mui/icons-material/Book';

function BottomNav({ value, onChange }) {
  return (
    <Paper elevation={3} sx={{ position: 'sticky', bottom: 0 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
      >
        <BottomNavigationAction label="Modelle" value="/models" icon={<ViewInArIcon />} />
        <BottomNavigationAction label="Drucker" value="/drucker" icon={<PrintIcon />} />
        <BottomNavigationAction label="Logbuch" value="/logbuch" icon={<BookIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;