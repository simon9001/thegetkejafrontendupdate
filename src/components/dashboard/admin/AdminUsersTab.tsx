// components/dashboard/admin/AdminUsersTab.tsx
import React, { useState } from 'react';
import { Search, Filter, UserX, UserCheck, Shield, ChevronDown, Download } from 'lucide-react';
import { SectionHeader, Badge, Pagination, ConfirmModal, EmptyState } from '../shared';
import { useGetUsersQuery, useUpdateUserRoleMutation, useUpdateUserStatusMutation } from '../../../features/Api/DashboardApi';
import { useSuspendUserMutation, useBanUserMutation, useReactivateUserMutation, useGetUserStatsQuery } from '../../../features/Api/AdminApi';
import { exportToCsv } from '../../../utils/csvExport';

const ROLES = ['all', 'super_admin', 'staff', 'landlord', 'agent', 'caretaker', 'developer', 'seeker'];
const STATUSES = ['all', 'active', 'suspended', 'banned', 'pending_verify'];

const AdminUsersTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState<{ type: string; userId: string; name: string } | null>(null);

  const { data: userStats } = useGetUserStatsQuery();
  const { data, isLoading } = useGetUsersQuery({
    page, limit: 15, search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const [suspendUser] = useSuspendUserMutation();
  const [banUser] = useBanUserMutation();
  const [reactivateUser] = useReactivateUserMutation();

  const users = data?.users ?? [];
  const totalPages = data?.pages ?? 1;

  const handleConfirm = async (notes?: string) => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'suspend') await suspendUser({ userId: confirmAction.userId, reason: notes || 'Admin action' }).unwrap();
      else if (confirmAction.type === 'ban') await banUser({ userId: confirmAction.userId, reason: notes || 'Admin action' }).unwrap();
      else if (confirmAction.type === 'reactivate') await reactivateUser(confirmAction.userId).unwrap();
    } catch {}
    setConfirmAction(null);
  };

  const handleExport = () => {
    if (!users.length) return;
    const exportData = users.map(u => ({
      name: u.full_name ?? '—',
      email: u.email,
      roles: (u.roles ?? []).join(', '),
      status: u.account_status ?? u.status ?? 'active',
      provider: u.auth_provider ?? 'email',
      joined: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '—'
    }));
    exportToCsv(exportData, 'users-report');
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader title="User Management" sub={`${userStats?.new_this_month ?? 0} new users this month · ${userStats?.verified_ids_total ?? 0} verified IDs`} />
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#222222] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export Users
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(userStats?.by_role ?? {}).slice(0, 4).map(([role, count]) => (
          <div key={role} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xl font-bold text-[#222222]">{(count as number).toLocaleString()}</p>
            <p className="text-xs text-[#6a6a6a] capitalize mt-0.5">{role.replace('_', ' ')}s</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a]" />
          <input type="text" placeholder="Search by name or email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#222222] placeholder:text-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c]"
          />
        </div>
        <div className="relative">
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 cursor-pointer">
            {ROLES.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r.replace('_', ' ')}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a6a6a] pointer-events-none" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2.5 text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ')}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a6a6a] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={Search} message="No users found" sub="Try adjusting your search or filters" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Roles</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Provider</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Joined</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <span className="text-blue-600 text-xs font-bold">{(u.full_name ?? u.email ?? '?')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#222222] text-sm">{u.full_name ?? 'No name'}</p>
                          <p className="text-xs text-[#6a6a6a]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles ?? []).map((r: string) => <Badge key={r} status={r === 'super_admin' ? 'escalated' : r === 'staff' ? 'active' : 'inactive'} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge status={u.account_status ?? u.status ?? 'active'} /></td>
                    <td className="px-4 py-3"><span className="text-xs text-[#6a6a6a] capitalize">{u.auth_provider ?? 'email'}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-[#6a6a6a]">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {(u.account_status ?? u.status) !== 'suspended' && (u.account_status ?? u.status) !== 'banned' && (
                          <button onClick={() => setConfirmAction({ type: 'suspend', userId: u.id, name: u.full_name ?? u.email })}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Suspend">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(u.account_status ?? u.status) !== 'banned' && (
                          <button onClick={() => setConfirmAction({ type: 'ban', userId: u.id, name: u.full_name ?? u.email })}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Ban">
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {((u.account_status ?? u.status) === 'suspended' || (u.account_status ?? u.status) === 'banned') && (
                          <button onClick={() => setConfirmAction({ type: 'reactivate', userId: u.id, name: u.full_name ?? u.email })}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Reactivate">
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction ? `${confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)} User` : ''}
        message={confirmAction ? `Are you sure you want to ${confirmAction.type} "${confirmAction.name}"?` : ''}
        confirmLabel={confirmAction?.type === 'reactivate' ? 'Reactivate' : confirmAction?.type === 'ban' ? 'Ban User' : 'Suspend'}
        confirmClass={confirmAction?.type === 'reactivate' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        showNotes={confirmAction?.type !== 'reactivate'}
        notesPlaceholder="Reason for action…"
      />
    </div>
  );
};

export default AdminUsersTab;
