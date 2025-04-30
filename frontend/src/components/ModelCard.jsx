// src/components/ModelCard.jsx
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';

const ModelCard = ({ model, onAction }) => {
  const { name, size, thumbnail, operations } = model;

  const handleAction = useCallback(
    actionKey => {
      const { method, path } = operations[actionKey];
      onAction({ method, path });
    },
    [operations, onAction]
  );

  return (
    <Card
      sx={{
        width: '100%',
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 3,
        overflow: 'hidden'
      }}
    >
      {/* Bildbereich */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: `url("${thumbnail}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Content-Bereich */}
      <Box sx={{ p: 1 }}>
        <Typography
          variant="subtitle1"
          noWrap
          title={name}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {(size / 1024).toFixed(2)} KB
        </Typography>
      </Box>

      {/* Aktionen-Bereich */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          py: 1,
          px: 1
        }}
      >
        {/* Download öffnet Link in neuem Tab */}
        <IconButton
          component="a"
          href={operations.download.path}
          download
          rel="noopener noreferrer"
          title="Download"
        >
          <DownloadIcon />
        </IconButton>

        {/* Die anderen Aktionen bleiben AJAX-basiert */}
        <IconButton onClick={() => handleAction('print')} title="Drucken">
          <PrintIcon />
        </IconButton>
        <IconButton onClick={() => handleAction('refreshThumbnail')} title="Thumbnail aktualisieren">
          <RefreshIcon />
        </IconButton>
        <IconButton onClick={() => handleAction('delete')} title="Löschen">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

ModelCard.propTypes = {
  model: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    thumbnail: PropTypes.string.isRequired,
    operations: PropTypes.object.isRequired
  }).isRequired,
  onAction: PropTypes.func.isRequired
};

export default memo(ModelCard);
