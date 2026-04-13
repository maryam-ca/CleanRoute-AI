import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, IconButton, Tooltip, Avatar, CircularProgress
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RealTimeMap = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([33.7667, 72.3667]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      default: return '#4CAF50';
    }
  };

  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Real-Time Map</Typography>
          <Typography variant="caption">Live complaint locations</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
              <CircularProgress sx={{ color: '#2E7D32' }} />
            </Box>
          ) : (
            <MapContainer center={mapCenter} zoom={12} style={{ height: '500px', width: '100%', borderRadius: '8px' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {complaints.slice(0, 20).map((complaint) => (
                <Marker
                  key={complaint.id}
                  position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}
                >
                  <Popup>
                    <Box sx={{ p: 1, minWidth: 150 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Complaint #{complaint.id}</Typography>
                      <Typography variant="body2">Type: {complaint.complaint_type}</Typography>
                      <Typography variant="body2">Priority: {complaint.priority}</Typography>
                      <Typography variant="body2">Status: {complaint.status}</Typography>
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption">Total complaints: {complaints.length}</Typography>
            <Button variant="contained" onClick={() => window.location.href = '/'} sx={{ bgcolor: '#2E7D32' }}>
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RealTimeMap;

