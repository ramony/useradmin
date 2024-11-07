// 用户认证相关的工具函数
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const hasPermission = (permission) => {
  const user = getUser();
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}; 