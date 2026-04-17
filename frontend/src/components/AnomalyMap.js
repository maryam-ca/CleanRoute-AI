import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Chip, Button, Alert, CircularProgress, IconButton, Divider,
  List, ListItem, ListItemText, ListItemIcon, Badge
} from '@mui/material';
import {
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  NotificationsActive as AlertIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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

const AnomalyMap = ({ token, user }) => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    fetchAnomalies();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnomalies, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const data = await api.getAnomalies();
      if (data.success) {
        setAnomalies(data.anomalies || []);
        setHotspots(data.hotspots || []);
        setAlerts(data.recent_alerts || []);
        setStats({
          total_anomalies: data.total_anomalies || 0,
          total_hotspots: data.total_hotspots || 0,
          anomaly_rate: data.anomaly_rate || 0,
          high_severity: data.high_severity_alerts || 0
        });
        
        if (data.high_severity_alerts > 0) {
          toast.error(`${data.high_severity_alerts} high severity anomalies detected!`, { duration: 5000 });
        } else if (data.total_anomalies > 0) {
          toast.warning(`${data.total_anomalies} anomalies detected`, { duration: 3000 });
        }
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

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#0A66FF';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)' }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Chip icon={<SecurityIcon />} label="AI ANOMALY DETECTION" size="small" sx={{ mb: 1, bgcolor: 'rgba(239,68,68,0.2)', color: '#F87171' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Real-time Anomaly & Hotspot Detection</Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>AI-powered illegal dumping detection using Isolation Forest</Typography>
            </Box>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAnomalies} disabled={loading} sx={{ borderRadius: '999px' }}>
              {loading ? 'Scanning...' : 'Refresh'}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Anomalies Detected</Typography>
                <Typography variant="h3" sx={{ color: '#EF4444', fontWeight: 800 }}>{stats?.total_anomalies || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Active Hotspots</Typography>
                <Typography variant="h3" sx={{ color: '#F59E0B', fontWeight: 800 }}>{stats?.total_hotspots || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Anomaly Rate</Typography>
                <Typography variant="h3" sx={{ color: '#00C6FF', fontWeight: 800 }}>{stats?.anomaly_rate || 0}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>High Severity</Typography>
                <Typography variant="h3" sx={{ color: '#EF4444', fontWeight: 800 }}>{stats?.high_severity || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AlertIcon sx={{ color: '#EF4444' }} />
              <Typography variant="subtitle2" sx={{ color: '#EF4444', fontWeight: 700 }}>Real-time Alerts</Typography>
            </Box>
            <Grid container spacing={1}>
              {alerts.slice(0, 3).map((alert, idx) => (
                <Grid item xs={12} key={idx}>
                  <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.2)', borderRadius: 2 }}>
                    {alert.message} #{alert.complaint_id}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Map Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(10,102,255,0.2)', height: '600px' }}>
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
                
                {/* Anomaly markers */}
                {anomalies.map((anomaly) => (
                  <Marker
                    key={anomaly.id}
                    position={[anomaly.latitude, anomaly.longitude]}
                  >
                    <Popup>
                      <Box sx={{ minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: getSeverityColor(anomaly.severity) }}>
                          ⚠️ {anomaly.severity.toUpperCase()} SEVERITY ANOMALY
                        </Typography>
                        <Typography variant="body2">Complaint #{anomaly.complaint_id}</Typography>
                        <Typography variant="body2">Type: {anomaly.complaint_type}</Typography>
                        <Typography variant="body2">Priority: {anomaly.priority}</Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                          Anomaly Score: {anomaly.anomaly_score?.toFixed(3)}
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Hotspot circles */}
                {hotspots.map((hotspot, idx) => (
                  <Circle
                    key={idx}
                    center={[hotspot.center_lat, hotspot.center_lon]}
                    radius={hotspot.radius_km * 1000}
                    pathOptions={{
                      color: getSeverityColor(hotspot.severity),
                      fillColor: getSeverityColor(hotspot.severity),
                      fillOpacity: 0.2,
                      weight: 3
                    }}
                  >
                    <Popup>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        🔥 Hotspot #{idx + 1}
                      </Typography>
                      <Typography variant="body2">Intensity: {hotspot.intensity}</Typography>
                      <Typography variant="body2">Anomalies: {hotspot.size}</Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        Severity: {hotspot.severity.toUpperCase()}
                      </Typography>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            </Paper>
            
            {/* Legend */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, flexWrap: 'wrap' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#EF4444', boxShadow: '0 0 5px #EF4444' }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>High Severity Anomaly</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#F59E0B', boxShadow: '0 0 5px #F59E0B' }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Medium Severity Anomaly</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(239,68,68,0.3)', border: '2px solid #EF4444' }} />
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Hotspot Zone</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Anomaly List Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 4, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)', height: '600px', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>Detected Anomalies</Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress sx={{ color: '#0A66FF' }} />
                </Box>
              ) : anomalies.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <SecurityIcon sx={{ fontSize: 48, color: '#22C55E', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No anomalies detected</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>System is running normally</Typography>
                </Box>
              ) : (
                <List>
                  {anomalies.map((anomaly, idx) => (
                    <React.Fragment key={anomaly.id}>
                      <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', bgcolor: `rgba(${getSeverityColor(anomaly.severity).slice(1,3) === 'EF' ? '239,68,68' : '245,158,11'}, 0.1)`, borderRadius: 2, mb: 1 }}>
                        <Box display="flex" justifyContent="space-between" width="100%">
                          <Box display="flex" alignItems="center" gap={1}>
                            <WarningIcon sx={{ color: getSeverityColor(anomaly.severity), fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: getSeverityColor(anomaly.severity) }}>
                              {anomaly.severity.toUpperCase()} Severity
                            </Typography>
                          </Box>
                          <Chip label={`Score: ${anomaly.anomaly_score?.toFixed(3)}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 1 }}>Complaint #{anomaly.complaint_id}</Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Type: {anomaly.complaint_type} | Priority: {anomaly.priority}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B7280', mt: 0.5 }}>Fill Level: {anomaly.fill_level}%</Typography>
                      </ListItem>
                      {idx < anomalies.length - 1 && <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AnomalyMap;


