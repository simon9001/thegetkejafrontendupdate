// frontend/src/pages/Dashboard/AgentDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, Calendar, Users, DollarSign, BarChart3
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useGetMyPropertiesQuery } from '../../features/Api/PropertiesApi';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';


import AgentOverviewTab from '../../components/dashboard/agent/AgentOverviewTab';
import AgentListingsTab from '../../components/dashboard/agent/AgentListingsTab';
import AgentViewingsTab from '../../components/dashboard/agent/AgentViewingsTab';
import AgentLeadsTab from '../../components/dashboard/agent/AgentLeadsTab';
import AgentCommissionsTab from '../../components/dashboard/agent/AgentCommissionsTab';

const NAV: NavItem[] = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'listings',    label: 'My Listings', icon: Building2 },
  { id: 'viewings',    label: 'Viewings',    icon: Calendar },
  { id: 'leads',       label: 'Leads',       icon: Users },
  { id: 'commissions', label: 'Commissions', icon: DollarSign },
  { id: 'reports',     label: 'Reports',     icon: BarChart3 },
];

const AgentDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav] = useState('overview');

  const { data: propertiesData } = useGetMyPropertiesQuery(undefined, { skip: !user });
  const properties = propertiesData?.properties ?? [];

  // Build stats from real endpoint data
  const stats = { ownedProperties: propertiesData?.total ?? 0, activeBookings: 0, activeCaretakers: 0 };

  if (!user) return <div className="p-20 text-center">Please login to access your dashboard.</div>;

  if (!user.roles.includes('agent')) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have the required permissions to view the Agent Dashboard.</p>
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Agent"
    >
      {activeNav === 'overview' && (
        <AgentOverviewTab stats={stats} userName={user.full_name ?? 'Agent'} />
      )}
      {activeNav === 'listings' && <AgentListingsTab properties={properties} />}
      {activeNav === 'viewings' && <AgentViewingsTab />}
      {activeNav === 'leads' && <AgentLeadsTab />}
      {activeNav === 'commissions' && <AgentCommissionsTab />}
      {activeNav === 'reports' && (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <BarChart3 className="w-12 h-12 opacity-20 mx-auto mb-3" />
          <p className="text-sm font-medium text-[#6a6a6a]">Performance reports coming soon.</p>
        </div>
      )}
    </DashboardShell>
  );
};

export default AgentDashboard;