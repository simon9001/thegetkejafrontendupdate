// components/dashboard/landlord/LandlordReportsTab.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../shared';

const LandlordReportsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Reports & Analytics" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <h3 className="font-bold text-[#222222] mb-4">Occupancy Rate</h3>
        <div className="flex items-end gap-6">
          <div className="flex-1 h-40 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100">
            <motion.div initial={{ height: 0 }} animate={{ height: '85%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-[#ff385c]/80 rounded-t-lg" />
          </div>
          <div className="text-center shrink-0">
            <p className="text-3xl font-bold text-[#222222]">85%</p>
            <p className="text-xs text-[#6a6a6a] mt-1 font-medium">Current Rate</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <h3 className="font-bold text-[#222222] mb-4">Revenue Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: 'Residential', value: 'KES 150,000', pct: '75%', color: 'bg-[#ff385c]' },
            { label: 'Commercial',  value: 'KES 85,000',  pct: '50%', color: 'bg-blue-500' },
          ].map(r => (
            <div key={r.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#6a6a6a] font-medium">{r.label}</span>
                <span className="font-bold text-[#222222]">{r.value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: r.pct }} transition={{ duration: 0.8 }}
                  className={`h-full ${r.color} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default LandlordReportsTab;
