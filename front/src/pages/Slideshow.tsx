import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface RandomImage {
  imageUrl: string;
  obra: {
    name: string;
    location: string;
    description?: string;
  };
}

export default function Slideshow() {
  const [currentImage, setCurrentImage] = useState<RandomImage | null>(null);
  const [nextImage, setNextImage] = useState<RandomImage | null>(null);
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRandomImage = async () => {
    try {
      const response = await axios.get(`${API_URL}/obraimage/random`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching random image:', error);
      return null;
    }
  };

  const preloadImage = (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const updateImages = async () => {
    if (!nextImage) return;

    setKey(prev => prev + 1);
    setCurrentImage(nextImage);
    setIsLoading(true);

    const newNextImage = await fetchRandomImage();
    if (newNextImage) {
      await preloadImage(newNextImage.imageUrl);
      setNextImage(newNextImage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeSlideshow = async () => {
      const firstImage = await fetchRandomImage();
      if (firstImage) {
        await preloadImage(firstImage.imageUrl);
        setCurrentImage(firstImage);

        const secondImage = await fetchRandomImage();
        if (secondImage) {
          await preloadImage(secondImage.imageUrl);
          setNextImage(secondImage);
          setIsLoading(false);
        }
      }
    };

    initializeSlideshow();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(updateImages, 5000);
    return () => clearInterval(interval);
  }, [isLoading, nextImage]);

  if (!currentImage) return <Typography>Carregando...</Typography>;

  return (
    <div className="slideshow-container">
      {/* Áudio oculto que toca automaticamente */}

      <AnimatePresence mode="wait">
        <motion.img
          key={key}
          src={currentImage.imageUrl}
          alt={currentImage.obra.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          onClick={() => {
            window.location.href = '/';
          }}
        />
      </AnimatePresence>
      <motion.div
        key={`info-${key}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '4em',
          right: '4em',
          minWidth: '15em',
          minHeight: '10em',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '16px',
          textAlign: 'center',
          borderRadius: '1em',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}
      >
        <Typography variant="h6">{currentImage.obra.name}</Typography>
        <Typography variant="subtitle1">{currentImage.obra.location}</Typography>
        <Typography variant="body2">{currentImage.obra.description}</Typography>
      </motion.div>
    </div>
  );
}
