import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({ title, value, icon, color, loading, trend, trendValue, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={onClick}
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0,198,255,0.2)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.5px' }}>
                {title}
              </Typography>
              {loading ? (
                <Skeleton width={80} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 700, color: color || '#FFFFFF', mt: 1, fontSize: '2rem' }}>
                  {value}
                </Typography>
              )}
              {trend && (
                <Box display="flex" alignItems="center" mt={1}>
                  <Typography variant="caption" sx={{ color: trend > 0 ? '#22C55E' : '#EF4444' }}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280', ml: 0.5 }}>
                    vs last week
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                background: 'rgba(10,102,255,0.15)',
                borderRadius: '16px',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GlassCard;
