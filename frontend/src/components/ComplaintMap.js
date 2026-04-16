import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Chip, CircularProgress, Paper, Alert } from '@mui/material';
import { Refresh as RefreshIcon, MyLocation as LocationIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';

// FIX: Proper marker icon setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers using divIcon
const createCustomIcon = (color) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [16, 16],
    className: 'custom-marker'
  });
};

const ComplaintMap = ({ token }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([33.805787, 72.351681]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiToken = localStorage.getItem('token');
      const response = await fetch('https://cleanroute-ai.onrender.com/api/complaints/', {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const complaintsArray = Array.isArray(data) ? data : [];
      setComplaints(complaintsArray);
      toast.success(`Loaded ${complaintsArray.length} complaints`);
      
      // Center map on first complaint if exists
      if (complaintsArray.length > 0 && complaintsArray[0].latitude) {
        setMapCenter([complaintsArray[0].latitude, complaintsArray[0].longitude]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to load complaints. Please check your connection.');
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Box sx={{ minHeight: '100vh', pt: '80px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              🗺️ Complaint Map
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              {complaints.length} complaints mapped in Mehria Town, Attock
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchComplaints}
              disabled={loading}
              sx={{
                borderColor: '#0A66FF',
                color: '#0A66FF',
                borderRadius: '999px',
                '&:hover': { borderColor: '#00C6FF', backgroundColor: 'rgba(10,102,255,0.1)' }
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<LocationIcon />}
              onClick={() => setMapCenter([33.805787, 72.351681])}
              sx={{
                background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
                borderRadius: '999px',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              Reset View
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Map Section */}
        <Paper sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(10,102,255,0.2)',
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={500}>
              <CircularProgress sx={{ color: '#0A66FF' }} />
              <Typography sx={{ ml: 2, color: '#9CA3AF' }}>Loading map data...</Typography>
            </Box>
          ) : complaints.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={500} flexDirection="column">
              <Typography sx={{ color: '#9CA3AF', mb: 2 }}>No complaints found</Typography>
              <Button 
                variant="contained" 
                onClick={() => window.location.href = '/submit'}
                sx={{ borderRadius: '999px' }}
              >
                Submit First Complaint
              </Button>
            </Box>
          ) : (
            <MapContainer
              key={mapCenter.join(',')}
              center={mapCenter}
              zoom={14}
              style={{ height: '550px', width: '100%', zIndex: 1 }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {complaints.filter(c => c.latitude && c.longitude).map((complaint) => (
                <Marker
                  key={complaint.id}
                  position={[complaint.latitude, complaint.longitude]}
                  icon={createCustomIcon(getPriorityColor(complaint.priority))}
                >
                  <Popup>
                    <Box sx={{ minWidth: 200, p: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        Complaint #{complaint.id}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4a4a4a' }}>
                        Type: {complaint.complaint_type?.replace('_', ' ')}
                      </Typography>
                      <Box display="flex" gap={1} mt={1}>
                        <Chip 
                          label={complaint.status} 
                          size="small"
                          sx={{ bgcolor: getStatusColor(complaint.status), color: 'white', fontWeight: 600 }}
                        />
                        <Chip 
                          label={complaint.priority} 
                          size="small"
                          sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white', fontWeight: 600 }}
                        />
                      </Box>
                      {complaint.description && (
                        <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                          {complaint.description.substring(0, 100)}
                        </Typography>
                      )}
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </Paper>

        {/* Legend */}
        <Box display="flex" justifyContent="center" gap={4} mt={3} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#EF4444', boxShadow: '0 0 8px #EF4444' }} />
            <Typography variant="caption" sx={{ color: '#E5E7EB' }}>Urgent</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
            <Typography variant="caption" sx={{ color: '#E5E7EB' }}>High</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#0A66FF', boxShadow: '0 0 8px #0A66FF' }} />
            <Typography variant="caption" sx={{ color: '#E5E7EB' }}>Medium</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
            <Typography variant="caption" sx={{ color: '#E5E7EB' }}>Low</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ComplaintMap;
