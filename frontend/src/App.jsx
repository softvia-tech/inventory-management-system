import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

import AppLayout from './components/AppLayout';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import Approvals from './pages/Approvals';
import Signup from './pages/Signup';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INVENTORY_ADMIN']}>
              <AppLayout><Inventory /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/pos" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'POS_ADMIN']}>
              <AppLayout><POS /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/sales" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'INVENTORY_ADMIN', 'POS_ADMIN']}>
              <AppLayout><Sales /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AppLayout><Settings /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/approvals" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AppLayout><Approvals /></AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
