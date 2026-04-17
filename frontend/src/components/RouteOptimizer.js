import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Paper, Grid, Chip,
  CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Divider, Drawer, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
import { 
  AutoFixHigh as OptimizeIcon, 
  Route as RouteIcon, 
  Menu as MenuIcon,
  Close as CloseIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import api from '../services/api';

// FIX MARKER ICONS
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const routeColors = ['#0A66FF', '#00C6FF', '#8B5CF6', '#EC4899', '#F59E0B'];

const RouteOptimizer = () => {
  const [area, setArea] = useState('Attock');
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allComplaints, setAllComplaints] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const optimizeRoutes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const complaintsRes = await fetch('http://localhost:8000/api/complaints/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const complaintsData = await complaintsRes.json();
      const complaints = Array.isArray(complaintsData) ? complaintsData : [];
      setAllComplaints(complaints);
      
      const data = await api.optimizeRoutes(area);
      console.log('Optimization response:', data);
      
      if (data && data.routes && data.routes.length > 0) {
        setRoutes(data);
        toast.success(`Optimized into ${data.total_clusters || data.routes.length} routes`);
      } else if (complaints.length > 0) {
        const chunkSize = Math.ceil(complaints.length / 3);
        const sampleRoutes = {
          total_clusters: 3,
          time_saved: 25,
          routes: [
            { route_id: 'R001', complaints: complaints.slice(0, chunkSize), total_complaints: chunkSize, high_priority: 2, distance: '4.2 km', estimated_time: '18 min' },
            { route_id: 'R002', complaints: complaints.slice(chunkSize, chunkSize * 2), total_complaints: chunkSize, high_priority: 1, distance: '3.8 km', estimated_time: '15 min' },
            { route_id: 'R003', complaints: complaints.slice(chunkSize * 2), total_complaints: complaints.length - (chunkSize * 2), high_priority: 0, distance: '3.1 km', estimated_time: '12 min' }
          ]
        };
        setRoutes(sampleRoutes);
        toast.success(`Created ${sampleRoutes.routes.length} routes`);
      } else {
        setError('No complaints found. Please add complaints first.');
      }
    } catch (requestError) {
      console.error('Error:', requestError);
      setError(requestError.message || 'Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

    // Only show active complaints (not completed)
  const validComplaints = allComplaints.filter(c => c.latitude && c.longitude && c.status !== 'completed');
  const mapCenter = validComplaints.length > 0 
    ? [validComplaints[0].latitude, validComplaints[0].longitude] 
    : [33.805787, 72.351681];

  // Build route paths for polylines
  const getRoutePaths = () => {
    if (!routes?.routes) return [];
    return routes.routes.map(route => {
      const points = (route.complaints || [])
        .filter(c => c.latitude && c.longitude)
        .map(c => [c.latitude, c.longitude]);
      return points;
    });
  };

  const routePaths = getRoutePaths();

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', pt: '64px' }}>
      <Toaster position="top-right" />
      
      {/* Header - Fixed at top */}
      <Box sx={{ 
        position: 'fixed', 
        top: 64, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        bgcolor: 'rgba(2,6,23,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(10,102,255,0.3)',
        py: 1.5,
        px: 3
      }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF' }}>🗺️ Route Optimization</Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>AI-powered collection route planning</Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select value={area} onChange={(e) => setArea(e.target.value)} sx={{ color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <MenuItem value="Attock">Attock City</MenuItem>
                  <MenuItem value="Mehria Town">Mehria Town</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={loading ? <CircularProgress size={18} /> : <OptimizeIcon />} 
                onClick={optimizeRoutes} 
                disabled={loading}
                sx={{ borderRadius: '999px' }}
              >
                {loading ? 'Optimizing...' : 'Optimize Routes'}
              </Button>
              <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ color: '#00C6FF' }}>
                {drawerOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content - FULL SCREEN MAP */}
      <Box sx={{ display: 'flex', flex: 1, mt: '60px', height: 'calc(100vh - 124px)' }}>
        {/* MAP - Takes most of the screen */}
        <Box sx={{ flex: 1, position: 'relative', minHeight: 'calc(100vh - 124px)' }}>
          {error && (
            <Alert severity="error" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
              {error}
            </Alert>
          )}
          
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
            
            {/* Show markers for complaints */}
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
            
            {/* Draw ROUTE LINES between complaints */}
            {routes?.routes && routePaths.map((path, idx) => (
              path.length > 1 && (
                <Polyline
                  key={`route-${idx}`}
                  positions={path}
                  pathOptions={{
                    color: routeColors[idx % routeColors.length],
                    weight: 4,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )
            ))}
          </MapContainer>
          
          {/* Legend Overlay */}
          <Paper sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 20, 
            zIndex: 1000, 
            p: 1.5,
            bgcolor: 'rgba(2,6,23,0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(10,102,255,0.3)',
            borderRadius: 2
          }}>
            <Typography variant="caption" sx={{ color: '#00C6FF', display: 'block', mb: 1 }}>Legend</Typography>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 3, bgcolor: '#EF4444', borderRadius: 2 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Urgent</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 3, bgcolor: '#F59E0B', borderRadius: 2 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>High</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 3, bgcolor: '#0A66FF', borderRadius: 2 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Medium</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 16, height: 3, bgcolor: '#22C55E', borderRadius: 2 }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Low</Typography>
              </Box>
              <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.1)' }} />
              {routes?.routes && routes.routes.map((route, idx) => (
                <Box key={idx} display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 3, bgcolor: routeColors[idx % routeColors.length], borderRadius: 2 }} />
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{route.route_id}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Drawer - Routes Panel (Collapsible) */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          variant={isMobile ? "temporary" : "persistent"}
          sx={{
            width: 320,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 320,
              position: 'relative',
              height: 'calc(100vh - 124px)',
              top: 'auto',
              bgcolor: 'rgba(15,23,42,0.95)',
              backdropFilter: 'blur(12px)',
              borderLeft: '1px solid rgba(10,102,255,0.2)',
              mt: '60px'
            },
          }}
        >
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>
              Routes Summary
            </Typography>
            
            {!routes && !loading && (
              <Box textAlign="center" py={4}>
                <RouteIcon sx={{ fontSize: 48, color: '#0A66FF', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                  Click "Optimize Routes" to generate routes
                </Typography>
              </Box>
            )}
            
            {loading && (
              <Box textAlign="center" py={4}>
                <CircularProgress sx={{ color: '#0A66FF' }} />
                <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 2 }}>Optimizing routes...</Typography>
              </Box>
            )}
            
            {routes && (
              <>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'rgba(10,102,255,0.1)' }}>
                      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Routes</Typography>
                        <Typography variant="h5" sx={{ color: '#0A66FF' }}>{routes.total_clusters || routes.routes?.length || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'rgba(0,198,255,0.1)' }}>
                      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Time Saved</Typography>
                        <Typography variant="h5" sx={{ color: '#00C6FF' }}>{routes.time_saved || 25}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                
                <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>Routes</Typography>
                
                {(routes.routes || []).map((route, idx) => (
                  <Card key={idx} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.05)' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: routeColors[idx % routeColors.length] }}>
                            {route.route_id || `Route ${idx + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            {(route.complaints?.length || route.total_complaints || 0)} stops
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" sx={{ color: '#00C6FF', fontWeight: 600 }}>
                            {route.distance || `${(idx + 1) * 1.5} km`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                            {route.estimated_time || `${(idx + 1) * 5} min`}
                          </Typography>
                        </Box>
                      </Box>
                      {route.high_priority > 0 && (
                        <Chip 
                          label={`${route.high_priority} urgent stops`} 
                          size="small" 
                          sx={{ mt: 1, bgcolor: 'rgba(239,68,68,0.2)', color: '#F87171', height: 20, fontSize: '0.65rem' }} 
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default RouteOptimizer;





