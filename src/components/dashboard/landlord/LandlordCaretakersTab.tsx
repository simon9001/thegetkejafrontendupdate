// components/dashboard/landlord/LandlordCaretakersTab.tsx
import React from 'react';
import { Phone, Mail, Edit3, UserCog } from 'lucide-react';
import { SectionHeader, Badge } from '../shared';

const MOCK_CARETAKERS = [
  { id: 1, name: 'Mike Wilson', property: 'Sunset Apartments', phone: '+254 712 345 678', status: 'active' },
  { id: 2, name: 'Sarah Brown', property: 'Green Heights',     phone: '+254 723 456 789', status: 'active' },
  { id: 3, name: 'David Lee',   property: 'Urban Loft',        phone: '+254 734 567 890', status: 'inactive' },
];

const LandlordCaretakersTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title="Caretakers"
      sub="Property caretakers under your management"
      action={
        <button className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
          <UserCog className="w-4 h-4" /> Add Caretaker
        </button>
      }
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_CARETAKERS.map(c => (
        <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                <span className="text-[#ff385c] font-bold">{c.name[0]}</span>
              </div>
              <div>
                <h3 className="font-bold text-[#222222]">{c.name}</h3>
                <p className="text-xs text-[#6a6a6a]">{c.property}</p>
              </div>
            </div>
            <Badge status={c.status} />
          </div>
          <div className="space-y-1.5 mb-4">
            <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{c.phone}</p>
            <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{c.name.toLowerCase().replace(' ', '.')}@example.com</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#222222] hover:bg-gray-50 transition-colors">Message</button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl text-[#6a6a6a] hover:bg-gray-50 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LandlordCaretakersTab;
