import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, AppBar, Toolbar, IconButton, useMediaQuery, useTheme,
  Tabs, Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const TesterDashboard = ({ token, user, setToken }) => {
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const fetchAllComplaints = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setAllComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!afterImage) {
      toast.error('Please upload after-cleaning photo');
      return;
    }
    
    setSubmitting(true);
    const formData = new FormData();
    formData.append('after_image', afterImage);
    
    try {
      const result = await api.completeByTester(selectedComplaint.id, formData);
      toast.success(`✅ Complaint #${selectedComplaint.id} completed! Waste reduced by ${result.reduction}%`);
      setSelectedComplaint(null);
      setAfterImage(null);
      fetchAllComplaints();
    } catch (error) {
      toast.error('Failed to mark completed');
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#4CAF50';
      case 'assigned': return '#FF9800';
      case 'pending': return '#F44336';
      case 'closed': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'assigned': return <AssignmentIcon sx={{ fontSize: 14 }} />;
      case 'completed': return <DoneAllIcon sx={{ fontSize: 14 }} />;
      default: return null;
    }
  };

  const assignedComplaints = allComplaints.filter(c => c.status === 'assigned');
  const otherComplaints = allComplaints.filter(c => c.status !== 'assigned');

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      <AppBar position="sticky" sx={{ bgcolor: '#1B5E20' }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Tester Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => { localStorage.clear(); setToken(null); }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Stats Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: '#2E7D32', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Total Complaints</Typography>
                <Typography variant="h4">{allComplaints.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FF9800', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Assigned to Me</Typography>
                <Typography variant="h4">{assignedComplaints.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: '#4CAF50', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">Completed by Me</Typography>
                <Typography variant="h4">{allComplaints.filter(c => c.status === 'completed').length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: '#9C27B0', color: 'white' }}>
              <CardContent>
                <Typography variant="caption">My Resolution Rate</Typography>
                <Typography variant="h4">
                  {assignedComplaints.length > 0 
                    ? Math.round((allComplaints.filter(c => c.status === 'completed').length / assignedComplaints.length) * 100) 
                    : 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 4, mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, pt: 1 }}>
            <Tab label={`Assigned to Me (${assignedComplaints.length})`} />
            <Tab label={`All Complaints (${allComplaints.length})`} />
          </Tabs>
        </Paper>

        {/* Assigned Complaints Table */}
        {tabValue === 0 && (
          <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Tasks Assigned to Me</Typography>
              <Button startIcon={<RefreshIcon />} onClick={fetchAllComplaints} variant="contained" sx={{ bgcolor: '#2E7D32' }}>
                Refresh
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#2E7D32' }} /></Box>
            ) : assignedComplaints.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>No assigned tasks. Wait for admin to assign.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Fill Level</TableCell>
                      <TableCell>Actions</TableCell>
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
                            {complaint.latitude}, {complaint.longitude}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${complaint.fill_level_before || 0}%`} size="small" />
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="contained"
                            startIcon={<CheckIcon />} 
                            onClick={() => setSelectedComplaint(complaint)} 
                            sx={{ bgcolor: '#2E7D32' }}
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
        )}

        {/* All Complaints Table (Read-only) */}
        {tabValue === 1 && (
          <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">All Complaints (Read-only)</Typography>
            </Box>
            
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#2E7D32' }} /></Box>
            ) : (
              <TableContainer>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {otherComplaints.map((complaint) => (
                      <TableRow key={complaint.id} hover>
                        <TableCell>#{complaint.id}</TableCell>
                        <TableCell>{complaint.complaint_type}</TableCell>
                        <TableCell>
                          <Chip label={complaint.priority} sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {getStatusIcon(complaint.status)}
                            <Chip label={complaint.status} sx={{ bgcolor: getStatusColor(complaint.status), color: 'white' }} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          {complaint.latitude}, {complaint.longitude}
                        </TableCell>
                        <TableCell>{formatDate(complaint.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Container>

      {/* Complete Dialog */}
      <Dialog open={!!selectedComplaint} onClose={() => { setSelectedComplaint(null); setAfterImage(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Task - Complaint #{selectedComplaint?.id}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom sx={{ mt: 1 }}>
            📍 Location: {selectedComplaint?.latitude}, {selectedComplaint?.longitude}
          </Typography>
          <Typography variant="body2" gutterBottom>
            🗑️ Current Fill Level: {selectedComplaint?.fill_level_before}%
          </Typography>
          <Button 
            variant="outlined" 
            component="label" 
            sx={{ mt: 2, py: 2, width: '100%' }}
          >
            📸 Upload After-Cleaning Photo (Required)
            <input type="file" accept="image/*" hidden onChange={(e) => setAfterImage(e.target.files[0])} />
          </Button>
          {afterImage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ Photo selected: {afterImage.name}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelectedComplaint(null); setAfterImage(null); }}>Cancel</Button>
          <Button 
            onClick={handleComplete} 
            variant="contained" 
            disabled={!afterImage || submitting}
            sx={{ bgcolor: '#2E7D32' }}
          >
            {submitting ? 'Processing...' : 'Complete Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TesterDashboard;
