import React from 'react';
import { Layers, HardHat, Building2, MapPin, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../shared';
import { useGetDeveloperUnitsQuery } from '../../../features/Api/DeveloperApi';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  available:    { label: 'Available',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  let:          { label: 'Let Out',     color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100' },
  let_out:      { label: 'Let Out',     color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100' },
  sold:         { label: 'Sold',        color: 'text-[#50757A]',   bg: 'bg-gray-100 border-gray-200' },
  off_market:   { label: 'Off Market',  color: 'text-gray-500',    bg: 'bg-gray-50 border-gray-100' },
  under_offer:  { label: 'Under Offer', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-100' },
};

const CATEGORY_LABELS: Record<string, string> = {
  for_sale:        'For Sale',
  long_term_rent:  'Long-term Rent',
  short_term_rent: 'Short Stay',
  commercial:      'Commercial',
};

const CONSTRUCTION_LABELS: Record<string, string> = {
  completed:          'Completed',
  off_plan:           'Off Plan',
  under_construction: 'Under Construction',
};

const DeveloperUnitsTab: React.FC = () => {
  const { data, isLoading } = useGetDeveloperUnitsQuery();

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48" />)}
        </div>
      </div>
    );
  }

  const inventoryCards = [
    { label: 'Total Units',  value: data?.total_units ?? 0, color: 'text-[#50757A]', bg: 'bg-gray-50 border-gray-100' },
    { label: 'Available',    value: data?.available ?? 0,   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Let / Occupied', value: data?.let_out ?? 0,  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-100' },
    { label: 'Sold',         value: data?.sold ?? 0,        color: 'text-[#50757A]', bg: 'bg-gray-100 border-gray-200' },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Unit Tracker" sub="Construction status and inventory management" />

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {inventoryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-5 rounded-2xl border ${c.bg}`}
          >
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-[11px] font-bold text-[#50757A] uppercase tracking-wider mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Construction Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <HardHat className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-bold text-[#50757A]">Construction Status</h3>
          </div>
          {Object.entries(data?.by_construction ?? {}).length === 0 ? (
            <p className="text-sm text-[#50757A] text-center py-8">No construction data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data?.by_construction ?? {}).map(([key, count]) => {
                const total = data?.total_units || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-[#50757A]">{CONSTRUCTION_LABELS[key] ?? key}</span>
                      <span className="text-[#50757A]">{count} units ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-[#DD6E42] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* By Category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-bold text-[#50757A]">Listing Category</h3>
          </div>
          {Object.entries(data?.by_category ?? {}).length === 0 ? (
            <p className="text-sm text-[#50757A] text-center py-8">No categories data available</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data?.by_category ?? {}).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-[#EAEAEA] border border-gray-100">
                  <span className="text-sm font-medium text-[#50757A]">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                  <span className="text-sm font-bold text-[#DD6E42]">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unit List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#50757A]">All Units</h3>
          <span className="text-xs text-[#50757A] font-medium">{data?.total_units ?? 0} total</span>
        </div>
        {(data?.properties ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-[#50757A]">No units yet. Add your first property.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.properties ?? []).map((prop, i) => {
              const statusCfg = STATUS_CONFIG[prop.status] ?? STATUS_CONFIG['available'];
              return (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 bg-[#50757A]/5 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-[#50757A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#50757A] text-sm truncate">{prop.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#50757A] mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {[prop.location?.area, prop.location?.county].filter(Boolean).join(', ') || 'Kenya'}
                        </span>
                        {prop.bedrooms > 0 && <> · {prop.bedrooms}BR</>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[11px] text-[#50757A]">
                      {CATEGORY_LABELS[prop.listing_category] ?? prop.listing_category}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperUnitsTab;
