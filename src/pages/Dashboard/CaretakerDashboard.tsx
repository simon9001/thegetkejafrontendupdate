import React, { useState, useEffect } from 'react';
import ModernDashboardLayout, { type NavigationItem } from '../../components/layout/ModernDashboardLayout';
import StatGauge from '../../components/dashboard/StatGauge';
import OrderDonut from '../../components/dashboard/OrderDonut';
import SalesChart from '../../components/dashboard/SalesChart';
import DataTable from '../../components/dashboard/DataTable';
import { Plus, Briefcase, LayoutDashboard, Wrench } from 'lucide-react';
import { useGetDashboardStatsQuery } from '../../features/Api/DashboardApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import PropertyModal from '../../components/dashboard/modals/PropertyModal';

const CaretakerDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.authSlice.user);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'caretaker') {
            navigate('/');
        }
    }, [user, navigate]);

    const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined, {
        skip: !user || user.role !== 'caretaker'
    });

    const tableItems = [
        { slNo: '01', orderNumber: '#301', customerName: 'Unit A-102', date: '21-02-2023', orderValue: 'Maintenance', status: 'Pending' as const },
        { slNo: '02', orderNumber: '#302', customerName: 'Unit B-204', date: '22-02-2023', orderValue: 'Repair', status: 'Done' as const },
        { slNo: '03', orderNumber: '#303', customerName: 'Unit C-005', date: '23-02-2023', orderValue: 'Cleaning', status: 'Pending' as const },
        { slNo: '04', orderNumber: '#304', customerName: 'Unit D-101', date: '24-02-2023', orderValue: 'Plumbing', status: 'Done' as const },
        { slNo: '05', orderNumber: '#305', customerName: 'Unit E-202', date: '25-02-2023', orderValue: 'Electrical', status: 'Canceled' as const },
    ];

    const navigation: NavigationItem[] = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'tasks', name: 'Tasks', icon: Wrench, badge: 2 },
    ];

    if (user?.role !== 'caretaker') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Briefcase size={48} className="text-red-500 opacity-20" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0F172A]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D4A373] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <ModernDashboardLayout
            user={user}
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarTitle="Caretaker Hub"
            sidebarSubtitle="Operations Management"
            sidebarIcon={Briefcase}
        >
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex justify-between items-center bg-[#1B2430] p-8 rounded-[24px] border border-gray-100 dark:border-white/5 relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold text-white">Daily Operations</h1>
                        <p className="text-[#D4A373] mt-1 text-sm">Manage tasks and logging.</p>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <button className="hidden sm:flex bg-white/10 text-white px-6 py-3 rounded-xl font-bold items-center gap-2 hover:bg-white/20 transition-all border border-white/10">
                            Log Work
                        </button>
                        <button
                            onClick={() => setIsPropertyModalOpen(true)}
                            className="bg-gradient-to-r from-[#D4A373] to-[#E6B17E] text-[#1B2430] px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#D4A373]/20 hover:scale-105 transition-all"
                        >
                            <Plus size={18} /> Add Property
                        </button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4A373]/10 to-[#E6B17E]/0 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatGauge label="Managed Units" value={stats?.managedUnits?.toString() || '0'} percentage={100} color="#D4A373" />
                    <StatGauge label="Open Tickets" value={stats?.openTickets?.toString() || '0'} percentage={25} color="#E6B17E" />
                    <StatGauge label="Completed Jobs" value={stats?.completedJobs?.toString() || '0'} percentage={95} color="#8B6E4E" />
                    <StatGauge label="Tenant Inquiries" value="3" percentage={15} color="#D4A373" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <OrderDonut />
                    <SalesChart />
                </div>

                {/* Table Row */}
                <div className="bg-white dark:bg-[#1B2430] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Maintenance Tasks</h2>
                        <button className="text-[#D4A373] text-sm font-bold hover:underline bg-[#D4A373]/10 px-4 py-2 rounded-lg transition-colors">View All</button>
                    </div>
                    <DataTable items={tableItems} />
                </div>
            </div>

            <PropertyModal
                isOpen={isPropertyModalOpen}
                onClose={() => setIsPropertyModalOpen(false)}
            />
        </ModernDashboardLayout>
    );
};

export default CaretakerDashboard;
