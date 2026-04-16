import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button, Grid, Card, CardContent,
  Chip, CircularProgress, IconButton, Tooltip, Divider, Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as ExcelIcon,
  BarChart as StatsIcon,
  Print as PrintIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import ExportService from '../services/exportService';

const Reports = ({ token, user, setToken }) => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const API_BASE_URL = 'https://cleanroute-ai.onrender.com/api/';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}complaints/dashboard_stats/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);
      
      // Fetch complaints list
      const complaintsResponse = await fetch(`${API_BASE_URL}complaints/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const complaintsData = await complaintsResponse.json();
      // Handle both array and object responses
      const complaintsArray = Array.isArray(complaintsData) ? complaintsData : (complaintsData.results || complaintsData.data || []);
      setComplaints(complaintsArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (complaints.length === 0) {
      toast.error('No data to export');
      return;
    }
    setExporting(true);
    try {
      ExportService.exportToExcel(complaints, 'complaints_report');
      toast.success('Excel report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (complaints.length === 0) {
      toast.error('No data to export');
      return;
    }
    setExporting(true);
    try {
      ExportService.exportToPDF(complaints, stats, 'complaints_report');
      toast.success('PDF report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportStats = async () => {
    if (!stats) {
      toast.error('No statistics data available');
      return;
    }
    setExporting(true);
    try {
      ExportService.exportStatsToExcel(stats, stats?.complaints_by_type || [], stats?.complaints_by_priority || []);
      toast.success('Statistics exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export statistics');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const reportCards = [
    { title: 'Complaints Report', icon: <ExcelIcon sx={{ fontSize: 40 }} />, color: '#22C55E', description: 'Export all complaints to Excel', action: handleExportExcel },
    { title: 'PDF Report', icon: <PdfIcon sx={{ fontSize: 40 }} />, color: '#F44336', description: 'Export complaints to PDF format', action: handleExportPDF },
    { title: 'Statistics Report', icon: <StatsIcon sx={{ fontSize: 40 }} />, color: '#2196F3', description: 'Export statistics summary', action: handleExportStats },
    { title: 'Print Report', icon: <PrintIcon sx={{ fontSize: 40 }} />, color: '#FF9800', description: 'Print complaints report', action: handlePrint },
  ];

  // Ensure complaints is an array for preview
  const previewComplaints = Array.isArray(complaints) ? complaints.slice(0, 10) : [];

  return (
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <Box sx={{ mx: { xs: 2, md: 3 }, mt: 2, py: 3, px: 4, color: 'white', border: '1px solid rgba(10,102,255,0.3)', borderRadius: 6, background: 'linear-gradient(135deg, rgba(10,102,255,0.15) 0%, rgba(15,23,42,0.3) 100%)', backdropFilter: 'blur(12px)' }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <DownloadIcon sx={{ fontSize: 32, color: '#81C784' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Export Reports</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Export complaints data in multiple formats</Typography>
              </Box>
            </Box>
            <Button variant="outlined" onClick={() => window.location.href = '/'} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ mb: 4, borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20', mb: 2 }}>
                Data Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#22C55E' }}>{stats?.total_complaints || 0}</Typography>
                    <Typography variant="caption">Total Complaints</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#F59E0B' }}>{stats?.pending_complaints || 0}</Typography>
                    <Typography variant="caption">Pending</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#22C55E' }}>{stats?.resolved_complaints || 0}</Typography>
                    <Typography variant="caption">Resolved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#2196F3' }}>{stats?.resolution_rate || 0}%</Typography>
                    <Typography variant="caption">Resolution Rate</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Options */}
        <Grid container spacing={3}>
          {reportCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                <Card sx={{ borderRadius: 4, textAlign: 'center', py: 3, cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }} onClick={card.action}>
                  <CardContent>
                    <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{card.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{card.description}</Typography>
                    {exporting && <CircularProgress size={24} sx={{ mt: 2 }} />}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Preview Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card sx={{ mt: 4, borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B5E20', mb: 2 }}>
                Recent Complaints Preview
              </Typography>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#22C55E' }} />
                </Box>
              ) : previewComplaints.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No complaints data available</Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#E8F5E9' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Priority</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewComplaints.map((complaint) => (
                        <tr key={complaint.id} style={{ borderBottom: '1px solid #E8F5E9' }}>
                          <td style={{ padding: '12px' }}>#{complaint.id}</td>
                          <td style={{ padding: '12px' }}>{complaint.complaint_type}</td>
                          <td style={{ padding: '12px' }}>
                            <Chip 
                              label={complaint.priority} 
                              size="small" 
                              sx={{ bgcolor: complaint.priority === 'high' ? '#F57C00' : complaint.priority === 'urgent' ? '#D32F2F' : '#4CAF50', color: 'white' }} 
                            />
                          </td>
                          <td style={{ padding: '12px' }}>{complaint.status}</td>
                          <td style={{ padding: '12px' }}>{new Date(complaint.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Reports;




