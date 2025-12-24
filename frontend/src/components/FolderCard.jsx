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
  Zoom,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const FolderCard = ({ folder, onNavigate, onAction, onMove, onDelete, onRename, dragState, onDragStart, onDragEnd, onDrop, onDragOverFolder }) => {
  const { name, path: folderPath, operations } = folder;
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  const handleRenameConfirm = () => {
    if (!renameValue.trim()) return;
    if (renameValue === name) {
      setRenameDialogOpen(false);
      return;
    }

    // Verwende die Rename-Mutation
    if (onRename) {
      onRename({ path: folderPath, newName: renameValue });
      setRenameDialogOpen(false);
    }
  };

  const isBeingDragged = dragState.isDragging && dragState.draggedItem?.path === folderPath;
  const isDropTarget = dragState.isDragging && dragState.dragOverFolder === folderPath;
  const showDropZone = dragState.isDragging && dragState.draggedItem?.path !== folderPath;

  return (
    <>
      <Zoom in={true} timeout={300}>
        <Card
          draggable={true}
          onDragStart={(e) => {
            onDragStart(folder);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json', JSON.stringify(folder));
          }}
          onDragEnd={onDragEnd}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            onDragOverFolder(folderPath);
          }}
          onDragLeave={() => {
            onDragOverFolder(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            onDrop(folder);
          }}
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: 3,
            overflow: 'hidden',
            opacity: isBeingDragged ? 0.7 : 1,
            cursor: dragState.isDragging ? 'default' : 'grab',
            transition: 'all 0.2s ease-in-out',
            ...(isDropTarget && {
              transform: 'scale(1.02)',
              opacity: 0.8,
              border: '2px solid',
              borderColor: 'primary.main'
            }),
            ...(showDropZone && !isDropTarget && {
              border: '2px dashed',
              borderColor: 'action.disabled'
            })
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
            <MenuItem onClick={() => {
              handleMenuClose();
              setRenameDialogOpen(true);
            }}>
              <ListItemIcon>
                <DriveFileRenameOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Umbenennen</ListItemText>
            </MenuItem>
          </Menu>
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
  onDelete: PropTypes.func,
  onRename: PropTypes.func,
  dragState: PropTypes.object.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onDragOverFolder: PropTypes.func.isRequired
};

export default memo(FolderCard);
