import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import WlanStatus from '../components/print-sensors/WlanStatus';
import TasmotaSwitch from '../components/TasmotaSwitch';

export default function Header({ title }) {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: { xs: '46px', sm: '52px' },
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', minHeight: { xs: '46px', sm: '52px' } }}>
        <Typography
          sx={{
            flexGrow: 1,
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            background: 'linear-gradient(135deg, #5eead4 0%, #2dd4aa 50%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        <TasmotaSwitch/>
        <WlanStatus />
      </Toolbar>
    </AppBar>
  );
}
