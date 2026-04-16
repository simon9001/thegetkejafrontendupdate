// frontend/src/pages/Dashboard/DeveloperDashboard.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, TrendingUp, Layers, BarChart3
} from 'lucide-react';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useGetMyPropertiesQuery } from '../../features/Api/PropertiesApi';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';


// Import Developer Tabs
import DeveloperOverviewTab from '../../components/dashboard/developer/DeveloperOverviewTab';
import DeveloperProjectsTab from '../../components/dashboard/developer/DeveloperProjectsTab';
import DeveloperPipelineTab from '../../components/dashboard/developer/DeveloperPipelineTab';
import DeveloperUnitsTab from '../../components/dashboard/developer/DeveloperUnitsTab';
import DeveloperReportsTab from '../../components/dashboard/developer/DeveloperReportsTab';

const NAV: NavItem[] = [
  { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { id: 'projects',   label: 'My Projects',   icon: Building2 },
  { id: 'pipeline',   label: 'Sales Pipeline',icon: TrendingUp },
  { id: 'units',      label: 'Unit Tracker',  icon: Layers },
  { id: 'reports',    label: 'Reports',       icon: BarChart3 },
];

const DeveloperDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const isDeveloper = !!user && (user.roles?.includes('developer') || user.roles?.includes('super_admin'));
  const [activeNav, setActiveNav] = useState('overview');

  const { data: propertiesData } = useGetMyPropertiesQuery(undefined, { skip: !isDeveloper });
  const stats = { ownedProperties: propertiesData?.total ?? 0 };

  if (!user) return <div className="p-20 text-center">Please login to access the Developer Dashboard.</div>;

  if (!isDeveloper) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have developer permissions.</p>
      </div>
    );
  }

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Developer"
    >
      {activeNav === 'overview' && (
        <DeveloperOverviewTab stats={stats} userName={user.full_name ?? 'Developer'} />
      )}
      {activeNav === 'projects' && <DeveloperProjectsTab />}
      {activeNav === 'pipeline' && <DeveloperPipelineTab />}
      {activeNav === 'units' && <DeveloperUnitsTab />}
      {activeNav === 'reports' && <DeveloperReportsTab />}
    </DashboardShell>
  );
};

export default DeveloperDashboard;
