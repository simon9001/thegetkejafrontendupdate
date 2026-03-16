import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Bell, Search, ChevronRight, Plus, Filter } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../../features/Slice/AuthSlice';
import { useNavigate } from 'react-router-dom';

export interface NavigationItem {
    id: string;
    name: string;
    icon: React.ElementType;
    badge?: number;
}

interface ModernDashboardLayoutProps {
    user: { name?: string; email?: string; role?: string } | null;
    navigation: NavigationItem[];
    activeTab: string;
    setActiveTab: (id: string) => void;
    sidebarTitle: string;
    sidebarSubtitle: string;
    sidebarIcon: React.ElementType;
    children: React.ReactNode;
}

const ModernDashboardLayout: React.FC<ModernDashboardLayoutProps> = ({
    user,
    navigation,
    activeTab,
    setActiveTab,
    sidebarTitle,
    sidebarSubtitle,
    sidebarIcon: SidebarIcon,
    children
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(clearCredentials());
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-[#0F172A] flex overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : 0 }} // Managed by CSS translating for breakpoints mostly, but we can animate explicitly if needed
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#1B2430] border-r border-gray-200 dark:border-white/5 
                    transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    flex flex-col h-screen
                `}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#E6B17E] flex items-center justify-center shadow-lg shadow-[#D4A373]/30">
                                <SidebarIcon className="w-5 h-5 text-[#1B2430]" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white">{sidebarTitle}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{sidebarSubtitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A373]/20 to-[#E6B17E]/20 flex items-center justify-center border border-[#D4A373]/30">
                            <span className="text-lg font-bold text-[#D4A373]">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                    {navigation.map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ x: 4 }}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-[#D4A373]/10 to-[#E6B17E]/5 dark:from-[#D4A373]/20 dark:to-[#D4A373]/5 text-[#D4A373] shadow-sm font-bold border border-[#D4A373]/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 font-medium'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                                    {item.badge}
                                </span>
                            )}
                        </motion.button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 dark:bg-[#1B2430]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 z-30 shrink-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
                                >
                                    <Filter className="w-6 h-6" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize truncate flex items-center gap-2">
                                        {activeTab.replace('-', ' ')}
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                        Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="hidden md:block relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl text-sm w-64 focus:ring-2 focus:ring-[#D4A373] focus:outline-none dark:text-white transition-all"
                                    />
                                </div>

                                {/* Notifications */}
                                <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1B2430]"></span>
                                </button>

                                {/* Profile */}
                                <button className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#E6B17E] flex items-center justify-center text-[#1B2430] font-bold">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModernDashboardLayout;
