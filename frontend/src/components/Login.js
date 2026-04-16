import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import {
  DeleteSweep as CleanIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://cleanroute-ai.onrender.com/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', username);
        setToken(data.access);
        toast.success(`Welcome back, ${username}!`);
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        setError('Invalid username or password');
        toast.error('Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { username: 'admin', password: 'admin123', role: 'Administrator', icon: <AdminIcon /> },
    { username: 'citizen', password: 'citizen123', role: 'Citizen', icon: <PersonIcon /> },
    { username: 'tester1', password: 'tester123', role: 'Tester', icon: <PersonIcon /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, #0F172A, #020617)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Toaster position="top-right" />
      
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(10,102,255,0.15), transparent)',
          borderRadius: '50%',
          top: '-200px',
          right: '-200px',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0,198,255,0.1), transparent)',
          borderRadius: '50%',
          bottom: '-150px',
          left: '-150px',
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: '32px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(10, 102, 255, 0.3)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Logo */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                  boxShadow: '0 0 30px rgba(0,198,255,0.4)',
                }}
              >
                <CleanIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FFFFFF, #00C6FF)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                CleanRoute-AI
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 1 }}>
                Smart Waste Management System
              </Typography>
            </Box>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: '#0A66FF' },
                    '&.Mui-focused fieldset': { borderColor: '#00C6FF' },
                  },
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00C6FF' },
                }}
              />
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOffIcon sx={{ color: '#9CA3AF' }} /> : <VisibilityIcon sx={{ color: '#9CA3AF' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: '#0A66FF' },
                    '&.Mui-focused fieldset': { borderColor: '#00C6FF' },
                  },
                  '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00C6FF' },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: '12px', bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
                  borderRadius: '999px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 0 20px rgba(0,198,255,0.3)',
                  '&:hover': {
                    boxShadow: '0 0 30px rgba(0,198,255,0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <Box mt={3}>
              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', textAlign: 'center', mb: 2 }}>
                Demo Credentials
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center">
                {demoUsers.map((user) => (
                  <Button
                    key={user.username}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setUsername(user.username);
                      setPassword(user.password);
                    }}
                    sx={{
                      borderColor: 'rgba(10,102,255,0.5)',
                      color: '#E5E7EB',
                      borderRadius: '999px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#00C6FF',
                        backgroundColor: 'rgba(10,102,255,0.1)',
                      },
                    }}
                  >
                    {user.username}
                  </Button>
                ))}
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
