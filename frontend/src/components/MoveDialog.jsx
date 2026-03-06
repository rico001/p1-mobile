import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';

const MoveDialog = ({ open, onClose, item, folders, onConfirm }) => {
  const [selectedFolder, setSelectedFolder] = useState(null);

  const handleConfirm = () => {
    if (selectedFolder) {
      onConfirm({
        sourcePath: item.path,
        targetFolder: selectedFolder
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFolder(null);
    onClose();
  };

  const availableFolders = [
    { name: 'Root', path: '/p1-app-models' },
    ...folders.filter(f =>
      f.type === 'folder' &&
      f.path !== item?.path &&
      !f.path.startsWith(item?.path + '/')
    )
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Verschieben: {item?.name}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Wählen Sie einen Zielordner aus.
        </Typography>

        <List>
          {availableFolders.map((folder) => (
            <ListItem key={folder.path} disablePadding>
              <ListItemButton
                selected={selectedFolder === folder.path}
                onClick={() => setSelectedFolder(folder.path)}
              >
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText
                  primary={folder.name}
                  secondary={folder.path === '/' ? 'Hauptverzeichnis' : folder.path}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Abbrechen</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedFolder}
        >
          Verschieben
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MoveDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  folders: PropTypes.array.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default MoveDialog;
