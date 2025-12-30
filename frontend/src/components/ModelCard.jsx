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
  TextField,
  Zoom,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/Info';
import StepperDialog from './StepperDialog';
import ModelDetailsDialog from './ModelDetailsDialog';
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

const ModelCard = ({ model, onAction, onMove, dragState, onDragStart, onDragEnd }) => {
  const { name, size, thumbnail, operations } = model;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [renameError, setRenameError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = useCallback(
    (actionKey, query) => {
      const { method, path } = operations[actionKey];
      return onAction({ method, path, query });
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
    handleMenuClose();
  }, [name]);

  const closeRenameDialog = useCallback(() => {
    setRenameDialogOpen(false);
  }, []);

  const handleRenameConfirm = async () => {
    if (!renameValue.trim()) {
      setRenameError('Der Dateiname darf nicht leer sein.');
      return;
    }
    if (renameValue === name) {
      // Kein Änderungsbedarf
      setRenameDialogOpen(false);
      return;
    }
    try {
      const query = objectToQueryString({ newFileName: renameValue });
      await handleAction('rename', query);
      setRenameDialogOpen(false);
    } catch (error) {
      // Wenn Fehler auftritt, Fehlermeldung anzeigen aber Dialog offen lassen
      setRenameError(error.message || 'Fehler beim Umbenennen');
    }
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
      <Zoom in={true} timeout={300}>
        <Card
          draggable={true}
          onDragStart={(e) => {
            onDragStart(model);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(model));
          }}
          onDragEnd={onDragEnd}
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
            opacity: dragState.isDragging && dragState.draggedItem?.path === model.path ? 0.5 : 1,
            cursor: dragState.isDragging ? 'grabbing' : 'grab',
            transition: 'opacity 0.2s ease-in-out'
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
            <IconButton onClick={() => setModalOpen(true)} title="Drucken">
              <PrintIcon />
            </IconButton>

            <IconButton onClick={() => onMove(model)} title="Verschieben">
              <DriveFileMoveIcon />
            </IconButton>

            <IconButton onClick={() => handleAction('refreshThumbnail')} title="Thumbnail aktualisieren">
              <RefreshIcon />
            </IconButton>

            <IconButton onClick={() => setDetailsDialogOpen(true)} title="Details">
              <InfoIcon />
            </IconButton>

            <IconButton onClick={handleDelete} title="Löschen">
              <DeleteIcon />
            </IconButton>

            <IconButton onClick={handleMenuOpen} title="Mehr">
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* More Menu */}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem
              component="a"
              href={operations.download.path}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <DownloadIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Download</ListItemText>
            </MenuItem>

            <MenuItem onClick={openRenameDialog}>
              <ListItemIcon>
                <DriveFileRenameOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Umbenennen</ListItemText>
            </MenuItem>
          </Menu>
        </Card>
      </Zoom>

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

      {/* Details-Dialog */}
      <ModelDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        model={model}
      />
    </>
  );
};

ModelCard.propTypes = {
  model: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    type: PropTypes.string,
    path: PropTypes.string,
    thumbnail: PropTypes.string,
    operations: PropTypes.object.isRequired
  }).isRequired,
  onAction: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  dragState: PropTypes.object.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired
};

export default memo(ModelCard);