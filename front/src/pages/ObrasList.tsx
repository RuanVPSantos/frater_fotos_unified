import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Obra {
  id: number;
  name: string;
  description: string;
  location: string;
}

export default function ObrasList() {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>([]);
  const [open, setOpen] = useState(false);
  const [newObra, setNewObra] = useState({
    name: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    fetchObras();
  }, []);

  const fetchObras = async () => {
    try {
      const response = await axios.get(`${API_URL}/obra/all`);
      setObras(response.data);
    } catch (error) {
      console.error('Error fetching obras:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API_URL}/obra`, newObra);
      setOpen(false);
      setNewObra({ name: '', description: '', location: '' });
      fetchObras();
    } catch (error) {
      console.error('Error creating obra:', error);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
      >
        Nova Obra
      </Button>

      <Grid container spacing={3}>
        {obras.map((obra) => (
          <Grid item xs={12} sm={6} md={4} key={obra.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{obra.name}</Typography>
                <Typography color="textSecondary">{obra.location}</Typography>
                <Typography variant="body2">{obra.description}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/obra/${obra.id}`)}>
                  Ver Detalhes
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Nova Obra</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={newObra.name}
            onChange={(e) => setNewObra({ ...newObra, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Localização"
            fullWidth
            value={newObra.location}
            onChange={(e) => setNewObra({ ...newObra, location: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={newObra.description}
            onChange={(e) => setNewObra({ ...newObra, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained">
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}