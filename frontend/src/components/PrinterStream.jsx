import React, { useState } from 'react';
import { Box, Dialog, DialogContent } from '@mui/material';

export default function PrinterStream( props ) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const src_1 = "/api/video/video-stream-1";
  const src_2 = "/api/video/video-stream-2";

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  return (
    <div style={{position: 'relative'}}>
      {/* Stream als klickbares Vorschaubild */}
      <Box
          component="img"
          src={src_2}
          alt="Printer Stream-2"
          onClick={handleOpen}
          sx={{
            display: 'block',
            width: '-webkit-fill-available',
            height: '130px',
            cursor: 'pointer',
            backgroundColor: '#000',
            margin: 'auto',
            borderRadius: '10px',
            backgroundColor: '#4040404a',
            width: '200px',
            height: '130px',
            cursor: 'pointer',
          }}
        />

      {/* Vollbild-Dialog */}
      <Dialog
        open={previewOpen}
        onClick={handleClose}
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
      {/* chilldren */}
      {props.children}
    </div>
  );
}
