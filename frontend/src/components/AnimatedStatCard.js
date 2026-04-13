import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const AnimatedStatCard = ({ title, value, icon, color, trend, trendValue, suffix = '', prefix = '' }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card sx={{ 
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: color,
        }
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: color }}>
                {prefix}
                <CountUp end={value} duration={2} separator="," />
                {suffix}
              </Typography>
              {trend && (
                <Box display="flex" alignItems="center" mt={1}>
                  <TrendIcon trend={trend} />
                  <Typography variant="caption" color={trend > 0 ? '#10B981' : '#EF4444'} sx={{ ml: 0.5 }}>
                    {trendValue}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TrendIcon = ({ trend }) => {
  if (trend > 0) {
    return <TrendingUpIcon sx={{ fontSize: 14, color: '#10B981' }} />;
  }
  return <TrendingDownIcon sx={{ fontSize: 14, color: '#EF4444' }} />;
};

export default AnimatedStatCard;
