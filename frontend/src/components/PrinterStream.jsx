import React, { useState, useRef } from 'react';
import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const transparentImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAgKAAAAACH5BAUAAAAALAAAAAABAAEAAAICRAEAOw==';

export default function PrinterStream(props) {
  const baseSrc = "/api/video/video-stream";
  const [reloadKey, setReloadKey] = useState(Date.now());
  const [showTransparent, setShowTransparent] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fullscreenRef = useRef(null);

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  const handleError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = transparentImg;
  };

  const src = showTransparent
    ? transparentImg
    : `${baseSrc}?reload=${reloadKey}`;

  const reloadStream = () => {

    setShowTransparent(true);

    setTimeout(() => {
      setReloadKey(Date.now());
      setShowTransparent(false);
    }, 1500);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <IconButton
        size="small"
        onClick={reloadStream}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
        }}
      >
        <RefreshIcon fontSize="small" />
      </IconButton>

      <Box
        component="img"
        src={src}
        alt="Printer Stream Preview"
        onError={handleError}
        onClick={handleOpen}
        sx={{
          display: 'block',
          cursor: 'pointer',
          height: '123px',
          minWidth: '218px',
          background: '#4040404a',
          borderRadius: '10px',
          margin: 'auto',
        }}
      />

      <Dialog
        open={previewOpen}
        onClick={handleClose}
        maxWidth={false}
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
            sx={{ width: '90%', objectFit: 'contain', boxShadow: 4, borderRadius: 1, backgroundColor: '#fff' }}
          />
        </DialogContent>
      </Dialog>

      {props.children}
    </div>
  );
}
