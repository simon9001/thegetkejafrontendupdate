// components/dashboard/agent/AgentListingsTab.tsx
import React from 'react';
import { Building2, PlusCircle, MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader, Badge } from '../shared';

const AgentListingsTab: React.FC<{ properties: any[] }> = ({ properties }) => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title={`My Active Listings (${properties.length})`}
      action={
        <Link
          to="/dashboard/add-property"
          className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all"
        >
          <PlusCircle className="w-4 h-4" /> New Listing
        </Link>
      }
    />
    {properties.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-48 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Building2 className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">No listings yet</p>
        <Link to="/dashboard/add-property" className="text-xs text-[#ff385c] font-semibold hover:underline">
          Add your first listing
        </Link>
      </div>
    ) : (
      <div className="grid gap-3">
        {properties.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              {p.images?.[0]?.image_url
                ? <img src={p.images[0].image_url} className="w-full h-full object-cover" alt="" />
                : <Building2 className="w-7 h-7 text-gray-300 mx-auto mt-3.5" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#222222] truncate">{p.title}</p>
              <p className="text-xs text-[#6a6a6a] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {p.location?.town || p.location?.county || 'Nairobi'}
              </p>
              <p className="text-sm font-bold text-[#ff385c] mt-1">
                KES {(p.price_per_month || p.price || 0).toLocaleString()}/mo
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge status={p.status ?? 'active'} />
              <div className="flex items-center gap-1 text-[11px] text-[#6a6a6a]">
                <Eye className="w-3 h-3" /> {p.views_count ?? 0} views
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default AgentListingsTab;
