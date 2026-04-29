import React, { useState } from 'react';
import { Calendar, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader, Badge } from '../shared';
import { useGetAgentViewingsQuery } from '../../../features/Api/AgentApi';

type FilterStatus = 'all' | 'requested' | 'confirmed' | 'rescheduled';

const STATUS_ICON: Record<string, React.ElementType> = {
  confirmed:   CheckCircle2,
  requested:   Clock,
  rescheduled: AlertCircle,
};

const AgentViewingsTab: React.FC = () => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const { data, isLoading } = useGetAgentViewingsQuery(
    filter !== 'all' ? { status: filter } : undefined
  );

  const viewings = data?.viewings ?? [];

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />
        ))}
      </div>
    );
  }

  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'requested' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Rescheduled', value: 'rescheduled' },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title="Viewing Schedule"
        sub={`${data?.total ?? 0} viewing${(data?.total ?? 0) !== 1 ? 's' : ''} scheduled`}
      />

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === f.value
                ? 'bg-[#50757A] text-white'
                : 'bg-gray-100 text-[#50757A] hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {viewings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-[#50757A] font-medium">No viewings found</p>
          <p className="text-xs text-[#50757A] mt-1">
            {filter !== 'all' ? 'Try changing the filter.' : 'Viewing requests on your listings appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {viewings.map((v, i) => {
            const StatusIcon = STATUS_ICON[v.status] ?? Clock;
            const visitDate = v.visit_date
              ? new Date(v.visit_date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
              : '—';
            const visitTime = v.visit_time ?? '';

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 bg-[#50757A] rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[#DD6E42]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#50757A] text-sm truncate">
                      {v.requester?.full_name ?? 'Prospective Tenant'}
                    </p>
                    <p className="text-xs text-[#50757A] truncate mt-0.5">
                      {v.property?.title ?? 'Property'}
                    </p>
                    {v.property?.location && (
                      <div className="flex items-center gap-1 text-[11px] text-[#50757A] mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {[v.property.location.area, v.property.location.county].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-[#DD6E42]">{visitDate}</p>
                    {visitTime && <p className="text-[11px] text-[#50757A]">{visitTime}</p>}
                  </div>
                  <Badge status={v.status} />
                  {v.requester?.phone && (
                    <a
                      href={`tel:${v.requester.phone}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#50757A]" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentViewingsTab;
