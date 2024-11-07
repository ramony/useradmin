import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { uploadImage } from '../services/api';

const ImageUpload = ({ images, onChange, maxImages = 10 }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 检查图片数量限制
    if (images.length + files.length > maxImages) {
      alert(`最多只能上传${maxImages}张图片`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await uploadImage(formData);
        return {
          url: response.url,
          sort: images.length,
        };
      });

      const newImages = await Promise.all(uploadPromises);
      onChange([...images, ...newImages]);
    } catch (error) {
      console.error('上传图片失败:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <input
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload"
          onChange={handleUpload}
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="image-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={uploading || images.length >= maxImages}
          >
            {uploading ? '上传中...' : '上传图片'}
          </Button>
        </label>
        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {`${images.length}/${maxImages}`}
        </Box>
      </Box>

      <ImageList sx={{ width: '100%', height: 'auto' }} cols={4} rowHeight={164}>
        {images.map((image, index) => (
          <ImageListItem key={index}>
            <img
              src={image.url}
              alt={`商品图片 ${index + 1}`}
              loading="lazy"
              style={{ height: '100%', objectFit: 'cover' }}
            />
            <ImageListItemBar
              sx={{
                background: 'rgba(0, 0, 0, 0.5)',
              }}
              actionIcon={
                <IconButton
                  sx={{ color: 'white' }}
                  onClick={() => handleDelete(index)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default ImageUpload; 