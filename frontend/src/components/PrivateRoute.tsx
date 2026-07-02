import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-height flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-brand-500 border-r-brand-500 rounded-full animate-spin"></div>
          </div>
          <span className="text-slate-400 text-sm font-medium tracking-wide animate-pulse-subtle">
            Loading your space...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect user to login page, storing original destination in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
