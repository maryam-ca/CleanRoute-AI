import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, IconButton, Tooltip, Avatar, Badge
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LiveRealTimeMap = ({ token, user }) => {
  const [complaints, setComplaints] = useState([]);
  const [vehicleLocation, setVehicleLocation] = useState({ lat: 33.6844, lng: 73.0479 });
  const [isConnected, setIsConnected] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [ws, setWs] = useState(null);

  const API_BASE_URL = 'https://cleanroute-ai.onrender.com/api/';

  useEffect(() => {
    fetchComplaints();
    
    // Connect WebSocket for real-time updates
    const socket = new WebSocket(`wss://cleanroute-ai.onrender.com/ws/complaints/`);
    
    socket.onopen = () => {
      setIsConnected(true);
      toast.success('Connected to real-time feed');
    };
    
    socket.onclose = () => {
      setIsConnected(false);
      toast.error('Disconnected from real-time feed');
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_complaint') {
        toast.info(`New complaint reported!`);
        fetchComplaints();
      } else if (data.type === 'status_update') {
        toast.info(`Complaint #${data.complaint_id} status updated`);
        fetchComplaints();
      }
    };
    
    setWs(socket);
    
    return () => {
      if (socket) socket.close();
    };
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}complaints/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const complaintsArray = Array.isArray(data) ? data : (data.results || data.data || []);
      setComplaints(complaintsArray);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  // Simulate vehicle movement for demo
  useEffect(() => {
    if (tracking) {
      const interval = setInterval(() => {
        setVehicleLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.01,
          lng: prev.lng + (Math.random() - 0.5) * 0.01
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [tracking]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      default: return '#4CAF50';
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <LocationIcon sx={{ fontSize: 32, color: '#81C784' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Live Real-Time Map</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Track collection vehicles in real-time</Typography>
              </Box>
              <Chip 
                icon={isConnected ? <WifiIcon /> : <WifiOffIcon />}
                label={isConnected ? 'Live' : 'Offline'} 
                size="small" 
                sx={{ bgcolor: isConnected ? '#4CAF50' : '#F44336', color: 'white' }}
              />
            </Box>
            <Box display="flex" gap={1}>
              <Button 
                variant={tracking ? "contained" : "outlined"}
                onClick={() => setTracking(!tracking)}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                {tracking ? 'Stop Tracking' : 'Start Vehicle Tracking'}
              </Button>
              <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                Back to Dashboard
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ height: 550, position: 'relative' }}>
                <MapContainer center={[33.6844, 73.0479]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  
                  {/* Vehicle Marker */}
                  {tracking && (
                    <Marker position={[vehicleLocation.lat, vehicleLocation.lng]} icon={vehicleIcon}>
                      <Popup>Collection Vehicle #001<br/>Speed: 35 km/h<br/>Status: Active</Popup>
                    </Marker>
                  )}
                  
                  {/* Vehicle Coverage Circle */}
                  {tracking && (
                    <Circle center={[vehicleLocation.lat, vehicleLocation.lng]} radius={300} pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.1 }} />
                  )}
                  
                  {/* Complaint Markers */}
                  {complaints.map((complaint) => (
                    <Marker key={complaint.id} position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}>
                      <Popup>
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography variant="subtitle2">Complaint #{complaint.id}</Typography>
                          <Typography variant="body2">Type: {complaint.complaint_type}</Typography>
                          <Typography variant="body2">Priority: {complaint.priority}</Typography>
                          <Typography variant="body2">Status: {complaint.status}</Typography>
                          {tracking && <Typography variant="body2">Distance: {calculateDistance(vehicleLocation.lat, vehicleLocation.lng, complaint.latitude, complaint.longitude)} km</Typography>}
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20' }}>Live Statistics</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" color="#4CAF50">{complaints.length}</Typography><Typography variant="caption">Active Complaints</Typography></Box></Grid>
                      <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" color="#F57C00">{complaints.filter(c => c.priority === 'high').length}</Typography><Typography variant="caption">High Priority</Typography></Box></Grid>
                      <Grid item xs={4}><Box textAlign="center"><Typography variant="h6" color="#FBC02D">{complaints.filter(c => c.status === 'pending').length}</Typography><Typography variant="caption">Pending</Typography></Box></Grid>
                      <Grid item xs={4}><Box textAlign="center"><Typography variant="h6" color="#2196F3">{complaints.filter(c => c.status === 'assigned').length}</Typography><Typography variant="caption">Assigned</Typography></Box></Grid>
                      <Grid item xs={4}><Box textAlign="center"><Typography variant="h6" color="#4CAF50">{complaints.filter(c => c.status === 'completed').length}</Typography><Typography variant="caption">Completed</Typography></Box></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {tracking && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20' }}>Vehicle Status</Typography>
                      <Box mt={2}>
                        <Typography variant="body2">Latitude: {vehicleLocation.lat.toFixed(6)}</Typography>
                        <Typography variant="body2">Longitude: {vehicleLocation.lng.toFixed(6)}</Typography>
                        <Typography variant="body2">Speed: 35 km/h</Typography>
                        <Typography variant="body2">Next Stop: {complaints.length} complaints pending</Typography>
                        <Typography variant="body2">Coverage: 78% of area</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LiveRealTimeMap;


