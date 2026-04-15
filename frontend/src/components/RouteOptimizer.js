import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker colors based on priority
const getMarkerIcon = (priority) => {
  const color = priority === 'urgent' ? 'red' : priority === 'high' ? 'orange' : priority === 'medium' ? 'blue' : 'green';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const RouteOptimizer = ({ token, user }) => {
  const [area, setArea] = useState('Attock');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  const areas = ['Attock', 'Islamabad'];

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);
    
    const apiToken = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://cleanroute-ai.onrender.com/api/optimize-routes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ area })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setRoutes(data);
        setComplaints(data.complaints || []);
        toast.success(`Found ${data.total_complaints} complaints in ${area}!`);
      } else {
        setError(data.message || 'No complaints found in this area');
        toast.error('No complaints found');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getMapCenter = () => {
    if (area === 'Attock') return [33.7667, 72.3667];
    return [33.6844, 73.0479];
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#F97316', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Route Optimization</Typography>
          <Typography variant="caption">AI-Powered Collection Route Planning</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Controls */}
        <Grid container spacing={3}>
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
                  sx={{ bgcolor: '#F97316', py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Optimize Routes'}
                </Button>
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              </CardContent>
            </Card>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E9' }}>
                  <Typography variant="h4">{routes?.total_complaints || 0}</Typography>
                  <Typography variant="caption">Total Complaints</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
                  <Typography variant="h4">{routes?.total_clusters || 0}</Typography>
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
                        <Card variant="outlined" sx={{ bgcolor: '#F5F5F5' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{route.route_id}</Typography>
                            <Typography variant="body2">{route.total_complaints} collection points</Typography>
                            {route.high_priority > 0 && (
                              <Chip label={`${route.high_priority} urgent`} size="small" sx={{ mt: 1, bgcolor: '#FFEBEE', color: '#D32F2F' }} />
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
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F97316' }}>
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
      </Container>
    </Box>
  );
};

export default RouteOptimizer;
