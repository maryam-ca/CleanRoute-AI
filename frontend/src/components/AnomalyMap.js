import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Red marker for anomalies
const anomalyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const AnomalyMap = ({ token, user }) => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [stats, setStats] = useState({ total_anomalies: 0, total_hotspots: 0 });

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    const apiToken = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://cleanroute-ai.onrender.com/api/anomalies/', {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAnomalies(data.anomalies || []);
        setHotspots(data.hotspots || []);
        setStats({
          total_anomalies: data.total_anomalies || 0,
          total_hotspots: data.total_hotspots || 0
        });
        toast.info(`Found ${data.total_anomalies} anomalies`);
      }
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      toast.error('Failed to load anomaly data');
    } finally {
      setLoading(false);
    }
  };

  const getMapCenter = () => {
    if (anomalies.length > 0) {
      return [anomalies[0].latitude, anomalies[0].longitude];
    }
    return [33.805787, 72.351681];
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#EF4444', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                🔥 Anomaly Detection & Hotspot Map
              </Typography>
              <Typography variant="caption">AI-powered illegal dumping detection</Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={fetchAnomalies}
              sx={{ bgcolor: '#DC2626' }}
            >
              Refresh
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#EF4444' }}>
                {stats.total_anomalies}
              </Typography>
              <Typography variant="caption">Anomalies Detected</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B' }}>
                {stats.total_hotspots}
              </Typography>
              <Typography variant="caption">Active Hotspots</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981' }}>
                {anomalies.length}
              </Typography>
              <Typography variant="caption">Suspected Locations</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', py: 2, bgcolor: '#FEF2F2' }}>
              <WarningIcon sx={{ fontSize: 40, color: '#EF4444' }} />
              <Typography variant="caption">Active Monitoring</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Map Section */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  🗺️ Anomaly & Hotspot Map
                </Typography>
                
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={500}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ height: 550, width: '100%', position: 'relative', zIndex: 1 }}>
                    <MapContainer
                      center={getMapCenter()}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Anomaly markers (red) */}
                      {anomalies.map((anomaly) => (
                        <Marker
                          key={anomaly.id}
                          position={[anomaly.latitude, anomaly.longitude]}
                          icon={anomalyIcon}
                        >
                          <Popup>
                            <Box sx={{ minWidth: 200 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#EF4444' }}>
                                ⚠️ ANOMALY DETECTED
                              </Typography>
                              <Typography variant="body2">Complaint #{anomaly.id}</Typography>
                              <Typography variant="body2">Type: {anomaly.complaint_type}</Typography>
                              <Typography variant="body2">Priority: {anomaly.priority}</Typography>
                              <Typography variant="caption">
                                Anomaly Score: {anomaly.anomaly_score?.toFixed(2)}
                              </Typography>
                            </Box>
                          </Popup>
                        </Marker>
                      ))}
                      
                      {/* Hotspot circles (orange) */}
                      {hotspots.map((hotspot, idx) => (
                        <Circle
                          key={idx}
                          center={[hotspot.center_lat, hotspot.center_lon]}
                          radius={300}
                          pathOptions={{
                            color: '#F59E0B',
                            fillColor: '#F59E0B',
                            fillOpacity: 0.3,
                            weight: 2
                          }}
                        >
                          <Popup>
                            <Typography variant="subtitle2">
                              🔥 Hotspot #{idx + 1}
                            </Typography>
                            <Typography variant="body2">
                              Intensity: {hotspot.intensity} anomalies
                            </Typography>
                          </Popup>
                        </Circle>
                      ))}
                    </MapContainer>
                  </Box>
                )}
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Box display="flex" gap={2}>
                    <Chip icon={<WarningIcon />} label="Anomaly (Red)" size="small" sx={{ bgcolor: '#EF4444', color: 'white' }} />
                    <Chip icon={<LocationIcon />} label="Hotspot (Orange Circle)" size="small" sx={{ bgcolor: '#F59E0B', color: 'white' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    AI-powered anomaly detection using Isolation Forest
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AnomalyMap;
