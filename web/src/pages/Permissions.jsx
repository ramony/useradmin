import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getPermissions, createPermission, updatePermission, deletePermission } from '../services/api';
import Message from '../components/Message';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [open, setOpen] = useState(false);
  const [editPermission, setEditPermission] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [message, setMessage] = useState({ open: false, type: 'success', text: '' });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await getPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      console.error('获取权限列表失败:', error);
      setMessage({ open: true, type: 'error', text: error.message });
      setPermissions([]);
    }
  };

  const handleOpen = (permission = null) => {
    if (permission) {
      setEditPermission(permission);
      setFormData({
        name: permission.name,
        code: permission.code,
        description: permission.description || '',
      });
    } else {
      setEditPermission(null);
      setFormData({
        name: '',
        code: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditPermission(null);
    setFormData({
      name: '',
      code: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.code) {
        setMessage({ open: true, type: 'error', text: '请填写必要信息' });
        return;
      }

      if (editPermission) {
        await updatePermission(editPermission.ID, formData);
        setMessage({ open: true, type: 'success', text: '更新权限成功' });
      } else {
        await createPermission(formData);
        setMessage({ open: true, type: 'success', text: '创建权限成功' });
      }
      handleClose();
      fetchPermissions();
    } catch (error) {
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个权限吗？')) {
      try {
        await deletePermission(id);
        setMessage({ open: true, type: 'success', text: '删除权限成功' });
        fetchPermissions();
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

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6">权限管理</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          添加权限
        </Button>
      </Box>

      {Object.entries(groupedPermissions).map(([module, perms]) => (
        <Paper key={module} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
            {module.toUpperCase()} 模块
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>权限名称</TableCell>
                  <TableCell>权限代码</TableCell>
                  <TableCell>描述</TableCell>
                  <TableCell width="120">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {perms.map((permission) => (
                  <TableRow key={permission.ID} hover>
                    <TableCell>{permission.name}</TableCell>
                    <TableCell>{permission.code}</TableCell>
                    <TableCell>{permission.description}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(permission)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(permission.ID)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editPermission ? '编辑权限' : '添加权限'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="权限名称"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="权限代码"
            fullWidth
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            helperText="格式: 模块:操作，例如: user:create"
            disabled={editPermission}
          />
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
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

export default Permissions;