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
  TextField,
  Grid,
  Button,
  TablePagination,
} from '@mui/material';
import { getLogs } from '../services/api';
import Message from '../components/Message';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    username: '',
    action: '',
    startTime: '',
    endTime: '',
  });
  const [message, setMessage] = useState({ open: false, type: 'error', text: '' });

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

  const fetchLogs = async () => {
    try {
      const response = await getLogs({
        ...filters,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setLogs(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('获取日志失败:', error);
      setMessage({ open: true, type: 'error', text: error.message });
      setLogs([]);
      setTotal(0);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="用户名"
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="操作类型"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="datetime-local"
              label="开始时间"
              InputLabelProps={{ shrink: true }}
              value={filters.startTime}
              onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="datetime-local"
              label="结束时间"
              InputLabelProps={{ shrink: true }}
              value={filters.endTime}
              onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSearch}>
              查询
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>用户名</TableCell>
              <TableCell>操作</TableCell>
              <TableCell>资源</TableCell>
              <TableCell>IP地址</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(logs) && logs.map((log) => (
              <TableRow key={log.ID}>
                <TableCell>{log.ID}</TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.resource}</TableCell>
                <TableCell>{log.ip}</TableCell>
                <TableCell>{log.status}</TableCell>
                <TableCell>{formatDateTime(log.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </TableContainer>

      <Message
        open={message.open}
        type={message.type}
        message={message.text}
        onClose={() => setMessage({ ...message, open: false })}
      />
    </Box>
  );
};

export default Logs; 