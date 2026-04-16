import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Paper, Chip } from '@mui/material';
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

// Custom markers by priority
const getMarkerIcon = (priority) => {
  const colors = {
    urgent: '#EF4444',
    high: '#F59E0B',
    medium: '#0A66FF',
    low: '#22C55E'
  };
  const color = colors[priority] || '#0A66FF';
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color};"></div>`,
    iconSize: [18, 18],
    className: 'custom-marker'
  });
};

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

  if (loading) return (
    <Box sx={{ pt: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress sx={{ color: '#0A66FF' }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Complaint Map</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{complaints.length} complaints mapped in Mehria Town, Attock</Typography>
        </Box>
        
        <Paper sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          border: '1px solid rgba(10,102,255,0.3)',
          height: '600px'
        }}>
          <MapContainer 
            center={[33.805787, 72.351681]} 
            zoom={14} 
            style={{ height: '100%', width: '100%', minHeight: '550px' }}
            scrollWheelZoom={true}
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            {complaints.filter(c => c.latitude && c.longitude).map((complaint) => (
              <Marker 
                key={complaint.id} 
                position={[complaint.latitude, complaint.longitude]}
                icon={getMarkerIcon(complaint.priority)}
              >
                <Popup>
                  <Box sx={{ minWidth: 180 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      #{complaint.id} - {complaint.complaint_type?.replace('_', ' ')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      Priority: {complaint.priority}<br />
                      Status: {complaint.status}<br />
                      Fill Level: {complaint.fill_level_before || 0}%
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Paper>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3, flexWrap: 'wrap' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#EF4444', boxShadow: '0 0 5px #EF4444' }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Urgent</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F59E0B', boxShadow: '0 0 5px #F59E0B' }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>High</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#0A66FF', boxShadow: '0 0 5px #0A66FF' }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Medium</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22C55E', boxShadow: '0 0 5px #22C55E' }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Low</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ComplaintMap;
