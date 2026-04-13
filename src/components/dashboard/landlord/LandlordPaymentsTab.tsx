// components/dashboard/landlord/LandlordPaymentsTab.tsx
import React from 'react';
import { DollarSign } from 'lucide-react';
import { SectionHeader, Badge } from '../shared';

const LandlordPaymentsTab: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Payments" sub="Revenue and transaction history" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Total Revenue',      value: `KES ${(stats?.totalRent ?? 0).toLocaleString()}`, sub: '+12.5% from last month', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Payments',   value: 'KES 45,000',  sub: '3 pending invoices', color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'This Month',         value: 'KES 128,000', sub: '8 payments received', color: 'text-blue-600',  bg: 'bg-blue-50' },
      ].map(c => (
        <div key={c.label} className={`${c.bg} rounded-2xl p-5`}>
          <p className={`text-2xl font-bold ${c.color} tracking-tight`}>{c.value}</p>
          <p className="text-xs text-[#6a6a6a] mt-0.5 font-medium">{c.label}</p>
          <p className="text-[11px] text-[#6a6a6a] mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-[#222222]">Recent Transactions</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3">Date</th>
            <th className="text-left px-5 py-3">Property</th>
            <th className="text-left px-5 py-3">Tenant</th>
            <th className="text-right px-5 py-3">Amount</th>
            <th className="text-right px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4 text-[#6a6a6a]">2024-01-15</td>
            <td className="px-5 py-4 font-semibold text-[#222222]">Sunset Apartments</td>
            <td className="px-5 py-4 text-[#6a6a6a]">John Doe</td>
            <td className="px-5 py-4 text-right font-bold text-[#222222]">KES 25,000</td>
            <td className="px-5 py-4 text-right"><Badge status="paid" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export default LandlordPaymentsTab;
