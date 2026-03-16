import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useGetUsersQuery, useUpdateUserRoleMutation, useUpdateUserStatusMutation } from '../../features/Api/DashboardApi';
import { Search, UserCog, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const UserManagement: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, isLoading } = useGetUsersQuery({ page, search });
    const [updateRole] = useUpdateUserRoleMutation();
    const [updateStatus] = useUpdateUserStatusMutation();

    const handleRoleChange = async (userId: string, currentRoles: string[]) => {
        const newRole = window.prompt('Enter new roles (comma separated, e.g., admin,verifier):', currentRoles.join(','));
        if (newRole !== null) {
            await updateRole({ id: userId, roles: newRole.split(',').map(r => r.trim()) });
        }
    };

    const handleStatusChange = async (userId: string, currentStatus: string) => {
        const newStatus = window.prompt('Enter new status (pending, active, banned):', currentStatus);
        if (newStatus !== null) {
            await updateStatus({ id: userId, status: newStatus.trim() });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1B2430] p-6 md:p-8 rounded-[32px] border border-[#2C3A4E] relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black text-white">User Intelligence</h1>
                        <p className="text-[#D4A373] font-bold mt-1 tracking-tight opacity-80 uppercase text-xs">Manage platform access and permissions</p>
                    </div>

                    <div className="relative w-full md:w-96 z-10">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0F172A] border border-[#2C3A4E] rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-[#D4A373]/30 outline-none transition-all placeholder:text-gray-600 font-medium"
                        />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A373]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>

                {/* Table Container */}
                <div className="bg-[#1B2430] rounded-[32px] border border-[#2C3A4E] overflow-hidden shadow-2xl shadow-black/20">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="bg-[#0F172A] border-b border-[#2C3A4E]">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Roles</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Created</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2C3A4E]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4A373] border-t-transparent mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : data?.users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-[#D4A373] border border-[#2C3A4E] font-black uppercase text-xs">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                                    ) : user.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-[#D4A373] transition-colors">{user.full_name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles.map((role: string) => (
                                                    <span key={role} className="px-2 py-0.5 bg-[#D4A373]/10 text-[#D4A373] text-[10px] font-black uppercase tracking-tighter rounded-md border border-[#D4A373]/20">
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                user.status === 'pending' ? 'bg-[#E6B17E]/10 text-[#E6B17E]' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                {user.status === 'active' ? <CheckCircle size={12} /> :
                                                    user.status === 'pending' ? <Shield size={12} /> :
                                                        <Ban size={12} />}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRoleChange(user.id, user.roles)}
                                                    className="p-2 bg-[#0F172A] text-gray-400 hover:text-[#D4A373] rounded-lg border border-[#2C3A4E] transition-all"
                                                    title="Change Role"
                                                >
                                                    <UserCog size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(user.id, user.status)}
                                                    className="p-2 bg-[#0F172A] text-gray-400 hover:text-[#D4A373] rounded-lg border border-[#2C3A4E] transition-all"
                                                    title="Update Status"
                                                >
                                                    <Shield size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-5 flex items-center justify-between bg-[#0F172A]/50 border-t border-[#2C3A4E]">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60">Total Users: {data?.total || 0}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="p-2 bg-[#1B2430] text-gray-400 hover:text-white rounded-lg border border-[#2C3A4E] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-black text-white px-4">Page {page}</span>
                            <button
                                onClick={() => setPage(prev => prev + 1)}
                                disabled={!data || data.users.length < 10}
                                className="p-2 bg-[#1B2430] text-gray-400 hover:text-white rounded-lg border border-[#2C3A4E] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserManagement;
