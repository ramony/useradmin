import React from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Grid,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const SpecManager = ({ specs, onChange }) => {
  const handleAdd = () => {
    onChange([...specs, { name: '', value: '', sort: specs.length }]);
  };

  const handleDelete = (index) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    onChange(newSpecs);
  };

  const handleChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onChange(newSpecs);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">商品规格</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="small"
        >
          添加规格
        </Button>
      </Box>

      {specs.map((spec, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
          <Grid item xs={5}>
            <TextField
              fullWidth
              size="small"
              label="规格名称"
              value={spec.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="规格值"
              value={spec.value}
              onChange={(e) => handleChange(index, 'value', e.target.value)}
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton
              color="error"
              onClick={() => handleDelete(index)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default SpecManager; 