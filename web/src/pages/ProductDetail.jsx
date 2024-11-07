import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  ImageList,
  ImageListItem,
  Divider,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { getProduct } from '../services/api';
import Message from '../components/Message';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState({ open: false, type: 'error', text: '' });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await getProduct(id);
      setProduct(data);
    } catch (error) {
      setMessage({ open: true, type: 'error', text: error.message });
    }
  };

  if (!product) {
    return null;
  }

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
            商品详情
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/products/${id}/edit`)}
        >
          编辑商品
        </Button>
      </Box>

      {/* 商品信息 */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 基本信息 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {product.title}
            </Typography>
            <Chip
              label={product.status === 1 ? '已上架' : '已下架'}
              color={product.status === 1 ? 'success' : 'default'}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>

          {/* 商品描述 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              商品描述
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {product.description || '暂无描述'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 商品图片 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              商品图片
            </Typography>
            {product.images && product.images.length > 0 ? (
              <ImageList cols={4} gap={16}>
                {product.images.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image.url}
                      alt={`商品图片 ${index + 1}`}
                      loading="lazy"
                      style={{ borderRadius: 8 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Typography color="text.secondary">暂无图片</Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 商品规格 */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              商品规格
            </Typography>
            {product.specs && product.specs.length > 0 ? (
              <Grid container spacing={2}>
                {product.specs.map((spec, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {spec.name}
                      </Typography>
                      <Typography variant="body1">
                        {spec.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">暂无规格</Typography>
            )}
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

export default ProductDetail; 