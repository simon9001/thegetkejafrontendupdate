// components/dashboard/staff/StaffMessagesTab.tsx
import React from 'react';
import { MessageSquare, Shield, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SectionHeader, EmptyState, Badge } from '../shared';
import {
  useGetReportedMessagesQuery,
  useResolveMessageReportMutation,
  useRemoveReportedMessageMutation,
} from '../../../features/Api/AdminApi';

const StaffMessagesTab: React.FC = () => {
  const { data, isLoading } = useGetReportedMessagesQuery({ page: 1, limit: 20 });
  const [resolve] = useResolveMessageReportMutation();
  const [remove] = useRemoveReportedMessageMutation();

  const handleAction = async (action: 'resolve'|'remove', id: string) => {
    try {
      if (action === 'resolve') await resolve(id).unwrap();
      if (action === 'remove') await remove(id).unwrap();
      toast.success('Report processed');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Action failed');
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Reported Messages" sub="Moderation of user-to-user chat flags" />

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : !data?.reports?.length ? (
        <EmptyState icon={MessageSquare} message="No reported messages." />
      ) : (
        <div className="space-y-4">
          {data.reports.map((r: any) => (
            <motion.div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><Shield className="w-4 h-4" /></div>
                   <div>
                     <p className="text-xs font-bold text-red-600 uppercase tracking-tighter">Report Reason: {r.reason}</p>
                     <p className="text-[10px] text-[#6a6a6a]">From: {r.sender_email} · Reported by: {r.reporter_email}</p>
                   </div>
                </div>
                {!r.reviewed && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction('resolve', r.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-100"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleAction('remove', r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
                {r.reviewed && <Badge status="resolved" />}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-[#222222] border border-gray-100 line-clamp-3">
                {r.message_body ?? '[Content Removed]'}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffMessagesTab;
