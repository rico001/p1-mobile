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
          borderRadius: '16px',
          cursor: isDragging ? 'default' : 'pointer',
          border: '1px dashed',
          borderColor: 'rgba(45, 212, 170, 0.35)',
          backgroundColor: 'rgba(45, 212, 170, 0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
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
