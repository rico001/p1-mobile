import React, { useState, useRef } from 'react';
import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LightToggle from './LightToggle';

export default function PrinterStream(props) {
  const baseSrc = "/api/video/video-stream";
  const [reloadKey, setReloadKey] = useState(Date.now());
  const [previewOpen, setPreviewOpen] = useState(false);
  const fullscreenRef = useRef(null);

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  const handleError = (e) => {
    e.currentTarget.onerror = null;
  };

  const src = `${baseSrc}?reload=${reloadKey}`;

  const reloadStream = () => {
    setTimeout(() => {
      setReloadKey(Date.now());
    }, 1500);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <IconButton
        size="small"
        onClick={reloadStream}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          zIndex: 2,
          bgcolor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
        }}
      >
        <RefreshIcon fontSize="small" />
      </IconButton>


      <LightToggle />


      <Box
        component="img"
        src={src}
        alt="Printer Stream Preview"
        onError={handleError}
        onClick={handleOpen}
        sx={{
          display: 'block',
          cursor: 'pointer',
          maxHeight: '250px',
          width: '100%',
          aspectRatio: '16/9',
          background: '#4040404a',
          margin: 'auto',
          objectFit: 'cover',
          minHeight: '130px',
        }}
      />


      <Dialog
        open={previewOpen}
        onClick={handleClose}

        PaperProps={{
          sx: { backgroundColor: 'transparent', boxShadow: 'none', m: 0, position: 'relative' }
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        <DialogContent
          sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
        >
          <Box
            component="img"
            src={src}
            alt="Printer Stream Fullscreen"
            ref={fullscreenRef}
            sx={{ width: '98%', objectFit: 'contain', boxShadow: 4, borderRadius: 1, backgroundColor: '#fff' }}
          />
        </DialogContent>
      </Dialog>

      {props.children}
    </div>
  );
}
