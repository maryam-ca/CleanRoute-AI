import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Paper, Chip, Tooltip } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom colored markers based on priority
const getMarkerIcon = (priority) => {
  const colors = {
    urgent: { bg: '#EF4444', border: '#DC2626', glow: '#EF4444', label: 'URGENT' },
    high: { bg: '#F59E0B', border: '#D97706', glow: '#F59E0B', label: 'HIGH' },
    medium: { bg: '#0A66FF', border: '#0057DB', glow: '#0A66FF', label: 'MEDIUM' },
    low: { bg: '#22C55E', border: '#16A34A', glow: '#22C55E', label: 'LOW' }
  };
  
  const priorityColor = colors[priority] || colors.medium;
  
  return L.divIcon({
    html: `
      <div style="background-color: ${priorityColor.bg}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${priorityColor.glow}; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <span style="color: white; font-size: 10px; font-weight: bold;">${priorityColor.label.charAt(0)}</span>
      </div>
    `,
    iconSize: [24, 24],
    className: 'priority-marker',
    popupAnchor: [0, -12]
  });
};

const ComplaintMap = () => {
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }
      
      const response = await fetch('https://cleanroute-ai.onrender.com/api/complaints/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const complaintsArray = Array.isArray(data) ? data : (data.results || []);
      setAllComplaints(complaintsArray);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter out completed complaints - ONLY active (pending + assigned)
  const activeComplaints = allComplaints.filter(c => c.status !== 'completed');
  
  // Apply priority filter
  const filteredByPriority = activeComplaints.filter(c => {
    if (selectedPriority === 'all') return true;
    return c.priority?.toLowerCase() === selectedPriority;
  });

  const validComplaints = filteredByPriority.filter(c => c.latitude && c.longitude);
  const mapCenter = validComplaints.length > 0 
    ? [validComplaints[0].latitude, validComplaints[0].longitude] 
    : [33.805787, 72.351681];

  // Count active complaints by priority
  const priorityCounts = {
    urgent: activeComplaints.filter(c => c.priority?.toLowerCase() === 'urgent').length,
    high: activeComplaints.filter(c => c.priority?.toLowerCase() === 'high').length,
    medium: activeComplaints.filter(c => c.priority?.toLowerCase() === 'medium').length,
    low: activeComplaints.filter(c => c.priority?.toLowerCase() === 'low').length
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return { bg: '#EF4444', text: '#EF4444', label: 'Urgent' };
      case 'high': return { bg: '#F59E0B', text: '#F59E0B', label: 'High' };
      case 'medium': return { bg: '#0A66FF', text: '#0A66FF', label: 'Medium' };
      default: return { bg: '#22C55E', text: '#22C55E', label: 'Low' };
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#0A66FF';
      default: return '#9CA3AF';
    }
  };

  if (loading) {
    return (
      <Box sx={{ pt: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#0A66FF' }} />
        <Typography sx={{ ml: 2, color: '#9CA3AF' }}>Loading map data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: '110px', p: 3 }}>
        <Container maxWidth="xl">
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Typography variant="h6" sx={{ color: '#EF4444' }}>Error loading map</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>{error}</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Complaint Map</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            {validComplaints.length} active complaints mapped • Color coded by priority
            {allComplaints.length - activeComplaints.length > 0 && 
              ` (${allComplaints.length - activeComplaints.length} completed in archive)`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={`All (${activeComplaints.length})`}
            onClick={() => setSelectedPriority('all')}
            sx={{
              bgcolor: selectedPriority === 'all' ? '#0A66FF' : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#0A66FF' }
            }}
          />
          <Chip
            label={`Urgent (${priorityCounts.urgent})`}
            onClick={() => setSelectedPriority('urgent')}
            sx={{
              bgcolor: selectedPriority === 'urgent' ? '#EF4444' : 'rgba(239,68,68,0.2)',
              color: selectedPriority === 'urgent' ? 'white' : '#F87171',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#EF4444', color: 'white' }
            }}
          />
          <Chip
            label={`High (${priorityCounts.high})`}
            onClick={() => setSelectedPriority('high')}
            sx={{
              bgcolor: selectedPriority === 'high' ? '#F59E0B' : 'rgba(245,158,11,0.2)',
              color: selectedPriority === 'high' ? 'white' : '#FBBF24',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#F59E0B', color: 'white' }
            }}
          />
          <Chip
            label={`Medium (${priorityCounts.medium})`}
            onClick={() => setSelectedPriority('medium')}
            sx={{
              bgcolor: selectedPriority === 'medium' ? '#0A66FF' : 'rgba(10,102,255,0.2)',
              color: selectedPriority === 'medium' ? 'white' : '#60A5FA',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#0A66FF', color: 'white' }
            }}
          />
          <Chip
            label={`Low (${priorityCounts.low})`}
            onClick={() => setSelectedPriority('low')}
            sx={{
              bgcolor: selectedPriority === 'low' ? '#22C55E' : 'rgba(34,197,94,0.2)',
              color: selectedPriority === 'low' ? 'white' : '#4ADE80',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#22C55E', color: 'white' }
            }}
          />
        </Box>

        <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(10,102,255,0.3)', height: '600px', width: '100%' }}>
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
            
            {validComplaints.map((complaint) => (
              <Marker 
                key={complaint.id} 
                position={[complaint.latitude, complaint.longitude]}
                icon={getMarkerIcon(complaint.priority)}
              >
                <Popup>
                  <Box sx={{ minWidth: 220, p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                      #{complaint.id} - {complaint.complaint_type?.replace('_', ' ')}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={complaint.priority?.toUpperCase()} size="small" sx={{ bgcolor: getPriorityColor(complaint.priority).bg, color: 'white', fontWeight: 600 }} />
                      <Chip label={complaint.status} size="small" sx={{ bgcolor: getStatusColor(complaint.status), color: 'white', fontWeight: 600 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 1 }}>
                      Fill Level: {complaint.fill_level_before || 0}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block' }}>
                      Location: {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 3, flexWrap: 'wrap' }}>
          <Tooltip title="Urgent - Immediate attention required">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#EF4444', boxShadow: '0 0 8px #EF4444' }} />
              <Typography variant="caption" sx={{ color: '#E5E7EB' }}>Urgent</Typography>
            </Box>
          </Tooltip>
          <Tooltip title="High priority - Schedule within 24 hours">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
              <Typography variant="caption" sx={{ color: '#E5E7EB' }}>High</Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Medium priority - Schedule within 48 hours">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#0A66FF', boxShadow: '0 0 8px #0A66FF' }} />
              <Typography variant="caption" sx={{ color: '#E5E7EB' }}>Medium</Typography>
            </Box>
          </Tooltip>
          <Tooltip title="Low priority - Schedule within 72 hours">
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
              <Typography variant="caption" sx={{ color: '#E5E7EB' }}>Low</Typography>
            </Box>
          </Tooltip>
        </Box>
      </Container>
    </Box>
  );
};

export default ComplaintMap;

