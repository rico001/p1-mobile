import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import WlanStatus from '../components/print-sensors/WlanStatus';
import TasmotaSwitch from '../components/TasmotaSwitch';

export default function Header({ title }) {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#30506b', minHeight: { xs: '40px', sm: '50px' } }}>
      {/* AppBar ist die obere Leiste */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', minHeight: { xs: '40px', sm: '50px' } }}>
        {/* Titel links, nimmt den verfügbaren Platz ein */}
        <Typography sx={{ flexGrow: 1,  fontSize: '1rem'  }}>
          {title}
        </Typography>
        <TasmotaSwitch/>
        <WlanStatus />
      </Toolbar>
    </AppBar>
  );
}
