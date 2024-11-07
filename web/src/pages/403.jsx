import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Typography variant="h1" color="error">
        403
      </Typography>
      <Typography variant="h5" color="textSecondary" sx={{ mt: 2 }}>
        抱歉，您没有访问该页面的权限
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ mt: 4 }}
      >
        返回首页
      </Button>
    </Box>
  );
};

export default Forbidden; 