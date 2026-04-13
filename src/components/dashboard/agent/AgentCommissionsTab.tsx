// components/dashboard/agent/AgentCommissionsTab.tsx
import React from 'react';
import { DollarSign, Clock, TrendingUp } from 'lucide-react';
import { SectionHeader, Badge } from '../shared';

const AgentCommissionsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Commission Tracker" sub="Earnings and pending payouts" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Earned This Month', value: 'KES 85,000', icon: DollarSign,  accent: 'bg-emerald-50 text-emerald-600' },
        { label: 'Pending Payment',   value: 'KES 60,000', icon: Clock,       accent: 'bg-amber-50 text-amber-600' },
        { label: 'Annual Total',      value: 'KES 720,000',icon: TrendingUp,  accent: 'bg-blue-50 text-blue-600' },
      ].map(c => (
        <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.accent}`}>
            <c.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">{c.value}</p>
          <p className="text-xs text-[#6a6a6a] mt-1 font-medium">{c.label}</p>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      <SectionHeader title="Recent Deals" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase border-b border-gray-100">
              <th className="text-left pb-3 pr-4">Property</th>
              <th className="text-left pb-3 pr-4">Client</th>
              <th className="text-right pb-3 pr-4">Commission</th>
              <th className="text-right pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { property: 'Kilimani 2BR', client: 'Amina Hassan',  amount: 'KES 25,000', status: 'paid' },
              { property: 'Karen Villa',  client: 'David Mwangi',   amount: 'KES 60,000', status: 'pending' },
            ].map((d, i) => (
              <tr key={i}>
                <td className="py-3.5 pr-4 font-semibold text-[#222222]">{d.property}</td>
                <td className="py-3.5 pr-4 text-[#6a6a6a]">{d.client}</td>
                <td className="py-3.5 pr-4 text-right font-bold text-[#222222]">{d.amount}</td>
                <td className="py-3.5 text-right"><Badge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AgentCommissionsTab;
