import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, useMediaQuery, useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  LocationOn as LocationIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const TesterDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use the dedicated my_tasks endpoint
      const tasks = await api.getMyTasks();
      console.log('📋 My Tasks:', tasks);
      setComplaints(Array.isArray(tasks) ? tasks : []);
      
      if (tasks.length === 0) {
        toast.info('No tasks assigned to you yet');
      } else {
        toast.success(`${tasks.length} tasks assigned`);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!afterImage) {
      toast.error('Please upload after-cleaning photo');
      return;
    }
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append('after_image', afterImage);
    
    try {
      const result = await api.completeTask(selectedComplaint.id, formData);
      toast.success(`✅ Task completed! Waste reduced by ${result.reduction || 24}%`);
      setSelectedComplaint(null);
      setAfterImage(null);
      fetchData();
    } catch (error) {
      console.error('Complete task error:', error);
      toast.error(error.message || 'Failed to complete task');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#0A66FF';
      default: return '#22C55E';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'assigned': return '#0A66FF';
      case 'completed': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  const totalAssigned = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'assigned').length;
  const completed = complaints.filter(c => c.status === 'completed').length;

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)', backdropFilter: 'blur(12px)' }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>📋 My Tasks</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>View and complete tasks assigned to you</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(10,102,255,0.2)' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Assigned to Me</Typography>
                <Typography variant="h3" sx={{ color: '#0A66FF', fontWeight: 800 }}>{totalAssigned}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(10,102,255,0.2)' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>In Progress</Typography>
                <Typography variant="h3" sx={{ color: '#F59E0B', fontWeight: 800 }}>{inProgress}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(10,102,255,0.2)' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Completed</Typography>
                <Typography variant="h3" sx={{ color: '#22C55E', fontWeight: 800 }}>{completed}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>Tasks Assigned to Me</Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#0A66FF' }} />
            </Box>
          ) : complaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#9CA3AF' }}>No tasks assigned to you yet</Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', mt: 1, display: 'block' }}>
                Ask an admin to assign complaints to you
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(10,102,255,0.1)' }}>
                    <TableCell sx={{ color: '#FFFFFF' }}>ID</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Type</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Priority</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Location</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Fill Level</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>Status</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>{complaint.complaint_type?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Chip label={complaint.priority} size="small" sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                            {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${complaint.fill_level_before || 0}%`} size="small" sx={{ bgcolor: 'rgba(0,198,255,0.2)', color: '#00C6FF' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={complaint.status} size="small" sx={{ bgcolor: getStatusColor(complaint.status), color: 'white' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Button variant="outlined" size="small" startIcon={<ViewIcon />} onClick={() => setViewDetails(complaint)} sx={{ borderRadius: '999px' }}>
                            View
                          </Button>
                          {complaint.status === 'assigned' && (
                            <Button variant="contained" size="small" startIcon={<CheckIcon />} onClick={() => setSelectedComplaint(complaint)} sx={{ borderRadius: '999px' }}>
                              Complete
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetails} onClose={() => setViewDetails(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'rgba(10,102,255,0.15)', color: '#FFFFFF' }}>Complaint #{viewDetails?.id} Details</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Complaint Type</Typography>
                <Typography variant="body1" sx={{ color: '#FFFFFF' }}>{viewDetails?.complaint_type?.replace('_', ' ')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Priority</Typography>
                <Chip label={viewDetails?.priority} sx={{ bgcolor: getPriorityColor(viewDetails?.priority), color: 'white' }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Fill Level</Typography>
                <Typography variant="body1" sx={{ color: '#00C6FF' }}>{viewDetails?.fill_level_before}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Status</Typography>
                <Chip label={viewDetails?.status} sx={{ bgcolor: getStatusColor(viewDetails?.status), color: 'white' }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Location</Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{viewDetails?.latitude}, {viewDetails?.longitude}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Description</Typography>
                <Typography variant="body2" sx={{ color: '#E5E7EB' }}>{viewDetails?.description || 'No description provided'}</Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDetails(null)} variant="outlined" sx={{ borderRadius: '999px' }}>Close</Button>
          {viewDetails?.status === 'assigned' && (
            <Button onClick={() => { setSelectedComplaint(viewDetails); setViewDetails(null); }} variant="contained" sx={{ borderRadius: '999px' }}>
              Complete Task
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Complete Task Dialog */}
      <Dialog open={!!selectedComplaint} onClose={() => { setSelectedComplaint(null); setAfterImage(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'rgba(10,102,255,0.15)', color: '#FFFFFF' }}>Complete Task - Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              <strong>📍 Location:</strong> {selectedComplaint?.latitude}, {selectedComplaint?.longitude}<br />
              <strong>📊 Fill Level:</strong> {selectedComplaint?.fill_level_before}%<br />
              <strong>⚠️ Priority:</strong> {selectedComplaint?.priority?.toUpperCase()}
            </Alert>
            <Button variant="contained" component="label" startIcon={<UploadIcon />} sx={{ py: 2, width: '100%', borderRadius: '999px' }}>
              Upload After-Cleaning Photo (Required)
              <input type="file" accept="image/*" hidden onChange={(e) => setAfterImage(e.target.files[0])} />
            </Button>
            {afterImage && <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>✅ Photo selected: {afterImage.name}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setSelectedComplaint(null); setAfterImage(null); }} variant="outlined" sx={{ borderRadius: '999px' }}>Cancel</Button>
          <Button onClick={handleCompleteTask} variant="contained" disabled={!afterImage || submitting} sx={{ borderRadius: '999px' }}>
            {submitting ? 'Processing...' : 'Confirm Completion'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TesterDashboard;


