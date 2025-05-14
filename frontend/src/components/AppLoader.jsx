import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Backdrop, CircularProgress, Typography, Box, Fade, useTheme } from '@mui/material';

const DEFAULT_TEXTS = ['Lade Daten…'];
const DEFAULT_DISPLAY_TIME = 3000;

const AppLoader = ({ open, texts = DEFAULT_TEXTS, displayTime = DEFAULT_DISPLAY_TIME }) => {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const txtRef = useRef(texts);

  useEffect(() => {
    txtRef.current = texts;
  }, [texts]);

  useEffect(() => {
    if (!open || txtRef.current.length < 2) {
      setIndex(0);
      return;
    }

    const cycle = () => {
      setIndex(prev => (prev + 1) % txtRef.current.length);
    };

    const id = setInterval(cycle, displayTime);
    return () => clearInterval(id);
  }, [open, displayTime]);

  return (
    <Backdrop
      open={open}
      aria-label="Ladeanzeige"
      sx={{
        color: theme.palette.common.white,
        zIndex: theme.zIndex.modal + 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <CircularProgress aria-busy={open} />
      <Fade in={open} key={index} timeout={{ enter: 300, exit: 300 }} unmountOnExit>
        <Box mt={2}>
          <Typography variant="body1">{txtRef.current[index]}</Typography>
        </Box>
      </Fade>
    </Backdrop>
  );
};

AppLoader.propTypes = {
  open: PropTypes.bool.isRequired,
  texts: PropTypes.arrayOf(PropTypes.string),
  displayTime: PropTypes.number,
};

AppLoader.defaultProps = {
  texts: DEFAULT_TEXTS,
  displayTime: DEFAULT_DISPLAY_TIME,
};

export default AppLoader;
