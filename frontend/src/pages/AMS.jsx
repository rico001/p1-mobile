import React from 'react';
import AMSState from '../components/AMSState';
import { Box } from '@mui/material';

function AMS() {
    return (
        <Box p={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AMSState />
        </Box>
    );
}

export default AMS;