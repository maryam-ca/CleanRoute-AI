import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  LinearProgress,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Insights as InsightsIcon,
  TaskAlt as TaskAltIcon,
  Autorenew as AutorenewIcon
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
      const pending = allComplaints.filter((c) => c.status === 'pending').length;
      const assigned = allComplaints.filter((c) => c.status === 'assigned').length;
      const completed = allComplaints.filter((c) => c.status === 'completed').length;
      const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

      setStats({ total, pending, assigned, completed, completionRate });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
    { name: 'Assigned', value: stats.assigned, color: '#0A66FF' },
    { name: 'Completed', value: stats.completed, color: '#22C55E' }
  ].filter((item) => item.value > 0);

  const priorityData = [
    { name: 'Urgent', value: complaints.filter((c) => c.priority === 'urgent' && c.status !== 'completed').length, color: '#EF4444' },
    { name: 'High', value: complaints.filter((c) => c.priority === 'high' && c.status !== 'completed').length, color: '#F59E0B' },
    { name: 'Medium', value: complaints.filter((c) => c.priority === 'medium' && c.status !== 'completed').length, color: '#0A66FF' },
    { name: 'Low', value: complaints.filter((c) => c.priority === 'low' && c.status !== 'completed').length, color: '#22C55E' }
  ].filter((item) => item.value > 0);

  const getWeeklyTrend = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayComplaints = complaints.filter((c) => {
        const created = new Date(c.created_at);
        return created.toDateString() === date.toDateString();
      });
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        complaints: dayComplaints.length,
        completed: dayComplaints.filter((c) => c.status === 'completed').length
      });
    }
    return last7Days;
  };

  const weeklyData = getWeeklyTrend();
  const slogan = stats.completionRate > 75 ? '🎉 Excellent progress! Keep up the great work!' :
    stats.completionRate > 50 ? "👍 Good progress! You're on the right track!" :
      stats.completionRate > 25 ? '📈 Making progress! Keep pushing forward!' :
        "🚀 Let's get started! Every complaint matters!";
  const activeCases = stats.pending + stats.assigned;
  const topPriority = priorityData[0]?.name || 'Stable';

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      subtitle: 'All reported cases in the system',
      eyebrow: 'System Load',
      accent: '#D8FF72',
      glow: 'rgba(216,255,114,0.24)',
      progress: 100,
      icon: <InsightsIcon sx={{ color: '#D8FF72' }} />,
      footer: `${activeCases} active right now`
    },
    {
      title: 'Pending',
      value: stats.pending,
      subtitle: 'Waiting for dispatch or review',
      eyebrow: 'Queue',
      accent: '#F59E0B',
      glow: 'rgba(245,158,11,0.22)',
      progress: stats.total > 0 ? (stats.pending / stats.total) * 100 : 0,
      icon: <AutorenewIcon sx={{ color: '#F59E0B' }} />,
      footer: `${stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total cases`
    },
    {
      title: 'Assigned',
      value: stats.assigned,
      subtitle: 'Currently routed to field teams',
      eyebrow: 'In Motion',
      accent: '#36C4FF',
      glow: 'rgba(54,196,255,0.22)',
      progress: stats.total > 0 ? (stats.assigned / stats.total) * 100 : 0,
      icon: <TrendingUpIcon sx={{ color: '#36C4FF' }} />,
      footer: `${topPriority} is the top active priority`
    },
    {
      title: 'Completed',
      value: stats.completed,
      subtitle: 'Resolved and closed successfully',
      eyebrow: 'Resolved',
      accent: '#53D769',
      glow: 'rgba(83,215,105,0.24)',
      progress: Number(stats.completionRate),
      icon: <TaskAltIcon sx={{ color: '#53D769' }} />,
      footer: `${stats.completionRate}% completion rate`
    }
  ];

  const dashboardCardSx = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 6,
    border: '1px solid rgba(139,225,255,0.18)',
    background: 'linear-gradient(180deg, rgba(10, 28, 57, 0.88) 0%, rgba(7, 21, 42, 0.94) 100%)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 28px 55px rgba(3,12,25,0.28)'
  };

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

      <Box
        sx={{
          mx: { xs: 2, md: 3 },
          py: 3.5,
          px: 4,
          border: '1px solid rgba(139,225,255,0.22)',
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(15,78,148,0.36) 0%, rgba(19,107,89,0.22) 58%, rgba(7,22,43,0.45) 100%)',
          backdropFilter: 'blur(16px)',
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 48% 20%, rgba(255,244,173,0.16), transparent 18%), radial-gradient(circle at 88% 12%, rgba(54,196,255,0.16), transparent 18%)' }} />
        <Container maxWidth="xl">
          <Typography variant="overline" sx={{ color: '#D8FF72', fontWeight: 800, letterSpacing: '0.18em' }}>
            Live Operations Command
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', position: 'relative' }}>
            Welcome back, {user || 'User'}
          </Typography>
          <Typography variant="body1" sx={{ color: '#DDEDF8', mt: 1, maxWidth: 760, position: 'relative' }}>
            {slogan}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip icon={<SpeedIcon />} label={`Completion Rate: ${stats.completionRate}%`} sx={{ bgcolor: 'rgba(83,215,105,0.18)', color: '#D8FF72', border: '1px solid rgba(216,255,114,0.18)' }} />
            <Chip icon={<TrendingUpIcon />} label={`Total Resolved: ${stats.completed}`} sx={{ bgcolor: 'rgba(54,196,255,0.16)', color: '#74DDFF', border: '1px solid rgba(116,221,255,0.18)' }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.1 }}>
                <Card
                  sx={{
                    ...dashboardCardSx,
                    minHeight: 230,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: '0 auto auto 0',
                      width: '100%',
                      height: 4,
                      background: `linear-gradient(90deg, ${card.accent}, transparent)`
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: -40,
                      top: -30,
                      width: 130,
                      height: 130,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`
                    }
                  }}
                >
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                      <Box>
                        <Typography variant="overline" sx={{ color: card.accent, letterSpacing: '0.16em', fontWeight: 800 }}>
                          {card.eyebrow}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, lineHeight: 1.15 }}>
                          {card.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: '16px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.06)',
                          border: `1px solid ${card.glow}`
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>

                    <Typography variant="h2" sx={{ fontWeight: 800, color: card.accent, lineHeight: 0.95, mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#BDD8EB', mb: 3, maxWidth: 220 }}>
                      {card.subtitle}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#DDEDF8' }}>
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: card.accent, fontWeight: 700 }}>
                          {Math.round(card.progress)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={card.progress}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: 'rgba(255,255,255,0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${card.accent}, rgba(255,255,255,0.92))`
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#8FB9D3' }}>
                        {card.footer}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <Paper sx={{ ...dashboardCardSx, p: 3.5, minHeight: 420 }}>
                <Chip
                  icon={<CheckIcon />}
                  label="Operations Snapshot"
                  sx={{
                    mb: 2,
                    bgcolor: 'rgba(216,255,114,0.12)',
                    color: '#D8FF72',
                    border: '1px solid rgba(216,255,114,0.2)'
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1.5 }}>
                  Smarter routing needs better visual hierarchy too.
                </Typography>
                <Typography variant="body2" sx={{ color: '#BDD8EB', lineHeight: 1.75, mb: 3 }}>
                  This panel anchors the page and gives the rest of the dashboard a stronger editorial layout instead of a flat grid of identical boxes.
                </Typography>

                <Box sx={{ display: 'grid', gap: 1.5, mb: 3 }}>
                  {[
                    { label: 'Active complaints', value: activeCases, color: '#36C4FF' },
                    { label: 'Resolved cases', value: stats.completed, color: '#53D769' },
                    { label: 'Top active priority', value: topPriority, color: '#F59E0B' }
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 1.6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(139,225,255,0.12)'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#DDEDF8' }}>{item.label}</Typography>
                      <Typography variant="subtitle1" sx={{ color: item.color, fontWeight: 800 }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ height: 150, mt: 'auto' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="complaintsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#36C4FF" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#36C4FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.16)" vertical={false} />
                      <XAxis dataKey="day" stroke="#8FB9D3" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0C1E37', border: '1px solid rgba(54,196,255,0.25)', borderRadius: 14 }} />
                      <Area type="monotone" dataKey="complaints" stroke="#36C4FF" strokeWidth={3} fill="url(#complaintsFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <Paper sx={{ ...dashboardCardSx, p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="overline" sx={{ color: '#74DDFF', letterSpacing: '0.16em', fontWeight: 800 }}>
                      Distribution
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                      Complaint Status
                    </Typography>
                  </Box>
                  <Chip label={`${pieData.length} states`} sx={{ bgcolor: 'rgba(54,196,255,0.12)', color: '#74DDFF' }} />
                </Box>
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
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(139,225,255,0.12)' }}>
                  <Typography variant="body2" sx={{ color: '#BDD8EB', textAlign: 'center' }}>
                    {stats.completed} out of {stats.total} complaints resolved
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#D8FF72', display: 'block', mt: 1, textAlign: 'center' }}>
                    {stats.completionRate}% completion rate
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Paper sx={{ ...dashboardCardSx, p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="overline" sx={{ color: '#FFD166', letterSpacing: '0.16em', fontWeight: 800 }}>
                      Active Queue
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                      Complaints by Priority
                    </Typography>
                  </Box>
                  <Chip label={topPriority} sx={{ bgcolor: 'rgba(245,158,11,0.14)', color: '#FFD166' }} />
                </Box>
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
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(139,225,255,0.12)' }}>
                  <Typography variant="caption" sx={{ color: '#FFD166', display: 'block', textAlign: 'center' }}>
                    Urgent issues need immediate attention
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Paper sx={{ ...dashboardCardSx, p: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
                  <Box>
                    <Typography variant="overline" sx={{ color: '#74DDFF', letterSpacing: '0.16em', fontWeight: 800 }}>
                      Trendline
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                      Weekly Complaint Flow
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#BDD8EB', mt: 0.5 }}>
                      New reports versus resolved cases over the last 7 days.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${stats.total} total cases`} sx={{ bgcolor: 'rgba(54,196,255,0.12)', color: '#74DDFF' }} />
                    <Chip label={`${stats.completed} resolved`} sx={{ bgcolor: 'rgba(83,215,105,0.14)', color: '#8FF0A1' }} />
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#102746', border: '1px solid #36C4FF' }} />
                    <Legend />
                    <Line type="monotone" dataKey="complaints" stroke="#36C4FF" strokeWidth={3} name="New Complaints" dot={{ fill: '#36C4FF', r: 6 }} />
                    <Line type="monotone" dataKey="completed" stroke="#53D769" strokeWidth={3} name="Resolved" dot={{ fill: '#53D769', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
                <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(139,225,255,0.12)' }}>
                  <Typography variant="caption" sx={{ color: '#BDD8EB' }}>
                    Tracking complaints over time to identify patterns
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Paper sx={{ p: 3.5, borderRadius: 6, background: 'linear-gradient(135deg, rgba(54,196,255,0.14), rgba(83,215,105,0.09), rgba(255,209,102,0.08))', border: '1px solid rgba(139,225,255,0.22)', boxShadow: '0 22px 46px rgba(3,12,25,0.18)' }}>
            <Typography variant="body1" sx={{ color: '#E5F8FF', fontWeight: 600 }}>
              Every optimized route brings cleaner streets, faster service, and smarter city operations.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardSummary;
