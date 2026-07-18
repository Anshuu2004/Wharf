import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user } = useAuthStore();

  if (!user || user.isAdmin !== true) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
