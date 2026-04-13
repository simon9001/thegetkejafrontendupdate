// components/dashboard/shared/DashboardShell.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, selectCurrentUser } from '../../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../../features/Api/AuthApi';
import DashboardSidebar from './DashboardSidebar';
import type { NavItem } from './DashboardSidebar';

import DashboardTopbar from './DashboardTopbar';

interface DashboardShellProps {
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  roleLabel: string;
  notificationCount?: number;
  topbarAction?: React.ReactNode;
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({
  navItems, activeNav, onNavChange, roleLabel,
  notificationCount, topbarAction, children,
}) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const user      = useSelector(selectCurrentUser);
  const [logout]  = useLogoutMutation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await logout({ refreshToken: rt }).unwrap();
    } catch {}
    dispatch(clearCredentials());
    navigate('/login');
  };

  const currentLabel = navItems.find(n => n.id === activeNav)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex font-['DM_Sans',sans-serif]">
      <DashboardSidebar
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={onNavChange}
        roleLabel={roleLabel}
        userName={user?.full_name ?? user?.email}
        userRole={user?.primaryRole}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopbar
          title={currentLabel}
          onMenuClick={() => setSidebarOpen(true)}
          notificationCount={notificationCount}
          action={topbarAction}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
