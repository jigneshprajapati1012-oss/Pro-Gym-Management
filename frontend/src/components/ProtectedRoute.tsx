import React from 'react';
import {
  Navigate,
  Outlet
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRole: 'OWNER' | 'TRAINER';
}

export const ProtectedRoute: React.FC<
  ProtectedRouteProps
> = ({ allowedRole }) => {
  const {
    user,
    isLoading
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />

          <span className="text-sm font-semibold tracking-wider text-slate-400">
            Verifying staff credentials...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== allowedRole) {
    const dashboard =
      user.role === 'OWNER'
        ? '/admin/dashboard'
        : '/trainer/dashboard';

    return (
      <Navigate
        to={dashboard}
        replace
      />
    );
  }

  return <Outlet />;
};
