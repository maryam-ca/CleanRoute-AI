import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkBlueTheme } from './darkBlueTheme';
import Navigation from './components/Navigation';
import Login from './components/Login';
import ModernDashboard from './components/ModernDashboard';
import ComplaintForm from './components/ComplaintForm';
import RouteOptimizer from './components/RouteOptimizer';
import ComplaintMap from './components/ComplaintMap';
import WastePrediction from './components/WastePrediction';
import Reports from './components/Reports';
import AdminDashboard from './components/AdminDashboard';
import TesterDashboard from './components/TesterDashboard';
import RealTimeMap from './components/RealTimeMap';
import AnomalyMap from './components/AnomalyMap';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const user = localStorage.getItem('user');

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <ThemeProvider theme={darkBlueTheme.light}>
      <CssBaseline />
      <Router>
        <Navigation user={user} setToken={setToken} />
        <Routes>
          <Route path="/" element={<ModernDashboard token={token} user={user} setToken={setToken} />} />
          <Route path="/submit" element={<ComplaintForm token={token} user={user} setToken={setToken} />} />
          <Route path="/routes" element={<RouteOptimizer token={token} />} />
          <Route path="/complaint-map" element={<ComplaintMap token={token} />} />
          <Route path="/predict" element={<WastePrediction token={token} />} />
          <Route path="/reports" element={<Reports token={token} />} />
          <Route path="/admin" element={<AdminDashboard token={token} user={user} setToken={setToken} />} />
          <Route path="/tester" element={<TesterDashboard token={token} user={user} setToken={setToken} />} />
          <Route path="/real-time-map" element={<RealTimeMap token={token} user={user} setToken={setToken} />} />
          <Route path="/anomaly-map" element={<AnomalyMap token={token} user={user} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

