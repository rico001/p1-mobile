import React, { useState } from 'react';
import { Box, Dialog, DialogContent } from '@mui/material';

export default function PrinterStream( props ) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const src = "/api/video/video-stream";

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  return (
    <div style={{position: 'relative'}}>
      {/* Stream als klickbares Vorschaubild */}
      <div style={{ position: 'relative', width: '100%', width: 'fit-content', margin: 'auto', overflow: 'hidden' }}>
      <Box
          component="img"
          src={"/public/axis-overlay-xy.svg"}
          alt="Printer Stream"
          onClick={handleOpen}
          sx={{
            display: 'block',
            width: '-webkit-fill-available',
            pointerEvents: 'none',
            height: '130px',
            position: 'absolute',
            margin: 'auto',
            borderRadius: '10px',
            cursor: 'pointer',
            top: '37px',
            left: '30px',
          }}
        />
        <Box
          component="img"
          src={src}
          alt="Printer Stream"
          onClick={handleOpen}
          sx={{
            display: 'block',
            width: 'auto',
            minWidth: '200px',
            height: '130px',
            borderRadius: '10px',
            border: '3px solid #4040404a',
            cursor: 'pointer',
            backgroundColor: '#4040404a',
          }}
        />
      </div>

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
      {/* chilldren */}
      {props.children}
    </div>
  );
}
