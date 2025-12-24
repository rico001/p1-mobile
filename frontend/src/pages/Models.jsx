import { useState } from 'react';
import { Box, Alert } from '@mui/material';
import ModelCard from '../components/ModelCard';
import FolderCard from '../components/FolderCard';
import CreateFolderButton from '../components/CreateFolderButton';
import MoveDialog from '../components/MoveDialog';
import PathBreadcrumbs from '../components/PathBreadcrumbs';
import { useModels } from '../hooks/useModels';
import UploadButton from '../components/UploadBttn';
import AppLoader from '../components/AppLoader';

// Grid-Konfiguration
const MIN_CARD_WIDTH = 220;  // minimale Karten-Breite
const MAX_CARD_WIDTH = 230;  // maximale Karten-Breite
const GRID_GAP = 40;   // Abstand zwischen Karten

export default function Models() {
    const {
        models,
        isLoading,
        error,
        isError,
        performAction,
        isActionPending,
        currentPath,
        setCurrentPath,
        createFolder,
        moveItem,
        deleteFolder,
        isFolderActionPending,
        refetch
    } = useModels();

    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [itemToMove, setItemToMove] = useState(null);

    const handleNavigate = (newPath) => {
        setCurrentPath(newPath);
    };

    const handleMoveClick = (item) => {
        setItemToMove(item);
        setMoveDialogOpen(true);
    };

    const handleMoveConfirm = ({ sourcePath, targetFolder }) => {
        moveItem({ sourcePath, targetFolder });
    };

    // Trenne Ordner und Dateien
    const folders = models.filter(m => m.type === 'folder');
    const files = models.filter(m => m.type === 'file');

    if (isError) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error.message}
            </Alert>
        );
    }

    return (
        <Box sx={{ width: '90%', maxWidth: '97%', mx: 'auto', p: 2 }}>
            {/* Breadcrumbs für Navigation */}
            <PathBreadcrumbs
                currentPath={currentPath}
                onNavigate={handleNavigate}
            />

            {/* Grid Layout */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(${MIN_CARD_WIDTH}px, ${MAX_CARD_WIDTH}px))`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: `${GRID_GAP}px`,
                }}
            >
                {/* Neuer Ordner Button */}
                <CreateFolderButton
                    onCreateFolder={createFolder}
                    currentPath={currentPath}
                />

                {/* Upload Button */}
                <UploadButton
                    uploadUrl="/api/ftp/upload-file"
                    onUploaded={refetch}
                    currentPath={currentPath}
                />

                {/* Ordner zuerst */}
                {folders.map(folder => (
                    <FolderCard
                        key={folder.path}
                        folder={folder}
                        onNavigate={handleNavigate}
                        onAction={performAction}
                        onMove={handleMoveClick}
                        onDelete={deleteFolder}
                    />
                ))}

                {/* Dann Dateien */}
                {files.map(file => (
                    <ModelCard
                        key={file.path}
                        model={file}
                        onAction={performAction}
                        onMove={handleMoveClick}
                    />
                ))}
            </Box>

            {/* Move Dialog */}
            <MoveDialog
                open={moveDialogOpen}
                onClose={() => setMoveDialogOpen(false)}
                item={itemToMove}
                folders={folders}
                onConfirm={handleMoveConfirm}
            />

            {/* Loading Overlay */}
            <AppLoader
                open={isActionPending || isLoading || isFolderActionPending}
                texts={isLoading ? ['Lade Modelle…'] : ["Bitte warten...", "Anfrage wird verarbeitet."]}
                displayTime={3000}
            />
        </Box>
    );
}