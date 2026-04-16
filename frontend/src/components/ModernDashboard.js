import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Button, Paper, IconButton } from '@mui/material';
import { Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import GlassCard from './GlassCard';
import api from '../services/api';

const ModernDashboard = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const complaintsData = await api.getComplaints();
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      const statsData = await api.getDashboardStats();
      setStats(statsData);
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

  return (
    <Box sx={{ minHeight: '100vh', pt: '70px', pb: 4 }}>
      <Toaster position="top-right" />
      
      <Container maxWidth="xl">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
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
              sx={{
                borderColor: '#2F80ED',
                color: '#2F80ED',
                borderRadius: '999px',
                '&:hover': { borderColor: '#00C6FF', backgroundColor: 'rgba(10,102,255,0.1)' }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => window.location.href = '/submit'}
              sx={{
                background: 'linear-gradient(135deg, #0A66FF, #00C6FF)',
                borderRadius: '999px',
                boxShadow: '0 0 20px rgba(0,198,255,0.3)',
                '&:hover': { boxShadow: '0 0 30px rgba(0,198,255,0.5)' }
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
                icon={<Typography variant="h5">{card.icon}</Typography>}
                loading={loading}
                trend={card.trend}
              />
            </Grid>
          ))}
        </Grid>

        {/* Recent Complaints */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Paper sx={{ p: 3, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 2 }}>
              Recent Complaints
            </Typography>
            
            {loading ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>Loading...</Typography>
              </Box>
            ) : complaints.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography sx={{ color: '#9CA3AF' }}>No complaints found</Typography>
              </Box>
            ) : (
              <Box>
                {complaints.slice(0, 5).map((complaint) => (
                  <Box
                    key={complaint.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#FFFFFF' }}>
                        #{complaint.id} - {complaint.complaint_type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        {complaint.status} • {complaint.priority}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ModernDashboard;
