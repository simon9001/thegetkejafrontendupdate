// components/dashboard/developer/DeveloperUnitsTab.tsx
import React from 'react';
import { Layers, HardHat, Key, Building2 } from 'lucide-react';
import { SectionHeader } from '../shared';

const DeveloperUnitsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Unit Tracker" sub="Construction status and inventory management" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center"><HardHat className="w-5 h-5 text-orange-600" /></div>
             <h3 className="font-bold text-[#222222]">Construction Status</h3>
          </div>
          <div className="space-y-4">
             {[
               { label: 'Foundation', pct: '100%', status: 'Completed' },
               { label: 'Superstructure', pct: '75%', status: 'In Progress' },
               { label: 'Finishing', pct: '10%', status: 'Upcoming' },
             ].map(s => (
               <div key={s.label}>
                 <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-tighter">
                    <span className="text-[#6a6a6a]">{s.label}</span>
                    <span className="text-[#222222]">{s.pct}</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: s.pct }} />
                 </div>
               </div>
             ))}
          </div>
       </div>
       <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-violet-600" /></div>
             <h3 className="font-bold text-[#222222]">Inventory Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xl font-bold text-[#222222]">24</p>
                <p className="text-[10px] font-bold text-[#6a6a6a] uppercase">Total Units</p>
             </div>
             <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xl font-bold text-emerald-700">8</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Available</p>
             </div>
             <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xl font-bold text-blue-700">12</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase">Reserved</p>
             </div>
             <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xl font-bold text-red-700">4</p>
                <p className="text-[10px] font-bold text-red-600 uppercase">Sold</p>
             </div>
          </div>
       </div>
    </div>
  </div>
);

export default DeveloperUnitsTab;
