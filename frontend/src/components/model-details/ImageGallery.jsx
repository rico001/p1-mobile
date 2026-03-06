import { useState } from 'react';
import { Box, ImageList, ImageListItem, ImageListItemBar, Dialog, DialogContent, Typography } from '@mui/material';

export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        Keine Bilder gefunden
      </Box>
    );
  }

  return (
    <>
      <ImageList cols={3} gap={8} sx={{ mt: 0, p: 2 }}>
        {images.map((img, idx) => (
          <ImageListItem
            key={idx}
            onClick={() => setSelectedImage(img)}
            sx={{
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
              transition: 'opacity 0.2s'
            }}
          >
            <img
              src={img.url}
              alt={img.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
            <ImageListItemBar
              title={img.name.split('/').pop()}
              sx={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                '& .MuiImageListItemBar-title': {
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      {/* Full-size preview dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        onClick={() => setSelectedImage(null)}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            m: 0,
            position: 'relative'
          }
        }}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' } }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Box
            component="img"
            src={selectedImage?.url}
            alt={selectedImage?.name}
            sx={{
              width: '98%',
              objectFit: 'contain',
              boxShadow: 4,
              borderRadius: 1,
              backgroundColor: '#fff'
            }}
          />
          {selectedImage && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                px: 2,
                py: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: 1
              }}
            >
              {selectedImage.name}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
