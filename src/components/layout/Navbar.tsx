// frontend/src/components/layout/Navbar.tsx
// Airbnb-inspired design: white sticky header, Rausch Red (#ff385c) accent,
// three-segment search pill, circular nav controls, warm near-black text.
import React, { useState, useEffect, useRef } from 'react';
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
  LayoutDashboard,
  X,
  Check,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { clearCredentials, selectCurrentUser, selectIsAuthenticated } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';
import { useLanguage, type Lang } from '../../context/LanguageContext';

interface NavbarProps {
  transparent?:    boolean;
  showSearch?:     boolean;
  onSearchToggle?: () => void;
}

/** Map a single role string to its dashboard sub-path */
const roleToPath = (role: string): string | null => {
  if (role === 'super_admin' || role === 'admin') return '/dashboard/admin';
  if (role === 'developer')  return '/dashboard/developer';
  if (role === 'landlord')   return '/dashboard/landlord';
  if (role === 'staff')      return '/dashboard/staff';
  if (role === 'agent')      return '/dashboard/agent';
  if (role === 'caretaker')  return '/dashboard/caretaker';
  if (role === 'verifier')   return '/dashboard/verifier';
  return null;
};

/** Resolve the correct dashboard path for a user.
 *  Uses primaryRole first (the backend's declared primary), then scans roles[]. */
const getDashboardPath = (roles: string[], primaryRole?: string): string | null => {
  if (primaryRole) {
    const path = roleToPath(primaryRole);
    if (path) return path;
  }
  for (const r of roles) {
    const path = roleToPath(r);
    if (path) return path;
  }
  return null;
};

const Navbar: React.FC<NavbarProps> = ({
  transparent = false,
  showSearch  = true,
  onSearchToggle,
}) => {
  const [isScrolled,     setIsScrolled]     = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangOpen,     setIsLangOpen]     = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const { lang, setLang, t } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user            = useSelector(selectCurrentUser);
  const savedCount      = useSelector(
    (state: RootState) => state.savedProperties?.items?.length ?? 0,
  );

  const dashboardPath = user ? getDashboardPath(user.roles ?? [], user.primaryRole) : null;

  // ── Scroll ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsUserMenuOpen(false); setIsLangOpen(false); }, [location]);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    if (isLangOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isLangOpen]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const [logout] = useLogoutMutation();
  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await logout({ refreshToken: rt }).unwrap();
    } catch (_) { /* silent */ }
    dispatch(clearCredentials());
    navigate('/login');
  };

  // ── Derived styles ──────────────────────────────────────────────────────────
  const elevated    = isScrolled || !transparent;
  const navBg       = elevated ? 'bg-white' : 'bg-transparent';
  const shadowClass = elevated ? 'shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : '';
  const textColor   = elevated || !transparent ? 'text-[#222222]' : 'text-white';

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg} ${shadowClass}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main row ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-[80px] gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-0.5 select-none"
            aria-label="GetKeja home"
          >
            {/* Amy coooking */}
           <img
              src={logo} 
              alt="GetKeja logo"
              className="w-8 h-8 object-contain"
            />
            <span
              className={`text-xl font-bold tracking-tight ${
                elevated || !transparent ? 'text-[#ff385c]' : 'text-white'
              }`}
            >
              Getkeja
            </span>
          </Link>

          {/* ── Desktop search pill ──────────────────────────────────────────── */}
          {showSearch && (
            <button
              onClick={onSearchToggle}
              className={`
                hidden md:flex items-center h-9 rounded-full border px-1.5 gap-0
                shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_4px]
                hover:shadow-[rgba(0,0,0,0.08)_0px_3px_10px]
                bg-white border-[#e5e5e5] transition-shadow duration-200
                ${elevated ? '' : 'border-white/40'}
              `}
            >
              <span className="px-3 text-xs font-semibold text-[#222222] whitespace-nowrap">{t('findYourKeja')}</span>
              <span className="w-px h-4 bg-[#c1c1c1]" />
              <span className="px-3 text-xs text-[#6a6a6a] whitespace-nowrap">{t('anyBudget')}</span>
              <span className="ml-1 w-6 h-6 flex items-center justify-center bg-[#ff385c] rounded-full shrink-0">
                <Search className="w-3 h-3 text-white" />
              </span>
            </button>
          )}

          {/* ── Right controls ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* "Share your home" text link */}
            <Link
              to="/become-host"
              className={`
                hidden lg:flex items-center px-4 py-2.5 rounded-full text-sm font-semibold
                transition-colors duration-150 hover:bg-black/[0.04]
                ${textColor}
              `}
            >
              {t('shareYourHome')}
            </Link>

            {/* Language picker */}
            <div ref={langRef} className="relative hidden sm:block">
              <button
                onClick={() => setIsLangOpen((v) => !v)}
                className={`
                  flex items-center gap-1.5 px-2.5 h-10 rounded-full
                  transition-colors duration-150 hover:bg-black/[0.04]
                  ${textColor}
                `}
                aria-label={t('language')}
                aria-expanded={isLangOpen}
              >
                <Globe className="w-[18px] h-[18px]" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {lang}
                </span>
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.13 }}
                    className="
                      absolute right-0 top-[calc(100%+6px)] z-50
                      w-44 bg-white rounded-[14px] py-2 overflow-hidden
                      shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.12)_0px_8px_24px]
                      border border-[#e5e5e5]
                    "
                  >
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6a6a6a]">
                      {t('language')}
                    </p>
                    {([
                      { code: 'en', flag: '🇬🇧', label: 'English'    },
                      { code: 'sw', flag: '🇰🇪', label: 'Kiswahili'  },
                    ] as { code: Lang; flag: string; label: string }[]).map(({ code, flag, label }) => (
                      <button
                        key={code}
                        onClick={() => { setLang(code); setIsLangOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#f7f7f7] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{flag}</span>
                          {label}
                        </div>
                        {lang === code && <Check className="w-3.5 h-3.5 text-[#ff385c]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Saved properties icon — always visible in navbar */}
            <Link
              to="/saved"
              aria-label={`Saved properties${savedCount > 0 ? ` (${savedCount})` : ''}`}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full
                transition-colors duration-150 hover:bg-black/[0.04]
                ${textColor}
              `}
            >
              <Heart
                className={`w-[18px] h-[18px] transition-colors ${
                  savedCount > 0 ? 'fill-[#ff385c] text-[#ff385c]' : ''
                }`}
              />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-[#ff385c] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </Link>

            {/* ── User menu pill ──────────────────────────────────────────── */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="
                  flex items-center gap-2 border border-[#c1c1c1] rounded-full
                  py-1.5 pl-3 pr-1.5 bg-white
                  hover:shadow-[rgba(0,0,0,0.08)_0px_4px_12px]
                  transition-shadow duration-200
                "
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <Menu className="w-4 h-4 text-[#222222]" />
                <div className="w-7 h-7 rounded-full bg-[#6a6a6a] flex items-center justify-center overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name ?? 'avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                {/* Unread dot */}
                {isAuthenticated && (
                  <span className="sr-only">
                    {user?.full_name ?? user?.email ?? 'Account'}
                  </span>
                )}
              </button>

              {/* ── Dropdown ──────────────────────────────────────────────── */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="
                        absolute right-0 top-[calc(100%+8px)] z-50
                        w-56 bg-white rounded-[14px] py-2
                        shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.12)_0px_8px_24px]
                        border border-[#e5e5e5]
                      "
                    >
                      {isAuthenticated && user ? (
                        <>
                          {/* User info header */}
                          <div className="px-4 py-3 border-b border-[#f2f2f2]">
                            <p className="text-sm font-semibold text-[#222222] truncate">
                              {user.full_name ?? user.email}
                            </p>
                            <p className="text-xs text-[#6a6a6a] truncate mt-0.5">{user.email}</p>
                            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full bg-[#fff1f2] text-[#ff385c] text-[10px] font-semibold capitalize">
                              {user.primaryRole ?? user.roles?.[0] ?? 'seeker'}
                            </span>
                          </div>

                          {/* Dashboard */}
                          {dashboardPath && (
                            <MenuItem
                              to={dashboardPath}
                              icon={<LayoutDashboard className="w-4 h-4" />}
                              label={t('dashboard')}
                            />
                          )}

                          <MenuItem to="/profile"  icon={<User className="w-4 h-4" />}           label={t('profile')} />
                          <MenuItem to="/trips"    icon={<Calendar className="w-4 h-4" />}        label={t('trips')} />
                          <MenuItem to="/messages" icon={<MessageCircle className="w-4 h-4" />}   label={t('messages')} />
                          <MenuItem
                            to="/saved"
                            icon={<Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-[#ff385c] text-[#ff385c]' : ''}`} />}
                            label={t('saved')}
                            badge={savedCount > 0 ? String(savedCount > 9 ? '9+' : savedCount) : undefined}
                          />

                          <div className="my-1.5 border-t border-[#f2f2f2]" />

                          <MenuItem to="/settings" icon={<Settings className="w-4 h-4" />} label={t('settings')} />

                          <button
                            onClick={handleLogout}
                            className="
                              w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                              text-[#c13515] hover:bg-[#fff1f2] transition-colors duration-150
                            "
                          >
                            <LogOut className="w-4 h-4" />
                            {t('logout')}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            className="block px-4 py-2.5 text-sm font-semibold text-[#222222] hover:bg-[#f7f7f7] transition-colors"
                          >
                            {t('login')}
                          </Link>
                          <Link
                            to="/register"
                            className="block px-4 py-2.5 text-sm text-[#222222] hover:bg-[#f7f7f7] transition-colors"
                          >
                            {t('signup')}
                          </Link>
                          <div className="my-1.5 border-t border-[#f2f2f2]" />
                          <MenuItem
                            to="/saved"
                            icon={<Heart className="w-4 h-4" />}
                            label={t('savedProperties')}
                          />
                          <MenuItem to="/become-host" icon={<span className="w-4 h-4 text-[#ff385c] font-bold text-base leading-none">+</span>} label={t('shareYourHome')} />
                          <MenuItem to="/help"        icon={<X className="w-4 h-4 rotate-45" />} label={t('help')} />
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </nav>

    {/* ── Mobile floating search pill ──────────────────────────────────────── */}
    {showSearch && (
      <div
        className={`
          md:hidden fixed left-4 right-4 z-40
          transition-all duration-300 ease-in-out
          ${isScrolled ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'}
        `}
        style={{ top: '88px' }}
      >
        <button
          onClick={onSearchToggle}
          className="
            w-full flex items-center gap-3
            bg-white/60 backdrop-blur-md
            border border-white/50 rounded-full
            px-4 py-2.5
            shadow-[rgba(0,0,0,0.06)_0px_2px_12px]
          "
        >
          <Search className="w-4 h-4 text-[#ff385c] shrink-0" />
          <span className="flex-1 text-left text-sm font-medium text-[#222222]/80">{t('findYourKeja')}…</span>
          <span className="flex-1 text-left text-sm font-medium text-[#222222]/80">{t('anyBudget')}</span>
          <span className="flex-1 text-left text-sm font-medium text-[#222222]/80">{t('anywhere')}</span>
        </button>
      </div>
    )}
    </>
  );
};

// ─── Reusable menu item ────────────────────────────────────────────────────────
interface MenuItemProps {
  to:     string;
  icon:   React.ReactNode;
  label:  string;
  badge?: string;
}
const MenuItem: React.FC<MenuItemProps> = ({ to, icon, label, badge }) => (
  <Link
    to={to}
    className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#222222] hover:bg-[#f7f7f7] transition-colors duration-150"
  >
    <div className="flex items-center gap-3">
      <span className="text-[#6a6a6a]">{icon}</span>
      {label}
    </div>
    {badge && (
      <span className="bg-[#ff385c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </Link>
);

export default Navbar;
