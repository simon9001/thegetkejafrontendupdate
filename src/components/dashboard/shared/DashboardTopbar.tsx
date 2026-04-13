// components/dashboard/shared/DashboardTopbar.tsx
import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface DashboardTopbarProps {
  title: string;
  onMenuClick: () => void;
  notificationCount?: number;
  action?: React.ReactNode;
}

const DashboardTopbar: React.FC<DashboardTopbarProps> = ({
  title, onMenuClick, notificationCount, action,
}) => (
  <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20">
    <button onClick={onMenuClick} className="lg:hidden text-[#6a6a6a] hover:text-[#222222] transition-colors">
      <Menu className="w-5 h-5" />
    </button>

    <div>
      <h1 className="text-base font-bold text-[#222222] tracking-tight">{title}</h1>
      <p className="text-xs text-[#6a6a6a]">
        {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>

    <div className="ml-auto flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52">
        <Search className="w-3.5 h-3.5 text-[#6a6a6a]" />
        <input placeholder="Search…" className="bg-transparent text-xs text-[#222222] placeholder:text-[#6a6a6a] outline-none flex-1" />
      </div>
      <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors">
        <Bell className="w-4 h-4" />
        {(notificationCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff385c] rounded-full" />
        )}
      </button>
      {action}
    </div>
  </header>
);

export default DashboardTopbar;
