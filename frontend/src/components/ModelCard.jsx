import React, { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogContent,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import StepperDialog from './StepperDialog';
import { useNavigate } from 'react-router-dom';
import { confirmDialog, objectToQueryString } from '../utils/functions';

function bytesToKB(bytes) {
  const kb = bytes / 1024;
  return Math.round(kb * 100) / 100;
}

function bytesToMB(bytes) {
  const mb = bytes / (1024 * 1024);
  return Math.round(mb * 100) / 100;
}

const ModelCard = ({ model, onAction }) => {
  const { name, size, thumbnail, operations } = model;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = useCallback(
    (actionKey, query) => {
      if(actionKey === 'delete') {
        const confirm = confirmDialog(`Möchten Sie ${name} wirklich löschen?`);
        if (!confirm) {
          return;
        }
      }
      if (actionKey === 'download') {
        const confirm = confirmDialog(`Möchten Sie ${name} wirklich herunterladen?`);
        if (!confirm) {
          return;
        } 
      }
      const { method, path } = operations[actionKey];
      onAction({ method, path, query })
    },
    [operations, onAction]
  );

  const handleConfirmPrint = useCallback((printJobConfig) => {
    const query = objectToQueryString(printJobConfig);
    handleAction('print', query);
    setTimeout(() => {
      navigate('/printer');
    }
    , 2000);
  }, [handleAction]);

  const handleRename = useCallback(() => {
    const newFileName = prompt('Bitte neuen Dateinamen eingeben:', name);
    if (newFileName && newFileName !== name) {
      const query = objectToQueryString({ newFileName });
      handleAction('rename', query);
    }
  }, [handleAction, name]);

  const handleThumbnailClick = () => setPreviewOpen(true);
  const handleClosePreview = () => setPreviewOpen(false);

  return (
    <>
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
          onClick={handleThumbnailClick}
          sx={{
            flex: 1,
            backgroundImage: `url("${thumbnail}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
        />

        {/* Content-Bereich */}
        <Box sx={{ p: 1, pt: 0, pb: 0 }}>
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
            {bytesToMB(size)} MB
          </Typography>
        </Box>

        {/* Aktionen-Bereich */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            py: 1,
            px: 1,
            pb: 0,
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
          <IconButton onClick={() => setModalOpen(true)} title="Drucken">
            <PrintIcon />
          </IconButton>
          <IconButton onClick={() => handleAction('refreshThumbnail')} title="Thumbnail aktualisieren">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={() => handleRename()} title="Umbenennen">
            <DriveFileRenameOutlineIcon />
          </IconButton>
          <IconButton onClick={() => handleAction('delete')} title="Löschen">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Card>

      {/* Overlay-Vorschau */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth={false}
        onClick={handleClosePreview}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            m: 0,
            position: 'relative'
          }
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >

        {/* Bildvorschau zentriert und nahezu fullscreen */}
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Box
            component="img"
            src={thumbnail}
            alt={`Vorschau von ${name}`}
            sx={{
              width: '90%',
              objectFit: 'contain',
              boxShadow: 4,
              borderRadius: 1,
              backgroundColor: '#fff',
            }}
          />
        </DialogContent>
      </Dialog>
      <StepperDialog name={name} thumbnail={thumbnail} open={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirmPrint} />
    </>
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
