// components/dashboard/caretaker/CaretakerUtilitiesTab.tsx
import React from 'react';
import { Droplets, Zap, PlusCircle } from 'lucide-react';
import { SectionHeader } from '../shared';

const CaretakerUtilitiesTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Utility Readings" sub="Track water and electricity usage" action={
      <button className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
        <PlusCircle className="w-4 h-4" /> Log Reading
      </button>
    } />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center"><Droplets className="w-5 h-5 text-cyan-600" /></div>
             <h3 className="font-bold text-[#222222]">Upcoming Water Readings</h3>
          </div>
          <p className="text-sm text-[#6a6a6a] mb-5">12 units have pending meter readings for this month.</p>
          <button className="w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#222222] hover:bg-gray-100">Start Reading Cycle</button>
       </div>
       <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-yellow-600" /></div>
             <h3 className="font-bold text-[#222222]">Electricity Tokens</h3>
          </div>
          <p className="text-sm text-[#6a6a6a] mb-5">Common area token balance: <span className="font-bold text-[#222222]">KES 4,500</span></p>
          <button className="w-full py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#222222] hover:bg-gray-100">Recharge Token</button>
       </div>
    </div>
  </div>
);

export default CaretakerUtilitiesTab;
