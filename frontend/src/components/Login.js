import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, Avatar, InputAdornment, IconButton
} from '@mui/material';
import {
  Login as LoginIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DeleteSweep as CleanIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For demo purposes, allow any non-empty credentials
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Try to authenticate with backend
      const data = await api.login(username, password);
      if (data && data.access) {
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', username);
        setToken(data.access);
        toast.success(`Welcome, ${username}!`);
        window.location.href = '/';
      } else {
        // Fallback: allow demo login for testing
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', username);
        setToken('demo-token');
        toast.success(`Welcome, ${username}! (Demo Mode)`);
        window.location.href = '/';
      }
    } catch (err) {
      // Fallback: allow any login for testing
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', username);
      setToken('demo-token');
      toast.success(`Welcome, ${username}! (Demo Mode)`);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F1F8E9', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper sx={{ p: 5, borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <Box textAlign="center" mb={4}>
              <Avatar sx={{ width: 80, height: 80, margin: '0 auto 20px', bgcolor: '#4CAF50' }}>
                <CleanIcon sx={{ fontSize: 50 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1B5E20' }}>
                CleanRoute-AI
              </Typography>
              <Typography variant="body2" color="textSecondary">
                AI-Powered Waste Management System
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LoginIcon color="action" /></InputAdornment>,
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LoginIcon color="action" /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <Box mt={3} textAlign="center">
              <Typography variant="caption" color="textSecondary">
                Demo: Any username/password works
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
