import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({ title, value, icon, color, loading, trend, trendValue, onClick }) => {
  // Trend color based on value
  const trendColor = trend > 0 ? '#22C55E' : trend < 0 ? '#EF4444' : '#9CA3AF';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

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
          background: 'linear-gradient(180deg, rgba(16, 56, 102, 0.88) 0%, rgba(6, 24, 47, 0.92) 100%)',
          backdropFilter: 'blur(18px)',
          borderRadius: '24px',
          border: '1px solid rgba(139, 225, 255, 0.16)',
          boxShadow: '0 22px 44px rgba(2, 6, 23, 0.26)',
          cursor: onClick ? 'pointer' : 'default',
          minHeight: '100%',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle at top right, rgba(54,196,255,0.22), transparent 36%),
              radial-gradient(circle at bottom left, rgba(83,215,105,0.14), transparent 28%)
            `,
            pointerEvents: 'none'
          },
          '&:hover': {
            boxShadow: '0 28px 56px rgba(2, 6, 23, 0.34)',
            transform: 'translateY(-4px)',
            border: '1px solid rgba(216,255,114,0.24)',
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box flex={1}>
              <Typography variant="caption" sx={{ color: '#b8dbef', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {title}
              </Typography>
              {loading ? (
                <Skeleton width={80} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 800, color: color || '#FFFFFF', mt: 1.25, fontSize: { xs: '2rem', sm: '2.2rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
              )}
              {trend !== undefined && (
                <Box display="flex" alignItems="center" mt={1.5} flexWrap="wrap" gap={0.5}>
                  <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
                    {trendIcon} {Math.abs(trend)}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8eb0c5' }}>
                    vs last week
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, rgba(216,255,114,0.18), rgba(54,196,255,0.18))',
                border: '1px solid rgba(216,255,114,0.14)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
              }}
            >
              {typeof icon === 'string' ? (
                <Typography variant="h5">{icon}</Typography>
              ) : (
                icon
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GlassCard;
