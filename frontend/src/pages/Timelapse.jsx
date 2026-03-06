import { Box, Alert, Typography } from '@mui/material';
import TimelapseCard from '../components/TimelapseCard';
import { useTimelapses } from '../hooks/useTimelapses';
import AppLoader from '../components/AppLoader';

// Grid-Konfiguration
const MIN_CARD_WIDTH = 220;
const MAX_CARD_WIDTH = 230;
const GRID_GAP = 40;

export default function Timelapse() {
  const {
    timelapses,
    isLoading,
    error,
    isError,
    deleteTimelapse,
    isDeleting
  } = useTimelapses();

  // Sortiere Videos: neueste zuerst (Dateinamen enthalten Datum im Format YYYY-MM-DD_HH-MM-SS)
  const sortedTimelapses = [...timelapses].sort((a, b) => b.name.localeCompare(a.name));

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '90%', maxWidth: '97%', mx: 'auto', p: 2 }}>
      {/* Grid Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${MIN_CARD_WIDTH}px, ${MAX_CARD_WIDTH}px))`,
          justifyContent: 'center',
          alignItems: 'center',
          gap: `${GRID_GAP}px`,
        }}
      >
        {sortedTimelapses.length === 0 && !isLoading ? (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Keine Timelapse-Videos gefunden
            </Typography>
          </Box>
        ) : (
          sortedTimelapses.map(video => (
            <TimelapseCard
              key={video.path}
              video={video}
              onDelete={deleteTimelapse}
            />
          ))
        )}
      </Box>

      {/* Loading Overlay */}
      <AppLoader
        open={isDeleting || isLoading}
        texts={isLoading ? ['Lade Videos…'] : ["Bitte warten...", "Video wird gelöscht."]}
        displayTime={3000}
      />
    </Box>
  );
}
