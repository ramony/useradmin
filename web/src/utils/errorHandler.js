import { logout } from './auth';

export const handleApiError = (error) => {
  // 处理 401 未授权错误
  if (error.response?.status === 401) {
    logout();
    return '登录已过期，请重新登录';
  }

  // 处理 403 权限错误
  if (error.response?.status === 403) {
    return '没有操作权限';
  }

  // 处理其他错误
  return error.response?.data?.error || error.message || '操作失败';
};

export const handleResponse = (response) => {
  if (response.error) {
    throw new Error(response.error);
  }
  return response;
}; 