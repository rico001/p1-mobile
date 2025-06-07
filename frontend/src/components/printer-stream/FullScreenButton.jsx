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
        bgcolor: 'rgba(0,0,0,0.5)',
        color: '#fff',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
      }}
    >
      <FullScreenIcon fontSize="small" />
    </IconButton>
  );
}
