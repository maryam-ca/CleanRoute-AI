import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
import { AutoFixHigh as OptimizeIcon, Route as RouteIcon } from '@mui/icons-material';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const routeColors = ['#0A66FF', '#00C6FF', '#8B5CF6', '#EC4899', '#F59E0B'];

const RouteOptimizer = () => {
  const [area, setArea] = useState('Attock');
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const optimizeRoutes = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await api.optimizeRoutes(area);
      if (data.total_clusters) {
        setRoutes(data);
        toast.success(`Optimized into ${data.total_clusters} routes`);
      } else {
        setError(data.error || 'Optimization failed');
      }
    } catch (requestError) {
      console.error('Error optimizing routes:', requestError);
      setError(requestError.message || 'Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

  const routePaths = routes?.routes?.map((route) =>
    (route.complaints || [])
      .filter((complaint) => complaint.latitude && complaint.longitude)
      .map((complaint) => [complaint.latitude, complaint.longitude])
  ) || [];

  return (
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', pt: '110px' }}>
      <Toaster position="top-right" />

      <Box
        sx={{
          mx: { xs: 2, md: 3 },
          py: 3,
          px: 4,
          color: 'white',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(79, 140, 255, 0.16) 0%, rgba(15, 23, 42, 0.18) 100%)'
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Route Optimization</Typography>
          <Typography variant="caption">AI-powered collection route planning</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Route Settings
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Area</InputLabel>
                <Select value={area} onChange={(e) => setArea(e.target.value)} label="Area">
                  <MenuItem value="Attock">Attock</MenuItem>
                  <MenuItem value="Mehria Town">Mehria Town</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <OptimizeIcon />}
                onClick={optimizeRoutes}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Optimizing...' : 'Optimize Routes'}
              </Button>

              {!routes ? (
                <Box textAlign="center" py={4}>
                  <RouteIcon sx={{ fontSize: 48, color: '#0A66FF', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Generate optimized routes to see the plan here.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
                    <Chip label={`Routes: ${routes.total_clusters || 0}`} />
                    {routes.time_saved !== undefined && <Chip label={`Time Saved: ${routes.time_saved}%`} />}
                  </Box>

                  {(routes.routes || []).map((route, idx) => (
                    <Box
                      key={route.route_id || idx}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.03)',
                        borderLeft: `4px solid ${routeColors[idx % routeColors.length]}`
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {route.route_id || `Route ${idx + 1}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(route.total_complaints || route.complaints?.length || 0)} stops
                        {route.high_priority ? ` • ${route.high_priority} urgent` : ''}
                      </Typography>
                      <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                        {route.distance && <Chip label={route.distance} size="small" />}
                        {route.estimated_time && <Chip label={route.estimated_time} size="small" />}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ height: 550, width: '100%' }}>
                <MapContainer center={[33.805787, 72.351681]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {(routes?.routes || []).map((route, idx) => (
                    <React.Fragment key={route.route_id || idx}>
                      {(route.complaints || []).map((complaint, complaintIdx) => (
                        <Marker
                          key={`${route.route_id || idx}-${complaint.id || complaintIdx}`}
                          position={[complaint.latitude, complaint.longitude]}
                        >
                          <Popup>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {route.route_id || `Route ${idx + 1}`}
                            </Typography>
                            <Typography variant="caption">
                              Priority: {complaint.priority || 'medium'}
                            </Typography>
                          </Popup>
                        </Marker>
                      ))}
                      {routePaths[idx] && routePaths[idx].length > 1 && (
                        <Polyline positions={routePaths[idx]} pathOptions={{ color: routeColors[idx % routeColors.length], weight: 4 }} />
                      )}
                    </React.Fragment>
                  ))}
                </MapContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RouteOptimizer;

