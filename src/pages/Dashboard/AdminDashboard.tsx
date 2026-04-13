// frontend/src/pages/Dashboard/AdminDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, Building2, Calendar, TrendingUp, 
  Package, ShieldAlert, Star, Megaphone, FileText, Settings
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useGetKpiSnapshotQuery } from '../../features/Api/AdminApi';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';


// Import Admin Tabs
import AdminOverview from '../../components/dashboard/admin/AdminOverview';
import AdminUsersTab from '../../components/dashboard/admin/AdminUsersTab';
import AdminPropertiesTab from '../../components/dashboard/admin/AdminPropertiesTab';
import AdminBookingsTab from '../../components/dashboard/admin/AdminBookingsTab';
import AdminRevenueTab from '../../components/dashboard/admin/AdminRevenueTab';
import AdminSubscriptionsTab from '../../components/dashboard/admin/AdminSubscriptionsTab';
import AdminModerationTab from '../../components/dashboard/admin/AdminModerationTab';
import AdminReviewsTab from '../../components/dashboard/admin/AdminReviewsTab';
import AdminAdsTab from '../../components/dashboard/admin/AdminAdsTab';
import AdminAuditTab from '../../components/dashboard/admin/AdminAuditTab';
import AdminFeesTab from '../../components/dashboard/admin/AdminFeesTab';

const NAV: NavItem[] = [
  { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
  { id: 'users',          label: 'Users',          icon: Users },
  { id: 'properties',     label: 'Properties',     icon: Building2 },
  { id: 'bookings',       label: 'Bookings',       icon: Calendar },
  { id: 'revenue',        label: 'Revenue',        icon: TrendingUp },
  { id: 'subscriptions',  label: 'Subscriptions',  icon: Package },
  { id: 'moderation',     label: 'Moderation',     icon: ShieldAlert },
  { id: 'reviews',        label: 'Reviews',        icon: Star },
  { id: 'ads',            label: 'Ads',            icon: Megaphone },
  { id: 'audit',          label: 'Audit Log',      icon: FileText },
  { id: 'fees',           label: 'Fee Config',     icon: Settings },
];

const AdminDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav] = useState('overview');
  const isAdmin = !!user && (user.roles?.includes('super_admin') || user.roles?.includes('staff'));

  // Notification count (Verifications + Disputes)
  const { data: kpi } = useGetKpiSnapshotQuery(undefined, { skip: !isAdmin });
  const pendingCount = (kpi?.moderation?.pending_id_verifications ?? 0) + (kpi?.moderation?.open_disputes ?? 0);

  // Update nav with dynamic badges
  const navWithBadges = NAV.map(n => 
    n.id === 'moderation' ? { ...n, badge: pendingCount } : n
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#222222]">Access Denied</h2>
          <p className="text-sm text-[#6a6a6a] mt-1">You need admin privileges to view this page.</p>
          <button onClick={() => window.location.href = '/'} className="mt-4 px-4 py-2 bg-[#ff385c] text-white rounded-lg text-sm font-medium hover:bg-[#e00b41] transition">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={navWithBadges}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Admin"
      notificationCount={pendingCount}
    >
      {activeNav === 'overview' && <AdminOverview onNavigate={setActiveNav} />}
      {activeNav === 'users' && <AdminUsersTab />}
      {activeNav === 'properties' && <AdminPropertiesTab />}
      {activeNav === 'bookings' && <AdminBookingsTab />}
      {activeNav === 'revenue' && <AdminRevenueTab />}
      {activeNav === 'subscriptions' && <AdminSubscriptionsTab />}
      {activeNav === 'moderation' && <AdminModerationTab />}
      {activeNav === 'reviews' && <AdminReviewsTab />}
      {activeNav === 'ads' && <AdminAdsTab />}
      {activeNav === 'audit' && <AdminAuditTab />}
      {activeNav === 'fees' && <AdminFeesTab />}
    </DashboardShell>
  );
};

export default AdminDashboard;