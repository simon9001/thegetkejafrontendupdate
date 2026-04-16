// frontend/src/pages/Dashboard/StaffDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, UserCheck, Building2, Star, Scale, MessageSquare
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import {
  useGetModerationVerificationsQuery,
  useGetModerationDisputesQuery,
  useGetPendingListingsQuery,
} from '../../features/Api/AdminApi';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';


// Import Staff Tabs
import StaffOverviewTab from '../../components/dashboard/staff/StaffOverviewTab';
import StaffVerificationsTab from '../../components/dashboard/staff/StaffVerificationsTab';
import StaffListingsTab from '../../components/dashboard/staff/StaffListingsTab';
import StaffReviewsTab from '../../components/dashboard/staff/StaffReviewsTab';
import StaffDisputesTab from '../../components/dashboard/staff/StaffDisputesTab';
import StaffMessagesTab from '../../components/dashboard/staff/StaffMessagesTab';

const NAV: NavItem[] = [
  { id: 'overview',      label: 'Overview',          icon: LayoutDashboard },
  { id: 'verifications', label: 'ID Verifications',  icon: UserCheck },
  { id: 'listings',      label: 'Listing Review',    icon: Building2 },
  { id: 'reviews',       label: 'Review Queue',      icon: Star },
  { id: 'disputes',      label: 'Disputes',          icon: Scale },
  { id: 'messages',      label: 'Reported Messages', icon: MessageSquare },
];

const StaffDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav] = useState('overview');

  const isStaff = !!user && (user.roles.includes('staff') || user.roles.includes('super_admin'));

  // Only fire count queries when the user genuinely has the staff role
  const { data: pendingVerif }  = useGetModerationVerificationsQuery({ page: 1, limit: 1, status: 'pending' }, { skip: !isStaff });
  const { data: openDisputes }  = useGetModerationDisputesQuery({ page: 1, limit: 1, status: 'open' },        { skip: !isStaff });
  const { data: pendingProps }  = useGetPendingListingsQuery({ page: 1, limit: 1 },                           { skip: !isStaff });

  const stats = {
    pendingUserVerifications: pendingVerif?.total ?? 0,
    activeDisputes:           openDisputes?.total ?? 0,
    pendingProperties:        pendingProps?.total  ?? 0,
  };

  if (!user) return <div className="p-20 text-center">Please login to access the moderation dashboard.</div>;

  if (!isStaff) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have the required staff permissions.</p>
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Staff · Moderator"
    >
      {activeNav === 'overview' && (
        <StaffOverviewTab stats={stats} userName={user.full_name ?? 'Moderator'} />
      )}
      {activeNav === 'verifications' && <StaffVerificationsTab />}
      {activeNav === 'listings' && <StaffListingsTab />}
      {activeNav === 'reviews' && <StaffReviewsTab />}
      {activeNav === 'disputes' && <StaffDisputesTab />}
      {activeNav === 'messages' && <StaffMessagesTab />}
    </DashboardShell>
  );
};

export default StaffDashboard;