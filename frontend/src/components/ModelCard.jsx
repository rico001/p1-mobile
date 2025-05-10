import React, { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import StepperDialog from './StepperDialog';
import { useNavigate } from 'react-router-dom';
import { objectToQueryString } from '../utils/functions';

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
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [renameError, setRenameError] = useState('');
  const navigate = useNavigate();

  const handleAction = useCallback(
    (actionKey, query) => {
      const { method, path } = operations[actionKey];
      onAction({ method, path, query });
    },
    [operations, onAction]
  );

  const handleConfirmPrint = useCallback((printJobConfig) => {
    const query = objectToQueryString(printJobConfig);
    handleAction('print', query);
    setTimeout(() => navigate('/printer'), 2000);
  }, [handleAction, navigate]);

  const openRenameDialog = useCallback(() => {
    setRenameValue(name);
    setRenameError('');
    setRenameDialogOpen(true);
  }, [name]);

  const closeRenameDialog = useCallback(() => {
    setRenameDialogOpen(false);
  }, []);

  const handleRenameConfirm = () => {
    if (!renameValue.trim()) {
      setRenameError('Der Dateiname darf nicht leer sein.');
      return;
    }
    if (renameValue === name) {
      // Kein Änderungsbedarf
      setRenameDialogOpen(false);
      return;
    }
    const query = objectToQueryString({ newFileName: renameValue });
    handleAction('rename', query);
    setRenameDialogOpen(false);
  };

  const handleDelete = () => {
    setRenameError('');
    // Bestätigungsdialog für Löschen
    if (window.confirm(`Möchten Sie ${name} wirklich löschen?`)) {
      handleAction('delete');
    }
  };
 
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
        <Box
          onClick={() => setPreviewOpen(true)}
          sx={{
            flex: 1,
            backgroundImage: `url("${thumbnail}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }}
        />

        <Box sx={{ p: 1, pt: 0, pb: 0 }}>
          <Typography
            variant="subtitle1"
            noWrap
            title={name}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bytesToMB(size)} MB
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 1, px: 1, pb: 0 }}>
          <IconButton
            component="a"
            href={operations.download.path}
            download
            rel="noopener noreferrer"
            title="Download"
          >
            <DownloadIcon />
          </IconButton>

          <IconButton onClick={() => setModalOpen(true)} title="Drucken">
            <PrintIcon />
          </IconButton>

          <IconButton onClick={() => handleAction('refreshThumbnail')} title="Thumbnail aktualisieren">
            <RefreshIcon />
          </IconButton>

          <IconButton onClick={openRenameDialog} title="Umbenennen">
            <DriveFileRenameOutlineIcon />
          </IconButton>

          <IconButton onClick={handleDelete} title="Löschen">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Card>

      {/* Vorschau-Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onClick={() => setPreviewOpen(false)}
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', m: 0, position: 'relative' } }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' } }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Box
            component="img"
            src={thumbnail}
            alt={`Vorschau von ${name}`}
            sx={{ width: '98%', objectFit: 'contain', boxShadow: 4, borderRadius: 1, backgroundColor: '#fff' }}
          />
        </DialogContent>
      </Dialog>

      {/* Print-Dialog */}
      <StepperDialog
        name={name}
        thumbnail={thumbnail}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmPrint}
      />

      {/* Umbenennen-Dialog */}
      <Dialog open={renameDialogOpen} onClose={closeRenameDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Datei umbenennen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Neuer Dateiname"
            type="text"
            fullWidth
            value={renameValue.endsWith('.3mf') ? renameValue.split('.3mf')[0] : renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            error={Boolean(renameError)}
            helperText={renameError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRenameDialog}>Abbrechen</Button>
          <Button onClick={handleRenameConfirm} variant="contained">Umbenennen</Button>
        </DialogActions>
      </Dialog>
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