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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
} from '@mui/material';
import { getRoles, getPermissions, createRole, updateRole, deleteRole, updateRolePermissions } from '../services/api';
import Message from '../components/Message';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permission_ids: [],
  });
  const [message, setMessage] = useState({ open: false, type: 'success', text: '' });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await getPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      console.error('获取权限列表失败:', error);
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const handleOpen = (role = null) => {
    if (role) {
      setEditRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permission_ids: role.permissions?.map(p => p.ID) || [],
      });
    } else {
      setEditRole(null);
      setFormData({
        name: '',
        description: '',
        permission_ids: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditRole(null);
    setFormData({
      name: '',
      description: '',
      permission_ids: [],
    });
  };

  const handleSubmit = async () => {
    try {
      if (editRole) {
        await updateRole(editRole.ID, formData);
        await updateRolePermissions(editRole.ID, formData.permission_ids);
        setMessage({ open: true, type: 'success', text: '更新角色成功' });
      } else {
        await createRole(formData);
        setMessage({ open: true, type: 'success', text: '创建角色成功' });
      }
      handleClose();
      fetchRoles();
    } catch (error) {
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个角色吗？')) {
      try {
        await deleteRole(id);
        setMessage({ open: true, type: 'success', text: '删除角色成功' });
        fetchRoles();
      } catch (error) {
        setMessage({ open: true, type: 'error', text: error.message });
      }
    }
  };

  // 按模块对权限进行分组
  const groupedPermissions = Array.isArray(permissions) ? permissions.reduce((groups, permission) => {
    const module = permission.code.split(':')[0];
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {}) : {};

  const handlePermissionChange = (permissionId) => {
    const newPermissionIds = formData.permission_ids.includes(Number(permissionId))
      ? formData.permission_ids.filter(id => Number(id) !== Number(permissionId))
      : [...formData.permission_ids, Number(permissionId)];

    setFormData({ ...formData, permission_ids: newPermissionIds });
  };

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6">角色管理</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          添加角色
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>角色名称</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>权限数量</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(roles) && roles.map((role) => (
              <TableRow key={role.ID}>
                <TableCell>{role.ID}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{role.permissions?.length || 0}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpen(role)}>
                    编辑
                  </Button>
                  {role.ID !== 1 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(role.ID)}
                    >
                      删除
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editRole ? '编辑角色' : '添加角色'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="角色名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 3 }}
            />
            <Typography variant="subtitle1" gutterBottom>
              权限设置
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {Object.entries(groupedPermissions).map(([module, perms]) => (
              <Box key={module} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {module.toUpperCase()} 模块
                </Typography>
                <FormGroup>
                  {perms.map((permission) => (
                    <FormControlLabel
                      key={permission.ID}
                      control={
                        <Checkbox
                          checked={formData.permission_ids.includes(Number(permission.ID))}
                          onChange={() => handlePermissionChange(permission.ID)}
                        />
                      }
                      label={`${permission.name} (${permission.code})`}
                    />
                  ))}
                </FormGroup>
              </Box>
            ))}
          </Box>
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

export default Roles;