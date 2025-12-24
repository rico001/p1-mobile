import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Zoom
} from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const CreateFolderButton = ({ onCreateFolder, currentPath, dragState, onDrop, onDragOverFolder }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const isDropTarget = dragState?.isDragging && dragState.dragOverFolder === 'parent';
  const isDragging = dragState?.isDragging || false;
  const isRootPath = currentPath === '/p1-app-models';
  const showParentDrop = isDragging && !isRootPath;

  const handleConfirm = () => {
    if (folderName.trim()) {
      onCreateFolder({ folderName: folderName.trim(), parentPath: currentPath });
      setDialogOpen(false);
      setFolderName('');
    }
  };

  return (
    <>
      <Zoom in={true} timeout={300}>
        <Card
          onClick={() => !isDragging && setDialogOpen(true)}
          onDragOver={showParentDrop ? (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            onDragOverFolder?.('parent');
          } : undefined}
          onDragLeave={showParentDrop ? () => {
            onDragOverFolder?.(null);
          } : undefined}
          onDrop={showParentDrop ? (e) => {
            e.preventDefault();
            // Berechne Parent-Pfad
            const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/p1-app-models';
            onDrop?.({ path: parentPath, name: '..' });
          } : undefined}
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            boxShadow: 3,
            cursor: isDragging ? 'default' : 'pointer',
            border: '2px dashed',
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
            transition: 'all 0.2s ease-in-out',
            ...(isDropTarget && {
              transform: 'scale(1.02)',
              border: '2px solid',
              borderColor: 'primary.main',
              backgroundColor: 'action.selected'
            }),
            ...(!isDragging && {
              '&:hover': {
                backgroundColor: 'action.selected',
                borderColor: 'primary.dark'
              }
            })
          }}
        >
          {showParentDrop ? (
            <>
              <ArrowUpwardIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" color="primary">
                ..
              </Typography>
            </>
          ) : (
            <>
              <CreateNewFolderIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" color="primary">
                Neuer Ordner
              </Typography>
            </>
          )}
        </Card>
      </Zoom>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Neuen Ordner erstellen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ordnername"
            type="text"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="z.B. Meine Modelle"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleConfirm} variant="contained" disabled={!folderName.trim()}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CreateFolderButton.propTypes = {
  onCreateFolder: PropTypes.func.isRequired,
  currentPath: PropTypes.string.isRequired,
  dragState: PropTypes.object,
  onDrop: PropTypes.func,
  onDragOverFolder: PropTypes.func
};

export default CreateFolderButton;
