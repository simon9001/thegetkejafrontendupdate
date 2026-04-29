import React, { useState } from 'react';
import { Users, Home, Calendar, Phone, Bed } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader, Badge } from '../shared';
import { useGetLandlordTenantsQuery } from '../../../features/Api/DashboardApi';

type Tab = 'long_term' | 'short_stay';

const LandlordTenantsTab: React.FC = () => {
  const { data, isLoading } = useGetLandlordTenantsQuery();
  const [activeTab, setActiveTab] = useState<Tab>('long_term');

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24" />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-64" />
      </div>
    );
  }

  const longTerm   = data?.long_term ?? [];
  const shortStay  = data?.short_stay_guests ?? [];

  const summaryCards = [
    { label: 'Long-term Tenants', value: longTerm.length,  icon: Home,     color: 'bg-[#50757A]/10 text-[#50757A]' },
    { label: 'Guests In Home',    value: shortStay.filter(g => g.status === 'checked_in').length, icon: Bed, color: 'bg-[#DD6E42]/10 text-[#DD6E42]' },
    { label: 'Total Occupants',   value: data?.total ?? 0, icon: Users,    color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title="Tenants & Guests"
        sub={`${longTerm.length} long-term tenants · ${shortStay.length} short-stay guests`}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#50757A]">{c.value}</p>
            <p className="text-xs text-[#50757A] mt-1 font-medium">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['long_term', 'short_stay'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t
                ? 'bg-white text-[#50757A] shadow-sm'
                : 'text-[#50757A] hover:text-[#50757A]'
            }`}
          >
            {t === 'long_term' ? `Long-term (${longTerm.length})` : `Short Stay Guests (${shortStay.length})`}
          </button>
        ))}
      </div>

      {/* Long-term Tenants */}
      {activeTab === 'long_term' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {longTerm.length === 0 ? (
            <div className="py-16 text-center">
              <Home className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-[#50757A] font-medium">No active tenants</p>
              <p className="text-xs text-[#50757A] mt-1">Approved tenancy applications will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-[#50757A] font-semibold uppercase border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3.5">Tenant</th>
                    <th className="text-left px-5 py-3.5">Property</th>
                    <th className="text-left px-5 py-3.5">Lease Period</th>
                    <th className="text-right px-5 py-3.5">Rent (KES)</th>
                    <th className="text-right px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {longTerm.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#DD6E42] flex items-center justify-center shrink-0">
                            <span className="text-[#50757A] text-xs font-bold">
                              {(t.tenant?.full_name ?? 'T')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-[#50757A]">{t.tenant?.full_name ?? 'Tenant'}</p>
                            <p className="text-[11px] text-[#50757A]">{t.tenant?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#50757A]">{t.property_title}</td>
                      <td className="px-5 py-4 text-[#50757A] text-xs">
                        {t.start_date ? new Date(t.start_date).toLocaleDateString('en-KE') : '—'}
                        {' → '}
                        {t.end_date ? new Date(t.end_date).toLocaleDateString('en-KE') : 'Ongoing'}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#50757A]">
                        {(t.monthly_rent_kes ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right"><Badge status={t.status} /></td>
                      <td className="px-5 py-4 text-right">
                        {t.tenant?.phone && (
                          <a href={`tel:${t.tenant.phone}`} className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                            <Phone className="w-3 h-3 text-[#50757A]" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Short-stay Guests In Home */}
      {activeTab === 'short_stay' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {shortStay.length === 0 ? (
            <div className="py-16 text-center">
              <Bed className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-[#50757A] font-medium">No guests currently in-home</p>
              <p className="text-xs text-[#50757A] mt-1">Checked-in or confirmed short-stay guests appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {shortStay.map((g: any, i: number) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#DD6E42]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#DD6E42] text-sm font-bold">
                        {(g.guest?.full_name ?? 'G')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#50757A] text-sm">{g.guest?.full_name ?? 'Guest'}</p>
                      <p className="text-xs text-[#50757A] truncate">{g.property_title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 ml-3">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-xs text-[#50757A]">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {g.check_in_date ? new Date(g.check_in_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
                          {' → '}
                          {g.check_out_date ? new Date(g.check_out_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      </div>
                      <p className="text-xs text-[#50757A] mt-0.5">{g.guests_count ?? 1} guest{(g.guests_count ?? 1) !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#50757A]">KES {(g.total_kes ?? 0).toLocaleString()}</p>
                      <Badge status={g.status} />
                    </div>
                    {g.guest?.phone && (
                      <a href={`tel:${g.guest.phone}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-[#50757A]" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandlordTenantsTab;
