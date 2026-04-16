// frontend/src/pages/Dashboard/CaretakerDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, Wrench, Droplets, Shield
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';


// Import Caretaker Tabs
import CaretakerTicketsTab from '../../components/dashboard/caretaker/CaretakerTicketsTab';
import CaretakerUnitsTab from '../../components/dashboard/caretaker/CaretakerUnitsTab';
import CaretakerUtilitiesTab from '../../components/dashboard/caretaker/CaretakerUtilitiesTab';
import CaretakerSecurityTab from '../../components/dashboard/caretaker/CaretakerSecurityTab';

const NAV: NavItem[] = [
  { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { id: 'tickets',    label: 'Maintenance',   icon: Wrench },
  { id: 'units',      label: 'Units',         icon: Building2 },
  { id: 'utilities',  label: 'Utilities',     icon: Droplets },
  { id: 'security',   label: 'Security Log',  icon: Shield },
];

const CaretakerDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav] = useState('overview');

  if (!user) return <div className="p-20 text-center">Please login to access your dashboard.</div>;

  // Security Guard: Ensure current user actually has the caretaker role
  if (!user.roles.includes('caretaker')) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have the required caretaker permissions.</p>
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Caretaker"
    >
      {activeNav === 'overview' && (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-[#222222]">Caretaker Overview</h2>
          <p className="text-sm text-[#6a6a6a] mt-1">Manage maintenance tickets and unit operations.</p>
        </div>
      )}
      {activeNav === 'tickets' && <CaretakerTicketsTab />}
      {activeNav === 'units' && <CaretakerUnitsTab />}
      {activeNav === 'utilities' && <CaretakerUtilitiesTab />}
      {activeNav === 'security' && <CaretakerSecurityTab />}
    </DashboardShell>
  );
};

export default CaretakerDashboard;