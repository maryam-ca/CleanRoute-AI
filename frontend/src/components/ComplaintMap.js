import React, { useState, useEffect } from 'react';
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
      const response = await fetch('https://cleanroute-ai.onrender.com/api/optimize-routes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ area })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComplaints(data.complaints || []);
        toast.success(`Loaded ${data.complaints?.length || 0} complaints in ${area}`);
      } else {
        setError('No complaints found');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const getMapCenter = () => {
    if (area === 'Attock') return [33.7667, 72.3667];
    return [33.6844, 73.0479];
  };

  const getMarkerColor = (priority) => {
    if (priority === 'urgent') return 'red';
    if (priority === 'high') return 'orange';
    if (priority === 'medium') return 'blue';
    return 'green';
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
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Filters</Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Area</InputLabel>
                  <Select value={area} onChange={(e) => setArea(e.target.value)} label="Area">
                    {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={loadComplaints}
                  disabled={loading}
                  sx={{ bgcolor: '#F97316' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Load Complaints'}
                </Button>
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
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
                    <Typography>No complaints found in {area}</Typography>
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
                        <Marker
                          key={complaint.id}
                          position={[complaint.latitude, complaint.longitude]}
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
                        </Marker>
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
