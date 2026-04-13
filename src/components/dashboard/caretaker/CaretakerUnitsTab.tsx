// components/dashboard/caretaker/CaretakerUnitsTab.tsx
import React from 'react';
import { Building2, Phone } from 'lucide-react';
import { SectionHeader, Badge } from '../shared';

const MOCK_UNITS = [
  { number: 'A-101', type: '2 Bedroom', floor: 1, tenant: 'James Ochieng', phone: '0712 345 678', status: 'occupied', rent: 25000 },
  { number: 'A-102', type: '1 Bedroom', floor: 1, tenant: 'Mary Wanjiku',  phone: '0723 456 789', status: 'occupied', rent: 18000 },
  { number: 'B-201', type: 'Bedsitter', floor: 2, tenant: null,            phone: null,            status: 'vacant',   rent: 12000 },
  { number: 'B-204', type: '2 Bedroom', floor: 2, tenant: 'Peter Kamau',   phone: '0734 567 890', status: 'occupied', rent: 25000 },
  { number: 'C-305', type: 'Studio',    floor: 3, tenant: 'Grace Achieng', phone: '0745 678 901', status: 'occupied', rent: 15000 },
];

const CaretakerUnitsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Unit Management" sub={`${MOCK_UNITS.filter(u => u.status === 'occupied').length} occupied units`} />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3.5">Unit</th>
              <th className="text-left px-5 py-3.5">Type</th>
              <th className="text-left px-5 py-3.5">Tenant</th>
              <th className="text-right px-5 py-3.5">Rent</th>
              <th className="text-right px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_UNITS.map(u => (
              <tr key={u.number} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-bold text-[#222222]">{u.number}</td>
                <td className="px-5 py-4 text-[#6a6a6a]">{u.type} · Floor {u.floor}</td>
                <td className="px-5 py-4">
                  {u.tenant ? (
                    <div>
                      <p className="font-semibold text-[#222222]">{u.tenant}</p>
                      <p className="text-[11px] text-[#6a6a6a]">{u.phone}</p>
                    </div>
                  ) : <span className="text-[#6a6a6a] italic">None</span>}
                </td>
                <td className="px-5 py-4 text-right font-bold text-[#222222]">KES {u.rent.toLocaleString()}</td>
                <td className="px-5 py-4 text-right"><Badge status={u.status} /></td>
                <td className="px-5 py-4 text-right">
                  <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"><Phone className="w-3.5 h-3.5 text-[#6a6a6a]" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default CaretakerUnitsTab;
