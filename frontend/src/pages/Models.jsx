import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import ModelCard from '../components/ModelCard';
import { useModels } from '../hooks/useModels';
import UploadButton from '../components/UploadBttn';
import AppLoader from '../components/AppLoader';

// Grid-Konfiguration
const MIN_CARD_WIDTH = 220;  // minimale Karten-Breite
const MAX_CARD_WIDTH = 230;  // maximale Karten-Breite
const GRID_GAP = 40;   // Abstand zwischen Karten

export default function Models() {
    const { 
        models, isLoading, 
        error, isError, 
        performAction, isActionPending, 
        refetch 
    } = useModels();

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
                width: '90%',
                maxWidth: '97%',
                mx: 'auto',
                display: 'grid',
                gridTemplateColumns: `
                    repeat(
                        auto-fit,
                        minmax(${MIN_CARD_WIDTH}px, ${MAX_CARD_WIDTH}px)
                    )`,
                justifyContent: 'center',
                alignItems: 'center',
                gap: `${GRID_GAP}px`,
                p: 2,
            }}
        >

            <UploadButton
                uploadUrl="/api/ftp/upload-file"
                onUploaded={refetch}
            />
            {models.map(m => (
                <ModelCard key={m.name} model={m} onAction={performAction} />
            ))}
            <AppLoader  
                open={isActionPending || isLoading}
                texts={isLoading ? ['Lade Modelle…'] : ["Bitte warten...", "Anfrage wird verarbeitet."]}
                displayTime={3000}
            />
        </Box>
    );
}