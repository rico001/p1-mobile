// src/components/UploadFabDialog.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function UploadFabDialog({ uploadUrl, onUploaded }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleOpen = () => {
    setOpen(true);
    setMessage('');
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      setMessage(json.message || 'Upload erfolgreich');
      onUploaded?.();
      // Automatisch Dialog nach kurzer Zeit schließen
      setTimeout(() => {
        setOpen(false);
        setFile(null);
        setMessage('');
      }, 1500);
    } catch (err) {
      setMessage('Fehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button zum Öffnen des Dialogs */}
      <Fab
        color="primary"
        aria-label="Datei hochladen"
        onClick={handleOpen}
        sx={{ position: 'fixed', bottom: 80, right: 40 }}
      >
        <CloudUploadIcon />
      </Fab>

      {/* Dialog für Datei-Auswahl und Upload */}
      <Dialog open={open} onClose={handleClose}>
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
            <Typography variant="body2" sx={{ mt: 1 }}>
              {file.name}
            </Typography>
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
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            OK
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