// frontend/src/components/layout/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Search,
    Menu,
    Globe,
    User,
    Heart,
    LogOut,
    Settings,
    Calendar,
    MessageCircle,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { clearCredentials } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import { useGetUnreadCountQuery } from '../../features/Api/ChatApi';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react'; // Using an existing layout icon

interface NavbarProps {
    transparent?: boolean;
    showSearch?: boolean;
    onSearchToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
    transparent = false,
    showSearch = true,
    onSearchToggle
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchLocation] = useState('Anywhere');
    const [searchDate] = useState('Any week');
    const [searchGuests] = useState('Add guests');

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { isAuthenticated, user } = useSelector((state: RootState) => state.authSlice);

    // Get unread message count
    const { data: unreadData } = useGetUnreadCountQuery(undefined, {
        skip: !isAuthenticated,
        pollingInterval: 30000, // Poll every 30 seconds
    });
    const unreadCount = unreadData?.unreadCount || 0;

    // Get saved properties count from Redux store
    const savedCount = useSelector((state: RootState) => state.savedProperties?.items?.length || 0);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [location]);

    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                // If this fails (e.g. 401), we still want to log out locally
                await logout({ refreshToken }).unwrap();
            }
        } catch (error) {
            console.error('Logout error (server-side):', error);
        } finally {
            // Always clear local state and redirect
            dispatch(clearCredentials());
            navigate('/login');
            setIsUserMenuOpen(false);
        }
    };

    const navClasses = `
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled || !transparent ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}
        ${transparent ? 'text-white' : 'text-[#1B2430]'}
    `;

    return (
        <nav className={navClasses}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-1 text-xl lg:text-2xl font-bold"
                    >
                        <span className={transparent && !isScrolled ? 'text-white' : 'text-[#1B2430]'}>
                            vacation
                        </span>
                        <span className="text-[#D4A373]">hub</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    {showSearch && (
                        <div className="hidden md:flex items-center border rounded-full py-1.5 px-3 shadow-sm hover:shadow-md transition cursor-pointer bg-white">
                            <button className="px-3 text-sm font-medium text-[#1B2430]">
                                {searchLocation}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button className="px-3 text-sm font-medium text-[#1B2430]">
                                {searchDate}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button className="px-3 text-sm text-gray-500">
                                {searchGuests}
                            </button>
                            <button
                                onClick={onSearchToggle}
                                className="ml-2 p-1.5 bg-[#D4A373] rounded-full text-white hover:bg-[#E6B17E] transition"
                            >
                                <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                        </div>
                    )}

                    {/* Right Navigation */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        {/* Become a Host */}
                        <Link
                            to="/become-host"
                            className={`hidden lg:block text-sm font-medium hover:bg-white/10 px-3 py-1.5 rounded-full transition ${transparent && !isScrolled ? 'text-white' : 'text-[#1B2430]'
                                }`}
                        >
                            Share your home
                        </Link>

                        {/* Saved Properties Link - Moved outside user menu for visibility */}
                        <Link
                            to="/saved"
                            className="relative flex items-center gap-1 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-full transition"
                        >
                            <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-red-500 text-red-500' : 'text-[#1B2430]'}`} />
                            <span className="hidden lg:inline">Saved</span>
                            {savedCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {savedCount > 9 ? '9+' : savedCount}
                                </span>
                            )}
                        </Link>

                        {/* Language Selector */}
                        <button className={`p-1.5 lg:p-2 rounded-full transition ${transparent && !isScrolled
                            ? 'hover:bg-white/10 text-white'
                            : 'hover:bg-gray-100 text-[#1B2430]'
                            }`}>
                            <Globe className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`flex items-center border rounded-full p-0.5 lg:p-1 hover:shadow-md transition ${transparent && !isScrolled
                                    ? 'border-white/30 hover:border-white'
                                    : 'border-gray-300'
                                    }`}
                            >
                                <Menu className={`w-4 h-4 lg:w-5 lg:h-5 ${transparent && !isScrolled ? 'text-white' : 'text-[#1B2430]'
                                    }`} />
                                <div className={`p-1.5 lg:p-2 rounded-full ${transparent && !isScrolled
                                    ? 'bg-white/10'
                                    : 'bg-[#D4A373]/10'
                                    }`}>
                                    <User className={`w-4 h-4 lg:w-5 lg:h-5 ${transparent && !isScrolled ? 'text-white' : 'text-[#D4A373]'
                                        }`} />
                                </div>
                            </button>

                            {/* User Dropdown Menu */}
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100"
                                    >
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-[#1B2430]">
                                                        {user?.fullName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {user?.email}
                                                    </p>
                                                </div>

                                                {/* Dashboard Link for Authorized Roles */}
                                                {(user?.role === 'admin' || user?.role === 'landlord' || user?.role === 'caretaker' || user?.role === 'agent' || user?.role === 'verifier') && (
                                                    <Link
                                                        to={`/dashboard/${user.role === 'admin' ? '' : user.role}`}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 text-[#D4A373]" />
                                                        Dashboard
                                                    </Link>
                                                )}

                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/trips"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    Trips
                                                </Link>
                                                <Link
                                                    to="/messages"
                                                    className="flex items-center justify-between px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span>Messages</span>
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <span className="bg-[#D4A373] text-white text-xs px-1.5 py-0.5 rounded-full">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <Link
                                                    to="/saved"
                                                    className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                                        <span>Saved properties</span>
                                                    </div>
                                                    {savedCount > 0 && (
                                                        <span className="bg-[#D4A373] text-white text-xs px-1.5 py-0.5 rounded-full">
                                                            {savedCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <Link
                                                    to="/settings"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    Settings
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Log out
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    to="/login"
                                                    className="block px-4 py-2 text-sm font-medium text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    Login
                                                </Link>
                                                <Link
                                                    to="/register"
                                                    className="block px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    Sign up
                                                </Link>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <Link
                                                    to="/saved"
                                                    className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                                        <span>Saved properties</span>
                                                    </div>
                                                    {savedCount > 0 && (
                                                        <span className="bg-[#D4A373] text-white text-xs px-1.5 py-0.5 rounded-full">
                                                            {savedCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <Link
                                                    to="/become-host"
                                                    className="block px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    Share your home
                                                </Link>
                                                <Link
                                                    to="/help"
                                                    className="block px-4 py-2 text-sm text-[#1B2430] hover:bg-gray-50 transition"
                                                >
                                                    Help
                                                </Link>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                {showSearch && (
                    <div className="md:hidden mt-3">
                        <button
                            onClick={onSearchToggle}
                            className="w-full flex items-center border rounded-full py-2 px-3 shadow-sm bg-white"
                        >
                            <div className="flex-1 text-left">
                                <div className="text-xs font-medium text-[#1B2430]">
                                    {searchLocation}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <span>{searchDate}</span>
                                    <span>·</span>
                                    <span>{searchGuests}</span>
                                </div>
                            </div>
                            <Search className="w-3 h-3 text-[#D4A373]" />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;