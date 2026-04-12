import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, CircularProgress, Alert, AppBar, Toolbar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const TesterDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [afterImage, setAfterImage] = useState(null);

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const fetchAssignedComplaints = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      const assignedComplaints = complaintsData.filter(c => c.status === 'assigned');
      setComplaints(assignedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!afterImage) {
      toast.error('Please upload after-cleaning photo');
      return;
    }
    
    const formData = new FormData();
    formData.append('after_image', afterImage);
    
    try {
      const result = await api.markCompleted(selectedComplaint.id, formData);
      toast.success(`Complaint #${selectedComplaint.id} completed! Waste reduced by ${result.reduction}%`);
      setSelectedComplaint(null);
      setAfterImage(null);
      fetchAssignedComplaints();
    } catch (error) {
      toast.error('Failed to mark completed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    toast.success('Logged out successfully');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#D32F2F';
      case 'high': return '#F57C00';
      case 'medium': return '#FBC02D';
      default: return '#4CAF50';
    }
  };

  return (
    <Box sx={{ bgcolor: '#F1F8E9', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <AppBar position="static" sx={{ bgcolor: '#1B5E20' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Tester Dashboard - Assigned Complaints
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Assigned to Me ({complaints.length})</Typography>
            <Button startIcon={<RefreshIcon />} onClick={fetchAssignedComplaints} variant="contained" sx={{ bgcolor: '#4CAF50' }}>
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#4CAF50' }} /></Box>
          ) : complaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>No assigned complaints. Wait for admin to assign.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#E8F5E9' }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>{complaint.complaint_type}</TableCell>
                      <TableCell>
                        <Chip label={complaint.priority} sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                      </TableCell>
                      <TableCell>{complaint.latitude}, {complaint.longitude}</TableCell>
                      <TableCell>{complaint.description}</TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<CheckIcon />} onClick={() => setSelectedComplaint(complaint)} sx={{ bgcolor: '#4CAF50', color: 'white' }}>
                          Complete
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

      {/* Complete Dialog */}
      <Dialog open={!!selectedComplaint} onClose={() => { setSelectedComplaint(null); setAfterImage(null); }}>
        <DialogTitle>Complete Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label" sx={{ mt: 2, py: 2, width: '100%' }}>
            📸 Upload After-Cleaning Photo
            <input type="file" accept="image/*" hidden onChange={(e) => setAfterImage(e.target.files[0])} />
          </Button>
          {afterImage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Photo selected: {afterImage.name}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelectedComplaint(null); setAfterImage(null); }}>Cancel</Button>
          <Button onClick={handleMarkCompleted} variant="contained" sx={{ bgcolor: '#4CAF50' }}>Mark Completed</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TesterDashboard;
