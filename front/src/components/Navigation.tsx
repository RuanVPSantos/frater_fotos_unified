import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Construction, Slideshow } from '@mui/icons-material';

export default function Navigation() {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        color="inherit"
        startIcon={<Construction />}
        onClick={() => navigate('/')}
      >
        Obras
      </Button>
      <Button
        color="inherit"
        startIcon={<Slideshow />}
        onClick={() => navigate('/slideshow')}
      >
        Slideshow
      </Button>
    </div>
  );
}