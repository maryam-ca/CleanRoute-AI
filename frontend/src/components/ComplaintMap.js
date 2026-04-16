import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Paper, Chip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons - CRITICAL
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ComplaintMap = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login first');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:8000/api/complaints/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const complaintsArray = Array.isArray(data) ? data : (data.results || []);
        setComplaints(complaintsArray);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, []);

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#0A66FF';
      default: return '#22C55E';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#0A66FF';
      case 'completed': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  const validComplaints = complaints.filter(c => c.latitude && c.longitude);
  const mapCenter = validComplaints.length > 0 
    ? [validComplaints[0].latitude, validComplaints[0].longitude] 
    : [33.805787, 72.351681];

  if (loading) {
    return (
      <Box sx={{ pt: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#0A66FF' }} />
        <Typography sx={{ ml: 2, color: '#9CA3AF' }}>Loading map data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: '110px', p: 3 }}>
        <Container maxWidth="xl">
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Typography variant="h6" sx={{ color: '#EF4444' }}>Error loading map</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{error}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF' }}>🗺️ Complaint Map</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            {validComplaints.length} complaints mapped in Mehria Town, Attock
          </Typography>
        </Box>
        
        <Paper sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          border: '1px solid rgba(10,102,255,0.3)',
          height: '600px',
          width: '100%'
        }}>
          <MapContainer
            key={mapCenter.join(',')}
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            {validComplaints.map((complaint) => (
              <Marker 
                key={complaint.id} 
                position={[complaint.latitude, complaint.longitude]}
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
