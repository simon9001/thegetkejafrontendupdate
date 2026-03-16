import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface RoleRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.authSlice);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        // If user is authenticated but doesn't have the right role, 
        // redirect them to a default page or unauthorized page
        return <Navigate to="/vacation-hub" replace />;
    }

    return <>{children}</>;
};

export default RoleRoute;
