// src/components/LightToggle.jsx
import React from 'react';
import { IconButton } from '@mui/material';
import FullScreenIcon from '@mui/icons-material/Fullscreen';

export default function FullScreenButton({ disabled = false, src = '' }) {
  if (!src) {
    console.warn('FullScreenButton: No source provided');
    return null;
  }
  console.log('rendering FullScreenButton');

  return (
    <IconButton
      size="small"
      disabled={disabled}
      onClick={e => window.confirm('Vollbild im neuen Tab öffnen?') && window.open(src)}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.14)' }
      }}
    >
      <FullScreenIcon fontSize="small" />
    </IconButton>
  );
}
