import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import Navbar from './Navbar';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans antialiased text-gray-200 overflow-x-hidden">
            <Navbar />

            <div className="flex flex-1 pt-16">
                {/* Sidebar - Positioned for mobile/desktop */}
                <div className="fixed inset-y-0 left-0 z-[40] lg:static lg:inset-auto pt-4">
                    <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                </div>

                {/* Backdrop for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity cursor-pointer"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
                    {/* Mobile toggle - since we removed Header */}
                    <div className="lg:hidden p-4 flex items-center bg-[#1B2430]/50 backdrop-blur-md sticky top-0 z-30 border-b border-white/5">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="ml-4 font-bold text-lg text-white">Dashboard</span>
                    </div>

                    <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-y-auto w-full">
                        <div className="max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
