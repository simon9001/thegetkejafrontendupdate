// components/dashboard/caretaker/CaretakerTicketsTab.tsx
import React, { useState } from 'react';
import { Wrench, PlusCircle } from 'lucide-react';
import { SectionHeader } from '../shared';

const MOCK_TICKETS = [
  { id: 'T-001', unit: 'Unit A-102', category: 'Plumbing',     desc: 'Leaking pipe under sink',     priority: 'urgent', status: 'pending',     reported: '2 hrs ago' },
  { id: 'T-002', unit: 'Unit B-204', category: 'Electrical',   desc: 'Power socket not working',    priority: 'normal', status: 'in_progress', reported: '1 day ago' },
  { id: 'T-003', unit: 'Unit C-305', category: 'Cleaning',     desc: 'Common area cleaning',        priority: 'low',    status: 'done',        reported: '3 days ago' },
  { id: 'T-004', unit: 'Unit D-101', category: 'Security',     desc: 'Door lock replacement',       priority: 'urgent', status: 'pending',     reported: '5 hrs ago' },
  { id: 'T-005', unit: 'Unit E-202', category: 'Maintenance',  desc: 'Window seal broken',          priority: 'normal', status: 'pending',     reported: '2 days ago' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending:     'bg-amber-50  text-amber-700  border-amber-200',
    in_progress: 'bg-blue-50   text-blue-700   border-blue-200',
    done:        'bg-emerald-50 text-emerald-700 border-emerald-200',
    urgent:      'bg-red-50    text-red-700    border-red-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const CaretakerTicketsTab: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'done'>('all');
  const filtered = filter === 'all' ? MOCK_TICKETS : MOCK_TICKETS.filter(t => t.status === filter);

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title="Maintenance Tickets"
        sub={`${MOCK_TICKETS.filter(t => t.status === 'pending').length} pending`}
        action={
          <button className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
            <PlusCircle className="w-4 h-4" /> New Ticket
          </button>
        }
      />
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'in_progress', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
              filter === f ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#6a6a6a] border-gray-200 hover:border-gray-400'
            }`}>{f.replace('_', ' ')}</button>
        ))}
      </div>
      <div className="grid gap-3">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                  <Wrench className="w-5 h-5 text-[#6a6a6a]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#222222]">{t.unit} · {t.category}</h4>
                  <p className="text-sm text-[#6a6a6a] mt-0.5">{t.desc}</p>
                  <p className="text-[11px] text-[#6a6a6a] mt-1.5">Reported {t.reported}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={t.status} />
                {t.priority === 'urgent' && <StatusBadge status="urgent" />}
              </div>
            </div>
            {t.status !== 'done' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-[#6a6a6a] hover:bg-gray-100 transition-colors">Start Progress</button>
                <button className="px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">Mark Resolved</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaretakerTicketsTab;
