// components/dashboard/landlord/LandlordSettingsTab.tsx
import React from 'react';
import { SectionHeader } from '../shared';

const LandlordSettingsTab: React.FC = () => (
  <div className="max-w-2xl space-y-5">
    <SectionHeader title="Profile Settings" />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {[
          { label: 'Full Name', placeholder: 'Your name', type: 'text' },
          { label: 'Email Address', placeholder: 'your@email.com', type: 'email' },
          { label: 'Phone Number', placeholder: '+254 700 000 000', type: 'tel' },
          { label: 'Company Name', placeholder: 'Your real estate company', type: 'text' },
        ].map(f => (
          <div key={f.label}>
            <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block mb-1.5">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#222222] placeholder:text-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c]" />
          </div>
        ))}
      </div>
      <button className="px-5 py-2.5 bg-[#ff385c] text-white rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all">
        Save Changes
      </button>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      <h3 className="font-bold text-[#222222] mb-4">Notification Preferences</h3>
      <div className="space-y-3">
        {[
          { label: 'Email Notifications', defaultChecked: true },
          { label: 'SMS Alerts',          defaultChecked: false },
          { label: 'Payment Reminders',   defaultChecked: true },
        ].map(n => (
          <label key={n.label} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[#222222] font-medium">{n.label}</span>
            <input type="checkbox" defaultChecked={n.defaultChecked}
              className="w-4 h-4 accent-[#ff385c] rounded" />
          </label>
        ))}
      </div>
    </div>
  </div>
);

export default LandlordSettingsTab;
