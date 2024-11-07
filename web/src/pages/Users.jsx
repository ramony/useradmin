import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getUsers, getRoles, createUser, updateUser, deleteUser } from '../services/api';
import Message from '../components/Message';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    roleId: '',
    status: 1
  });
  const [message, setMessage] = useState({ open: false, type: 'success', text: '' });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const handleOpen = (user = null) => {
    if (user) {
      setEditUser(user);
      setFormData({
        username: user.username,
        password: '',
        roleId: user.role_id,
        status: user.status,
        id: user.id
      });
    } else {
      setEditUser(null);
      setFormData({
        username: '',
        password: '',
        roleId: '',
        status: 1,
        id: null
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
    setFormData({
      username: '',
      password: '',
      roleId: '',
      status: 1
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.username || (!editUser && !formData.password)) {
        setMessage({ open: true, type: 'error', text: '请填写必要信息' });
        return;
      }

      const userData = {
        username: formData.username,
        role_id: Number(formData.roleId),
        status: Number(formData.status)
      };

      if (formData.password) {
        userData.password = formData.password;
      }

      if (editUser) {
        await updateUser(formData.id, userData);
        setMessage({ open: true, type: 'success', text: '更新用户成功' });
      } else {
        await createUser(userData);
        setMessage({ open: true, type: 'success', text: '创建用户成功' });
      }
      handleClose();
      fetchUsers();
    } catch (error) {
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await deleteUser(id);
        setMessage({ open: true, type: 'success', text: '删除用户成功' });
        fetchUsers();
      } catch (error) {
        setMessage({ open: true, type: 'error', text: error.message });
      }
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          用户管理
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          添加用户
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          flexGrow: 1,
          borderRadius: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>用户名</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>角色</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>状态</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role?.name}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      bgcolor: user.status === 1 ? 'success.light' : 'error.light',
                      color: 'white',
                    }}
                  >
                    {user.status === 1 ? '启用' : '禁用'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleOpen(user)}
                    sx={{ mr: 1 }}
                  >
                    编辑
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editUser ? '编辑用户' : '添加用户'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="用户名"
            fullWidth
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={!!editUser}
          />
          <TextField
            margin="dense"
            label="密码"
            type="password"
            fullWidth
            required={!editUser}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText={editUser ? "不修改请留空" : ""}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>角色</InputLabel>
            <Select
              value={formData.roleId}
              label="角色"
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            >
              {Array.isArray(roles) && roles.map((role) => (
                <MenuItem key={role.ID} value={role.ID}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>状态</InputLabel>
            <Select
              value={formData.status}
              label="状态"
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value={1}>启用</MenuItem>
              <MenuItem value={0}>禁用</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained">确定</Button>
        </DialogActions>
      </Dialog>

      <Message
        open={message.open}
        type={message.type}
        message={message.text}
        onClose={() => setMessage({ ...message, open: false })}
      />
    </Box>
  );
};

export default Users; 