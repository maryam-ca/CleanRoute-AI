import React, { useState } from 'react';
import { Box, Container, Paper, TextField, Button, Typography, Alert, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import { CleaningServices } from '@mui/icons-material';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Logging in with:', username, password);
    
    try {
      const response = await fetch('https://cleanroute-ai.onrender.com/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.access) {
        localStorage.setItem('token', data.access);
        localStorage.setItem('user', username);
        setToken(data.access);
        window.location.href = '/';
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)', p: 2 }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#795548', color: 'white', p: 3, textAlign: 'center' }}>
            <CleaningServices sx={{ fontSize: 48 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>CleanRoute-AI</Typography>
            <Typography variant="subtitle2">AI-Powered Waste Management System</Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <form onSubmit={handleSubmit}>
              <TextField 
                fullWidth 
                label="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                margin="normal" 
                required 
              />
              <TextField 
                fullWidth 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                margin="normal" 
                required 
              />
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                disabled={loading} 
                sx={{ mt: 3, py: 1.5, bgcolor: '#795548', '&:hover': { bgcolor: '#EA580C' } }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
              </Button>
            </form>
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Button fullWidth size="small" variant="outlined" onClick={() => { setUsername('admin'); setPassword('admin123'); }}>
                  Admin
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button fullWidth size="small" variant="outlined" onClick={() => { setUsername('citizen'); setPassword('citizen123'); }}>
                  Citizen
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button fullWidth size="small" variant="outlined" onClick={() => { setUsername('tester1'); setPassword('tester123'); }}>
                  Tester
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;

