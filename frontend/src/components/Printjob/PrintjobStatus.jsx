import React from 'react';
import { Box, Typography, LinearProgress, Button } from '@mui/material';

export const PrinterStatus = () => {
  return (
    <Box
      sx={{
        width: 420,
        color: 'white',
        m: 'auto',
        borderRadius: 2,
        p: 2
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
        {/* Platzhalter für das Thumbnail */}
        <Box
          sx={{
            width: { xs: 70, sm: 100 },
            height: { xs: 70, sm: 100 },
            p: 1,
            bgcolor: 'grey.300',
            borderRadius: 1,
          }}
        />
        <Box sx={{ flexGrow: 1, ml: 2 }}>
      
            <Typography variant="subtitle1" fontWeight={600} textAlign={'left'} mb={1}>
              Sculpture
            </Typography>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
              <Typography variant="body2">
                Layers
              </Typography>
              <Typography variant="body2">
                0  /  164
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
              <Typography variant="body2">
                30%
              </Typography>
              <Typography variant="body2">
                3h 4m
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={0} sx={{ height: 8, borderRadius: 1, mt: 1, bgcolor: 'grey.200' }} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button size="small" sx={{ textTransform: 'none', color: 'grey.700' }}>
          Skip
        </Button>
        <Button size="small" variant="text" color="success" sx={{ textTransform: 'none' }}>
          Pause
        </Button>
        <Button size="small" variant="text" color="error" sx={{ textTransform: 'none' }}>
          Stop
        </Button>
      </Box>
    </Box>
  );
};
