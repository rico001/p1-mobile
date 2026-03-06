import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  LinearProgress,
  Alert
} from '@mui/material';
import { use3mfFile } from '../hooks/use3mfFile';
import ImageGallery from './model-details/ImageGallery';
import MetadataPanel from './model-details/MetadataPanel';
import Model3DViewer from './model-details/Model3DViewer';

export default function ModelDetailsDialog({ open, onClose, model }) {
  const [activeTab, setActiveTab] = useState(0);

  // Only load when dialog is open
  const downloadUrl = model?.operations?.download?.path;
  const { isLoading, error, data } = use3mfFile(downloadUrl, open);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { height: '80vh' } } }}
    >
      <DialogTitle textAlign={'center'}>
        {model?.name || 'Model Details'}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {isLoading && (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <LinearProgress sx={{ width: '50%', mb: 2 }} />
            <Box sx={{ color: 'text.secondary' }}>
              Lade 3MF-Datei...
            </Box>
          </Box>
        )}

        {!isLoading && error && (
          <Alert severity="error" sx={{ m: 2 }}>
            Fehler beim Laden: {error}
          </Alert>
        )}

        {!isLoading && data && (
          <>
            <Tabs
              value={activeTab}
              onChange={(_e, val) => setActiveTab(val)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Bilder (${data.images.length})`} />
              <Tab label="Metadaten" />
              {data.hasGeometry && <Tab label="3D-Vorschau" />}
            </Tabs>

            <Box sx={{ height: 'calc(80vh - 180px)', overflow: 'auto' }}>
              {activeTab === 0 && <ImageGallery images={data.images} />}
              {activeTab === 1 && <MetadataPanel metadata={data.metadata} />}
              {activeTab === 2 && data.hasGeometry && <Model3DViewer modelXml={data.modelXml} gcodes={data.gcodes} />}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
}
