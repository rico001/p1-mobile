import { memo, useState } from 'react';
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
  Zoom
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';

const FolderCard = ({ folder, onNavigate, onAction, onMove, onDelete }) => {
  const { name, path: folderPath, operations } = folder;
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(name);

  const handleDelete = () => {
    if (window.confirm(`Möchten Sie den Ordner "${name}" wirklich löschen?`)) {
      if (onDelete) {
        // Verwende die dedizierte deleteFolder-Funktion
        onDelete(folderPath);
      } else {
        // Fallback auf performAction
        onAction({ method: 'DELETE', path: operations.delete.path });
      }
    }
  };

  const handleRenameConfirm = async () => {
    if (!renameValue.trim()) return;
    if (renameValue === name) {
      setRenameDialogOpen(false);
      return;
    }

    // Sende Rename-Request mit newName im Body
    try {
      const response = await fetch(operations.rename.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: renameValue })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Fehler beim Umbenennen: ${error.message}`);
        return;
      }

      // Erfolg - Dialog schließen und Parent über Erfolg informieren
      setRenameDialogOpen(false);

      // Triggere Refresh über onAction
      if (onAction) {
        onAction({ method: 'REFRESH' });
      }
    } catch (err) {
      alert(`Fehler beim Umbenennen: ${err.message}`);
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
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden'
          }}
        >
          <Box
            onClick={() => onNavigate(folder.path)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'action.hover',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.selected'
              }
            }}
          >
            <FolderIcon sx={{ fontSize: 80, color: 'primary.main' }} />
          </Box>

          <Box sx={{ p: 1, pt: 0, pb: 0 }}>
            <Typography
              variant="subtitle1"
              noWrap
              title={name}
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ordner
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 1, px: 1, pb: 0 }}>
            <IconButton onClick={() => onMove(folder)} title="Verschieben">
              <DriveFileMoveIcon />
            </IconButton>

            <IconButton onClick={() => setRenameDialogOpen(true)} title="Umbenennen">
              <DriveFileRenameOutlineIcon />
            </IconButton>

            <IconButton onClick={handleDelete} title="Löschen">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Card>
      </Zoom>

      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Ordner umbenennen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Neuer Ordnername"
            type="text"
            fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleRenameConfirm} variant="contained">Umbenennen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

FolderCard.propTypes = {
  folder: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    operations: PropTypes.object.isRequired
  }).isRequired,
  onNavigate: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func
};

export default memo(FolderCard);
