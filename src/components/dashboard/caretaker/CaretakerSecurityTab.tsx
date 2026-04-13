// components/dashboard/caretaker/CaretakerSecurityTab.tsx
import React from 'react';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import { SectionHeader } from '../shared';

const CaretakerSecurityTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Security & Incidents" sub="Daily security logs and incident reports" />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
       <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-[#222222] text-sm">Incident Feed</h3>
          <button className="text-xs font-bold text-[#ff385c] hover:underline">+ New Entry</button>
       </div>
       <div className="divide-y divide-gray-50">
          {[
            { time: '10:30 PM', event: 'Main Gate Lock Check', status: 'secure' },
            { time: '08:15 PM', event: 'Unauthorized Access Attempt', status: 'flagged' },
            { time: '06:00 PM', event: 'Shift Handover', status: 'secure' },
          ].map((e, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-[#6a6a6a]" /></div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{e.event}</p>
                    <p className="text-[11px] text-[#6a6a6a]">{e.time}</p>
                  </div>
               </div>
               {e.status === 'flagged' ? (
                 <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100"><AlertTriangle className="w-3 h-3" /> Flagged</span>
               ) : (
                 <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">Secure</span>
               )}
            </div>
          ))}
       </div>
    </div>
  </div>
);

export default CaretakerSecurityTab;
