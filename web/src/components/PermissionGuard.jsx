import React from 'react';
import { Navigate } from 'react-router-dom';

const PermissionGuard = ({ permission, children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = user.permissions || [];

  if (!permissions.includes(permission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default PermissionGuard; 