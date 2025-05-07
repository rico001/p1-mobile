import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import WlanStatus from '../components/sensors/WlanStatus';
import TasmotaSwitch from '../components/TasmotaSwitch';

export default function Header({ title }) {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2', minHeight: { xs: '40px', sm: '50px' } }}>
      {/* AppBar ist die obere Leiste */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', minHeight: { xs: '40px', sm: '50px' } }}>
        {/* Titel links, nimmt den verfügbaren Platz ein */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <TasmotaSwitch/>
        <WlanStatus />
      </Toolbar>
    </AppBar>
  );
}
