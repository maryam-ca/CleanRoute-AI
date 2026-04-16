import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Button, Paper, IconButton, Chip } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import GlassCard from './GlassCard';
import api from '../services/api';

const ModernDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const assigned = complaints.filter(c => c.status === 'assigned').length;
  const completed = complaints.filter(c => c.status === 'completed').length;

  const statsCards = [
    { title: 'Total Complaints', value: total, color: '#FFFFFF', icon: '📋', trend: 12 },
    { title: 'Pending', value: pending, color: '#F59E0B', icon: '⏳', trend: -5 },
    { title: 'Assigned', value: assigned, color: '#0A66FF', icon: '🚛', trend: 8 },
    { title: 'Completed', value: completed, color: '#22C55E', icon: '✅', trend: 15 },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' };
      case 'assigned': return { bg: 'rgba(10,102,255,0.15)', text: '#0A66FF' };
      case 'completed': return { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' };
      default: return { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' };
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' };
      case 'high': return { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' };
      case 'medium': return { bg: 'rgba(10,102,255,0.15)', text: '#0A66FF' };
      default: return { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pt: '80px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
              Welcome back, {user}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
              sx={{
                borderColor: '#2F80ED',
                color: '#2F80ED',
                borderRadius: '999px',
                px: 3,
                '&:hover': { 
                  borderColor: '#00C6FF', 
                  backgroundColor: 'rgba(10,102,255,0.1)',
                  color: '#00C6FF'
                }
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => window.location.href = '/submit'}
              sx={{
                background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
                borderRadius: '999px',
                px: 3,
                boxShadow: '0 0 20px rgba(0,198,255,0.3)',
                '&:hover': { 
                  boxShadow: '0 0 30px rgba(0,198,255,0.5)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              New Complaint
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <GlassCard
                title={card.title}
                value={card.value}
                color={card.color}
                icon={card.icon}
                loading={loading}
                trend={card.trend}
              />
            </Grid>
          ))}
        </Grid>

        {/* Recent Complaints */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: '20px', 
            background: 'rgba(15, 23, 42, 0.95)', 
            backdropFilter: 'blur(12px)', 
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                Recent Complaints
              </Typography>
              <Button 
                size="small" 
                onClick={() => window.location.href = '/admin'}
                sx={{ color: '#00C6FF', textTransform: 'none' }}
              >
                View All →
              </Button>
            </Box>
            
            {loading ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>Loading complaints...</Typography>
              </Box>
            ) : complaints.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>No complaints found</Typography>
                <Button 
                  variant="contained" 
                  onClick={() => window.location.href = '/submit'}
                  sx={{ mt: 2, borderRadius: '999px', background: 'linear-gradient(135deg, #0A66FF, #00C6FF)' }}
                >
                  Submit First Complaint
                </Button>
              </Box>
            ) : (
              <Box>
                {complaints.slice(0, 5).map((complaint) => {
                  const statusStyle = getStatusColor(complaint.status);
                  const priorityStyle = getPriorityColor(complaint.priority);
                  return (
                    <Box
                      key={complaint.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        flexWrap: 'wrap',
                        gap: 1,
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#FFFFFF' }}>
                          #{complaint.id} - {complaint.complaint_type?.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Box display="flex" gap={1} mt={0.5}>
                          <Chip 
                            label={complaint.status} 
                            size="small"
                            sx={{ 
                              bgcolor: statusStyle.bg, 
                              color: statusStyle.text,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: '22px'
                            }} 
                          />
                          <Chip 
                            label={complaint.priority} 
                            size="small"
                            sx={{ 
                              bgcolor: priorityStyle.bg, 
                              color: priorityStyle.text,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: '22px'
                            }} 
                          />
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ModernDashboard;
