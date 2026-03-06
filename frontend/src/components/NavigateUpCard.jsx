import PropTypes from 'prop-types';
import {
  Card,
  Typography,
  Zoom
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const NavigateUpCard = ({ currentPath, onNavigate, dragState }) => {
  const isDragging = dragState?.isDragging || false;

  const handleClick = () => {
    if (isDragging) return;

    // Berechne Parent-Pfad
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/p1-app-models';
    onNavigate(parentPath);
  };

  return (
    <Zoom in={true} timeout={300}>
      <Card
        onClick={handleClick}
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          boxShadow: 3,
          cursor: isDragging ? 'default' : 'pointer',
          border: '2px dashed',
          borderColor: 'primary.main',
          backgroundColor: 'action.hover',
          transition: 'all 0.2s ease-in-out',
          ...(!isDragging && {
            '&:hover': {
              backgroundColor: 'action.selected',
              borderColor: 'primary.dark',
              transform: 'scale(1.02)'
            }
          })
        }}
      >
        <ArrowUpwardIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
        <Typography variant="subtitle1" color="primary">
          ..
        </Typography>
      </Card>
    </Zoom>
  );
};

NavigateUpCard.propTypes = {
  currentPath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  dragState: PropTypes.object
};

export default NavigateUpCard;
