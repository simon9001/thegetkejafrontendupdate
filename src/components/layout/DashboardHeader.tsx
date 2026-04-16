import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { Bell, Search, User as UserIcon, Menu } from 'lucide-react';

interface DashboardHeaderProps {
    onMenuClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <header className="h-[72px] bg-[#1B2430] flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 border-b border-[#2C3A4E]/50">
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-[#2C3A4E] transition-all"
            >
                <Menu size={24} />
            </button>

            {/* Logo for mobile only */}
            <div className="lg:hidden flex items-center gap-2 ml-2">
                <div className="w-8 h-8 bg-[#D4A373] rounded-lg flex items-center justify-center shadow-lg shadow-[#D4A373]/20">
                    <div className="w-4 h-4 bg-[#1B2430] rounded-sm"></div>
                </div>
            </div>

            {/* Search Bar - Hidden on small mobile, compact on tablet */}
            <div className="flex-1 hidden md:flex justify-center px-4">
                <div className="flex items-center bg-[#0F172A] rounded-[18px] px-6 py-2.5 w-full max-w-xl transition-all focus-within:ring-2 focus-within:ring-[#D4A373]/30 border border-[#2C3A4E]">
                    <Search size={18} className="text-gray-500 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-full text-white placeholder:text-gray-600 font-medium"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-6 ml-auto">
                <button className="md:hidden p-2.5 text-gray-400 hover:text-[#D4A373] transition-all">
                    <Search size={20} />
                </button>

                <button className="relative p-2.5 bg-[#232F3F] rounded-[14px] text-gray-400 hover:text-[#D4A373] transition-all border border-[#2C3A4E]">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#D4A373] rounded-full ring-2 ring-[#232F3F]"></span>
                </button>

                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-xs font-black text-white leading-none capitalize">{user?.full_name?.split(' ')[0]}</span>
                        <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-tighter opacity-80">{user?.role}</span>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-[12px] md:rounded-[14px] bg-[#D4A373] flex items-center justify-center text-[#1B2430] overflow-hidden shadow-lg shadow-[#D4A373]/20 border-2 border-[#D4A373]/50 transform transition-transform group-hover:scale-110 shrink-0">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={20} className="font-bold" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
