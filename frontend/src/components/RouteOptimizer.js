import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Paper, Grid, Chip,
  CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
<<<<<<< HEAD
import { Optimize as OptimizeIcon, Route as RouteIcon } from '@mui/icons-material';
=======
import api from '../services/api';
>>>>>>> final-updates

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

<<<<<<< HEAD
// Route colors
const routeColors = ['#0A66FF', '#00C6FF', '#8B5CF6', '#EC4899', '#F59E0B'];
=======
const getMarkerIcon = (priority) => {
  const color = priority === 'urgent' ? 'blue' : priority === 'high' ? 'blue' : priority === 'medium' ? 'blue' : 'violet';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};
>>>>>>> final-updates

const RouteOptimizer = ({ token }) => {
  const [area, setArea] = useState('Attock');
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const optimizeRoutes = async () => {
    setLoading(true);
<<<<<<< HEAD
    setError('');
    try {
      const apiToken = localStorage.getItem('token');
      const response = await fetch('https://cleanroute-ai.onrender.com/api/optimize-routes/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ area })
      });
      const data = await response.json();
      if (data.total_clusters) {
=======
    setError(null);
    
    try {
      const data = await api.optimizeRoutes(area);
      if (data.success) {
>>>>>>> final-updates
        setRoutes(data);
        toast.success(`Optimized into ${data.total_clusters} routes`);
      } else {
        setError(data.error || 'Optimization failed');
      }
    } catch (error) {
      console.error('Error optimizing routes:', error);
      setError('Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <Box sx={{ minHeight: '100vh', pt: '80px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Route Optimizer
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              AI-powered waste collection route optimization
            </Typography>
          </Box>
          
          <Box display="flex" gap={2} alignItems="center">
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#9CA3AF' }}>Area</InputLabel>
              <Select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                label="Area"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0A66FF' },
                }}
              >
                <MenuItem value="Attock">Attock City</MenuItem>
                <MenuItem value="Mehria Town">Mehria Town</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<OptimizeIcon />}
              onClick={optimizeRoutes}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
                borderRadius: '999px',
                px: 4,
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Optimize Routes'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            {error}
          </Alert>
        )}
=======
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', pt: '110px' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, color: 'white', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(79, 140, 255, 0.16) 0%, rgba(15, 23, 42, 0.18) 100%)' }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Route Optimization</Typography>
          <Typography variant="caption">AI-Powered Collection Route Planning</Typography>
        </Container>
      </Box>
>>>>>>> final-updates

        <Grid container spacing={3}>
<<<<<<< HEAD
          {/* Map */}
          <Grid item xs={12} md={8}>
            <Paper sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(10,102,255,0.2)',
            }}>
              <Box sx={{ height: 550, width: '100%' }}>
                <MapContainer
                  center={[33.805787, 72.351681]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
=======
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Route Settings</Typography>
                
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
                  sx={{ py: 1.5 }}
>>>>>>> final-updates
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {routes && routes.routes && routes.routes.map((route, idx) => (
                    route.complaints.map((complaint, cidx) => (
                      <Marker key={cidx} position={[complaint.latitude, complaint.longitude]}>
                        <Popup>
                          <Typography variant="body2">Route: {route.route_id}</Typography>
                          <Typography variant="caption">Priority: {complaint.priority}</Typography>
                        </Popup>
                      </Marker>
                    ))
                  ))}
                </MapContainer>
              </Box>
            </Paper>
          </Grid>

<<<<<<< HEAD
          {/* Routes List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              borderRadius: '20px',
              background: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(10,102,255,0.2)',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 2 }}>
                Optimized Routes
              </Typography>
              
              {!routes ? (
                <Box textAlign="center" py={4}>
                  <RouteIcon sx={{ fontSize: 48, color: '#0A66FF', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    Click "Optimize Routes" to generate optimal collection routes
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" sx={{ color: '#0A66FF' }}>
                      Total Routes: {routes.total_clusters}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#22C55E' }}>
                      Time Saved: {routes.time_saved}%
                    </Typography>
                  </Box>
                  
                  {routes.routes.map((route, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderLeft: `4px solid ${routeColors[idx % routeColors.length]}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {route.route_id}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {route.total_complaints} complaints • {route.high_priority} urgent
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip label={route.distance} size="small" sx={{ bgcolor: 'rgba(10,102,255,0.2)', color: '#0A66FF' }} />
                        <Chip label={route.estimated_time} size="small" sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#22C55E' }} />
                      </Box>
                    </Box>
                  ))}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
=======
          {/* Stats */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2.5, textAlign: 'center' }}>
                  <Typography variant="h4">{routes?.total_complaints || 0}</Typography>
                  <Typography variant="caption">Total Complaints</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2.5, textAlign: 'center' }}>
                  <Typography variant="h4">{routes?.total_clusters || 0}</Typography>
                  <Typography variant="caption">Optimal Routes</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2.5, textAlign: 'center' }}>
                  <Typography variant="h4">25%</Typography>
                  <Typography variant="caption">Time Saved</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Routes List */}
        {routes?.routes && routes.routes.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📋 Optimized Routes</Typography>
                  <Grid container spacing={2}>
                    {routes.routes.map((route, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{route.route_id}</Typography>
                            <Typography variant="body2">{route.total_complaints} collection points</Typography>
                            {route.high_priority > 0 && (
                              <Chip label={`${route.high_priority} urgent`} size="small" sx={{ mt: 1, bgcolor: 'rgba(96, 165, 250, 0.14)', color: '#dce8ff' }} />
                            )}
                            <Typography variant="body2" sx={{ mt: 1 }}>{route.distance} • {route.estimated_time}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* MAP SECTION - Shows actual complaint locations */}
        {complaints.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    🗺️ Complaint Locations ({complaints.length} complaints)
                  </Typography>
                  <Box sx={{ height: 500, width: '100%', position: 'relative' }}>
                    <MapContainer
                      center={getMapCenter()}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {complaints.map((complaint) => (
                        <Marker
                          key={complaint.id}
                          position={[complaint.latitude, complaint.longitude]}
                          icon={getMarkerIcon(complaint.priority)}
                        >
                          <Popup>
                            <Box sx={{ p: 1, minWidth: 250 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7DB0FF' }}>
                                Complaint #{complaint.id}
                              </Typography>
                              <Typography variant="body2">📍 Type: {complaint.complaint_type}</Typography>
                              <Typography variant="body2">⚠️ Priority: {complaint.priority.toUpperCase()}</Typography>
                              <Typography variant="body2">📌 Status: {complaint.status}</Typography>
                              <Typography variant="body2">🗑️ Fill Level: {complaint.fill_level_before || 'N/A'}%</Typography>
                              <Typography variant="caption" display="block" sx={{ mt: 1, color: '#666' }}>
                                📍 {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                              </Typography>
                              {complaint.address && (
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  📍 {complaint.address}
                                </Typography>
                              )}
                            </Box>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                    📍 Showing {complaints.length} complaint locations in {area}. Click markers for details.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
>>>>>>> final-updates
      </Container>
    </Box>
  );
};

export default RouteOptimizer;
