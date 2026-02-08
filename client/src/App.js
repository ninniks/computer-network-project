import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { it } from 'date-fns/locale';
import { ToastProvider } from './contexts/ToastContext';
import theme from './theme';
import { initializeAuth } from './store/authSlice';
import Navbar from './components/Navbar';
import LoginCard from './components/LoginCard';
import FullPageCalendar from './components/FullPageCalendar';
import AuthCallback from './components/AuthCallback';

function AppContent() {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh' }}>
        {auth.isAuthenticated && <Navbar />}
        <Routes>
          <Route
            path='/'
            element={auth.isAuthenticated ? <FullPageCalendar /> : <LoginCard />}
          />
          <Route path='/auth/callback' element={<AuthCallback />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
