import React, { useState, useRef } from 'react';
import { Box, Dialog, DialogContent } from '@mui/material';

export default function PrinterStream(props) {

  const src = "/api/video/video-stream";

  const [previewOpen, setPreviewOpen] = useState(false);

  const previewRef = useRef(null);
  const fullscreenRef = useRef(null);

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Box
        component="img"
        src={src}
        alt="Printer Stream Preview"
        ref={previewRef}
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

      {/* Fullscreen Dialog */}
      <Dialog
        open={previewOpen}
        onClick={handleClose}
        maxWidth={false}
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', m: 0, position: 'relative' } }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' } }}
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