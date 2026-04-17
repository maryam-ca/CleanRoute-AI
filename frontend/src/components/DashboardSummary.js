import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Paper, Typography, Card, CardContent, 
  LinearProgress, Button, Chip, CircularProgress
} from '@mui/material';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const DashboardSummary = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    completed: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getComplaints();
      const allComplaints = Array.isArray(data) ? data : [];
      setComplaints(allComplaints);
      
      const total = allComplaints.length;
      const pending = allComplaints.filter(c => c.status === 'pending').length;
      const assigned = allComplaints.filter(c => c.status === 'assigned').length;
      const completed = allComplaints.filter(c => c.status === 'completed').length;
      const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
      
      setStats({ total, pending, assigned, completed, completionRate });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Data for pie chart
  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Assigned', value: stats.assigned, color: '#0A66FF' },
    { name: 'Completed', value: stats.completed, color: '#22C55E' }
  ].filter(item => item.value > 0);

  // Data for priority distribution
  const priorityData = [
    { name: 'Urgent', value: complaints.filter(c => c.priority === 'urgent' && c.status !== 'completed').length, color: '#EF4444' },
    { name: 'High', value: complaints.filter(c => c.priority === 'high' && c.status !== 'completed').length, color: '#F59E0B' },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'medium' && c.status !== 'completed').length, color: '#0A66FF' },
    { name: 'Low', value: complaints.filter(c => c.priority === 'low' && c.status !== 'completed').length, color: '#22C55E' }
  ].filter(item => item.value > 0);

  // Weekly trend data
  const getWeeklyTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayComplaints = complaints.filter(c => {
        const created = new Date(c.created_at);
        return created.toDateString() === date.toDateString();
      });
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        complaints: dayComplaints.length,
        completed: dayComplaints.filter(c => c.status === 'completed').length
      });
    }
    return last7Days;
  };

  const weeklyData = getWeeklyTrend();
  const slogan = stats.completionRate > 75 ? "🎉 Excellent progress! Keep up the great work!" :
                  stats.completionRate > 50 ? "👍 Good progress! You're on the right track!" :
                  stats.completionRate > 25 ? "📈 Making progress! Keep pushing forward!" :
                  "🚀 Let's get started! Every complaint matters!";

  if (loading) {
    return (
      <Box sx={{ pt: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#0A66FF' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: '110px', pb: 4 }}>
      <Toaster position="top-right" />
      
      {/* Welcome Header */}
      <Box sx={{ mx: { xs: 2, md: 3 }, py: 3, px: 4, border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)', mb: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
            Welcome back, {user || 'User'}! 👋
          </Typography>
          <Typography variant="body1" sx={{ color: '#9CA3AF', mt: 1 }}>
            {slogan}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip icon={<SpeedIcon />} label={`Completion Rate: ${stats.completionRate}%`} sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#22C55E' }} />
            <Chip icon={<TrendingUpIcon />} label={`Total Resolved: ${stats.completed}`} sx={{ bgcolor: 'rgba(0,198,255,0.2)', color: '#00C6FF' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)', textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#FFFFFF' }}>{stats.total}</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Total Complaints</Typography>
                <LinearProgress variant="determinate" value={100} sx={{ mt: 1, mx: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#F59E0B' }}>{stats.pending}</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Pending</Typography>
                <LinearProgress variant="determinate" value={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0} sx={{ mt: 1, mx: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B' } }} />
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.3)', textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#0A66FF' }}>{stats.assigned}</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Assigned</Typography>
                <LinearProgress variant="determinate" value={stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0} sx={{ mt: 1, mx: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#0A66FF' } }} />
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card sx={{ bgcolor: 'rgba(15,23,42,0.85)', border: '1px solid rgba(34,197,94,0.3)', textAlign: 'center', py: 2 }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: '#22C55E' }}>{stats.completed}</Typography>
                <Typography variant="body2" sx={{ color: '#9CA3AF' }}>Completed</Typography>
                <LinearProgress variant="determinate" value={stats.completionRate} sx={{ mt: 1, mx: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#22C55E' } }} />
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3}>
          {/* Pie Chart - Status Distribution */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2, textAlign: 'center' }}>
                  📊 Complaint Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} complaints`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    {stats.completed} out of {stats.total} complaints resolved
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#22C55E', display: 'block', mt: 1 }}>
                    🎯 {stats.completionRate}% Completion Rate
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Bar Chart - Priority Distribution */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2, textAlign: 'center' }}>
                  ⚡ Active Complaints by Priority
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94A3B8" />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" width={60} />
                    <Tooltip formatter={(value) => [`${value} complaints`, 'Count']} />
                    <Bar dataKey="value" fill="#0A66FF" radius={[0, 8, 8, 0]} barSize={30}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#EF4444' }}>
                    🔴 Urgent issues need immediate attention
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Weekly Trend Chart */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>
                  📈 Weekly Complaint Trend (Last 7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #0A66FF' }} />
                    <Legend />
                    <Line type="monotone" dataKey="complaints" stroke="#0A66FF" strokeWidth={3} name="New Complaints" dot={{ fill: '#0A66FF', r: 6 }} />
                    <Line type="monotone" dataKey="completed" stroke="#22C55E" strokeWidth={3} name="Resolved" dot={{ fill: '#22C55E', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                    📅 Tracking complaints over time to identify patterns
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Inspirational Message */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Paper sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, rgba(10,102,255,0.1), rgba(0,198,255,0.05))', border: '1px solid rgba(10,102,255,0.3)' }}>
            <Typography variant="body1" sx={{ color: '#00C6FF', fontWeight: 500 }}>
              "Every complaint resolved is a step towards a cleaner, healthier city. Keep up the great work! 🌍💚"
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardSummary;
