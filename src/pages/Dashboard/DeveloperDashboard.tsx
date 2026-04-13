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
  const [activeNav, setActiveNav] = useState('overview');

  const isDeveloper = !!user && (user.roles?.includes('developer') || user.roles?.includes('super_admin'));
  const { data: propertiesData } = useGetMyPropertiesQuery(undefined, { skip: !isDeveloper });
  const properties = propertiesData?.properties ?? [];

  if (!user || !isDeveloper) return <div className="p-20 text-center">Access Denied</div>;

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Developer"
    >
      {activeNav === 'overview' && (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-[#222222]">Developer Overview</h2>
          <p className="text-sm text-[#6a6a6a] mt-1">Manage your large-scale projects and sales pipeline.</p>
        </div>
      )}
      {activeNav === 'projects' && <DeveloperProjectsTab />}
      {activeNav === 'pipeline' && <DeveloperPipelineTab />}
      {activeNav === 'units' && <DeveloperUnitsTab />}
      {activeNav === 'reports' && <DeveloperReportsTab />}
    </DashboardShell>
  );
};

export default DeveloperDashboard;
