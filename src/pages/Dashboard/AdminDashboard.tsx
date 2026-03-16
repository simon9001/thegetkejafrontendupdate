import React, { useState, useEffect } from 'react';
import ModernDashboardLayout, { type NavigationItem } from '../../components/layout/ModernDashboardLayout';
import StatGauge from '../../components/dashboard/StatGauge';
import OrderDonut from '../../components/dashboard/OrderDonut';
import SalesChart from '../../components/dashboard/SalesChart';
import DataTable from '../../components/dashboard/DataTable';
import ActionModal from '../../components/dashboard/modals/ActionModal';
import { useGetDashboardStatsQuery } from '../../features/Api/DashboardApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import {
    useGetAllPropertiesQuery,
    useVerifyPropertyMutation,
    useDeletePropertyMutation,
    useStrikePropertyMutation,
    useBoostPropertyMutation
} from '../../features/Api/PropertiesApi';
import { ShieldCheck, Zap, AlertTriangle, Trash2, CheckCircle, Users, LayoutDashboard, UserMinus, UserCheck, Shield } from 'lucide-react';
import {
    useGetAllUsersQuery,
    useUpdateUserRoleMutation,
    useUpdateUserStatusMutation,
    useDeleteUserMutation
} from '../../features/Api/UsersApi';

const AdminDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.authSlice.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const [activeTab, setActiveTab] = useState('properties');

    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        action: string;
        id: string;
        currentVal?: any;
    }>({ isOpen: false, action: '', id: '' });
    const [promptInput, setPromptInput] = useState('');

    const { data: stats, isLoading: isStatsLoading } = useGetDashboardStatsQuery(undefined, {
        skip: !user || user.role !== 'admin'
    });
    const { data: propertiesData, isLoading: isPropertiesLoading } = useGetAllPropertiesQuery(undefined, {
        skip: !user || user.role !== 'admin' || activeTab !== 'properties'
    });
    const { data: usersData, isLoading: isUsersLoading } = useGetAllUsersQuery(undefined, {
        skip: !user || user.role !== 'admin' || activeTab !== 'users'
    });

    const [verifyProperty] = useVerifyPropertyMutation();
    const [deleteProperty] = useDeletePropertyMutation();
    const [strikeProperty] = useStrikePropertyMutation();
    const [boostProperty] = useBoostPropertyMutation();

    const [updateUserRole] = useUpdateUserRoleMutation();
    const [updateUserStatus] = useUpdateUserStatusMutation();
    const [deleteUser] = useDeleteUserMutation();

    const properties = propertiesData?.properties || [];

    const confirmAction = async () => {
        const { action, id, currentVal } = modalConfig;
        try {
            switch (action) {
                // Property Actions
                case 'verify':
                    await verifyProperty(id).unwrap();
                    break;
                case 'delete-property':
                    await deleteProperty(id).unwrap();
                    break;
                case 'strike':
                    await strikeProperty({ id, isStruck: !currentVal }).unwrap();
                    break;
                case 'boost':
                    await boostProperty({ id, isBoosted: !currentVal }).unwrap();
                    break;

                // User Actions
                case 'delete-user':
                    await deleteUser(id).unwrap();
                    break;
                case 'toggle-active':
                    await updateUserStatus({ id, status: !currentVal }).unwrap();
                    break;
                case 'change-role':
                    if (promptInput) {
                        const roles = promptInput.split(',').map(r => r.trim()).filter(Boolean);
                        await updateUserRole({ id, roles }).unwrap();
                    }
                    break;
            }
        } catch (error) {
            console.error(`${action} failed:`, error);
            alert(`Action failed: ${action}`);
        } finally {
            closeModal();
        }
    };

    const openModal = (action: string, id: string, currentVal?: any) => {
        setModalConfig({ isOpen: true, action, id, currentVal });
        if (action === 'change-role') {
            setPromptInput(currentVal?.join(',') || '');
        }
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, action: '', id: '' });
        setPromptInput('');
    };

    const tableItems = properties.map((p, index) => ({
        slNo: (index + 1).toString().padStart(2, '0'),
        orderNumber: p.id.slice(0, 8).toUpperCase(),
        customerName: p.title,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
        orderValue: p.owner?.full_name || 'N/A',
        status: (p.is_struck ? 'Canceled' : p.is_verified ? 'Done' : 'Pending') as any,
        raw: p
    }));

    const userTableItems = (usersData?.users || []).map((u, index) => ({
        slNo: (index + 1).toString().padStart(2, '0'),
        orderNumber: u.phone || 'NO PHONE',
        customerName: u.full_name,
        date: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
        orderValue: u.email,
        status: (u.is_active ? 'Done' : 'Canceled') as any,
        raw: u
    }));

    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <ShieldCheck size={48} className="text-red-500 opacity-20" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
            </div>
        );
    }

    if (isStatsLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0F172A]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D4A373] border-t-transparent"></div>
            </div>
        );
    }

    const navigation: NavigationItem[] = [
        { id: 'properties', name: 'Properties', icon: LayoutDashboard },
        { id: 'users', name: 'User Management', icon: Users }
    ];

    const renderModalContent = () => {
        const { action } = modalConfig;

        switch (action) {
            case 'change-role':
                return (
                    <ActionModal
                        isOpen={modalConfig.isOpen}
                        onClose={closeModal}
                        title="Update User Roles"
                        description="Enter the new roles separated by commas (e.g., user, agent, landlord)"
                        icon={Shield}
                        iconColor="primary"
                        onSubmit={confirmAction}
                    >
                        <input
                            type="text"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#D4A373] dark:text-white"
                            value={promptInput}
                            onChange={e => setPromptInput(e.target.value)}
                            placeholder="user, admin"
                        />
                    </ActionModal>
                );
            case 'delete-user':
                return (
                    <ActionModal
                        isOpen={modalConfig.isOpen}
                        onClose={closeModal}
                        title="Delete User Account"
                        description="Are you sure you want to PERMANENTLY delete this user? This cannot be undone."
                        icon={Trash2}
                        iconColor="red"
                        submitColor="red"
                        submitText="Delete Permanently"
                        onSubmit={confirmAction}
                    />
                );
            case 'delete-property':
                return (
                    <ActionModal
                        isOpen={modalConfig.isOpen}
                        onClose={closeModal}
                        title="Delete Property"
                        description="Are you sure you want to delete this property? This action is irreversible."
                        icon={Trash2}
                        iconColor="red"
                        submitColor="red"
                        submitText="Delete Property"
                        onSubmit={confirmAction}
                    />
                );
            case 'verify':
                return (
                    <ActionModal
                        isOpen={modalConfig.isOpen}
                        onClose={closeModal}
                        title="Verify Property"
                        description="Are you sure you want to mark this property as officially verified?"
                        icon={CheckCircle}
                        iconColor="green"
                        submitColor="green"
                        submitText="Verify"
                        onSubmit={confirmAction}
                    />
                );
            case 'strike':
                return (
                    <ActionModal
                        isOpen={modalConfig.isOpen}
                        onClose={closeModal}
                        title={modalConfig.currentVal ? "Remove Strike" : "Strike Property"}
                        description={modalConfig.currentVal ? "This action will unstrike the property." : "Striking this property will suspend it and remove any verification or boost status."}
                        icon={AlertTriangle}
                        iconColor={modalConfig.currentVal ? "blue" : "amber"}
                        submitColor={modalConfig.currentVal ? "blue" : "amber"}
                        submitText={modalConfig.currentVal ? "Unstrike" : "Strike"}
                        onSubmit={confirmAction}
                    />
                );
            case 'boost':
                return (
                    <ActionModal
                        isOpen={modalConfig.isOpen}
                        onClose={closeModal}
                        title={modalConfig.currentVal ? "Remove Boost" : "Boost Property"}
                        description={modalConfig.currentVal ? "Remove premium boost positioning from this property?" : "Give this property premium boost positioning?"}
                        icon={Zap}
                        iconColor="amber"
                        submitColor="amber"
                        submitText={modalConfig.currentVal ? "Unboost" : "Boost Now"}
                        onSubmit={confirmAction}
                    />
                );
            case 'toggle-active':
                return (
                    <ActionModal
                        isOpen={modalConfig.isOpen}
                        onClose={closeModal}
                        title={modalConfig.currentVal ? "Deactivate User" : "Activate User"}
                        description={modalConfig.currentVal ? "This user will no longer be able to log in." : "Restore this user's account access."}
                        icon={modalConfig.currentVal ? UserMinus : UserCheck}
                        iconColor={modalConfig.currentVal ? "red" : "green"}
                        submitColor={modalConfig.currentVal ? "red" : "green"}
                        submitText="Confirm"
                        onSubmit={confirmAction}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ModernDashboardLayout
            user={user}
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarTitle="Admin Nexus"
            sidebarSubtitle="Platform Control"
            sidebarIcon={ShieldCheck}
        >
            <div className="space-y-8 pb-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatGauge label="Total Users" value={stats?.totalUsers?.toString() || '0'} percentage={100} color="#D4A373" />
                    <StatGauge label="Total Properties" value={stats?.totalProperties?.toString() || '0'} percentage={80} color="#E6B17E" />
                    <StatGauge label="Pending Verifications" value={stats?.pendingVerifications?.toString() || '0'} percentage={30} color="#8B6E4E" />
                    <StatGauge label="Monthly Revenue" value={`$${stats?.monthlyRevenue || '0'}`} percentage={45} color="#D4A373" />
                </div>

                {isPropertiesLoading || isUsersLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D4A373] border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {/* Content Section */}
                        {activeTab === 'properties' ? (
                            <div className="bg-white dark:bg-[#1B2430] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Property Hub</h2>
                                        <p className="text-gray-500 text-xs mt-1">Manage verification, visibility, and strikes</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                        <ShieldCheck size={12} className="text-blue-500" /> Secure System
                                    </span>
                                </div>

                                <DataTable
                                    items={tableItems}
                                    renderAction={(item) => {
                                        const p = item.raw;
                                        return (
                                            <div className="flex items-center justify-end gap-2">
                                                {!p.is_verified && !p.is_struck && (
                                                    <button
                                                        onClick={() => openModal('verify', p.id)}
                                                        className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-transparent hover:border-blue-600 group/tip relative shadow-sm"
                                                        title="Verify"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openModal('boost', p.id, p.is_boosted)}
                                                    className={`p-2 rounded-xl transition-all border shadow-sm group/tip relative ${p.is_boosted ? 'bg-[#D4A373] text-white border-[#D4A373]' : 'bg-[#D4A373]/10 text-[#D4A373] border-[#D4A373]/20 hover:bg-[#D4A373] hover:text-white'}`}
                                                    title={p.is_boosted ? 'Unboost' : 'Boost'}
                                                >
                                                    <Zap size={16} fill={p.is_boosted ? 'currentColor' : 'none'} />
                                                </button>
                                                <button
                                                    onClick={() => openModal('strike', p.id, p.is_struck)}
                                                    className={`p-2 rounded-xl transition-all border shadow-sm group/tip relative ${p.is_struck ? 'bg-red-500 text-white border-red-500' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                                                    title={p.is_struck ? 'Unstrike' : 'Strike'}
                                                >
                                                    <AlertTriangle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openModal('delete-property', p.id)}
                                                    className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-transparent hover:border-red-600 group/tip relative shadow-sm"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1B2430] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Matrix</h2>
                                        <p className="text-gray-500 text-xs mt-1">Manage accounts, roles, and access</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-widest">
                                        <ShieldCheck size={12} className="text-green-500" /> Authorized Only
                                    </span>
                                </div>

                                <DataTable
                                    items={userTableItems}
                                    renderAction={(item) => {
                                        const u = item.raw;
                                        return (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal('change-role', u.id, u.roles)}
                                                    className="p-2 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-transparent hover:border-blue-600 shadow-sm"
                                                    title="Change Role"
                                                >
                                                    <ShieldCheck size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openModal('toggle-active', u.id, u.is_active)}
                                                    className={`p-2 rounded-xl transition-all border shadow-sm ${u.is_active ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 hover:bg-orange-500 hover:text-white' : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 hover:bg-green-500 hover:text-white'}`}
                                                    title={u.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {u.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => openModal('delete-user', u.id)}
                                                    className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-transparent hover:border-red-600 shadow-sm"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Secondary Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <OrderDonut />
                    <SalesChart />
                </div>
            </div>

            {/* Modals Gateway */}
            {renderModalContent()}

        </ModernDashboardLayout>
    );
};

export default AdminDashboard;
