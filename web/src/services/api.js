import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const API_BASE_URL = 'http://' + window.location.hostname + ':8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(handleApiError(error));
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(handleApiError(error))
);

// 用户相关接口
export const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUsers = async (params) => {
  try {
    return await api.get('/users', { params });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createUser = async (userData) => {
  try {
    return await api.post('/users', userData);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUser = async (id, userData) => {
  try {
    return await api.put(`/users/${id}`, userData);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteUser = async (id) => {
  try {
    return await api.delete(`/users/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// 角色相关接口
export const getRoles = async () => {
  try {
    const response = await api.get('/roles');
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createRole = async (roleData) => {
  try {
    const response = await api.post('/roles', roleData);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteRole = async (id) => {
  try {
    const response = await api.delete(`/roles/${id}`);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    const response = await api.put(`/roles/${roleId}/permissions`, {
      permission_ids: permissionIds
    });
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

// 权限相关接口
export const getPermissions = async () => {
  try {
    const response = await api.get('/permissions');
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createPermission = async (permissionData) => {
  try {
    const response = await api.post('/permissions', permissionData);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updatePermission = async (id, permissionData) => {
  try {
    const response = await api.put(`/permissions/${id}`, permissionData);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deletePermission = async (id) => {
  try {
    const response = await api.delete(`/permissions/${id}`);
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

// 日志相关接口
export const getLogs = async (params) => {
  try {
    return await api.get('/logs', { params });
  } catch (error) {
    throw handleApiError(error);
  }
};

// 商品相关接口
export const getProducts = async (params) => {
  try {
    return await api.get('/products', { params });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getProduct = async (id) => {
  try {
    return await api.get(`/products/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createProduct = async (productData) => {
  try {
    return await api.post('/products', productData);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateProduct = async (id, productData) => {
  try {
    return await api.put(`/products/${id}`, productData);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteProduct = async (id) => {
  try {
    return await api.delete(`/products/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// 图片上传接口
export const uploadImage = async (formData) => {
  try {
    return await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

// 导出 API 实例
export default api; 