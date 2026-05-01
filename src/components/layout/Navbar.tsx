// frontend/src/components/layout/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Menu, Globe, User, Heart, LogOut, Settings,
  Calendar, MessageCircle, LayoutDashboard, X, Check,
  Users, Truck, Sun, Moon, Flame,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { clearCredentials, selectCurrentUser, selectIsAuthenticated } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';
import { useLanguage, type Lang } from '../../context/LanguageContext';
import { useTheme, type Theme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavbarProps {
  transparent?:    boolean;
  showSearch?:     boolean;
  onSearchToggle?: () => void;
}

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

// Theme icon map
const THEME_ICONS: Record<Theme, React.ElementType> = {
  light: Sun,
  dark:  Moon,
  warm:  Flame,
};

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark',  label: 'Dark'  },
  { value: 'warm',  label: 'Warm'  },
];

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
  const { theme, setTheme }  = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user            = useSelector(selectCurrentUser);
  const savedCount      = useSelector(
    (state: RootState) => state.savedProperties?.items?.length ?? 0,
  );

  const dashboardPath = user ? getDashboardPath(user.roles ?? [], user.primaryRole) : null;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsUserMenuOpen(false); setIsLangOpen(false); }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setIsLangOpen(false);
    };
    if (isLangOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isLangOpen]);

  const [logout] = useLogoutMutation();
  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await logout({ refreshToken: rt }).unwrap();
    } catch (_) { /* silent */ }
    dispatch(clearCredentials());
    navigate('/login');
  };

  const elevated    = isScrolled || !transparent;
  const navBg       = elevated ? 'bg-white' : 'bg-transparent';
  const shadowClass = elevated ? 'shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : '';
  const textColor   = elevated || !transparent ? 'text-[#50757A]' : 'text-white';

  // ── Appearance section used inside mobile dropdown ───────────────────────────
  const AppearanceSection = (
    <div className="px-4 py-3 border-b border-[#EAEAEA] sm:hidden">
      <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-3">
        Appearance
      </p>

      {/* Theme row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#50757A] font-medium">Theme</span>
        <div className="flex items-center gap-0.5 rounded-full border border-[#EAEAEA] bg-[#F7F7F7] p-0.5">
          {THEMES.map(({ value, label }) => {
            const Icon = THEME_ICONS[value];
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 ${
                  theme === value
                    ? 'bg-[#DD6E42] text-white shadow-sm'
                    : 'text-[#50757A] hover:bg-[#EAEAEA]'
                }`}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Language row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#50757A] font-medium">Language</span>
        <div className="flex gap-1.5">
          {([
            { code: 'en' as Lang, flag: '🇬🇧', label: 'EN' },
            { code: 'sw' as Lang, flag: '🇰🇪', label: 'SW' },
          ]).map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                lang === code
                  ? 'bg-[#DD6E42] text-white border-[#DD6E42]'
                  : 'border-[#EAEAEA] text-[#50757A] hover:bg-[#EAEAEA]'
              }`}
            >
              <span>{flag}</span> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg} ${shadowClass}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main row ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-[72px] sm:h-[80px] gap-2 sm:gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-0.5 select-none"
            aria-label="GetKeja home"
          >
            <img src={logo} alt="GetKeja logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
            <span className={`text-lg sm:text-xl font-bold tracking-tight ${
              elevated || !transparent ? 'text-[#DD6E42]' : 'text-white'
            }`}>
              GetQeja
            </span>
          </Link>

          {/* Desktop search pill */}
          {showSearch && (
            <button
              onClick={onSearchToggle}
              className={`
                hidden md:flex items-center h-9 rounded-full border px-1.5 gap-0 flex-1 max-w-sm
                shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_4px]
                hover:shadow-[rgba(0,0,0,0.08)_0px_3px_10px]
                bg-white border-[#EAEAEA] transition-shadow duration-200
              `}
            >
              <span className="px-3 text-xs font-semibold text-[#50757A] whitespace-nowrap">{t('findYourKeja')}</span>
              <span className="w-px h-4 bg-[#EAEAEA]" />
              <span className="px-3 text-xs text-[#50757A] whitespace-nowrap">{t('anyBudget')}</span>
              <span className="ml-auto mr-0.5 w-6 h-6 flex items-center justify-center bg-[#DD6E42] rounded-full shrink-0">
                <Search className="w-3 h-3 text-white" />
              </span>
            </button>
          )}

          {/* ── Right controls ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Share your home — desktop only */}
            <Link
              to="/become-host"
              className={`hidden lg:flex items-center px-4 py-2.5 rounded-full text-sm font-semibold
                transition-colors duration-150 hover:bg-black/[0.04] ${textColor}`}
            >
              {t('shareYourHome')}
            </Link>

            {/* Roommate — tablet+ */}
            <Link
              to="/roommates"
              className={`hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-semibold
                transition-colors duration-150 hover:bg-black/[0.04] ${textColor}`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Roommate</span>
            </Link>

            {/* Movers — tablet+ */}
            <Link
              to="/moving-services"
              className={`hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm font-semibold
                transition-colors duration-150 hover:bg-black/[0.04] ${textColor}`}
            >
              <Truck className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Movers</span>
            </Link>

            {/* Language picker — desktop */}
            <div ref={langRef} className="relative hidden sm:block">
              <button
                onClick={() => setIsLangOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 h-10 rounded-full
                  transition-colors duration-150 hover:bg-black/[0.04] ${textColor}`}
                aria-label={t('language')}
                aria-expanded={isLangOpen}
              >
                <Globe className="w-[18px] h-[18px]" />
                <span className="text-xs font-semibold uppercase tracking-wide">{lang}</span>
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.13 }}
                    className="absolute right-0 top-[calc(100%+6px)] z-50
                      w-44 bg-white rounded-[14px] py-2 overflow-hidden
                      shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.12)_0px_8px_24px]
                      border border-[#EAEAEA]"
                  >
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#50757A]">
                      {t('language')}
                    </p>
                    {([
                      { code: 'en' as Lang, flag: '🇬🇧', label: 'English'   },
                      { code: 'sw' as Lang, flag: '🇰🇪', label: 'Kiswahili' },
                    ]).map(({ code, flag, label }) => (
                      <button
                        key={code}
                        onClick={() => { setLang(code); setIsLangOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#50757A] hover:bg-[#EAEAEA] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base leading-none">{flag}</span>
                          {label}
                        </div>
                        {lang === code && <Check className="w-3.5 h-3.5 text-[#DD6E42]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle — desktop only (mobile gets it inside dropdown) */}
            <div className="hidden sm:flex items-center">
              <ThemeToggle />
            </div>

            {/* Saved heart */}
            <Link
              to="/saved"
              aria-label={`Saved properties${savedCount > 0 ? ` (${savedCount})` : ''}`}
              className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full
                transition-colors duration-150 hover:bg-black/[0.04] ${textColor}`}
            >
              <Heart className={`w-[18px] h-[18px] transition-colors ${
                savedCount > 0 ? 'fill-[#DD6E42] text-[#DD6E42]' : ''
              }`} />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-[#DD6E42] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </Link>

            {/* ── User menu pill ──────────────────────────────────────────── */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 sm:gap-2 border border-[#EAEAEA] rounded-full
                  py-1.5 pl-2.5 sm:pl-3 pr-1.5 bg-white
                  hover:shadow-[rgba(0,0,0,0.08)_0px_4px_12px] transition-shadow duration-200"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <Menu className="w-4 h-4 text-[#50757A]" />
                <div className="w-7 h-7 rounded-full bg-[#50757A] flex items-center justify-center overflow-hidden">
                  {user?.avatar_url
                    ? <img src={user.avatar_url} alt={user.full_name ?? 'avatar'} className="w-full h-full object-cover" />
                    : <User className="w-4 h-4 text-white" />
                  }
                </div>
              </button>

              {/* ── Dropdown ────────────────────────────────────────────── */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />

                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="
                        absolute right-0 top-[calc(100%+8px)] z-50
                        w-[min(calc(100vw-1.5rem),288px)]
                        bg-white rounded-[14px] py-2 overflow-hidden
                        shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.12)_0px_8px_24px]
                        border border-[#EAEAEA]
                        max-h-[85vh] overflow-y-auto
                      "
                    >
                      {isAuthenticated && user ? (
                        <>
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-[#EAEAEA]">
                            <p className="text-sm font-semibold text-[#50757A] truncate">
                              {user.full_name ?? user.email}
                            </p>
                            <p className="text-xs text-[#50757A] truncate mt-0.5">{user.email}</p>
                            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full bg-[#E8DAB2] text-[#DD6E42] text-[10px] font-semibold capitalize">
                              {user.primaryRole ?? user.roles?.[0] ?? 'seeker'}
                            </span>
                          </div>

                          {/* Mobile-only: theme + language */}
                          {AppearanceSection}

                          {dashboardPath && (
                            <MenuItem to={dashboardPath} icon={<LayoutDashboard className="w-4 h-4" />} label={t('dashboard')} />
                          )}
                          <MenuItem to="/profile"  icon={<User className="w-4 h-4" />}          label={t('profile')} />
                          <MenuItem to="/trips"    icon={<Calendar className="w-4 h-4" />}       label={t('trips')} />
                          <MenuItem to="/messages" icon={<MessageCircle className="w-4 h-4" />}  label={t('messages')} />
                          <MenuItem
                            to="/saved"
                            icon={<Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-[#DD6E42] text-[#DD6E42]' : ''}`} />}
                            label={t('saved')}
                            badge={savedCount > 0 ? String(savedCount > 9 ? '9+' : savedCount) : undefined}
                          />

                          <div className="my-1.5 border-t border-[#EAEAEA]" />

                          <MenuItem to="/roommates"       icon={<Users className="w-4 h-4" />} label="Roommate Finder" />
                          <MenuItem to="/moving-services" icon={<Truck className="w-4 h-4" />} label="Movers" />

                          <div className="my-1.5 border-t border-[#EAEAEA]" />

                          <MenuItem to="/settings" icon={<Settings className="w-4 h-4" />} label={t('settings')} />

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                              text-[#DD6E42] hover:bg-[#E8DAB2] transition-colors duration-150"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('logout')}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/login"    className="block px-4 py-2.5 text-sm font-semibold text-[#50757A] hover:bg-[#EAEAEA] transition-colors">{t('login')}</Link>
                          <Link to="/register" className="block px-4 py-2.5 text-sm text-[#50757A] hover:bg-[#EAEAEA] transition-colors">{t('signup')}</Link>

                          <div className="my-1.5 border-t border-[#EAEAEA]" />

                          {/* Mobile-only: theme + language */}
                          {AppearanceSection}

                          <MenuItem to="/saved"           icon={<Heart className="w-4 h-4" />}                                                       label={t('savedProperties')} />
                          <MenuItem to="/become-host"     icon={<span className="w-4 h-4 text-[#DD6E42] font-bold text-base leading-none">+</span>}  label={t('shareYourHome')} />
                          <MenuItem to="/roommates"       icon={<Users className="w-4 h-4" />}                                                       label="Roommate Finder" />
                          <MenuItem to="/moving-services" icon={<Truck className="w-4 h-4" />}                                                       label="Movers" />
                          <MenuItem to="/help"            icon={<X className="w-4 h-4 rotate-45" />}                                                 label={t('help')} />
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

    {/* ── Mobile search pill (floats below nav) ──────────────────────────────── */}
    {showSearch && (
      <div
        className={`md:hidden fixed left-3 right-3 z-40
          transition-all duration-300 ease-in-out
          ${isScrolled ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'}`}
        style={{ top: '80px' }}
      >
        <button
          onClick={onSearchToggle}
          className="w-full flex items-center gap-2
            bg-white/70 backdrop-blur-md border border-white/50 rounded-full
            px-4 py-2.5 shadow-[rgba(0,0,0,0.06)_0px_2px_12px]"
        >
          <Search className="w-4 h-4 text-[#DD6E42] shrink-0" />
          <span className="flex-1 text-left text-sm font-medium text-[#50757A]/80 truncate">{t('findYourKeja')}…</span>
          <span className="text-sm font-medium text-[#50757A]/60 whitespace-nowrap hidden xs:inline">{t('anyBudget')}</span>
        </button>
      </div>
    )}
    </>
  );
};

// ─── Menu item ────────────────────────────────────────────────────────────────
interface MenuItemProps { to: string; icon: React.ReactNode; label: string; badge?: string; }

const MenuItem: React.FC<MenuItemProps> = ({ to, icon, label, badge }) => (
  <Link
    to={to}
    className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#50757A] hover:bg-[#EAEAEA] transition-colors duration-150"
  >
    <div className="flex items-center gap-3">
      <span className="text-[#50757A]">{icon}</span>
      {label}
    </div>
    {badge && (
      <span className="bg-[#DD6E42] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </Link>
);

export default Navbar;
