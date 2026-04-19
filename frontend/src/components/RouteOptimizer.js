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
} from '@mui/icons-material';
import api from '../services/api';

// FIX MARKER ICONS
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const routeColors = ['#36C4FF', '#53D769', '#D8FF72', '#FF8A65', '#A78BFA'];

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
      const data = await api.optimizeRoutes(area);
      console.log('Optimization response:', data);
      
      if (data && data.routes && data.routes.length > 0) {
        setRoutes(data);
        if (Array.isArray(data.complaints)) {
          setAllComplaints(data.complaints);
        }
        toast.success(`Optimized into ${data.total_clusters || data.routes.length} routes`);
      } else {
        setRoutes(data);
        setAllComplaints(Array.isArray(data?.complaints) ? data.complaints : []);
        setError('No active complaints found in this area.');
      }
    } catch (requestError) {
      console.error('Error:', requestError);
      setError(requestError.message || 'Failed to optimize routes');
    } finally {
      setLoading(false);
    }
  };

  const routedComplaints = routes?.routes
    ? routes.routes.flatMap((route) => route.complaints || [])
    : [];
  const uniqueRoutedComplaints = Array.from(
    new Map(
      routedComplaints
        .filter((complaint) => complaint?.id && complaint.latitude && complaint.longitude && complaint.status !== 'completed')
        .map((complaint) => [complaint.id, complaint])
    ).values()
  );

    // Only show active complaints (not completed)
  const validComplaints = allComplaints.filter(c => c.latitude && c.longitude && c.status !== 'completed');
  const displayedComplaints = uniqueRoutedComplaints.length > 0 ? uniqueRoutedComplaints : validComplaints;
  const mapCenter = displayedComplaints.length > 0
    ? [
        displayedComplaints.reduce((sum, complaint) => sum + Number(complaint.latitude), 0) / displayedComplaints.length,
        displayedComplaints.reduce((sum, complaint) => sum + Number(complaint.longitude), 0) / displayedComplaints.length,
      ]
    : [33.805787, 72.351681];
  const mapZoom = area === 'Attock' ? 10 : 13;

  // Build route paths for polylines
  const getRoutePaths = () => {
    if (!routes?.routes) return [];
    return routes.routes.map(route => {
      if (Array.isArray(route.path) && route.path.length > 1) {
        return route.path;
      }
      return (route.complaints || [])
        .filter(c => c.latitude && c.longitude)
        .map(c => [c.latitude, c.longitude]);
    });
  };

  const routePaths = getRoutePaths();
  const glassPanelSx = {
    borderRadius: 6,
    border: '1px solid rgba(139,225,255,0.18)',
    background: 'linear-gradient(180deg, rgba(10, 28, 57, 0.88) 0%, rgba(7, 21, 42, 0.94) 100%)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 28px 55px rgba(3,12,25,0.28)'
  };
  const summaryCards = [
    { label: 'Active Complaints', value: displayedComplaints.length, accent: '#74DDFF' },
    { label: 'Route Clusters', value: routes?.total_clusters || routes?.routes?.length || 0, accent: '#D8FF72' },
    { label: 'Time Saved', value: `${routes?.time_saved || 0}%`, accent: '#53D769' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', pt: '96px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, mb: 3 }}>
        <Container maxWidth="xl" disableGutters>
          <Box
            sx={{
              py: { xs: 2.5, md: 3.25 },
              px: { xs: 2, md: 3.5 },
              border: '1px solid rgba(139,225,255,0.22)',
              borderRadius: 6,
              background: 'linear-gradient(135deg, rgba(15,78,148,0.34) 0%, rgba(19,107,89,0.22) 58%, rgba(7,22,43,0.45) 100%)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 25% 24%, rgba(255,244,173,0.18), transparent 16%), radial-gradient(circle at 82% 18%, rgba(54,196,255,0.18), transparent 20%)' }} />
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} flexWrap="wrap" gap={2.5} position="relative">
              <Box sx={{ minWidth: 0, flex: '1 1 340px' }}>
                <Chip label="AI Route Command" size="small" sx={{ mb: 1.25, bgcolor: 'rgba(216,255,114,0.16)', color: '#D8FF72', border: '1px solid rgba(216,255,114,0.18)' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.1, pr: { md: 2 } }}>
                  Route Optimizer
                </Typography>
                <Typography variant="body2" sx={{ color: '#DDEDF8', mt: 1, maxWidth: 680, lineHeight: 1.7 }}>
                  Generate cleaner collection paths, compare route load, and guide field movement from one live optimization screen.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.25,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'stretch', md: 'flex-end' },
                  width: { xs: '100%', lg: 'auto' },
                  flex: '0 1 420px',
                }}
              >
                <FormControl
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', sm: 180 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      background: 'rgba(255,255,255,0.06)',
                      color: '#F5FBFF',
                    },
                  }}
                >
                  <InputLabel sx={{ color: '#BDD8EB' }}>Area</InputLabel>
                  <Select value={area} label="Area" onChange={(e) => setArea(e.target.value)}>
                    <MenuItem value="Attock">Whole Attock Area</MenuItem>
                    <MenuItem value="Mehria Town">Mehria Town</MenuItem>
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  startIcon={loading ? <CircularProgress size={18} sx={{ color: '#041328' }} /> : <OptimizeIcon />} 
                  onClick={optimizeRoutes} 
                  disabled={loading}
                  sx={{ borderRadius: '999px', px: 2.75, minWidth: { xs: '100%', sm: 'auto' } }}
                >
                  {loading ? 'Optimizing...' : 'Optimize Routes'}
                </Button>
                <IconButton onClick={() => setDrawerOpen(!drawerOpen)} sx={{ color: '#74DDFF', border: '1px solid rgba(116,221,255,0.22)', bgcolor: 'rgba(255,255,255,0.04)' }}>
                  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, px: { xs: 2, md: 3 }, gap: 2.5, alignItems: 'stretch' }}>
        <Box sx={{ flex: 1, position: 'relative', minHeight: { xs: '58vh', md: '70vh' } }}>
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {summaryCards.map((card) => (
              <Grid item xs={12} sm={4} key={card.label}>
                <Paper sx={{ ...glassPanelSx, p: 2.2 }}>
                  <Typography variant="caption" sx={{ color: '#8FB9D3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h4" sx={{ color: card.accent, fontWeight: 800, mt: 0.5 }}>
                    {card.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {error && (
            <Alert severity="error" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
              {error}
            </Alert>
          )}
          
          <Paper
            sx={{
              height: '100%',
              minHeight: { xs: '58vh', md: '70vh' },
              ...glassPanelSx,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <MapContainer
              key={mapCenter.join(',')}
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {displayedComplaints.map((complaint) => (
                <Marker
                  key={complaint.id}
                  position={[complaint.latitude, complaint.longitude]}
                >
                  <Popup>
                    <div style={{ minWidth: '200px', color: '#0f172a', fontFamily: 'Manrope, Segoe UI, sans-serif', lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px', color: '#0f172a' }}>
                        #{complaint.id} - {complaint.complaint_type?.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        <div><strong>Priority:</strong> {complaint.priority}</div>
                        <div><strong>Status:</strong> {complaint.status}</div>
                        <div><strong>Fill Level:</strong> {complaint.fill_level_before || 0}%</div>
                        {complaint.description ? (
                          <div style={{ marginTop: '6px' }}>
                            <strong>Description:</strong> {complaint.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {routes?.routes && routePaths.map((path, idx) => (
                path.length > 1 && (
                  <Polyline
                    key={`route-${idx}`}
                    positions={path}
                    pathOptions={{
                      color: routeColors[idx % routeColors.length],
                      weight: 5,
                      opacity: 0.92,
                      lineCap: 'round',
                      lineJoin: 'round'
                    }}
                  />
                )
              ))}
            </MapContainer>
          </Paper>
          
          <Paper sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 20, 
            zIndex: 1000, 
            p: 1.5,
            bgcolor: 'rgba(7,22,43,0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(139,225,255,0.24)',
            borderRadius: 4
          }}>
            <Typography variant="caption" sx={{ color: '#74DDFF', display: 'block', mb: 1, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Legend</Typography>
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

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          variant={isMobile ? "temporary" : "persistent"}
          sx={{
            width: 320,
            flexShrink: 0,
            display: { xs: 'block', md: 'block' },
            '& .MuiDrawer-paper': {
              width: 320,
              position: isMobile ? 'fixed' : 'relative',
              height: isMobile ? '100vh' : 'auto',
              top: 'auto',
              bgcolor: 'rgba(7,22,43,0.95)',
              backdropFilter: 'blur(16px)',
              borderLeft: '1px solid rgba(139,225,255,0.18)',
              borderRadius: isMobile ? 0 : '28px',
              mt: isMobile ? 0 : 0
            },
          }}
        >
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="overline" sx={{ color: '#D8FF72', fontWeight: 800, letterSpacing: '0.14em' }}>
              Route Intelligence
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2 }}>
              Routes Summary
            </Typography>
            
            {!routes && !loading && (
              <Box textAlign="center" py={4}>
                <RouteIcon sx={{ fontSize: 48, color: '#36C4FF', mb: 2, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ color: '#BDD8EB' }}>
                  Click "Optimize Routes" to generate routes
                </Typography>
              </Box>
            )}
            
            {loading && (
              <Box textAlign="center" py={4}>
                <CircularProgress sx={{ color: '#36C4FF' }} />
                <Typography variant="body2" sx={{ color: '#BDD8EB', mt: 2 }}>Optimizing routes...</Typography>
              </Box>
            )}
            
            {routes && (
              <>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'rgba(54,196,255,0.1)', border: '1px solid rgba(116,221,255,0.18)' }}>
                      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#BDD8EB' }}>Total Routes</Typography>
                        <Typography variant="h5" sx={{ color: '#36C4FF' }}>{routes.total_clusters || routes.routes?.length || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ bgcolor: 'rgba(83,215,105,0.1)', border: '1px solid rgba(83,215,105,0.18)' }}>
                      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#BDD8EB' }}>Time Saved</Typography>
                        <Typography variant="h5" sx={{ color: '#53D769' }}>{routes.time_saved || 25}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                
                <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 700 }}>Routes</Typography>
                
                {(routes.routes || []).map((route, idx) => (
                  <Card key={idx} sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,225,255,0.14)' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: routeColors[idx % routeColors.length] }}>
                            {route.route_id || `Route ${idx + 1}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            {(route.complaints?.length || route.total_complaints || 0)} stops
                          </Typography>
                          {route.assigned_tester && (
                            <Typography variant="caption" sx={{ color: '#74DDFF', display: 'block', mt: 0.25 }}>
                              {route.assigned_tester}
                            </Typography>
                          )}
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="caption" sx={{ color: '#74DDFF', fontWeight: 700 }}>
                            {route.distance || `${(idx + 1) * 1.5} km`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                            {route.estimated_time || `${(idx + 1) * 5} min`}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1.4, borderColor: 'rgba(255,255,255,0.08)' }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Chip label={`${route.complaints?.length || route.total_complaints || 0} pickups`} size="small" sx={{ bgcolor: 'rgba(54,196,255,0.14)', color: '#74DDFF' }} />
                        <Chip label={route.estimated_time || `${(idx + 1) * 5} min`} size="small" sx={{ bgcolor: 'rgba(216,255,114,0.14)', color: '#D8FF72' }} />
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





