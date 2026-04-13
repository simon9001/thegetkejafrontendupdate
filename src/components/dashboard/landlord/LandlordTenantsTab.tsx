// components/dashboard/landlord/LandlordTenantsTab.tsx
import React from 'react';
import { Key } from 'lucide-react';
import { SectionHeader, Badge } from '../shared';

const MOCK_TENANTS = [
  { id: 1, name: 'John Doe',    property: 'Sunset Apartments', leaseStart: '2024-01-01', leaseEnd: '2024-12-31', status: 'active' },
  { id: 2, name: 'Jane Smith',  property: 'Green Heights',     leaseStart: '2024-02-01', leaseEnd: '2025-01-31', status: 'active' },
  { id: 3, name: 'Bob Johnson', property: 'Urban Loft',        leaseStart: '2023-12-01', leaseEnd: '2024-11-30', status: 'pending' },
];

const LandlordTenantsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Current Tenants" sub={`${MOCK_TENANTS.filter(t => t.status === 'active').length} active tenancies`} />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3.5">Tenant</th>
              <th className="text-left px-5 py-3.5">Property</th>
              <th className="text-left px-5 py-3.5">Lease Period</th>
              <th className="text-right px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_TENANTS.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-semibold text-[#222222]">{t.name}</td>
                <td className="px-5 py-4 text-[#6a6a6a]">{t.property}</td>
                <td className="px-5 py-4 text-[#6a6a6a] text-xs">{t.leaseStart} → {t.leaseEnd}</td>
                <td className="px-5 py-4 text-right"><Badge status={t.status} /></td>
                <td className="px-5 py-4 text-right">
                  <button className="text-xs text-[#ff385c] font-semibold hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default LandlordTenantsTab;
