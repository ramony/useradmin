import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { getProduct, createProduct, updateProduct } from '../services/api';
import Message from '../components/Message';
import ImageUpload from '../components/ImageUpload';
import SpecManager from '../components/SpecManager';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [],
    specs: [],
    status: 1,
  });
  const [message, setMessage] = useState({ open: false, type: 'success', text: '' });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await getProduct(id);
      setFormData({
        title: data.title,
        description: data.description,
        images: data.images || [],
        specs: data.specs || [],
        status: data.status,
      });
    } catch (error) {
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      setMessage({ open: true, type: 'error', text: '请输入商品标题' });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        images: formData.images.map((img, index) => ({
          ...img,
          sort: index
        }))
      };

      if (id) {
        await updateProduct(id, submitData);
        setMessage({ open: true, type: 'success', text: '更新商品成功' });
      } else {
        await createProduct(submitData);
        setMessage({ open: true, type: 'success', text: '创建商品成功' });
      }
      setTimeout(() => navigate('/products'), 1500);
    } catch (error) {
      setMessage({ open: true, type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  return (
    <Box>
      {/* 标题栏 */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
          >
            返回
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {id ? '编辑商品' : '新增商品'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
        >
          保存
        </Button>
      </Box>

      {/* 表单内容 */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 基本信息 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              基本信息
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="商品标题"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="商品描述"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>商品状态</InputLabel>
                  <Select
                    value={formData.status}
                    label="商品状态"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value={1}>上架</MenuItem>
                    <MenuItem value={0}>下架</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 商品图片 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              商品图片
            </Typography>
            <ImageUpload
              images={formData.images}
              onChange={handleImagesChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 商品规格 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              商品规格
            </Typography>
            <SpecManager
              specs={formData.specs}
              onChange={(specs) => setFormData({ ...formData, specs })}
            />
          </Grid>
        </Grid>
      </Paper>

      <Message
        open={message.open}
        type={message.type}
        message={message.text}
        onClose={() => setMessage({ ...message, open: false })}
      />
    </Box>
  );
};

export default ProductForm; 