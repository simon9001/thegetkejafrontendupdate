// components/dashboard/developer/DeveloperReportsTab.tsx
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { SectionHeader } from '../shared';

const DeveloperReportsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Performance Reports" sub="Project analytics and financial summaries" />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
       <BarChart3 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
       <h3 className="font-bold text-[#222222]">Analytics Engine Loading</h3>
       <p className="text-sm text-[#6a6a6a] max-w-sm mx-auto mt-2">Comprehensive historical data and forecasting tools will be available soon for all developers.</p>
    </div>
  </div>
);

export default DeveloperReportsTab;
