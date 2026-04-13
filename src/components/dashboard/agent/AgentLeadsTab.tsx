// components/dashboard/agent/AgentLeadsTab.tsx
import React from 'react';
import { Users, Phone, MessageSquare } from 'lucide-react';
import { SectionHeader } from '../shared';

const MOCK_LEADS = [
  { id: 'L-001', name: "Fatuma Ali",       intent: 'Rent', budget: 'KES 30,000', area: 'Kilimani', contacted: '2 hrs ago',  source: 'WhatsApp' },
  { id: 'L-002', name: "Robert Ndung'u",   intent: 'Buy',  budget: 'KES 8M',     area: 'Karen',    contacted: '1 day ago',  source: 'Website' },
  { id: 'L-003', name: 'Lucy Wambui',      intent: 'Rent', budget: 'KES 20,000', area: 'Westlands',contacted: '2 days ago', source: 'Referral' },
];

const AgentLeadsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Client Leads" sub={`${MOCK_LEADS.length} active leads`} />
    <div className="grid gap-3">
      {MOCK_LEADS.map(l => (
        <div key={l.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-[#222222]">{l.name}</p>
              <p className="text-xs text-[#6a6a6a]">{l.intent} · {l.area} · Budget: {l.budget}</p>
              <p className="text-[11px] text-[#6a6a6a] mt-0.5">Via {l.source} · {l.contacted}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AgentLeadsTab;
