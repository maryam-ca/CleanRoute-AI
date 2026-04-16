import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ComplaintMap = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://cleanroute-ai.onrender.com/api/complaints/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setComplaints(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ pt: '80px', p: 3 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>🗺️ Complaint Map</Typography>
        <MapContainer center={[33.805787, 72.351681]} zoom={14} style={{ height: '550px', width: '100%', borderRadius: '20px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {complaints.map(c => c.latitude && c.longitude && (
            <Marker key={c.id} position={[c.latitude, c.longitude]}>
              <Popup>#{c.id} - {c.complaint_type}<br />Priority: {c.priority}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </Container>
    </Box>
  );
};

export default ComplaintMap;
