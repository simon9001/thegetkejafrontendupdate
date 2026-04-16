// components/dashboard/staff/StaffDisputesTab.tsx
import React from 'react';
import { Scale, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SectionHeader, Badge, EmptyState } from '../shared';
import {
  useGetModerationDisputesQuery,
  useResolveDisputeMutation,
} from '../../../features/Api/AdminApi';

const StaffDisputesTab: React.FC = () => {
  const { data, isLoading } = useGetModerationDisputesQuery({ page: 1, limit: 15 });
  const [resolve] = useResolveDisputeMutation();

  const handleResolve = async (id: string, resolution: 'resolved_guest'|'resolved_host') => {
    try {
      await resolve({ disputeId: id, resolution, resolution_notes: 'Resolved by Staff' }).unwrap();
      toast.success('Dispute resolved');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Resolution failed');
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Booking Disputes" sub="Manage and resolve user disputes" />

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : !data?.disputes?.length ? (
        <EmptyState icon={Scale} message="Relax! No disputes found." />
      ) : (
        <div className="space-y-4">
          {data.disputes.map((d: any) => (
            <motion.div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#6a6a6a]">REF: {d.booking_id.slice(0, 8)}</span>
                    <Badge status={d.status} />
                  </div>
                  <h4 className="font-bold text-[#222222]">{d.reason}</h4>
                </div>
                <div className="text-right">
                   <p className="text-lg font-bold text-[#ff385c]">KES {d.total_charged_kes?.toLocaleString()}</p>
                   <p className="text-[10px] text-[#6a6a6a] font-medium">Escrow Amount</p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4 text-sm text-amber-900">
                <p className="flex items-center gap-2 font-bold mb-1"><AlertCircle className="w-4 h-4" /> Guest Statement</p>
                <p className="italic">"{d.guest_statement ?? 'No statement provided'}"</p>
              </div>

              {d.status === 'open' && (
                <div className="flex gap-3 pt-4 border-t border-gray-50">
                  <button onClick={() => handleResolve(d.id, 'resolved_guest')} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors">Refund Guest</button>
                  <button onClick={() => handleResolve(d.id, 'resolved_host')} className="flex-1 py-2 bg-[#222222] text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">Pay Landlord</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDisputesTab;
