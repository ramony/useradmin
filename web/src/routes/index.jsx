import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Users from '../pages/Users';
import Roles from '../pages/Roles';
import Permissions from '../pages/Permissions';
import Logs from '../pages/Logs';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import ProductForm from '../pages/ProductForm';
import Forbidden from '../pages/403';
import PrivateRoute from '../components/PrivateRoute';
import PermissionGuard from '../components/PermissionGuard';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/users',
        element: (
          <PermissionGuard permission="user:list">
            <Users />
          </PermissionGuard>
        ),
      },
      {
        path: '/roles',
        element: (
          <PermissionGuard permission="role:list">
            <Roles />
          </PermissionGuard>
        ),
      },
      {
        path: '/permissions',
        element: (
          <PermissionGuard permission="role:list">
            <Permissions />
          </PermissionGuard>
        ),
      },
      {
        path: '/products',
        children: [
          {
            path: '',
            element: (
              <PermissionGuard permission="product:list">
                <Products />
              </PermissionGuard>
            ),
          },
          {
            path: 'create',
            element: (
              <PermissionGuard permission="product:create">
                <ProductForm />
              </PermissionGuard>
            ),
          },
          {
            path: ':id',
            element: (
              <PermissionGuard permission="product:list">
                <ProductDetail />
              </PermissionGuard>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <PermissionGuard permission="product:update">
                <ProductForm />
              </PermissionGuard>
            ),
          },
        ],
      },
      {
        path: '/logs',
        element: (
          <PermissionGuard permission="log:list">
            <Logs />
          </PermissionGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router; 