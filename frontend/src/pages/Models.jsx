import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import ModelCard from '../components/ModelCard';
import { useModels } from '../hooks/useModels';

// Grid-Konfiguration
const MIN_CARD_WIDTH  = 150;  // minimale Karten-Breite
const MAX_CARD_WIDTH  = 200;  // maximale Karten-Breite
const GRID_GAP        = 40;   // Abstand zwischen Karten

export default function Models() {
  const { models, isLoading, isError, error, performAction, isActionLoading } = useModels();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        width: '90%',
        maxWidth: '97%',
        mx: 'auto',
        display: 'grid',
        gridTemplateColumns: `
          repeat(
            auto-fit,
            minmax(${MIN_CARD_WIDTH}px, ${MAX_CARD_WIDTH}px)
          )
        `,
        gap: `${GRID_GAP}px`,
        p: 2,
      }}
    >
      {models.map(m => (
        <ModelCard key={m.name} model={m} onAction={performAction} />
      ))}

      {isActionLoading && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
}