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
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const TesterDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      console.log('Fetched complaints:', complaintsData);
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      const statsData = await api.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      toast.success(`✅ Task completed! Waste reduced by ${result.reduction}%`);
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
    switch(priority) {
      case 'urgent': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const assignedComplaints = complaints.filter(c => c.status === 'assigned');

  return (
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', pt: '110px' }}>
      <Toaster position="top-right" />

      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, color: 'white', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(79, 140, 255, 0.16) 0%, rgba(15, 23, 42, 0.18) 100%)' }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Tester Panel</Typography>
          <Typography variant="caption" sx={{ color: '#cdd8ee' }}>View and complete the tasks assigned to you</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={4}>
            <Card sx={{ bgcolor: 'rgba(34, 197, 94, 0.18)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Assigned to Me</Typography>
                <Typography variant="h3">{assignedComplaints.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <Card sx={{ bgcolor: 'rgba(245, 158, 11, 0.18)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">In Progress</Typography>
                <Typography variant="h3">{complaints.filter(c => c.status === 'assigned').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={4}>
            <Card sx={{ bgcolor: 'rgba(96, 165, 250, 0.18)', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Completed</Typography>
                <Typography variant="h3">{complaints.filter(c => c.status === 'completed').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tasks Table */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: '#f8fbff' }}>Tasks Assigned to Me</Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained">
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#2E7D32' }} /></Box>
          ) : assignedComplaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>No tasks assigned to you. Wait for admin to assign.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.04)' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Fill Level</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedComplaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>{complaint.complaint_type}</TableCell>
                      <TableCell>
                        <Chip label={complaint.priority} sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationIcon sx={{ fontSize: 14 }} />
                          {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${complaint.fill_level_before || 0}%`} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="contained"
                          startIcon={<CheckIcon />} 
                          onClick={() => setSelectedComplaint(complaint)} 
                          sx={{ minWidth: 140 }}
                        >
                          Complete Task
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Complete Task Dialog */}
      <Dialog open={!!selectedComplaint} onClose={() => { setSelectedComplaint(null); setAfterImage(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'rgba(79, 140, 255, 0.16)', color: 'white' }}>
          Complete Task - Complaint #{selectedComplaint?.id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Location:</strong> {selectedComplaint?.latitude}, {selectedComplaint?.longitude}<br />
              <strong>Current Fill Level:</strong> {selectedComplaint?.fill_level_before}%
            </Alert>
            
            <Button 
              variant="outlined" 
              component="label" 
              startIcon={<UploadIcon />}
              sx={{ py: 2, width: '100%' }}
            >
              Upload After-Cleaning Photo (Required)
              <input type="file" accept="image/*" hidden onChange={(e) => setAfterImage(e.target.files[0])} />
            </Button>
            
            {afterImage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✅ Photo selected: {afterImage.name}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setSelectedComplaint(null); setAfterImage(null); }} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteTask} 
            variant="contained" 
            disabled={!afterImage || submitting}
          >
            {submitting ? 'Processing...' : 'Confirm Completion'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TesterDashboard;


