import React, { useState } from 'react';
import { Box, Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function PrinterStream() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const src = "http://localhost:1984/api/stream.mjpeg?src=p1s";

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  return (
    <>
      {/* Stream als klickbares Vorschaubild */}
      <Box
        component="img"
        src={src}
        alt="Printer Stream"
        onClick={handleOpen}
        sx={{
          display: 'block',
          width: '100%',
          maxWidth: '350px',
          height: 'auto',
          userSelect: 'none',
          margin: 'auto',
          backgroundColor: 'hsl(0, 0%, 25%)',
          borderRadius: '10px',
          cursor: 'pointer'
        }}
      />

      {/* Vollbild-Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            m: 0,
            position: 'relative'
          }
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        {/* Schließen-Button oben rechts */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#fff',
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Dialog-Inhalt: Stream fast fullscreen */}
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <Box
            component="img"
            src={src}
            alt="Printer Stream Fullscreen"
            sx={{
              width: '90%',
              objectFit: 'contain',
              boxShadow: 4,
              borderRadius: 1,
              backgroundColor: '#fff',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
