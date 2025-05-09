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
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <Box
        sx={{
          display: 'block',
          marginTop: { xs: '0', md: 3 },
          cursor: 'pointer',
          maxHeight: '250px',
          width: '100%',
          maxWidth: '420px',
          aspectRatio: '16/9',
          margin: 'auto',
          position: 'relative',
        }}>
        <Box
          component="img"
          src={src}
          alt="Printer Stream Preview"
          onError={handleError}
          onClick={handleOpen}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: '#4040404a',
          }}
        />
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
      </Box>

      <Dialog
        open={previewOpen}
        onClick={handleClose}
        backgroundColor="transparent"
        PaperComponent={({ children }) => (
          <Box
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 0,
              borderRadius: 0,
              width: '70%',
              maxWidth: '800px',
              height: 'auto',
              overflow: 'hidden'
            }}
          >
            {children}
          </Box>
        )}
      >
        <DialogContent
          sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
        >
          <Box
            component="img"
            src={src}
            alt="Printer Stream Fullscreen"
            ref={fullscreenRef}
            sx={{ width: '100%', objectFit: 'contain', boxShadow: 4, borderRadius: 1, backgroundColor: '#fff', maxWidth: '100%' }}
          />
        </DialogContent>
      </Dialog>

      {props.children}
    </div>
  );
}
