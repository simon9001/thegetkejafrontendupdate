// components/dashboard/developer/DeveloperPipelineTab.tsx
import React from 'react';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { SectionHeader } from '../shared';

const DeveloperPipelineTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Sales Pipeline" sub="Track leads and unit reservations" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Total Enquiries', value: '42', icon: Users, accent: 'bg-blue-50 text-blue-600' },
        { label: 'Reserved Units',  value: '12', icon: Clock, accent: 'bg-amber-50 text-amber-600' },
        { label: 'Projected Sales', value: 'KES 85M', icon: DollarSign, accent: 'bg-emerald-50 text-emerald-600' },
      ].map(c => (
        <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.accent}`}>
             <c.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#222222]">{c.value}</p>
          <p className="text-xs text-[#6a6a6a] mt-1 font-medium">{c.label}</p>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-300" />
       </div>
       <h3 className="font-bold text-[#222222]">Detailed Pipeline Coming Soon</h3>
       <p className="text-sm text-[#6a6a6a] max-w-md mx-auto mt-2">We are working on a comprehensive CRM system for developers to track every lead from enquiry to closing.</p>
    </div>
  </div>
);

export default DeveloperPipelineTab;
