import React, { useState } from 'react';
import {
  Box, Container, Paper, TextField, Button, Typography,
  Alert, IconButton, InputAdornment, Divider, Chip,
  Card, CardContent, Grid, useMediaQuery, useTheme
} from '@mui/material';
import {
  Visibility, VisibilityOff, AdminPanelSettings,
  Person, Build, CleaningServices
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password');
      toast.error('Please enter username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await api.login(username, password);
      if (data.access) {
        toast.success(`Welcome ${username}! Redirecting...`);
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', username);
        setToken(data.access);
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        setError('Invalid username or password');
        toast.error('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { 
      role: 'Admin', 
      username: 'admin', 
      password: 'admin123', 
      icon: <AdminPanelSettings />, 
      color: '#1B5E20',
      bgColor: '#E8F5E9'
    },
    { 
      role: 'Citizen', 
      username: 'citizen', 
      password: 'citizen123', 
      icon: <Person />, 
      color: '#2E7D32',
      bgColor: '#F1F8E9'
    },
    { 
      role: 'Tester', 
      username: 'tester1', 
      password: 'tester123', 
      icon: <Build />, 
      color: '#00897B',
      bgColor: '#E0F2F1'
    },
  ];

  const fillCredentials = (user, pass, role) => {
    setUsername(user);
    setPassword(pass);
    toast.success(`${role} credentials loaded! Click LOGIN.`);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
      p: { xs: 2, sm: 3, md: 4 }
    }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{
            borderRadius: { xs: 4, sm: 5 },
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
              color: 'white',
              p: { xs: 3, sm: 4 },
              textAlign: 'center'
            }}>
              <CleaningServices sx={{ fontSize: { xs: 40, sm: 50 }, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                CleanRoute-AI
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mt: 1 }}>
                AI-Powered Waste Management System
              </Typography>
            </Box>

            {/* Login Form */}
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#2E7D32' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AdminPanelSettings sx={{ color: '#2E7D32' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1B5E20 0%, #0D3B0F 100%)',
                    }
                  }}
                >
                  {loading ? 'Logging in...' : 'LOGIN'}
                </Button>
              </form>

              <Divider sx={{ my: 3 }}>
                <Chip label="Quick Login" size="small" />
              </Divider>

              <Grid container spacing={2}>
                {demoCredentials.map((cred, idx) => (
                  <Grid item xs={12} sm={4} key={idx}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => fillCredentials(cred.username, cred.password, cred.role)}
                        sx={{
                          py: 1.5,
                          borderColor: cred.color,
                          color: cred.color,
                          bgcolor: cred.bgColor,
                          borderRadius: 3,
                          '&:hover': {
                            borderColor: cred.color,
                            bgcolor: `${cred.color}20`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          {cred.icon}
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {cred.role}
                          </Typography>
                        </Box>
                      </Button>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
                Click any role above to auto-fill credentials
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;

