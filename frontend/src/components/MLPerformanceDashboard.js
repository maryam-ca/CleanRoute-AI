import React from 'react';
import { Card, CardContent, Typography, Grid, Box, LinearProgress, Chip } from '@mui/material';
import { Speed as SpeedIcon, TrendingUp as TrendingUpIcon, CheckCircle as CheckIcon } from '@mui/icons-material';

const MLPerformanceDashboard = () => {
  const models = [
    { name: 'Waste Detection', accuracy: '90%', f1Score: '0.88', latency: '120ms', status: 'active', color: '#22C55E' },
    { name: 'Priority Classification', accuracy: '87.9%', f1Score: '0.85', latency: '45ms', status: 'active', color: '#00C6FF' },
    { name: 'Route Optimization', accuracy: '92%', f1Score: '0.91', latency: '230ms', status: 'active', color: '#0A66FF' },
    { name: 'Waste Prediction', accuracy: '85%', f1Score: '0.82', latency: '98ms', status: 'active', color: '#8B5CF6' },
    { name: 'Anomaly Detection', accuracy: '88%', f1Score: '0.86', latency: '156ms', status: 'active', color: '#F59E0B' }
  ];

  return (
    <Card sx={{ background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(10,102,255,0.2)', borderRadius: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>🤖 ML Model Performance Dashboard</Typography>
        <Grid container spacing={2}>
          {models.map((model, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: model.color }}>{model.name}</Typography>
                  <Chip label={model.status} size="small" sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#22C55E', height: 20, fontSize: '0.65rem' }} />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Accuracy</Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{model.accuracy}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>F1 Score</Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{model.f1Score}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>Latency</Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{model.latency}</Typography>
                  </Grid>
                </Grid>
                <LinearProgress 
                  variant="determinate" 
                  value={parseInt(model.accuracy)} 
                  sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: model.color } }} 
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MLPerformanceDashboard;
