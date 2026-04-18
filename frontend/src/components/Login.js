import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button,
  Alert, CircularProgress, InputAdornment, IconButton, Checkbox, FormControlLabel
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
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://cleanroute-ai.onrender.com/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('savedUsername', username);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('savedPassword');
        }
        
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', username);
        setToken(data.access);
        toast.success(`Welcome back, ${username}!`);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        setError(data.detail || 'Invalid username or password');
        toast.error('Login failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
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

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#F5FBFF',
      borderRadius: '18px',
      background: 'rgba(255,255,255,0.04)',
      '& fieldset': { borderColor: 'rgba(189,216,235,0.22)' },
      '&:hover fieldset': { borderColor: '#74DDFF' },
      '&.Mui-focused fieldset': { borderColor: '#D8FF72' },
    },
    '& .MuiInputLabel-root': { color: '#BDD8EB' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#D8FF72' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 20% 16%, rgba(54,196,255,0.24), transparent 22%),
          radial-gradient(circle at 82% 18%, rgba(83,215,105,0.2), transparent 20%),
          radial-gradient(circle at 48% 44%, rgba(255,244,173,0.18), transparent 16%),
          linear-gradient(180deg, #0b3775 0%, #11729a 38%, #3f8a53 72%, #08182e 100%)
        `,
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
          background: 'radial-gradient(circle, rgba(54,196,255,0.16), transparent)',
          borderRadius: '50%',
          top: '-200px',
          right: '-200px',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(83,215,105,0.18), transparent)',
          borderRadius: '50%',
          bottom: '-150px',
          left: '-150px',
          animation: 'pulse 4s ease-in-out infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          bottom: '8%',
          height: '8px',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, rgba(216,255,114,0.15), rgba(216,255,114,0.95), rgba(83,215,105,0.88), rgba(54,196,255,0.95), rgba(255,255,255,0.18))',
          filter: 'blur(0.4px)',
          opacity: 0.85,
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
              background: 'linear-gradient(180deg, rgba(11, 31, 61, 0.88) 0%, rgba(7, 22, 43, 0.94) 100%)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(139, 225, 255, 0.24)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.34)',
            }}
          >
            {/* Logo */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(135deg, rgba(216,255,114,0.2), rgba(54,196,255,0.22))',
                  border: '1px solid rgba(216,255,114,0.24)',
                  borderRadius: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                  boxShadow: '0 0 40px rgba(54,196,255,0.28)'
                }}
              >
                <Box
                component="img"
                src="/logo.svg"
                alt="CleanRoute-AI Logo"
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: '20px'
                }}
              />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #FFFFFF 18%, #D8FF72 55%, #53D769 72%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                CleanRouteAI
              </Typography>
              <Typography variant="body2" sx={{ color: '#DDEDF8', mt: 1, fontWeight: 600 }}>
                Smart Route Optimization with AI
              </Typography>
              <Typography variant="body2" sx={{ color: '#BDD8EB', mt: 1.25, maxWidth: 420, mx: 'auto' }}>
                Presentation-ready control center for smart waste operations, live routing, and field coordination.
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
                autoFocus
                sx={inputStyles}
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
                sx={inputStyles}
              />

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ color: '#74DDFF' }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ color: '#BDD8EB' }}>Remember me</Typography>}
                />
                <Button variant="text" size="small" sx={{ color: '#74DDFF' }}>
                  Forgot password?
                </Button>
              </Box>

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
                  background: 'linear-gradient(135deg, #D8FF72 0%, #53D769 45%, #36C4FF 100%)',
                  color: '#041328',
                  borderRadius: '999px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  boxShadow: '0 0 20px rgba(54,196,255,0.3)',
                  '&:hover': {
                    boxShadow: '0 0 30px rgba(54,196,255,0.4)',
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
                Quick Demo Access
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
                      borderColor: 'rgba(116,221,255,0.45)',
                      color: '#E5E7EB',
                      borderRadius: '999px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#D8FF72',
                        backgroundColor: 'rgba(83,215,105,0.1)',
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

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}
      </style>
    </Box>
  );
};

export default Login;





