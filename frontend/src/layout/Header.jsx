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
        background: 'linear-gradient(135deg, #1a2942 0%, #1e3a5f 50%, #1a2942 100%)',
        borderBottom: '1px solid rgba(91, 155, 213, 0.15)',
        backdropFilter: 'blur(20px)',
        minHeight: { xs: '44px', sm: '52px' },
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', minHeight: { xs: '44px', sm: '52px' } }}>
        <Typography
          sx={{
            flexGrow: 1,
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
            background: 'linear-gradient(135deg, #7db8e8, #5b9bd5)',
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
