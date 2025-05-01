import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Models from './pages/Models';
import Printer from './pages/Printer';
import Log from './pages/Log';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header title="Bambu Mobile!!!!!!!" />

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/models" replace />} />
          <Route path="/models" element={<Models />} />
          <Route path="/printer" element={<Printer />} />
          <Route path="/log" element={<Log />} />
        </Routes>
      </Box>

      <BottomNav
        value={location.pathname}
        onChange={(newValue) => navigate(newValue)}
      />
    </Box>
  );
}

export default App;