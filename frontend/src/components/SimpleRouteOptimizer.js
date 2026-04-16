import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Map as MapIcon, Refresh as RefreshIcon, Route as RouteIcon } from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';

const SimpleRouteOptimizer = ({ token, user }) => {
  const [area, setArea] = useState('Islamabad');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [error, setError] = useState(null);

  const areas = ['Islamabad', 'Karachi', 'Lahore', 'Attock'];

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    
    const apiToken = localStorage.getItem('token');
    console.log('Token:', apiToken ? 'Present' : 'Missing');
    console.log('Area:', area);
    
    try {
      const response = await fetch('http://localhost:8000/api/optimize-routes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ area: area })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setRoutes(data);
        toast.success(`Routes optimized for ${area}!`);
      } else {
        setError(data.message || 'Failed to optimize routes');
        toast.error('Failed to optimize routes');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, mt: 2, py: 3, px: 4, color: 'white', border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)', backdropFilter: 'blur(12px)' }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Route Optimization</Typography>
          <Typography variant="caption">AI-Powered Collection Route Planning</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Route Settings
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Area</InputLabel>
                  <Select value={area} onChange={(e) => setArea(e.target.value)} label="Select Area">
                    {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOptimize}
                  disabled={loading}
                  sx={{ bgcolor: '#0A66FF', py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Optimize Routes'}
                </Button>
                
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Optimized Routes
                </Typography>
                
                {!routes ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <RouteIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                    <Typography color="text.secondary">
                      Click "Optimize Routes" to see results
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
                          <Typography variant="h4">{routes.total_complaints || 0}</Typography>
                          <Typography variant="caption">Total Complaints</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
                          <Typography variant="h4">{routes.total_clusters || 0}</Typography>
                          <Typography variant="caption">Optimal Routes</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E3F2FD' }}>
                          <Typography variant="h4">25%</Typography>
                          <Typography variant="caption">Time Saved</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    {routes.routes?.map((route, idx) => (
                      <Card key={idx} sx={{ mb: 2, bgcolor: '#F5F5F5' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {route.route_id}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {route.total_complaints} collection points
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Chip 
                                label={`${route.high_priority || 0} urgent`}
                                size="small"
                                sx={{ bgcolor: '#FFEBEE', color: '#D32F2F' }}
                              />
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {route.distance} • {route.estimated_time}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SimpleRouteOptimizer;




