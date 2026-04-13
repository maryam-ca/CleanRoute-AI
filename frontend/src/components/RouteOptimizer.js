import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress,
  Alert, IconButton, Divider, List, ListItem, ListItemText, ListItemIcon,
  Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Map as MapIcon,
  LocationOn as LocationIcon,
  Route as RouteIcon,
  CleaningServices as CleanIcon,
  Speed as SpeedIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  MyLocation as MyLocationIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
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

const RouteOptimizer = ({ token, user, setToken }) => {
  const [area, setArea] = useState('Islamabad');
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [mapCenter, setMapCenter] = useState([33.6844, 73.0479]);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8001/api/';

  const areas = [
    { name: 'Attock', center: [33.7667, 72.3667], zoom: 13 },
    { name: 'Islamabad', center: [33.6844, 73.0479], zoom: 12 },
    { name: 'Karachi', center: [24.8607, 67.0011], zoom: 11 },
    { name: 'Lahore', center: [31.5497, 74.3436], zoom: 11 }
  ];

  useEffect(() => {
    fetchComplaints();
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

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}optimize-routes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ area })
      });
      const data = await response.json();
      setRoutes(data);
      
      const selectedArea = areas.find(a => a.name === area);
      if (selectedArea) {
        setMapCenter(selectedArea.center);
        setMapZoom(selectedArea.zoom);
      }
      
      toast.success(`Routes optimized for ${area}!`);
    } catch (error) {
      toast.error('Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteClick = (route) => {
    setSelectedRoute(route.cluster_id);
    setRouteDetails(route);
    setDetailDialogOpen(true);
    
    // Center map on route's approximate location
    const areaCenter = areas.find(a => a.name === area);
    if (areaCenter) {
      setMapCenter(areaCenter.center);
      setMapZoom(areaCenter.zoom);
    }
    
    toast.success(`Route ${route.route_id}: ${route.total_complaints} collection points`);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      default: return '#4CAF50';
    }
  };

  const getRouteIcon = (clusterId) => {
    const icons = ['🚛', '🚚', '🚒', '🚑', '🚐'];
    return icons[clusterId % icons.length];
  };

  const getRouteColor = (clusterId) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[clusterId % colors.length];
  };

  const areaComplaints = Array.isArray(complaints) ? complaints.filter(c => {
    if (area === 'Islamabad') return c.latitude > 33.5 && c.latitude < 33.9 && c.longitude > 72.8 && c.longitude < 73.3;
    if (area === 'Karachi') return c.latitude > 24.7 && c.latitude < 25.0 && c.longitude > 66.9 && c.longitude < 67.2;
    if (area === 'Attock') return c.latitude > 33.6 && c.latitude < 33.9 && c.longitude > 72.1 && c.longitude < 72.6;
    if (area === 'Lahore') return c.latitude > 31.4 && c.latitude < 31.7 && c.longitude > 74.2 && c.longitude < 74.5;
    return true;
  }) : [];

  const getRoutePolyline = (clusterId) => {
    const areaCenters = {
      'Islamabad': [
        [33.6844, 73.0479], [33.6914, 73.0529], [33.6984, 73.0579],
        [33.7054, 73.0529], [33.6984, 73.0479], [33.6914, 73.0429],
        [33.6844, 73.0479]
      ],
      'Karachi': [
        [24.8607, 67.0011], [24.8707, 67.0111], [24.8807, 67.0211],
        [24.8707, 67.0311], [24.8607, 67.0211], [24.8507, 67.0111],
        [24.8607, 67.0011]
      ],
      'Attock': [
        [33.7667, 72.3667], [33.7700, 72.3700], [33.7750, 72.3750],
        [33.7800, 72.3700], [33.7750, 72.3650], [33.7700, 72.3600],
        [33.7667, 72.3667]
      ],
      'Lahore': [
        [31.5497, 74.3436], [31.5597, 74.3536], [31.5697, 74.3636],
        [31.5597, 74.3736], [31.5497, 74.3636], [31.5397, 74.3536],
        [31.5497, 74.3436]
      ]
    };
    return areaCenters[area] || areaCenters['Islamabad'];
  };

  const routeColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#1B5E20', color: 'white', py: 2, px: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <RouteIcon sx={{ fontSize: 32, color: '#81C784' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Route Optimization</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>AI-Powered Collection Route Planning</Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Button variant="outlined" size="small" onClick={() => window.location.href = '/'} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                Back to Dashboard
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20', mb: 2 }}>
                    <RouteIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4CAF50' }} />
                    Route Settings
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Area</InputLabel>
                    <Select value={area} onChange={(e) => setArea(e.target.value)} label="Select Area">
                      {areas.map(a => <MenuItem key={a.name} value={a.name}>{a.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Button fullWidth variant="contained" onClick={handleOptimize} disabled={loading} sx={{ bgcolor: '#4CAF50', borderRadius: 3, py: 1.5 }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Optimize Routes'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderRadius: 4, textAlign: 'center', py: 2, bgcolor: '#E8F5E9' }}>
                  <CleanIcon sx={{ fontSize: 32, color: '#4CAF50' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1B5E20' }}>{areaComplaints.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Complaints</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderRadius: 4, textAlign: 'center', py: 2, bgcolor: '#FFF3E0' }}>
                  <WarningIcon sx={{ fontSize: 32, color: '#F57C00' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#E65100' }}>{areaComplaints.filter(c => c.priority === 'high' || c.priority === 'urgent').length}</Typography>
                  <Typography variant="caption" color="text.secondary">High Priority</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderRadius: 4, textAlign: 'center', py: 2, bgcolor: '#E3F2FD' }}>
                  <SpeedIcon sx={{ fontSize: 32, color: '#2196F3' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565C0' }}>{routes?.total_clusters || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Optimal Routes</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderRadius: 4, textAlign: 'center', py: 2, bgcolor: '#F3E5F5' }}>
                  <AccessTimeIcon sx={{ fontSize: 32, color: '#9C27B0' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#6A1B9A' }}>25%</Typography>
                  <Typography variant="caption" color="text.secondary">Time Saved</Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ height: 500, position: 'relative' }}>
                  <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <MapController center={mapCenter} zoom={mapZoom} />
                    
                    {areaComplaints.slice(0, 50).map((complaint, idx) => (
                      <Marker 
                        key={complaint.id} 
                        position={[parseFloat(complaint.latitude), parseFloat(complaint.longitude)]} 
                        icon={complaint.priority === 'urgent' ? redIcon : complaint.priority === 'high' ? orangeIcon : greenIcon}
                      >
                        <Popup>
                          <Box sx={{ p: 1, minWidth: 200 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Complaint #{complaint.id}</Typography>
                            <Typography variant="body2">Type: {complaint.complaint_type}</Typography>
                            <Typography variant="body2">Priority: {complaint.priority}</Typography>
                            <Typography variant="body2">Status: {complaint.status}</Typography>
                            <Typography variant="body2">Fill Level: {complaint.fill_level_before || 0}%</Typography>
                          </Box>
                        </Popup>
                      </Marker>
                    ))}

                    {routes && routes.routes && routes.routes.map((route, idx) => (
                      <Polyline
                        key={idx}
                        positions={getRoutePolyline(route.cluster_id)}
                        color={routeColors[idx % routeColors.length]}
                        weight={selectedRoute === route.cluster_id ? 6 : 4}
                        opacity={selectedRoute === route.cluster_id ? 1 : 0.7}
                        dashArray={selectedRoute === route.cluster_id ? undefined : '5, 5'}
                      />
                    ))}
                  </MapContainer>
                  
                  <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000, display: 'flex', gap: 1 }}>
                    <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }} onClick={() => setMapZoom(z => z + 1)}><ZoomInIcon /></IconButton>
                    <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }} onClick={() => setMapZoom(z => z - 1)}><ZoomOutIcon /></IconButton>
                    <IconButton sx={{ bgcolor: 'white', boxShadow: 2 }} onClick={() => { const areaData = areas.find(a => a.name === area); if (areaData) setMapCenter(areaData.center); }}><MyLocationIcon /></IconButton>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card sx={{ borderRadius: 4, height: 500, overflow: 'auto' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20', mb: 2 }}>
                    <RouteIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4CAF50' }} />
                    Optimized Routes
                    {routes && <Chip label={`${routes.total_clusters} routes`} size="small" sx={{ ml: 1, bgcolor: '#E8F5E9' }} />}
                  </Typography>
                  
                  {!routes ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <MapIcon sx={{ fontSize: 64, color: '#C8E6C9', mb: 2 }} />
                      <Typography color="text.secondary">Click "Optimize Routes" to see results</Typography>
                    </Box>
                  ) : (
                    <List>
                      {routes.routes?.map((route, idx) => (
                        <ListItem
                          key={idx}
                          component={Paper}
                          sx={{
                            mb: 2,
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            bgcolor: selectedRoute === route.cluster_id ? `${routeColors[idx % routeColors.length]}20` : 'white',
                            border: selectedRoute === route.cluster_id ? `2px solid ${routeColors[idx % routeColors.length]}` : '1px solid #E8F5E9',
                            '&:hover': { transform: 'translateX(4px)', boxShadow: 3 }
                          }}
                          onClick={() => handleRouteClick(route)}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: routeColors[idx % routeColors.length], width: 40, height: 40 }}>
                              {getRouteIcon(route.cluster_id)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {route.route_id}
                                </Typography>
                                {route.high_priority > 0 && (
                                  <Chip label={`${route.high_priority} urgent`} size="small" sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', height: 20 }} />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box component="span">
                                <Typography variant="body2" color="text.secondary">
                                  📍 {route.total_complaints} collection points
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  📏 {route.distance} • ⏱️ {route.estimated_time}
                                </Typography>
                              </Box>
                            }
                          />
                          <Chip 
                            label={`${Math.floor(route.total_complaints * 5)} min`}
                            size="small"
                            sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Route Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        {routeDetails && (
          <>
            <DialogTitle sx={{ bgcolor: '#1B5E20', color: 'white' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Route {routeDetails.route_id} Details</Typography>
                <IconButton onClick={() => { setDetailDialogOpen(false); alert("Opening map..."); window.location.href = "/map"; }} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#E8F5E9', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total Complaints</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>{routeDetails.total_complaints}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#E3F2FD', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">High Priority</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565C0' }}>{routeDetails.high_priority || 0}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#FFF3E0', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Distance</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#E65100' }}>{routeDetails.distance}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: '#F3E5F5', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Estimated Time</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#6A1B9A' }}>{routeDetails.estimated_time || `${routeDetails.total_complaints * 5} min`}</Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Collection Points:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {[...Array(Math.min(routeDetails.total_complaints, 10))].map((_, i) => (
                    <Chip key={i} label={`Stop ${i + 1}`} size="small" sx={{ bgcolor: '#E8F5E9' }} />
                  ))}
                  {routeDetails.total_complaints > 10 && (
                    <Chip label={`+${routeDetails.total_complaints - 10} more`} size="small" />
                  )}
                </Box>
              </Box>
            </DialogContent>
                        <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                sx={{ bgcolor: '#4CAF50' }} 
                onClick={() => {
                  setDetailDialogOpen(false);
                  // Direct navigation to map
                  window.location.href = 'http://localhost:3000/map';
                }}
              >
                Start Navigation
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default RouteOptimizer;











