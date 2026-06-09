import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import Navigation from './Navigation';

export default function Layout() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gestão de Obras
                    </Typography>
                    <Navigation />
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
}