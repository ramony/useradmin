import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Inventory as InventoryIcon,
  Lock as LockIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { hasPermission } from '../utils/auth';

const drawerWidth = 260;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: '仪表盘', icon: <DashboardIcon />, path: '/' },
    { text: '用户管理', icon: <PeopleIcon />, path: '/users', permission: 'user:list' },
    {
      text: '角色权限',
      icon: <SecurityIcon />,
      permission: 'role:list',
      children: [
        { text: '角色管理', icon: <SecurityIcon />, path: '/roles', permission: 'role:list' },
        { text: '权限管理', icon: <LockIcon />, path: '/permissions', permission: 'role:list' }
      ]
    },
    { text: '商品管理', icon: <InventoryIcon />, path: '/products', permission: 'product:list' },
    { text: '日志查询', icon: <AssignmentIcon />, path: '/logs', permission: 'log:list' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main
            }}
          >
            {user.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user.username}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user.role_name}
            </Typography>
          </Box>
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          (!item.permission || hasPermission(item.permission)) && (
            item.children ? (
              <React.Fragment key={item.text}>
                <ListItem
                  button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 2,
                    bgcolor: location.pathname.includes('/roles') || location.pathname.includes('/permissions') ? 'primary.light' : 'transparent',
                    color: location.pathname.includes('/roles') || location.pathname.includes('/permissions') ? 'white' : 'inherit',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {roleMenuOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={roleMenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      (!child.permission || hasPermission(child.permission)) && (
                        <ListItem
                          button
                          key={child.text}
                          onClick={() => {
                            navigate(child.path);
                            if (isMobile) {
                              setMobileOpen(false);
                            }
                          }}
                          sx={{
                            pl: 4,
                            mx: 1,
                            my: 0.5,
                            borderRadius: 2,
                            bgcolor: isActive(child.path) ? 'primary.light' : 'transparent',
                            color: isActive(child.path) ? 'white' : 'inherit',
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{child.icon}</ListItemIcon>
                          <ListItemText primary={child.text} />
                        </ListItem>
                      )
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  bgcolor: isActive(item.path) ? 'primary.light' : 'transparent',
                  color: isActive(item.path) ? 'white' : 'inherit',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            )
          )
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'error.light',
              color: 'white',
              '& .MuiListItemIcon-root': {
                color: 'white',
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="退出登录" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            后台管理系统
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.default',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.default',
              borderRight: '1px solid',
              borderColor: 'divider',
              transform: open ? 'none' : `translateX(-${drawerWidth}px)`,
              transition: theme.transitions.create('transform', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: open ? `${0}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: 8,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 