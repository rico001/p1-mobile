// components/GlobalLoader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

const AppLoader = ({ open, text }) => {

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <CircularProgress color="inherit" />
        {text && (
          <Typography
            variant="body1"
            sx={{ mt: 2 }}
          >
            {text}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};

AppLoader.propTypes = {
  open: PropTypes.bool.isRequired,
  text: PropTypes.string,
};

AppLoader.defaultProps = {
  text: 'Lade Daten…',
};

export default AppLoader;
