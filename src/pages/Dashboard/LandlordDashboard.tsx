// frontend/src/pages/Dashboard/LandlordDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, Calendar, Users, Key, DollarSign, TrendingUp, MessageSquare, Settings
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useGetLandlordDashboardQuery } from '../../features/Api/DashboardApi';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';


import LandlordOverviewTab from '../../components/dashboard/landlord/LandlordOverviewTab';
import LandlordPropertiesTab from '../../components/dashboard/landlord/LandlordPropertiesTab';
import LandlordBookingsTab from '../../components/dashboard/landlord/LandlordBookingsTab';
import LandlordTeamTab      from '../../components/dashboard/landlord/LandlordTeamTab';
import LandlordTenantsTab from '../../components/dashboard/landlord/LandlordTenantsTab';
import LandlordPaymentsTab from '../../components/dashboard/landlord/LandlordPaymentsTab';
import LandlordReportsTab from '../../components/dashboard/landlord/LandlordReportsTab';
import LandlordMessagesTab from '../../components/dashboard/landlord/LandlordMessagesTab';
import LandlordSettingsTab from '../../components/dashboard/landlord/LandlordSettingsTab';

const NAV: NavItem[] = [
  { id: 'overview',    label: 'Overview',         icon: LayoutDashboard },
  { id: 'properties',  label: 'My Properties',    icon: Building2 },
  { id: 'bookings',    label: 'Active Bookings',  icon: Calendar },
  { id: 'team',         label: 'Team & Access',    icon: Users },
  { id: 'tenants',     label: 'Tenants',          icon: Key },
  { id: 'payments',    label: 'Payments',         icon: DollarSign },
  { id: 'reports',     label: 'Reports',          icon: TrendingUp },
  { id: 'messages',    label: 'Messages',         icon: MessageSquare },
  { id: 'settings',    label: 'Settings',         icon: Settings },
];

const LandlordDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav] = useState('overview');

  const { data: dashboardData } = useGetLandlordDashboardQuery(undefined, { skip: !user });

  if (!user) return <div className="p-20 text-center">Please login to view your dashboard.</div>;

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Landlord"
    >
      {activeNav === 'overview' && (
        <LandlordOverviewTab stats={dashboardData} userName={user.full_name ?? 'Landlord'} />
      )}
      {activeNav === 'properties' && <LandlordPropertiesTab />}
      {activeNav === 'bookings' && <LandlordBookingsTab />}
      {activeNav === 'team' && <LandlordTeamTab />}
      {activeNav === 'tenants' && <LandlordTenantsTab />}
      {activeNav === 'payments' && <LandlordPaymentsTab stats={dashboardData?.stats} />}
      {activeNav === 'reports' && <LandlordReportsTab />}
      {activeNav === 'messages' && <LandlordMessagesTab />}
      {activeNav === 'settings' && <LandlordSettingsTab />}
    </DashboardShell>
  );
};

export default LandlordDashboard;