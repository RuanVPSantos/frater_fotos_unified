import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                        <Typography variant="h6">
                            Início
                        </Typography>
                    </Link>
                    <Link to="/slideshow" style={{ textDecoration: 'none', color: 'white' }}>
                        <Typography variant="h6">
                            Slideshow
                        </Typography>
                    </Link>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 