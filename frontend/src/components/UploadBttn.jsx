import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Button,
  Typography,
  Alert,
  TextField
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';

export default function UploadFabDialog({ uploadUrl, onUploaded }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existsError, setExistsError] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    resetState();
  };

  const handleClose = () => {
    if (!loading) {
      resetState();
      setOpen(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setNewFileName('');
    setMessage('');
    setExistsError(false);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0] || null;
    setFile(selected);
    setNewFileName(selected ? selected.name : '');
    setMessage('');
    setExistsError(false);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file, newFileName || file.name);

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      const json = await res.json();

      if (!res.ok) {
        // If server indicates file exists, allow rename
        if (res.status === 409 || json.code === 'fileExists') {
          setExistsError(true);
          setMessage('Eine Datei mit diesem Namen existiert bereits. Bitte umbenennen.');
        } else {
          setExistsError(false);
          throw new Error(json.message || 'Fehler beim Upload');
        }
        setLoading(false);
        return;
      }

      // Clear any previous error state before showing success
      setExistsError(false);
      setMessage(json.message || 'Upload erfolgreich');
      onUploaded?.();
      // Dialog schließen nach kurzer Zeit
      setTimeout(() => {
        resetState();
        setOpen(false);
      }, 2000);
    } catch (err) {
      setExistsError(false);
      setMessage('Fehler: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="Datei hochladen"
        onClick={handleOpen}
        sx={{ position: 'fixed', bottom: 80, right: 40 }}
      >
        <FileUploadIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Datei hochladen</DialogTitle>
        <DialogContent dividers>
          <Button variant="contained" component="label">
            Datei wählen
            <input
              hidden
              type="file"
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <>
              <Typography sx={{ mt: 2 }}>
                <strong>ausgewählte Datei:</strong>
              </Typography>
              <Typography>
                {file.name}
              </Typography>
            </>
          )}

          {existsError && (
            <TextField
              fullWidth
              label="Neuer Dateiname"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}

          {message && (
            <Alert
              severity={message.startsWith('Fehler') ? 'error' : 'success'}
              sx={{ mt: 2 }}
            >
              {message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Abbrechen
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            variant="contained"
            startIcon={<CircularProgress size={20} sx={{ display: loading ? 'block' : 'none' }} />}
          >
            {loading ? 'Bitte Warten...' : 'Hochladen'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

UploadFabDialog.propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  onUploaded: PropTypes.func
};