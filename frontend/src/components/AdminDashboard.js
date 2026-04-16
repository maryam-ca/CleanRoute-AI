import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [testers, setTesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTester, setSelectedTester] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'assigned', 'completed'

  useEffect(() => {
    fetchData();
    fetchTesters();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchTesters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/testers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTesters(Array.isArray(data) ? data : []);
      } else {
        setTesters([
          { id: 1, username: 'tester1', email: 'tester1@example.com' },
          { id: 2, username: 'tester2', email: 'tester2@example.com' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching testers:', error);
      setTesters([
        { id: 1, username: 'tester1', email: 'tester1@example.com' },
        { id: 2, username: 'tester2', email: 'tester2@example.com' }
      ]);
    }
  };

  const handleAssign = async () => {
    if (!selectedTester) {
      toast.error('Please select a tester');
      return;
    }
    
    setAssigning(true);
    try {
      const result = await api.assignComplaint(selectedComplaint.id, selectedTester);
      toast.success(`Complaint #${selectedComplaint.id} assigned to ${selectedTester}`);
      setSelectedComplaint(null);
      setSelectedTester('');
      fetchData();
    } catch (error) {
      console.error('Assign error:', error);
      toast.error(error.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  const handleFilterClick = (status) => {
    setFilterStatus(status);
  };

  // Filter complaints based on selected status
  const filteredComplaints = complaints.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const assigned = complaints.filter(c => c.status === 'assigned').length;
  const completed = complaints.filter(c => c.status === 'completed').length;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#0A66FF';
      default: return '#22C55E';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#F59E0B';
      case 'assigned': return '#0A66FF';
      case 'completed': return '#22C55E';
      default: return '#9CA3AF';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)' }}>
        <Container maxWidth="xl">
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>Admin Dashboard</Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Manage complaints, assign testers, and track progress</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards - Clickable */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card 
              onClick={() => handleFilterClick('all')}
              sx={{ 
                bgcolor: filterStatus === 'all' ? 'rgba(10,102,255,0.2)' : 'rgba(255,255,255,0.05)',
                border: filterStatus === 'all' ? '2px solid #0A66FF' : '1px solid rgba(10,102,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', bgcolor: 'rgba(10,102,255,0.15)' }
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Total Complaints</Typography>
                <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 800 }}>{total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card 
              onClick={() => handleFilterClick('pending')}
              sx={{ 
                bgcolor: filterStatus === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                border: filterStatus === 'pending' ? '2px solid #F59E0B' : '1px solid rgba(10,102,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', bgcolor: 'rgba(245,158,11,0.1)' }
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Pending</Typography>
                <Typography variant="h4" sx={{ color: '#F59E0B', fontWeight: 800 }}>{pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card 
              onClick={() => handleFilterClick('assigned')}
              sx={{ 
                bgcolor: filterStatus === 'assigned' ? 'rgba(10,102,255,0.2)' : 'rgba(255,255,255,0.05)',
                border: filterStatus === 'assigned' ? '2px solid #0A66FF' : '1px solid rgba(10,102,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', bgcolor: 'rgba(10,102,255,0.1)' }
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Assigned</Typography>
                <Typography variant="h4" sx={{ color: '#0A66FF', fontWeight: 800 }}>{assigned}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card 
              onClick={() => handleFilterClick('completed')}
              sx={{ 
                bgcolor: filterStatus === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                border: filterStatus === 'completed' ? '2px solid #22C55E' : '1px solid rgba(10,102,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)', bgcolor: 'rgba(34,197,94,0.1)' }
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Completed</Typography>
                <Typography variant="h4" sx={{ color: '#22C55E', fontWeight: 800 }}>{completed}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter Indicator */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterIcon sx={{ color: '#00C6FF', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              {filterStatus === 'all' ? 'Showing all complaints' : `Showing ${filterStatus} complaints only`}
            </Typography>
            {filterStatus !== 'all' && (
              <Chip 
                label="Clear Filter" 
                size="small" 
                onClick={() => handleFilterClick('all')}
                sx={{ cursor: 'pointer', bgcolor: 'rgba(10,102,255,0.2)', color: '#00C6FF' }}
              />
            )}
          </Box>
          <Button startIcon={<RefreshIcon />} onClick={fetchData} variant="contained" size="small">
            Refresh
          </Button>
        </Box>

        {/* Complaints Table */}
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              {filterStatus === 'all' ? 'All Complaints' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Complaints`}
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: '#0A66FF' }} /></Box>
          ) : filteredComplaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#9CA3AF' }}>No {filterStatus !== 'all' ? filterStatus : ''} complaints found</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
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
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>#{complaint.id}</TableCell>
                      <TableCell>{complaint.complaint_type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={complaint.priority} 
                          sx={{ bgcolor: getPriorityColor(complaint.priority), color: 'white' }} 
                        />
                      </TableCell>
                      <TableCell>
                        {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <Chip label={`${complaint.fill_level_before || 0}%`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={complaint.status} 
                          sx={{ bgcolor: getStatusColor(complaint.status), color: 'white' }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        {complaint.status === 'pending' && (
                          <Button 
                            variant="contained"
                            startIcon={<AssignIcon />} 
                            onClick={() => setSelectedComplaint(complaint)} 
                            size="small"
                          >
                            Assign
                          </Button>
                        )}
                        {complaint.status === 'assigned' && (
                          <Chip label="Assigned" size="small" sx={{ bgcolor: '#0A66FF', color: 'white' }} />
                        )}
                        {complaint.status === 'completed' && (
                          <Chip label="Completed" size="small" sx={{ bgcolor: '#22C55E', color: 'white' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Assign Dialog */}
      <Dialog open={!!selectedComplaint} onClose={() => { setSelectedComplaint(null); setSelectedTester(''); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'rgba(10,102,255,0.15)', color: '#FFFFFF' }}>
          Assign Complaint #{selectedComplaint?.id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              <strong>Complaint Details:</strong><br />
              Type: {selectedComplaint?.complaint_type}<br />
              Priority: {selectedComplaint?.priority}<br />
              Fill Level: {selectedComplaint?.fill_level_before}%
            </Alert>
            
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9CA3AF' }}>Select Tester</InputLabel>
              <Select
                value={selectedTester}
                onChange={(e) => setSelectedTester(e.target.value)}
                label="Select Tester"
                sx={{ color: '#FFFFFF' }}
              >
                {testers.map((tester) => (
                  <MenuItem key={tester.id || tester.username} value={tester.username}>
                    {tester.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => { setSelectedComplaint(null); setSelectedTester(''); }} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            variant="contained" 
            disabled={!selectedTester || assigning}
          >
            {assigning ? 'Assigning...' : 'Assign to Tester'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
