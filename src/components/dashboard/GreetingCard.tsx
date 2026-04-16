import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { Calendar, Clock, Sparkles } from 'lucide-react';

const GreetingCard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const now = new Date();

    const greeting = () => {
        const hour = now.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getRoleBadgeColor = () => {
        switch (user?.roles?.[0]) {
            case 'admin': return 'from-red-500/20 to-orange-500/20 text-orange-500 border-orange-500/30';
            case 'verifier': return 'from-blue-500/20 to-cyan-500/20 text-cyan-500 border-cyan-500/30';
            case 'landlord': return 'from-[#D4A373]/20 to-[#B68D64]/20 text-[#D4A373] border-[#D4A373]/30';
            default: return 'from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getRoleMessage = () => {
        switch (user?.roles?.[0]) {
            case 'admin': return 'System Overview & Central Control';
            case 'verifier': return 'Platform Integrity & Verification Queue';
            case 'landlord': return 'Portfolio Performance & Estate Management';
            default: return 'Welcome to The House Hunting';
        }
    };

    return (
        <div className="relative overflow-hidden bg-[#1B2430] rounded-[32px] border border-[#2C3A4E] p-8 shadow-2xl shadow-black/40 group">
            {/* Background Decorative Gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A373]/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-[#D4A373]/15 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-gradient-to-r ${getRoleBadgeColor()}`}>
                            {user?.roles?.[0]} Access
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                            <Sparkles size={12} className="text-[#D4A373]" />
                            Perfect UI System Active
                        </div>
                    </div>

                    <div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            {greeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#D4A373]">{user?.full_name?.split(' ')[0]}</span>
                        </h2>
                        <p className="text-[#D4A373] font-bold mt-2 tracking-wide uppercase text-xs opacity-90">
                            {getRoleMessage()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 bg-[#0F172A] px-5 py-3.5 rounded-2xl border border-[#2C3A4E] shadow-inner shadow-black/20">
                        <div className="p-2 bg-[#D4A373]/10 rounded-lg text-[#D4A373]">
                            <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Current Date</span>
                            <span className="text-sm text-white font-bold">{formatDate(now)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#0F172A] px-5 py-3.5 rounded-2xl border border-[#2C3A4E] shadow-inner shadow-black/20">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <Clock size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Current Time</span>
                            <span className="text-sm text-white font-bold">{formatTime(now)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated Underline */}
            <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#D4A373]/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000"></div>
        </div>
    );
};

export default GreetingCard;
