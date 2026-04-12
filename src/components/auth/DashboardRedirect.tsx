import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/Slice/AuthSlice';

const DashboardRedirect: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user            = useSelector(selectCurrentUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // user.roles is string[] — check highest-privilege role first
  const roles = user.roles ?? [];

  // Route by primaryRole first (most authoritative single role from backend)
  // then fall back to scanning the full roles array.
  const routePath = (role: string): string | null => {
    if (role === 'super_admin' || role === 'admin') return '/dashboard/admin';
    if (role === 'developer')  return '/dashboard/developer';
    if (role === 'landlord')   return '/dashboard/landlord';
    if (role === 'staff')      return '/dashboard/staff';
    if (role === 'agent')      return '/dashboard/agent';
    if (role === 'caretaker')  return '/dashboard/caretaker';
    if (role === 'verifier')   return '/dashboard/verifier';
    return null;
  };

  // 1. Try primaryRole (backend's declared primary role)
  if (user.primaryRole) {
    const path = routePath(user.primaryRole);
    if (path) return <Navigate to={path} replace />;
  }

  // 2. Fall back to scanning all roles in backend order
  for (const role of roles) {
    const path = routePath(role);
    if (path) return <Navigate to={path} replace />;
  }

  // seekers and any unrecognised role → profile page
  return <Navigate to="/profile" replace />;
};

export default DashboardRedirect;