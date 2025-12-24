import { useState, useEffect, useRef } from 'react';
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
        renameFolder,
        isFolderActionPending,
        refetch
    } = useModels();

    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [itemToMove, setItemToMove] = useState(null);
    const [dragState, setDragState] = useState({
        isDragging: false,
        draggedItem: null,
        dragOverFolder: null
    });

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

    const handleDragStart = (item) => {
        setDragState({
            isDragging: true,
            draggedItem: item,
            dragOverFolder: null
        });
    };

    const handleDragEnd = () => {
        setDragState({
            isDragging: false,
            draggedItem: null,
            dragOverFolder: null
        });
    };

    const handleDrop = (targetFolder) => {
        if (!dragState.draggedItem) return;

        // Prevent dropping folder into itself
        if (dragState.draggedItem.path === targetFolder.path) {
            handleDragEnd();
            return;
        }

        // Call existing moveItem mutation
        moveItem({
            sourcePath: dragState.draggedItem.path,
            targetFolder: targetFolder.path
        });

        handleDragEnd();
    };

    const handleDragOverFolder = (folderId) => {
        setDragState(prev => ({
            ...prev,
            dragOverFolder: folderId
        }));
    };

    // Auto-Scrolling beim Dragging
    const scrollIntervalRef = useRef(null);

    useEffect(() => {
        if (!dragState.isDragging) {
            if (scrollIntervalRef.current) {
                cancelAnimationFrame(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
            return;
        }

        const SCROLL_ZONE = 150; // Pixel vom Rand (breiter gemacht)
        const SCROLL_SPEED = 10; // Pixel pro Frame

        const handleDragMove = (e) => {
            const viewportHeight = window.innerHeight;
            const mouseY = e.clientY;

            const distanceFromTop = mouseY;
            const distanceFromBottom = viewportHeight - mouseY;

            let scrollAmount = 0;
            const inTopZone = distanceFromTop < SCROLL_ZONE;
            const inBottomZone = distanceFromBottom < SCROLL_ZONE;

            if (inTopZone) {
                // Nahe am oberen Rand - nach oben scrollen
                scrollAmount = -SCROLL_SPEED * ((SCROLL_ZONE - distanceFromTop) / SCROLL_ZONE);
            } else if (inBottomZone) {
                // Nahe am unteren Rand - nach unten scrollen
                scrollAmount = SCROLL_SPEED * ((SCROLL_ZONE - distanceFromBottom) / SCROLL_ZONE);
            }

            if (scrollAmount !== 0) {
                const scroll = () => {
                    window.scrollBy(0, scrollAmount);
                    if (dragState.isDragging) {
                        scrollIntervalRef.current = requestAnimationFrame(scroll);
                    }
                };
                if (!scrollIntervalRef.current) {
                    scrollIntervalRef.current = requestAnimationFrame(scroll);
                }
            } else {
                if (scrollIntervalRef.current) {
                    cancelAnimationFrame(scrollIntervalRef.current);
                    scrollIntervalRef.current = null;
                }
            }
        };

        document.addEventListener('dragover', handleDragMove);

        return () => {
            document.removeEventListener('dragover', handleDragMove);
            if (scrollIntervalRef.current) {
                cancelAnimationFrame(scrollIntervalRef.current);
            }
        };
    }, [dragState.isDragging]);

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
                {/* Neuer Ordner Button / Parent Directory Drop Target */}
                <CreateFolderButton
                    onCreateFolder={createFolder}
                    currentPath={currentPath}
                    dragState={dragState}
                    onDrop={handleDrop}
                    onDragOverFolder={handleDragOverFolder}
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
                        onRename={renameFolder}
                        dragState={dragState}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        onDragOverFolder={handleDragOverFolder}
                    />
                ))}

                {/* Dann Dateien */}
                {files.map(file => (
                    <ModelCard
                        key={file.path}
                        model={file}
                        onAction={performAction}
                        onMove={handleMoveClick}
                        dragState={dragState}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
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