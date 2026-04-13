// components/dashboard/shared/DashboardSidebar.tsx
import React from 'react';
import { Home, LogOut } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  activeNav: string;
  onNavChange: (id: string) => void;
  roleLabel: string;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  navItems, activeNav, onNavChange, roleLabel,
  userName, userRole, onLogout, open, onClose,
}) => (
  <>
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-56 bg-[#111827] flex flex-col
      transition-transform duration-300
      ${open ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static lg:flex
    `}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#ff385c] flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">GetKeja</span>
            <span className="block text-white/40 text-[10px] font-medium uppercase tracking-widest">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const active = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => { onNavChange(id); onClose(); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
              `}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#ff385c]' : ''}`} />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-[#ff385c]/20 flex items-center justify-center shrink-0">
            <span className="text-[#ff385c] text-xs font-bold">
              {(userName ?? 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{userName ?? 'User'}</p>
            <p className="text-white/40 text-[10px] capitalize">{userRole ?? roleLabel.toLowerCase()}</p>
          </div>
          <button onClick={onLogout} className="text-white/30 hover:text-[#ff385c] transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>

    {/* Backdrop */}
    {open && (
      <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
    )}
  </>
);

export default DashboardSidebar;
