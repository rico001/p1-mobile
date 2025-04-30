import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import ModelCard from '../components/ModelCard';
import { useModels } from '../hooks/useModels';

const MIN_CARD_WIDTH = 150;
const MAX_CARD_WIDTH = 200;
const GRID_GAP = 30;

const Models = () => {
    const {
        models,
        isLoading,
        isError,
        error,
        performAction,
        isActionLoading
    } = useModels();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error.message}
            </Alert>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                mx: 'auto',
                display: 'grid',
                gridTemplateColumns: `repeat(
          auto-fit,
          minmax(${MIN_CARD_WIDTH}px, ${MAX_CARD_WIDTH}px)
        )`,
                gap: `${GRID_GAP}px`,
                p: 2,
            }}
        >
            {models.map(model => (
                <ModelCard
                    key={model.name}
                    model={model}
                    onAction={performAction}
                />
            ))}

            {isActionLoading && (
                <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
                    <CircularProgress size={24} />
                </Box>
            )}
        </Box>
    );
};

export default Models;
