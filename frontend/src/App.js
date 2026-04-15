import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { ecoTechTheme } from './ecoTechTheme';
import { ColorModeProvider, useColorMode } from './ThemeContext';
import Navigation from './components/Navigation';
import Dashboard from './components/ModernDashboard';
import ComplaintForm from './components/ComplaintForm';
import RouteOptimizer from './components/SimpleRouteOptimizer';
import WastePrediction from './components/WastePrediction';
import RealTimeMap from './components/RealTimeMap';
import Reports from './components/Reports';
import AdminDashboard from './components/AdminDashboard';
import TesterDashboard from './components/TesterDashboard';
import Login from './components/Login';

const AppContent = () => {
  const { mode } = useColorMode();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#2E7D32' }} />
      </Box>
    );
  }

  if (!token) {
    return <Login setToken={(t) => { setToken(t); setUser(localStorage.getItem('user')); }} />;
  }

  return (
    <ThemeProvider theme={mode === 'light' ? ecoTechTheme.light : ecoTechTheme.dark}>
      <CssBaseline />
      <Router>
        <Navigation user={user} setToken={setToken} />
        <Routes>
          <Route path="/" element={<Dashboard token={token} user={user} setToken={setToken} />} />
          <Route path="/submit" element={<ComplaintForm token={token} user={user} setToken={setToken} />} />
          <Route path="/routes" element={<RouteOptimizer token={token} user={user} setToken={setToken} />} />
          <Route path="/predict" element={<WastePrediction token={token} user={user} setToken={setToken} />} />
          <Route path="/map" element={<RealTimeMap token={token} user={user} setToken={setToken} />} />
          <Route path="/reports" element={<Reports token={token} user={user} setToken={setToken} />} />
          <Route path="/admin" element={<AdminDashboard token={token} user={user} setToken={setToken} />} />
          <Route path="/tester" element={<TesterDashboard token={token} user={user} setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ColorModeProvider>
      <AppContent />
    </ColorModeProvider>
  );
}

export default App;





