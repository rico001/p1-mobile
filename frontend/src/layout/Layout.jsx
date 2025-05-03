import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import PrinterWebSocket from '../components/PrinterWebsocket';
import BottomNav from './BottomNav';
import Header from './Header';


export default function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header title="Bambu Mobile" />
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Outlet />
      </Box>
      <PrinterWebSocket />
      <BottomNav />
    </Box>
  );
}
