import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  Chip, CircularProgress, Button, Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';

const TesterDashboard = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // First get the current user's ID
    const fetchUserAndTasks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Get testers list to find current user's ID
        const testersRes = await fetch('https://cleanroute-ai.onrender.com/api/users/testers/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const testers = await testersRes.json();
        
        const currentUser = testers.find(t => t.username === user);
        if (currentUser) {
          setUserId(currentUser.id);
          
          // Fetch complaints assigned to this user ID
          const complaintsRes = await fetch('https://cleanroute-ai.onrender.com/api/complaints/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const allComplaints = await complaintsRes.json();
          
          const myTasks = allComplaints.filter(c => 
            c.assigned_to === currentUser.id && c.status !== 'completed'
          );
          setTasks(myTasks);
          
          if (myTasks.length > 0) {
            toast.success(`You have ${myTasks.length} assigned tasks`);
          }
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndTasks();
  }, [user]);

  const completeTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://cleanroute-ai.onrender.com/api/complaints/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
      toast.success('Task marked as completed!');
      // Refresh tasks
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#0A66FF';
      default: return '#22C55E';
    }
  };

  if (loading) {
    return (
      <Box sx={{ pt: '110px', display: 'flex', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#0A66FF' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
            📋 My Tasks ({tasks.length})
          </Typography>
          <Button startIcon={<RefreshIcon />} onClick={() => window.location.reload()} variant="outlined">
            Refresh
          </Button>
        </Box>

        {tasks.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
            <CheckIcon sx={{ fontSize: 64, color: '#22C55E', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>No pending tasks</Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Great job! All assigned complaints have been completed.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {tasks.map((task) => (
              <Grid item xs={12} md={6} lg={4} key={task.id}>
                <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: `1px solid ${getPriorityColor(task.priority)}40`, borderRadius: 3 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip label={`#${task.id}`} size="small" sx={{ bgcolor: 'rgba(10,102,255,0.2)', color: '#0A66FF' }} />
                      <Chip label={task.priority?.toUpperCase()} size="small" sx={{ bgcolor: getPriorityColor(task.priority), color: 'white' }} />
                    </Box>
                    
                    <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                      {task.complaint_type?.replace('_', ' ')}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2 }}>
                      {task.description || 'No description provided'}
                    </Typography>
                    
                    <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.1)' }} />
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LocationIcon sx={{ fontSize: 16, color: '#00C6FF' }} />
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {task.latitude?.toFixed(4)}, {task.longitude?.toFixed(4)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" sx={{ color: '#22C55E', display: 'block', mb: 2 }}>
                      Fill Level: {task.fill_level_before || 0}%
                    </Typography>
                    
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<CheckIcon />}
                      onClick={() => completeTask(task.id)}
                      sx={{ borderRadius: '999px', bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' } }}
                    >
                      Mark Complete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default TesterDashboard;
