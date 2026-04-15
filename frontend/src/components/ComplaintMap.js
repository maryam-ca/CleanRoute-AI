import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, FormControl, InputLabel, Select, MenuItem, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';

const ComplaintMap = ({ token, user }) => {
  const [area, setArea] = useState('Attock');
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    lat: 33.7667,
    lng: 72.3667,
    type: 'overflowing',
    priority: 'medium',
    description: ''
  });

  const areas = ['Attock', 'Islamabad'];

  // 10 different Attock Mehria Town locations
  const attockLocations = [
    { lat: 33.7667, lng: 72.3667, name: 'Mehria Town Main Gate' },
    { lat: 33.7675, lng: 72.3675, name: 'Central Park' },
    { lat: 33.7685, lng: 72.3685, name: 'Sector B' },
    { lat: 33.7695, lng: 72.3695, name: 'Market Area' },
    { lat: 33.7705, lng: 72.3705, name: 'Near Mosque' },
    { lat: 33.7715, lng: 72.3715, name: 'School Road' },
    { lat: 33.7725, lng: 72.3725, name: 'Sector C' },
    { lat: 33.7735, lng: 72.3735, name: 'Near Hospital' },
    { lat: 33.7745, lng: 72.3745, name: 'Community Center' },
    { lat: 33.7755, lng: 72.3755, name: 'Extension Road' }
  ];

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    
    const apiToken = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://cleanroute-ai.onrender.com/api/optimize-routes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({ area })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setComplaints(data.complaints || []);
        toast.success(`Loaded ${data.complaints?.length || 0} complaints in ${area}`);
      } else {
        setError('No complaints found');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const getMarkerColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF4444'; // Red
      case 'high': return '#F97316';   // Orange
      case 'medium': return '#3B82F6'; // Blue
      default: return '#22C55E';       // Green
    }
  };

  const getMarkerRadius = (priority) => {
    switch(priority) {
      case 'urgent': return 12;
      case 'high': return 10;
      case 'medium': return 8;
      default: return 6;
    }
  };

  const handleAddComplaint = async () => {
    const apiToken = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://cleanroute-ai.onrender.com/api/complaints/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          complaint_type: newComplaint.type,
          priority: newComplaint.priority,
          latitude: newComplaint.lat,
          longitude: newComplaint.lng,
          description: newComplaint.description,
          fill_level_before: newComplaint.priority === 'urgent' ? 90 : newComplaint.priority === 'high' ? 70 : 50
        })
      });
      
      if (response.ok) {
        toast.success('Complaint added successfully!');
        setOpenDialog(false);
        loadComplaints();
        setNewComplaint({
          lat: 33.7667,
          lng: 72.3667,
          type: 'overflowing',
          priority: 'medium',
          description: ''
        });
      } else {
        toast.error('Failed to add complaint');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getMapCenter = () => {
    if (area === 'Attock') return [33.771, 72.371];
    return [33.6844, 73.0479];
  };

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <Box sx={{ bgcolor: '#F97316', color: 'white', py: 2, px: 4 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>🗺️ Complaint Locations Map</Typography>
              <Typography variant="caption">Real complaint locations submitted by citizens</Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={() => setOpenDialog(true)}
              sx={{ bgcolor: '#EC4899', '&:hover': { bgcolor: '#DB2777' } }}
            >
              + Add New Complaint
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Filters</Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Area</InputLabel>
                  <Select value={area} onChange={(e) => setArea(e.target.value)} label="Area">
                    {areas.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                  </Select>
                </FormControl>
                
                <Button
                  fullWidth
                  variant="contained"
                  onClick={loadComplaints}
                  disabled={loading}
                  sx={{ bgcolor: '#F97316' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Load Complaints'}
                </Button>
                
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              </CardContent>
            </Card>
            
            {/* Legend */}
            <Card sx={{ borderRadius: 4, mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Legend</Typography>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#EF4444' }} />
                  <Typography variant="caption">Urgent - Immediate action</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#F97316' }} />
                  <Typography variant="caption">High - Respond within 24h</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                  <Typography variant="caption">Medium - Schedule pickup</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22C55E' }} />
                  <Typography variant="caption">Low - Routine collection</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={9}>
            <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  📍 Complaint Locations ({complaints.length})
                </Typography>
                
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <CircularProgress />
                  </Box>
                ) : complaints.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                    <Typography>No complaints found in {area}</Typography>
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
                      {complaints.map((complaint) => (
                        <CircleMarker
                          key={complaint.id}
                          center={[complaint.latitude, complaint.longitude]}
                          radius={getMarkerRadius(complaint.priority)}
                          fillColor={getMarkerColor(complaint.priority)}
                          color={getMarkerColor(complaint.priority)}
                          weight={2}
                          opacity={1}
                          fillOpacity={0.8}
                        >
                          <Popup>
                            <Box sx={{ minWidth: 200 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Complaint #{complaint.id}
                              </Typography>
                              <Typography variant="body2">Type: {complaint.complaint_type}</Typography>
                              <Typography variant="body2">Priority: {complaint.priority}</Typography>
                              <Typography variant="body2">Status: {complaint.status}</Typography>
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                📍 {complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}
                              </Typography>
                            </Box>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </Box>
                )}
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    📍 {complaints.length} complaint locations • 🔴 Urgent • 🟠 High • 🔵 Medium • 🟢 Low
                  </Typography>
                  <Button size="small" onClick={loadComplaints} startIcon={<span>🔄</span>}>
                    Refresh
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Add Complaint Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#F97316', color: 'white' }}>Add New Complaint</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={`${newComplaint.lat},${newComplaint.lng}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(',');
                  setNewComplaint({ ...newComplaint, lat: parseFloat(lat), lng: parseFloat(lng) });
                }}
                label="Location"
              >
                {attockLocations.map((loc, idx) => (
                  <MenuItem key={idx} value={`${loc.lat},${loc.lng}`}>
                    {loc.name} ({loc.lat}, {loc.lng})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Complaint Type</InputLabel>
              <Select
                value={newComplaint.type}
                onChange={(e) => setNewComplaint({ ...newComplaint, type: e.target.value })}
                label="Complaint Type"
              >
                <MenuItem value="overflowing">Overflowing Bin</MenuItem>
                <MenuItem value="spillage">Waste Spillage</MenuItem>
                <MenuItem value="missed">Missed Collection</MenuItem>
                <MenuItem value="illegal">Illegal Dumping</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newComplaint.priority}
                onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="urgent">Urgent - Immediate</MenuItem>
                <MenuItem value="high">High - Within 24h</MenuItem>
                <MenuItem value="medium">Medium - Schedule</MenuItem>
                <MenuItem value="low">Low - Routine</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              placeholder="Describe the waste issue..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddComplaint} variant="contained" sx={{ bgcolor: '#F97316' }}>
            Submit Complaint
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplaintMap;
