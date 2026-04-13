// components/dashboard/agent/AgentViewingsTab.tsx
import React from 'react';
import { Calendar, PlusCircle, Phone } from 'lucide-react';
import { SectionHeader, Badge } from '../shared';

const MOCK_VIEWINGS = [
  { id: 'V-001', client: 'Amina Hassan',  property: 'Kilimani 2BR Apt',  date: 'Today, 3:00 PM',     status: 'confirmed' },
  { id: 'V-002', client: 'David Mwangi',  property: 'Westlands Studio',  date: 'Tomorrow, 10:00 AM', status: 'pending' },
  { id: 'V-003', client: 'Sarah Otieno',  property: 'Karen Villa',        date: 'Thu, 2:00 PM',       status: 'confirmed' },
  { id: 'V-004', client: 'John Kariuki',  property: 'Lavington 3BR',      date: 'Fri, 11:00 AM',      status: 'pending' },
];

const AgentViewingsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title="Viewing Schedule"
      sub={`${MOCK_VIEWINGS.filter(v => v.status === 'pending').length} pending confirmation`}
      action={
        <button className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
          <PlusCircle className="w-4 h-4" /> Schedule Viewing
        </button>
      }
    />
    <div className="grid gap-3">
      {MOCK_VIEWINGS.map(v => (
        <div key={v.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#111827] rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#ff385c]" />
            </div>
            <div>
              <p className="font-semibold text-[#222222]">{v.client}</p>
              <p className="text-xs text-[#6a6a6a]">{v.property}</p>
              <p className="text-xs font-bold text-[#ff385c] mt-0.5">{v.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={v.status} />
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <Phone className="w-3.5 h-3.5 text-[#6a6a6a]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AgentViewingsTab;
