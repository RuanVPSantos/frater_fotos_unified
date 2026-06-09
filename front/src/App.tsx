import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import ObrasList from './pages/ObrasList';
import ObraDetails from './pages/ObraDetails';
import Slideshow from './pages/Slideshow';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ddd',
    },
    secondary: {
      main: '#2f2f2f',
    },
    error: {
      main: '#af0000',
    }
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/slideshow' element={<Slideshow />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<ObrasList />} />
            <Route path="obra/:id" element={<ObraDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;