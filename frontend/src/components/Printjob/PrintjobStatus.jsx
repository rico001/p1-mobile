import React from 'react';
import { Box, Typography, LinearProgress, Button } from '@mui/material';

export const PrinterStatus = () => {
  return (
    <Box
      sx={{
        maxWidth: 420,
        width: '100%',
        color: 'white',
        m: 'auto',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
        {/* Platzhalter für das Thumbnail */}
        <Box
          sx={{
            width: { xs: 90, sm: 110 },
            height: { xs: 90, sm: 110 },
            m: 1,
            
            bgcolor: 'grey.300',
            borderRadius: 1,
          }}
          //as img
          component="img"
          src="/thumbnails/v4_PLA_1h29m.3mf.png"
          alt="Thumbnail"
        />
        <Box sx={{ flexGrow: 1, ml: 1, mr: 2 }}>
      
            <Typography variant="subtitle1" fontWeight={600} textAlign={'left'} mb={1}>
              Sculpture
            </Typography>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
              <Typography variant="body2">
                
              </Typography>
              <Typography variant="body2">
                77  /  164
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
            <LinearProgress variant="determinate" value={30} sx={{ height: 8, borderRadius: 1, mt: 1, bgcolor: 'grey.200' }}/>
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
