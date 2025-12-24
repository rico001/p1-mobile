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

const CreateFolderButton = ({ onCreateFolder, currentPath }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

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
          onClick={() => setDialogOpen(true)}
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            boxShadow: 3,
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
            '&:hover': {
              backgroundColor: 'action.selected',
              borderColor: 'primary.dark'
            }
          }}
        >
          <CreateNewFolderIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
          <Typography variant="subtitle1" color="primary">
            Neuer Ordner
          </Typography>
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
  currentPath: PropTypes.string.isRequired
};

export default CreateFolderButton;
