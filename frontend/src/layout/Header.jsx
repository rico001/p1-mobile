import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import WlanStatus from '../components/WlanStatus';

export default function Header({ title }) {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* Titel links, nimmt den verfügbaren Platz ein */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        {/* WLAN-Status immer rechts */}
        <WlanStatus />
      </Toolbar>
    </AppBar>
  );
}
