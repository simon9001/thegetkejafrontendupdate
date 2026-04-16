// components/dashboard/admin/AdminAuditTab.tsx
import React, { useState } from 'react';
import { FileText, Search, Shield, Download, Calendar } from 'lucide-react';
import { SectionHeader, Pagination, EmptyState } from '../shared';
import { useGetAuditLogQuery } from '../../../features/Api/AdminApi';
import { exportToCsv } from '../../../utils/csvExport';

const AdminAuditTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const { data, isLoading } = useGetAuditLogQuery({
    page, limit: 20,
    event_type: eventType || undefined,
    user_id: userSearch || undefined,
    from: dateRange.from || undefined,
    to: dateRange.to || undefined
  });

  const events = data?.events ?? [];

  const handleExport = () => {
    if (!events.length) return;
    const exportData = events.map(e => ({
      timestamp: new Date(e.created_at).toLocaleString(),
      event_type: e.event_type,
      user: e.performer_email ?? e.user_email ?? 'System',
      ip_address: e.ip_address,
      metadata: JSON.stringify(e.metadata)
    }));
    exportToCsv(exportData, 'audit-log');
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader title="Security Audit Log" sub="System-wide activity and security event tracking" />
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#222222] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative text-sm">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a]" />
           <input type="text" placeholder="Filter by User ID or Email…" value={userSearch} onChange={e => { setUserSearch(e.target.value); setPage(1); }}
             className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#ff385c]/30" />
        </div>
        <input type="text" placeholder="Event Type (e.g. login)" value={eventType} onChange={e => { setEventType(e.target.value); setPage(1); }}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ff385c]/30" />
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Calendar className="w-3.5 h-3.5 text-[#6a6a6a]" />
          <input 
            type="date" 
            value={dateRange.from} 
            onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="text-[10px] font-bold outline-none bg-transparent w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />)}</div>
        ) : events.length === 0 ? (
          <EmptyState icon={FileText} message="No audit events found" className="border-none" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[#6a6a6a] text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">User / Actor</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${e.event_type?.includes('fail') || e.event_type?.includes('denied') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                           <Shield className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-[#222222] capitalize">{e.event_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-semibold text-[#222222]">{e.performer_email ?? e.user_email ?? 'System'}</p>
                      <p className="text-[#6a6a6a] opacity-60">ID: {(String(e.user_id ?? 'N/A')).slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6a6a6a] font-mono">{e.ip_address ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[#6a6a6a]">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="group relative">
                        <div className="text-[10px] text-[#6a6a6a] truncate font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 cursor-help">
                          {JSON.stringify(e.metadata ?? {})}
                        </div>
                        <div className="absolute z-20 left-0 bottom-full mb-2 hidden group-hover:block bg-[#222222] text-white p-2 rounded text-[10px] max-w-xs break-all shadow-xl">
                          {JSON.stringify(e.metadata ?? {}, null, 2)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100">
          <Pagination page={page} totalPages={data?.pages ?? 1} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default AdminAuditTab;
