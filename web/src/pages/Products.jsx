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
  Grid,
  Typography,
  TablePagination,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import Message from '../components/Message';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    title: '',
    status: '',
  });
  const [message, setMessage] = useState({ open: false, type: 'success', text: '' });

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, filters]);

  const fetchProducts = async () => {
    try {
      const response = await getProducts({
        ...filters,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setProducts(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个商品吗？')) {
      try {
        await deleteProduct(id);
        setMessage({ open: true, type: 'success', text: '删除商品成功' });
        fetchProducts();
      } catch (error) {
        setMessage({ open: true, type: 'error', text: error.message });
      }
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchProducts();
  };

  const handleReset = () => {
    setFilters({
      title: '',
      status: '',
    });
    setPage(0);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 标题和添加按钮 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          商品管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/create')}
          sx={{ borderRadius: 2 }}
        >
          添加商品
        </Button>
      </Box>

      {/* 搜索区域 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="商品标题"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>商品状态</InputLabel>
              <Select
                value={filters.status}
                label="商品状态"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">全部</MenuItem>
                <MenuItem value="1">上架</MenuItem>
                <MenuItem value="0">下架</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ mr: 1 }}
            >
              查询
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
            >
              重置
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 表格区域 */}
      <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>商品标题</TableCell>
              <TableCell>图片数量</TableCell>
              <TableCell>规格数量</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.ID} hover>
                <TableCell>{product.ID}</TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell>{product.images?.length || 0}</TableCell>
                <TableCell>{product.specs?.length || 0}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      bgcolor: product.status === 1 ? 'success.light' : 'error.light',
                      color: 'white',
                    }}
                  >
                    {product.status === 1 ? '上架' : '下架'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/products/${product.ID}`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/products/${product.ID}/edit`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(product.ID)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
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

export default Products; 