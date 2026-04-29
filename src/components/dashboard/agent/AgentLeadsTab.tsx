import React from 'react';
import { Users, Phone, MessageSquare, MapPin, Building2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../shared';
import { useGetAgentLeadsQuery } from '../../../features/Api/AgentApi';

const CATEGORY_LABELS: Record<string, string> = {
  for_sale:        'For Sale',
  long_term_rent:  'Rent',
  short_term_rent: 'Short Stay',
  commercial:      'Commercial',
};

const AgentLeadsTab: React.FC = () => {
  const { data, isLoading } = useGetAgentLeadsQuery();
  const leads = data?.leads ?? [];

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title="Client Leads"
        sub={`${data?.total ?? 0} active lead${(data?.total ?? 0) !== 1 ? 's' : ''}`}
      />

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-[#50757A] font-medium">No leads yet</p>
          <p className="text-xs text-[#50757A] mt-1">
            Enquiries from seekers on your listings will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {leads.map((lead, i) => {
            const unread = lead.unread_b ?? 0;
            const timeAgo = lead.last_message_at
              ? getTimeAgo(new Date(lead.last_message_at))
              : getTimeAgo(new Date(lead.created_at));

            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                    <span className="font-bold text-amber-600 text-sm">
                      {(lead.seeker?.full_name ?? 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#50757A] text-sm truncate">
                        {lead.seeker?.full_name ?? 'Unknown Seeker'}
                      </p>
                      {unread > 0 && (
                        <span className="shrink-0 text-[10px] font-bold bg-[#DD6E42] text-white px-1.5 py-0.5 rounded-full">
                          {unread} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-[#50757A]">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{lead.property?.title ?? 'Property'}</span>
                      </div>
                      {lead.property?.listing_category && (
                        <span className="text-[10px] font-semibold bg-[#50757A]/5 text-[#50757A] px-1.5 py-0.5 rounded-md">
                          {CATEGORY_LABELS[lead.property.listing_category] ?? lead.property.listing_category}
                        </span>
                      )}
                    </div>
                    {lead.property?.location && (
                      <div className="flex items-center gap-1 text-[11px] text-[#50757A] mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {[lead.property.location.area, lead.property.location.county].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#50757A]">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo}</span>
                  </div>
                  {lead.seeker?.phone && (
                    <a
                      href={`tel:${lead.seeker.phone}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  )}
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const diffMs   = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1)   return 'just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)   return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export default AgentLeadsTab;
