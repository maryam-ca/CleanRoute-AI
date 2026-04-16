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
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%), rgba(10, 22, 40, 0.82)',
          backdropFilter: 'blur(18px)',
          borderRadius: '24px',
          border: '1px solid rgba(148, 163, 184, 0.12)',
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
            background: 'radial-gradient(circle at top right, rgba(114,180,255,0.16), transparent 36%)',
            pointerEvents: 'none'
          },
          '&:hover': {
            boxShadow: '0 28px 56px rgba(2, 6, 23, 0.34)',
            transform: 'translateY(-4px)',
            border: '1px solid rgba(94, 162, 255, 0.24)',
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box flex={1}>
              <Typography variant="caption" sx={{ color: '#9fb0c9', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
                  <Typography variant="caption" sx={{ color: '#7d8ea7' }}>
                    vs last week
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, rgba(114,180,255,0.18), rgba(47,123,246,0.12))',
                border: '1px solid rgba(125,176,255,0.14)',
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
