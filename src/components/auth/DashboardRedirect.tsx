import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const DashboardRedirect: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.authSlice);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Role-based routing table
    switch (user.role.toLowerCase()) {
        case 'admin':
            return <Navigate to="/dashboard/admin" replace />;
        case 'landlord':
            return <Navigate to="/dashboard/landlord" replace />;
        case 'agent':
            return <Navigate to="/dashboard/agent" replace />;
        case 'caretaker':
            return <Navigate to="/dashboard/caretaker" replace />;
        case 'verifier':
            return <Navigate to="/dashboard/verifier" replace />;
        default:
            // For regular seekers/users, the profile or home page is their "dashboard"
            return <Navigate to="/profile" replace />;
    }
};

export default DashboardRedirect;
