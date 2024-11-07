import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 更新欢迎词
  useEffect(() => {
    const updateGreeting = () => {
      const hour = time.getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('早上好');
      } else if (hour >= 12 && hour < 18) {
        setGreeting('下午好');
      } else {
        setGreeting('晚上好');
      }
    };

    updateGreeting();
  }, [time]);

  // 计算指针角度
  const getHandRotation = () => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // 时针：360度/12小时 = 30度/小时，每分钟额外转0.5度
    const hourDegrees = ((hours % 12) * 30) + (minutes * 0.5);
    // 分针：360度/60分钟 = 6度/分钟
    const minuteDegrees = minutes * 6;
    // 秒针：360度/60秒 = 6度/秒
    const secondDegrees = seconds * 6;

    return { hourDegrees, minuteDegrees, secondDegrees };
  };

  const { hourDegrees, minuteDegrees, secondDegrees } = getHandRotation();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          mb: 4,
          background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {greeting}
      </Typography>

      <Box
        sx={{
          position: 'relative',
          width: '300px',
          height: '300px',
          border: '10px solid #FF9800',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 3px 10px rgba(0,0,0,0.2), inset 0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        {/* 时钟刻度 */}
        {[...Array(12)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '2px',
              height: '15px',
              background: '#FF9800',
              left: '149px',
              transformOrigin: '1px 150px',
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}

        {/* 时针 */}
        <Box
          sx={{
            position: 'absolute',
            width: '6px',
            height: '80px',
            background: '#FF9800',
            left: '147px',
            top: '70px',
            transformOrigin: '3px 80px',
            transform: `rotate(${hourDegrees}deg)`,
          }}
        />

        {/* 分针 */}
        <Box
          sx={{
            position: 'absolute',
            width: '4px',
            height: '100px',
            background: '#FF9800',
            left: '148px',
            top: '50px',
            transformOrigin: '2px 100px',
            transform: `rotate(${minuteDegrees}deg)`,
          }}
        />

        {/* 秒针 */}
        <Box
          sx={{
            position: 'absolute',
            width: '2px',
            height: '120px',
            background: '#FFB74D',
            left: '149px',
            top: '30px',
            transformOrigin: '1px 120px',
            transform: `rotate(${secondDegrees}deg)`,
          }}
        />

        {/* 中心点 */}
        <Box
          sx={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: '#FF9800',
            borderRadius: '50%',
            left: '144px',
            top: '144px',
          }}
        />
      </Box>
    </Box>
  );
};

export default Dashboard; 