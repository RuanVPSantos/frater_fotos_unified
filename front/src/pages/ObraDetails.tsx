import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Obra {
  id: number;
  name: string;
  description: string;
  location: string;
  ObraImages: Array<{
    id: number;
    imageUrl: string;
  }>;
}

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'error';
}

export default function ObraDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obra, setObra] = useState<Obra | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  useEffect(() => {
    fetchObra();
  }, [id]);

  useEffect(() => {
    // Cleanup preview URLs when component unmounts
    return () => {
      pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [pendingImages]);

  const fetchObra = async () => {
    try {
      const response = await axios.get(`${API_URL}/obra/${id}`);
      setObra(response.data);
      setEditData({
        name: response.data.name,
        description: response.data.description,
        location: response.data.location,
      });
    } catch (error) {
      console.error('Error fetching obra:', error);
    }
  };

  const handleUpdate = async () => {
    // Optimistic update
    if (obra) {
      const optimisticObra = {
        ...obra,
        ...editData
      };
      setObra(optimisticObra);
      setEditOpen(false);

      try {
        await axios.put(`${API_URL}/obra/${id}`, editData);
      } catch (error) {
        // Rollback on error
        setObra(obra);
        console.error('Error updating obra:', error);
        alert('Erro ao atualizar obra. Por favor, tente novamente.');
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta obra?')) {
      // Optimistic delete
      const previousObra = obra;
      setObra(null);

      try {
        await axios.delete(`${API_URL}/obra/${id}`);
        navigate('/');
      } catch (error) {
        // Rollback on error
        setObra(previousObra);
        console.error('Error deleting obra:', error);
        alert('Erro ao excluir obra. Por favor, tente novamente.');
      }
    }
  };

  const handleImageSelect = (files: FileList) => {
    const newPendingImages: PendingImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));
    setPendingImages(prev => [...prev, ...newPendingImages]);
  };

  const [_, setUploadingCount] = useState(0);

  const uploadImage = async (pendingImage: PendingImage) => {
    const formData = new FormData();
    formData.append('image', pendingImage.file);

    setUploadingCount(prev => prev + 1); // Incrementa contador antes do upload

    try {
      setPendingImages(prev =>
        prev.map(img =>
          img.id === pendingImage.id ? { ...img, status: 'uploading' } : img
        )
      );

      const response = await axios.post(`${API_URL}/obraimage/${id}`, formData);

      setPendingImages(prev => prev.filter(img => img.id !== pendingImage.id));
      setObra(prevObra =>
        prevObra ? { ...prevObra, ObraImages: [...prevObra.ObraImages, response.data] } : prevObra
      );
    } catch (error) {
      setPendingImages(prev =>
        prev.map(img =>
          img.id === pendingImage.id ? { ...img, status: 'error' } : img
        )
      );
      console.error('Error uploading image:', error);
    } finally {
      setUploadingCount(prev => {
        const newCount = prev - 1;
        if (newCount === 0) fetchObra(); // Faz o fetch apenas quando todos terminam
        return newCount;
      });
    }
  };

  const handleUploadAll = () => {
    pendingImages.forEach(img => uploadImage(img));
  };


  const handleImageDelete = async (imageId: number) => {
    // Optimistic delete
    if (obra) {
      const previousImages = obra.ObraImages;
      setObra({
        ...obra,
        ObraImages: obra.ObraImages.filter(img => img.id !== imageId)
      });

      try {
        await axios.delete(`${API_URL}/obraimage/${imageId}`);
      } catch (error) {
        // Rollback on error
        setObra({
          ...obra,
          ObraImages: previousImages
        });
        console.error('Error deleting image:', error);
        alert('Erro ao excluir imagem. Por favor, tente novamente.');
      }
    }
  };

  if (!obra) return <Typography>Carregando...</Typography>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {obra.name}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {obra.location}
      </Typography>
      <Typography variant="body1" paragraph>
        {obra.description}
      </Typography>

      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={() => setEditOpen(true)}
        sx={{ mr: 2 }}
      >
        Editar
      </Button>
      <Button
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={handleDelete}
      >
        Excluir
      </Button>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Imagens
      </Typography>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleImageSelect(e.target.files || new FileList())}
        style={{ display: 'none' }}
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
        >
          Selecionar Imagens
        </Button>
      </label>
      {pendingImages.length > 0 && (
        <Button
          variant="contained"
          onClick={handleUploadAll}
          sx={{ ml: 2, mb: 2 }}
        >
          Upload ({pendingImages.length})
        </Button>
      )}

      <Grid container spacing={2}>
        {pendingImages.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                }}
                image={image.previewUrl}
                alt="Preview"
              />
              <CardActions>
                <Typography variant="caption" color="textSecondary">
                  {image.status === 'pending' && 'Pendente'}
                  {image.status === 'uploading' && 'Enviando...'}
                  {image.status === 'error' && 'Erro no upload'}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => setPendingImages(prev =>
                    prev.filter(img => img.id !== image.id)
                  )}
                >
                  Remover
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {obra.ObraImages?.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={image.imageUrl}
                alt="Imagem da obra"
              />
              <CardActions>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleImageDelete(image.id)}
                >
                  Excluir
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Editar Obra</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Localização"
            fullWidth
            value={editData.location}
            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdate} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}