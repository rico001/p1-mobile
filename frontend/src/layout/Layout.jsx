import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import PrinterWebSocket from '../components/PrinterWebsocket';
import BottomNav from './BottomNav';
import Header from './Header';
import { OfflineCheck } from '../components/OfflineCheck';


export default function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header title="P1S Mobile" />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <OfflineCheck>
          <Outlet />
        </OfflineCheck>
      </Box>
      <PrinterWebSocket />
      <BottomNav />
    </Box>
  );
}
