import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';

const WorkingDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading complaints...');
      const data = await api.getComplaints();
      console.log('Data received:', data);
      
      if (data && Array.isArray(data)) {
        setComplaints(data);
      } else if (data && data.results) {
        setComplaints(data.results);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('Load error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography ml={2}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <button onClick={loadData}>Retry</button>
        }>
          Error: {error}
        </Alert>
      </Container>
    );
  }

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const assigned = complaints.filter(c => c.status === 'assigned').length;
  const completed = complaints.filter(c => c.status === 'completed').length;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user || 'Admin'}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Waste Management Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Complaints</Typography>
              <Typography variant="h3">{total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Pending</Typography>
              <Typography variant="h3" color="warning.main">{pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Assigned</Typography>
              <Typography variant="h3" color="info.main">{assigned}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Completed</Typography>
              <Typography variant="h3" color="success.main">{completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Recent Complaints ({complaints.length})
      </Typography>
      
      <Grid container spacing={2}>
        {complaints.slice(0, 5).map((complaint) => (
          <Grid item xs={12} key={complaint.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">
                  #{complaint.id} - {complaint.complaint_type || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Priority: {complaint.priority || 'N/A'} | Status: {complaint.status || 'pending'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default WorkingDashboard;
