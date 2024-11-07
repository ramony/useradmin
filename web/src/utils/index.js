// 格式化日期时间
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 检查权限
export const hasPermission = (requiredPermission) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userPermissions = user.permissions || [];
  return userPermissions.includes(requiredPermission);
};

// 处理API错误
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.error || '操作失败';
  }
  return error.message || '网络错误';
};

// 分页参数处理
export const getPaginationParams = (page, rowsPerPage) => {
  return {
    page: page + 1,
    pageSize: rowsPerPage,
  };
}; 