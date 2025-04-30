// src/components/UploadButton.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';

/**
 * Datei-Upload-Komponente mit eigenem Action-Button.
 *
 * Props:
 * - uploadUrl   (string): Endpoint zum Hochladen
 * - onUploaded  (func):   Callback, wird aufgerufen nach erfolgreichem Upload
 */
export default function UploadButton({ uploadUrl, onUploaded }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback(e => {
    setFile(e.target.files[0] || null);
    setMessage('');
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      setMessage(json.message || 'Upload erfolgreich');
      setFile(null);
      onUploaded?.();
    } catch (err) {
      setMessage('Fehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [file, uploadUrl, onUploaded]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="contained" component="label">
          Datei wählen
          <input
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        <Typography noWrap sx={{ flexGrow: 1 }}>
          {file ? file.name : 'Keine Datei ausgewählt'}
        </Typography>
        <Button
          variant="outlined"
          disabled={!file || loading}
          onClick={handleUpload}
        >
          {loading ? <CircularProgress size={20} /> : 'Hochladen'}
        </Button>
      </Box>
      {message && (
        <Alert
          severity={message.startsWith('Fehler') ? 'error' : 'success'}
          sx={{ mt: 2 }}
        >
          {message}
        </Alert>
      )}
    </Box>
  );
}

UploadButton.propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  onUploaded: PropTypes.func
};


