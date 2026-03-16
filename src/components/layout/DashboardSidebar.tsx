import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Calendar,
    ShoppingCart,
    Tag,
    MessageSquare,
    Settings,
    LogOut,
    ShieldCheck,
    Scale,
    Users,
    X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { clearCredentials } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.authSlice);
    const role = user?.role || '';
    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await logout({ refreshToken }).unwrap();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch(clearCredentials());
            navigate('/login');
        }
    };

    const navItems = [
        {
            label: 'Dashboard',
            path: '/dashboard',
            icon: LayoutDashboard,
            roles: ['admin', 'agent', 'landlord', 'caretaker', 'verifier']
        },
        {
            label: 'Verification Queue',
            path: '/dashboard/verify',
            icon: ShieldCheck,
            roles: ['verifier', 'admin']
        },
        {
            label: 'Disputes',
            path: '/dashboard/disputes',
            icon: Scale,
            roles: ['verifier', 'admin']
        },
        {
            label: 'User Management',
            path: '/dashboard/users',
            icon: Users,
            roles: ['admin', 'verifier']
        },
        {
            label: 'Assets',
            path: '/dashboard/assets',
            icon: Package,
            roles: ['landlord', 'agent', 'caretaker']
        },
        {
            label: 'Booking',
            path: '/dashboard/bookings',
            icon: Calendar,
            roles: ['admin', 'agent', 'landlord', 'caretaker']
        },
        {
            label: 'Sell/Rent',
            path: '/dashboard/sell',
            icon: Tag,
            roles: ['landlord', 'agent', 'caretaker']
        },
        {
            label: 'Marketplace',
            path: '/dashboard/buy',
            icon: ShoppingCart,
            roles: ['admin', 'agent', 'landlord', 'caretaker']
        },
        {
            label: 'Calendar',
            path: '/dashboard/calendar',
            icon: Calendar,
            roles: ['admin', 'agent', 'landlord', 'caretaker']
        },
        {
            label: 'Messages',
            path: '/dashboard/messages',
            icon: MessageSquare,
            roles: ['admin', 'agent', 'landlord', 'caretaker', 'verifier']
        }
    ];

    const filteredItems = navItems.filter(item => {
        if (item.label === 'Dashboard') return true;
        return item.roles.includes(role);
    });

    return (
        <div className={`w-64 h-screen bg-[#1B2430] text-white flex flex-col fixed left-0 top-0 z-[50] border-r border-[#2C3A4E] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl shadow-[#D4A373]/10' : '-translate-x-full'}`}>
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D4A373] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4A373]/20 transition-transform hover:scale-110">
                        <div className="w-5 h-5 bg-[#1B2430] rounded-md"></div>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white group cursor-default">
                        Get<span className="text-[#D4A373]">Keja</span>
                    </h1>
                </div>
                {/* Close for mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-[#2C3A4E]"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/dashboard');
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-[#D4A373] text-white shadow-xl shadow-[#D4A373]/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#D4A373]'} />
                            <span className="font-bold text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 space-y-2 border-t border-[#2C3A4E] bg-[#1B2430]/50 backdrop-blur-sm">
                <Link
                    to="/dashboard/settings"
                    onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
                >
                    <Settings size={20} className="group-hover:rotate-45 transition-transform" />
                    <span className="font-bold text-sm">Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 group"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Log out</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardSidebar;
