import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Typography
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';

const ModelCard = ({ model, onAction }) => {
  const { name, size, thumbnail, operations } = model;

  const handle = useCallback(
    (actionKey) => {
      const { method, path } = operations[actionKey];
      onAction({ method, path });
    },
    [operations, onAction]
  );

  return (
    <Card
      sx={{
        width: '100%',          // füllt das Grid-Item
        aspectRatio: '1 / 1',   // immer quadratisch
        
        display: 'grid',
        gridTemplateRows: '1fr auto auto',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      {/* Bildbereich */}
      <CardMedia
        component="div"
        sx={{
          gridRow: '1 / 2',
          backgroundImage: `url(${thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Content-Bereich */}
      <CardContent sx={{ gridRow: '2 / 3', p: 1 }}>
        <Typography variant="subtitle1" noWrap title={name}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {(size / 1024).toFixed(2)} KB
        </Typography>
      </CardContent>

      {/* Aktionen-Bereich */}
      <CardActions
        disableSpacing
        sx={{
          gridRow: '3 / 4',
          justifyContent: 'space-around',
          py: 1,
          px: 1,
        }}
      >
        <IconButton onClick={() => handle('download')} title="Download">
          <DownloadIcon />
        </IconButton>
        <IconButton onClick={() => handle('print')} title="Drucken">
          <PrintIcon />
        </IconButton>
        <IconButton onClick={() => handle('refreshThumbnail')} title="Thumbnail aktualisieren">
          <RefreshIcon />
        </IconButton>
        <IconButton onClick={() => handle('delete')} title="Löschen">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

ModelCard.propTypes = {
  model: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    thumbnail: PropTypes.string.isRequired,
    operations: PropTypes.object.isRequired,
  }).isRequired,
  onAction: PropTypes.func.isRequired,
};

export default memo(ModelCard);