import React from 'react';
import PropTypes from 'prop-types';
import { RgbColorPicker } from 'react-colorful';
//import 'react-colorful/dist/index.css';
import { Box, TextField, Grid } from '@mui/material';

const RgbPicker = ({ color, onChange }) => {
  return (
    <Box sx={{ width: 300, mx: 'auto', textAlign: 'center', pt: 1, margin: 'auto' }}>
      <RgbColorPicker color={color} onChange={onChange} style={{ width: '100%' }} />
      <Grid container spacing={1} justifyContent={'center'} alignItems={'center'}>
        {['r', 'g', 'b'].map((ch) => (
          <Grid item xs={4} key={ch} pt={5}>
            <TextField
              label={ch.toUpperCase()}
              type="number"
              inputProps={{ min: 0, max: 255 }}
              fullWidth
              value={color[ch]}
              onChange={(e) => {
                const v = Math.min(255, Math.max(0, Number(e.target.value) || 0));
                onChange({ ...color, [ch]: v });
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

RgbPicker.propTypes = {
  color: PropTypes.shape({
    r: PropTypes.number.isRequired,
    g: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RgbPicker;
