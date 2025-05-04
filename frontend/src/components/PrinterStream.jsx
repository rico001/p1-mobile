import React, { useState, useRef, useEffect } from 'react';
import { Box, Dialog, DialogContent, FormControl, Select, MenuItem } from '@mui/material';
import { useSelector } from 'react-redux';
import { useLocalStorage } from '../hooks/userLocalStorage';

export default function PrinterStream(props) {
  const { currentPage } = useSelector((state) => state.ui);
  console.log("PrinterStream page", currentPage);

  const src_1 = "/api/video/video-stream-1";
  const src_2 = "/api/video/video-stream-2";

  const [currentSrc, setCurrentSrc] = useLocalStorage('printerStreamSrc', src_1);
  const [previewOpen, setPreviewOpen] = useState(false);

  const previewRef = useRef(null);
  const fullscreenRef = useRef(null);

  const handleOpen = () => setPreviewOpen(true);
  const handleClose = () => setPreviewOpen(false);

  if (currentPage !== 'printer') {
    console.log("PrinterStream page not printer", currentPage);
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <FormControl
        variant="filled"
        size="small"
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 10,
          width: '35px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderRadius: 0.5,
          boxShadow: 1,
          '& .MuiFilledInput-root': {
            backgroundColor: 'transparent',
            padding: '0 !important',
          },
        }}
      >
        <Select
          value={currentSrc}
          onChange={(e) => setCurrentSrc(e.target.value)}
          sx={{
            fontSize: '0.6rem',
            padding: 0,
            width: 'px',
            '& .MuiSelect-select': {
              padding: '0 4px',
            },
          }}
          disableUnderline
          IconComponent={() => null}
        >
          <MenuItem sx={{ minHeight: 10, fontSize: '0.75rem', py: 0 }} value={src_1}>Cam-1</MenuItem>
          <MenuItem sx={{ minHeight: 10, fontSize: '0.75rem', py: 0 }} value={src_2}>Cam-2</MenuItem>
        </Select>
      </FormControl>

      <Box
        component="img"
        src={currentSrc}
        alt="Printer Stream Preview"
        ref={previewRef}
        onClick={handleOpen}
        sx={{
          display: 'block',
          cursor: 'pointer',
          width: '200px',
          height: '130px',
          backgroundColor: '#4040404a',
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
            src={currentSrc}
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