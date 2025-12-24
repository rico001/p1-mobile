import PropTypes from 'prop-types';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const PathBreadcrumbs = ({ currentPath, onNavigate }) => {
  const rootPath = '/p1-app-models';

  // Entferne den Root-Pfad aus dem aktuellen Pfad
  const relativePath = currentPath.startsWith(rootPath)
    ? currentPath.substring(rootPath.length)
    : currentPath;

  const pathParts = relativePath === '' || relativePath === '/'
    ? []
    : relativePath.split('/').filter(Boolean);

  const handleNavigate = (index) => {
    if (index === -1) {
      // Navigiere zu Root (/p1-app-models)
      onNavigate(rootPath);
    } else {
      // Baue den vollständigen Pfad wieder auf
      const newPath = rootPath + '/' + pathParts.slice(0, index + 1).join('/');
      onNavigate(newPath);
    }
  };
  
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 3 }}
    >
      <Link
        component="button"
        variant="body1"
        onClick={() => handleNavigate(-1)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'primary.main',
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
      </Link>

      {pathParts.map((part, index) => {
        const isLast = index === pathParts.length - 1;

        if (isLast) {
          return (
            <Typography
              sx={{
                textDecoration: 'none',
                color: 'white',
                cursor: 'pointer',
                border: 'none',
                background: 'none'
              }}
              key={index}>
              {part}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            component="button"
            variant="body1"
            onClick={() => handleNavigate(index)}
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {part}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

PathBreadcrumbs.propTypes = {
  currentPath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired
};

export default PathBreadcrumbs;
