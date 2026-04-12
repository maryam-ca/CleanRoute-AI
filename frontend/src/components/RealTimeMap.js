import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, IconButton, Tooltip, Avatar
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Refresh as RefreshIcon,
  Room as RoomIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useWebSocket from 'react-use-websocket';
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
  popupAnchor: [1, -34],
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const RealTimeMap = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [vehicleLocation, setVehicleLocation] = useState({ lat: 33.6844, lng: 73.0479 });
  const [isConnected, setIsConnected] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [mapCenter, setMapCenter] = useState([33.6844, 73.0479]);
  const mapRef = useRef();
  
  const API_BASE_URL = 'http://127.0.0.1:8000/api/';
  
  // WebSocket connection for real-time updates
  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:8001/ws/complaints/', {
    onOpen: () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      toast.success('Real-time tracking connected');
    },
    onClose: () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      toast.error('Real-time tracking disconnected');
    },
    shouldReconnect: (closeEvent) => true,
  });
  
  // WebSocket for location tracking
  const { sendMessage: sendLocation, lastMessage: lastLocation } = useWebSocket(
    tracking ? `ws://localhost:8001/ws/location/${user}/` : null,
    {
      onOpen: () => console.log('Location tracking started'),
      onClose: () => console.log('Location tracking stopped'),
    }
  );
  
  // Fetch initial complaints
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
  
  useEffect(() => {
    fetchComplaints();
    
    // Simulate vehicle movement (in production, this would come from GPS)
    if (tracking) {
      const interval = setInterval(() => {
        setVehicleLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.01,
          lng: prev.lng + (Math.random() - 0.5) * 0.01
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [tracking]);
  
  // Send location updates via WebSocket
  useEffect(() => {
    if (tracking && sendLocation) {
      sendLocation(JSON.stringify({
        type: 'live_location',
        latitude: vehicleLocation.lat,
        longitude: vehicleLocation.lng,
        timestamp: new Date().toISOString()
      }));
    }
  }, [vehicleLocation, tracking, sendLocation]);
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'new_complaint') {
        toast.success(`New complaint reported in your area!`);
        fetchComplaints();
      } else if (data.type === 'status_update') {
        toast.info(`Complaint #${data.complaint_id} status updated to ${data.status}`);
        fetchComplaints();
      }
    }
  }, [lastMessage]);
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      default: return '#4CAF50';
    }
  };
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved': return <CheckIcon sx={{ fontSize: 14, color: '#4CAF50' }} />;
      case 'in_progress': return <PendingIcon sx={{ fontSize: 14, color: '#FBC02D' }} />;
      default: return <WarningIcon sx={{ fontSize: 14, color: '#F57C00' }} />;
    }
  };
  
  const centerMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([vehicleLocation.lat, vehicleLocation.lng], 15);
    }
  };
  
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }
  
  const pendingCount = Array.isArray(complaints) ? complaints.filter(c => c.status === 'pending').length : 0;
  const inProgressCount = Array.isArray(complaints) ? complaints.filter(c => c.status === 'in_progress').length : 0;
  const resolvedCount = Array.isArray(complaints) ? complaints.filter(c => c.status === 'resolved').length : 0;
  const highPriorityCount = Array.isArray(complaints) ? complaints.filter(c => c.priority === 'high' || c.priority === 'urgent').length : 0;
  
  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <LocationIcon sx={{ fontSize: 32, color: '#81C784' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Real-Time Map Tracking</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Live vehicle location & complaint monitoring</Typography>
              </Box>
              <Chip icon={isConnected ? <WifiIcon /> : <WifiOffIcon />} label={isConnected ? 'Live' : 'Offline'} size="small" sx={{ bgcolor: isConnected ? '#4CAF50' : '#F44336', color: 'white' }} />
            </Box>
            <Box display="flex" gap={1}>
              <Button variant={tracking ? "contained" : "outlined"} onClick={() => setTracking(!tracking)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>{tracking ? 'Stop Tracking' : 'Start Tracking'}</Button>
              <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Back to Dashboard</Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ height: 600, position: 'relative' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  <MapController center={mapCenter} zoom={13} />
                  
                  {tracking && (
                    <Marker position={[vehicleLocation.lat, vehicleLocation.lng]} icon={vehicleIcon}>
                      <Popup><Typography variant="subtitle2">Collection Vehicle #001</Typography><Typography variant="caption">Speed: 35 km/h</Typography><Typography variant="caption">Status: Active</Typography></Popup>
                    </Marker>
                  )}
                  
                  {tracking && <Circle center={[vehicleLocation.lat, vehicleLocation.lng]} radius={500} pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.1 }} />}
                  
                  {Array.isArray(complaints) && complaints.map((complaint) => (
                    <Marker key={complaint.id} position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]}>
                      <Popup>
                        <Box sx={{ p: 1, minWidth: 200 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Complaint #{complaint.id}</Typography>
                          <Typography variant="body2">Type: {complaint.complaint_type}</Typography>
                          <Typography variant="body2">Priority: {complaint.priority}</Typography>
                          <Typography variant="body2">Status: {complaint.status}</Typography>
                          <Typography variant="body2">Distance: {calculateDistance(vehicleLocation.lat, vehicleLocation.lng, complaint.latitude, complaint.longitude)} km</Typography>
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
                
                <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }}>
                  <Tooltip title="Center on Vehicle"><IconButton sx={{ bgcolor: 'white', boxShadow: 2 }} onClick={centerMap}><MyLocationIcon /></IconButton></Tooltip>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20', mb: 2 }}><SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Live Statistics</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" sx={{ fontWeight: 800, color: '#4CAF50' }}>{Array.isArray(complaints) ? complaints.length : 0}</Typography><Typography variant="caption">Total Complaints</Typography></Box></Grid>
                      <Grid item xs={6}><Box textAlign="center"><Typography variant="h4" sx={{ fontWeight: 800, color: '#F57C00' }}>{highPriorityCount}</Typography><Typography variant="caption">High Priority</Typography></Box></Grid>
                      <Grid item xs={4}><Box textAlign="center"><Typography variant="h6" sx={{ fontWeight: 700, color: '#FBC02D' }}>{pendingCount}</Typography><Typography variant="caption">Pending</Typography></Box></Grid>
                      <Grid item xs={4}><Box textAlign="center"><Typography variant="h6" sx={{ fontWeight: 700, color: '#2196F3' }}>{inProgressCount}</Typography><Typography variant="caption">In Progress</Typography></Box></Grid>
                      <Grid item xs={4}><Box textAlign="center"><Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>{resolvedCount}</Typography><Typography variant="caption">Resolved</Typography></Box></Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20', mb: 2 }}>Recent Updates</Typography>
                    {Array.isArray(complaints) && complaints.slice(0, 5).map((complaint) => (
                      <Box key={complaint.id} sx={{ mb: 2, p: 1, bgcolor: '#F1F8E9', borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={600}>#{complaint.id}</Typography>
                          <Chip label={complaint.status} size="small" sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">{complaint.complaint_type}</Typography>
                        <Typography variant="caption" display="block">📍 {complaint.latitude}, {complaint.longitude}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              
              {tracking && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20', mb: 2 }}><RoomIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Vehicle Status</Typography>
                      <Box display="flex" alignItems="center" gap={2} mb={1}><Avatar sx={{ bgcolor: '#4CAF50' }}>V</Avatar><Box><Typography variant="subtitle2">Collection Vehicle #001</Typography><Typography variant="caption" color="text.secondary">Currently Active</Typography></Box></Box>
                      <Typography variant="body2">📍 Lat: {vehicleLocation.lat.toFixed(6)}</Typography>
                      <Typography variant="body2">📍 Lng: {vehicleLocation.lng.toFixed(6)}</Typography>
                      <Typography variant="body2">⚡ Speed: 35 km/h</Typography>
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

export default RealTimeMap;
