import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Grid, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AnomalyHotspotMap = ({ token, user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const apiToken = localStorage.getItem('token');
      const response = await fetch('https://cleanroute-ai.onrender.com/api/complaints/', {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      const data = await response.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: '#F97316', color: 'white', py: 2, px: 4 }}>
        <Container><Typography variant="h5">🔥 Anomaly Detection & Hotspot Map</Typography></Container>
      </Box>
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 2, borderRadius: 4 }}>
          <Typography variant="h6">Complaint Locations ({complaints.length})</Typography>
          <Box sx={{ height: 500, mt: 2 }}>
            {!loading && (
              <MapContainer center={[33.7667, 72.3667]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {complaints.map(c => (
                  <Marker key={c.id} position={[c.latitude, c.longitude]}>
                    <Popup>#{c.id}: {c.complaint_type}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AnomalyHotspotMap;
