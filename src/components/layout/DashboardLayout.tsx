import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-[#0F172A] flex font-sans antialiased text-gray-200 overflow-x-hidden">
            {/* Sidebar - Positioned for mobile/desktop */}
            <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden transition-opacity cursor-pointer"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
                <DashboardHeader onMenuClick={toggleSidebar} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
