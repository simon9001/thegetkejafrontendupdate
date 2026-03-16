import React, { useState, useEffect } from 'react';
import ModernDashboardLayout, { type NavigationItem } from '../../components/layout/ModernDashboardLayout';
import StatGauge from '../../components/dashboard/StatGauge';
import OrderDonut from '../../components/dashboard/OrderDonut';
import SalesChart from '../../components/dashboard/SalesChart';
import DataTable from '../../components/dashboard/DataTable';
import { Plus, LayoutDashboard, Building2, Calendar } from 'lucide-react';
import { useGetDashboardStatsQuery } from '../../features/Api/DashboardApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const AgentDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.authSlice.user);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user && user.role !== 'agent') {
            navigate('/');
        }
    }, [user, navigate]);

    const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined, {
        skip: !user || user.role !== 'agent'
    });

    const tableItems = [
        { slNo: '01', orderNumber: '#142', customerName: 'Sarah Jenkins', date: '24-02-2023', orderValue: '$450.00', status: 'Done' as const },
        { slNo: '02', orderNumber: '#143', customerName: 'Robert Wilson', date: '24-02-2023', orderValue: '$1,200.00', status: 'Pending' as const },
        { slNo: '03', orderNumber: '#144', customerName: 'Emily Davis', date: '25-02-2023', orderValue: '$85.00', status: 'Done' as const },
        { slNo: '04', orderNumber: '#145', customerName: 'Michael Brown', date: '25-02-2023', orderValue: '$320.00', status: 'Done' as const },
        { slNo: '05', orderNumber: '#146', customerName: 'Jessica Taylor', date: '26-02-2023', orderValue: '$150.00', status: 'Canceled' as const },
    ];

    const navigation: NavigationItem[] = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'listings', name: 'My Listings', icon: Building2 },
        { id: 'bookings', name: 'Bookings', icon: Calendar, badge: 1 },
    ];

    if (user?.role !== 'agent') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Building2 size={48} className="text-red-500 opacity-20" />
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
            sidebarTitle="Agent Nexus"
            sidebarSubtitle="Listing Management"
            sidebarIcon={Building2}
        >
            <div className="space-y-8 pb-12">
                {/* Header Section */}
                <div className="flex justify-between items-center bg-[#1B2430] p-8 rounded-[24px] border border-gray-100 dark:border-white/5 relative overflow-hidden shadow-lg">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold text-white">Agent Performance</h1>
                        <p className="text-[#D4A373] mt-1 text-sm">Track your listings and clients.</p>
                    </div>
                    <button className="bg-gradient-to-r from-[#D4A373] to-[#E6B17E] text-[#1B2430] px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#D4A373]/20 hover:scale-105 transition-all relative z-10">
                        <Plus size={18} /> New Listing
                    </button>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D4A373]/10 to-[#E6B17E]/0 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatGauge label="Owned Properties" value={stats?.ownedProperties?.toString() || '0'} percentage={100} color="#D4A373" />
                    <StatGauge label="Active Bookings" value={stats?.activeBookings?.toString() || '0'} percentage={75} color="#E6B17E" />
                    <StatGauge label="Total Revenue" value={`$${stats?.totalRevenue || '0'}`} percentage={60} color="#8B6E4E" />
                    <StatGauge label="Client Inquiries" value="128" percentage={85} color="#D4A373" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <OrderDonut />
                    <SalesChart />
                </div>

                {/* Table Row */}
                <div className="bg-white dark:bg-[#1B2430] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h2>
                        <button className="text-[#D4A373] text-sm font-bold hover:underline bg-[#D4A373]/10 px-4 py-2 rounded-lg transition-colors">View All</button>
                    </div>
                    <DataTable items={tableItems} />
                </div>
            </div>
        </ModernDashboardLayout>
    );
};

export default AgentDashboard;
