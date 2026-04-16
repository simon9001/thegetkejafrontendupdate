// frontend/src/pages/Dashboard/LandlordDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Calendar, Users, Key, DollarSign, TrendingUp, MessageSquare, Settings
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useGetMyPropertiesQuery } from '../../features/Api/PropertiesApi';
import { useGetMyHostBookingsQuery } from '../../features/Api/ShortStayApi';
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
// import ladlordpostproperty from '../../components/dashboard/landlord/AddProperty';

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
  const [searchParams] = useSearchParams();
  const [activeNav, setActiveNav] = useState(searchParams.get('tab') ?? 'overview');

  const isLandlord = !!user?.roles.includes('landlord');

  // Stitch real data from working endpoints
  const { data: propertiesData } = useGetMyPropertiesQuery(undefined,          { skip: !isLandlord });
  const { data: hostBookings }   = useGetMyHostBookingsQuery({ status: 'confirmed' }, { skip: !isLandlord });

  // Build a LandlordKpi-shaped object from real data (unknown fields default to 0)
  const dashboardData = {
    properties:  { total: propertiesData?.total ?? 0 },
    tenancies:   { active: 0, pending_applications: 0 },
    visits:      { pending: 0 },
    earnings:    { total_kes: 0 },
    messages:    { unread: 0 },
    short_stay:  { upcoming_bookings: hostBookings?.total ?? 0 },
    boosts:      { active: 0 },
    generated_at: new Date().toISOString(),
  };

  if (!user) return <div className="p-20 text-center">Please login to view your dashboard.</div>;

  if (!isLandlord) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have the required permissions to view the Landlord Dashboard.</p>
      </div>
    );
  }

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
      {activeNav === 'payments' && <LandlordPaymentsTab stats={undefined} />}
      {activeNav === 'reports' && <LandlordReportsTab />}
      {activeNav === 'messages' && <LandlordMessagesTab />}
      {activeNav === 'settings' && <LandlordSettingsTab />}
    </DashboardShell>
  );
};

export default LandlordDashboard;