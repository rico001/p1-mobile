import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Box,
  IconButton,
  Typography,
  Zoom
} from '@mui/material';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

function bytesToMB(bytes) {
  const mb = bytes / (1024 * 1024);
  return Math.round(mb * 100) / 100;
}

function formatVideoName(filename) {
  // Format: video_2025-04-27_09-51-52.avi
  // Extrahiere Datum und Zeit
  const match = filename.match(/video_(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})\.avi/);

  if (!match) {
    // Falls Format nicht passt, zeige Original
    return filename.replace('.avi', '');
  }

  const [, year, month, day, hour, minute] = match;

  // Formatiere als: "27.04.2025 - 09:51 Uhr"
  return `${day}.${month}.${year} - ${hour}:${minute} Uhr`;
}

const TimelapseCard = ({ video, onDelete }) => {
  const { name, size, path, operations } = video;

  const handleDelete = () => {
    if (window.confirm(`Möchten Sie das Video "${name}" wirklich löschen?`)) {
      onDelete(path);
    }
  };

  return (
    <>
      <Zoom in={true} timeout={300}>
        <Card
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover'
            }}
          >
            <VideoLibraryIcon sx={{ fontSize: 80, color: 'primary.main' }} />
          </Box>

          <Box sx={{ p: 1.25, pt: 0.75, pb: 0.5 }}>
            <Typography
              variant="subtitle1"
              noWrap
              title={name}
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
            >
              {formatVideoName(name)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {bytesToMB(size)} MB
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 0.5, px: 1, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <IconButton
              component="a"
              href={operations.download?.path}
              target="_blank"
              rel="noopener noreferrer"
              title="Download"
            >
              <DownloadIcon />
            </IconButton>

            <IconButton onClick={handleDelete} title="Löschen">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Card>
      </Zoom>
    </>
  );
};

TimelapseCard.propTypes = {
  video: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    path: PropTypes.string.isRequired,
    operations: PropTypes.object.isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired
};

export default memo(TimelapseCard);
