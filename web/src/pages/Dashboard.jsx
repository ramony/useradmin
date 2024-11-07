import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { getUsers, getRoles } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    roleCount: 0,
    loading: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, roles] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);

      setStats({
        userCount: users.data?.length || 0,
        roleCount: roles.length || 0,
        loading: false,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        仪表盘
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Typography variant="h6">用户总数</Typography>
            <Typography variant="h3">{stats.userCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'secondary.light',
              color: 'white',
            }}
          >
            <Typography variant="h6">角色总数</Typography>
            <Typography variant="h3">{stats.roleCount}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 