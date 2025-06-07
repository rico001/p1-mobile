import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, IconButton, FormControl, Select, MenuItem } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChamberLightToggle from './ChamberLightToggle';
import { transparentPng } from '../../utils/functions';
import BedTempState from '../print-sensors/BedTempState';
import NozzleTempState from '../print-sensors/NozzleTempState';
import ThirdPartyIframeToggle from './ThirdPartyIframeToggle';
import useLocalStorage from '../../hooks/useLocalStorage';
import FullScreenButton from './FullScreenButton';

export default function PrinterStream(props) {
  console.log('rendering PrinterStream');

  const printerSrc = "/api/video/video-stream";
  const externSrc1 = "/api/video/video-stream-extern-1";
  const externSrc2 = "/api/video/video-stream-extern-2";

  const [src, setSrc] = useState(transparentPng());
  const [loading, setLoading] = useState(false);

  const [streamSource, setStreamSource] = useLocalStorage('PrinterStream-src', printerSrc);

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadStream();
    }, 500);
    return () => clearTimeout(timer);
  }, [streamSource]);

  const handleError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = transparentPng();
  };

  const reloadStream = () => {
    if (loading) return;
    setLoading(true);
    setSrc(transparentPng());

    setTimeout(() => {
      const cacheKey = Date.now();
      setSrc(`${streamSource}?${cacheKey}`);
    }, 1500);

    setTimeout(() => {
      setLoading(false);
    }, streamSource === printerSrc ? 6000 : 3000);

  };

  // Handle source change
  const handleSourceChange = (e) => {
    setStreamSource(e.target.value);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          display: 'block',
          marginTop: { xs: '0', md: 3 },
          cursor: 'pointer',
          maxHeight: '250px',
          height: 'fill-available',
          width: '100%',
          maxWidth: '420px',
          aspectRatio: '16/9',
          margin: 'auto',
        }}>

        <FormControl
          variant="outlined"
          size="small"
          disabled={loading}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 3,
            '& .MuiSelect-select': { color: 'rgba(255, 255, 255, 0.83)', padding: '4px 8px', border: 'none', background: 'rgba(95, 95, 95, 0.51)' },
          }}>
          <Select
            value={streamSource}
            onChange={handleSourceChange}
            onOpen={() => {} }
            inputProps={{ 'aria-label': 'Stream source' }}
          >
            <MenuItem value={printerSrc}>1</MenuItem>
            <MenuItem value={externSrc1}>2</MenuItem>
            <MenuItem value={externSrc2}>3</MenuItem>
          </Select>
        </FormControl>
        <Box
          component="img"
          src={src}
          alt="Printer Stream Preview"
          onError={handleError}
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
          disabled={loading}
          //transition on loading rotate 
          
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            zIndex: 2,
            bgcolor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 2,
          }}
        >
          <ChamberLightToggle />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 50,
            zIndex: 2,
          }}
        >
          <ThirdPartyIframeToggle />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2,
          }}
        >
          <FullScreenButton disabled={loading} src={streamSource} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, padding: 0.5 }}>
          <BedTempState />
          <NozzleTempState />
        </Box>
      </Box>
      {props.children}
    </div>
  );
}
