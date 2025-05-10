import React, { useState, useRef } from 'react';
import { Box, CircularProgress, Dialog, DialogContent, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LightToggle from './LightToggle';
const transparentImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAgKAAAAACH5BAUAAAAALAAAAAABAAEAAAICRAEAOw==';

export default function PrinterStream(props) {
  const baseSrc = "/api/video/video-stream";
  const [reloadKey, setReloadKey] = useState(Date.now());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fullscreenRef = useRef(null);

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  const handleError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = transparentImg;
  };

  const src = loading
  ? transparentImg
  : `${baseSrc}?reload=${reloadKey}`;

  const reloadStream = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setReloadKey(Date.now());
    }, 1500);
    setTimeout(() => {
      setLoading(false);
    }, 6000);
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
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress size={50} />
          </Box>
        )}

        <IconButton
          size="small"
          onClick={reloadStream}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
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
