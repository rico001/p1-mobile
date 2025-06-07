// src/components/LightToggle.jsx
import React from 'react';
import { Dialog, IconButton } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useSelector } from 'react-redux';

//is showing an iframe for other light
export default function ThirdPartyIframeToggle() {
  console.log('rendering ThirdPartyIframeToggle');

  const thirdPartyIframeToggleSrc = useSelector(state => state.ui.env.thirdPartyIframeToggleSrc)
  const src = thirdPartyIframeToggleSrc

  const [open, setOpen] = React.useState(false);

  if (!src) return null;

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        sx={{
          bgcolor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
        }}
      >
        <AutoAwesomeIcon sx={{ color: '#fffbe3' }} fontSize="small" />
      </IconButton>
      {open && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullScreen
        >
          <iframe
            src={src}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'transparent',
              background: 'transparent',
            }}
            title="Third Party Iframe"
          />
          <IconButton
            onClick={() => setOpen(false)}
            size='large'
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'rgb(0, 0, 0)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgb(84, 84, 84)' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Dialog>
      )}
    </>
  );
}
