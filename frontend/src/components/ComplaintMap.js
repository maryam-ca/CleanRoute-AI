import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';

const ComplaintMap = ({ token, user }) => {
  const [area, setArea] = useState('Attock');
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  const areas = ['Attock', 'Islamabad'];

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    
    const apiToken = localStorage.getItem('token');
    
    try {
      // Directly fetch complaints from API
      const response = await fetch('https://cleanroute-ai.onrender.com/api/complaints/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (Array.isArray(data)) {
        setComplaints(data);
        toast.success(`Loaded ${data.length} complaints`);
      } else if (data.results) {
        setComplaints(data.results);
        toast.success(`Loaded ${data.results.length} complaints`);
      } else {
        setComplaints([]);
        toast.info('No complaints found');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const getMarkerColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#3B82F6';
      default: return '#22C55E';
    }
  };

  const getMarkerRadius = (priority) => {
    switch(priority) {
      case 'urgent': return 12;
      case 'high': return 10;
      case 'medium': return 8;
      default: return 6;
    }
  };

  // Calculate center based on complaints
  const getMapCenter = () => {
    if (complaints.length > 0) {
      const avgLat = complaints.reduce((sum, c) => sum + c.latitude, 0) / complaints.length;
      const avgLng = complaints.reduce((sum, c) => sum + c.longitude, 0) / complaints.length;
      return [avgLat, avgLng];
    }
    return [33.805787, 72.351681]; // Mehria Town center
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#F97316', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>🗺️ Complaint Locations Map</Typography>
          <Typography variant="caption">Real complaint locations submitted by citizens</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Controls</Typography>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={loadComplaints}
                  disabled={loading}
                  sx={{ bgcolor: '#F97316', mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Refresh Complaints'}
                </Button>
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              </CardContent>
            </Card>
            
            <Card sx={{ borderRadius: 4, mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Legend</Typography>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#EF4444' }} />
                  <Typography variant="caption">Urgent</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#F97316' }} />
                  <Typography variant="caption">High</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                  <Typography variant="caption">Medium</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22C55E' }} />
                  <Typography variant="caption">Low</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={9}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  📍 Complaint Locations ({complaints.length})
                </Typography>
                
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <CircularProgress />
                  </Box>
                ) : complaints.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <Typography>No complaints found. Add a complaint to see it on the map!</Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: 550, width: '100%', position: 'relative', zIndex: 1 }}>
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
                        <CircleMarker
                          key={complaint.id}
                          center={[complaint.latitude, complaint.longitude]}
                          radius={getMarkerRadius(complaint.priority)}
                          fillColor={getMarkerColor(complaint.priority)}
                          color={getMarkerColor(complaint.priority)}
                          weight={2}
                          opacity={1}
                          fillOpacity={0.8}
                        >
                          <Popup>
                            <Box sx={{ minWidth: 200 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Complaint #{complaint.id}
                              </Typography>
                              <Typography variant="body2">Type: {complaint.complaint_type}</Typography>
                              <Typography variant="body2">Priority: {complaint.priority}</Typography>
                              <Typography variant="body2">Status: {complaint.status}</Typography>
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                📍 {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                              </Typography>
                            </Box>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                  📍 {complaints.length} complaint locations • 🔴 Urgent • 🟠 High • 🔵 Medium • 🟢 Low
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ComplaintMap;
