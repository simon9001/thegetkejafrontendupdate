// frontend/src/pages/Dashboard/StaffDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, UserCheck, Building2, Star, Scale, MessageSquare, Users, FileText
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';


// Import Staff Tabs
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

  if (!user) return <div className="p-20 text-center">Please login to access the moderation dashboard.</div>;

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Staff · Moderator"
    >
      {activeNav === 'overview' && (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-[#222222]">Welcome Back, {user.full_name ?? 'Moderator'}</h2>
          <p className="text-sm text-[#6a6a6a] mt-1">Select a task from the sidebar to manage listings, identities, and disputes.</p>
        </div>
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