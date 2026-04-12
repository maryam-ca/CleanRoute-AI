import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import Dashboard from './components/Dashboard';
import ComplaintForm from './components/ComplaintForm';
import RouteOptimizer from './components/RouteOptimizer';
import WastePrediction from './components/WastePrediction';
import RealTimeMap from './components/RealTimeMap';
import Reports from './components/Reports';
import AdminDashboard from './components/AdminDashboard';
import TesterDashboard from './components/TesterDashboard';
import Login from './components/Login';

const theme = createTheme({
  palette: {
    primary: { main: '#10B981' },
    secondary: { main: '#3B82F6' },
    background: { default: '#F3F4F6' }
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress sx={{ color: '#10B981' }} />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {!token ? (
          <Login setToken={(t) => { setToken(t); setUser(localStorage.getItem('user')); }} />
        ) : (
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
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;

