// components/dashboard/landlord/LandlordMessagesTab.tsx
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { SectionHeader } from '../shared';

const LandlordMessagesTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Messages" sub="3 unread messages" />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="divide-y divide-gray-50">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                <span className="text-[#ff385c] text-sm font-bold">JD</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[#222222] text-sm">John Doe</h3>
                  <span className="text-[11px] text-[#6a6a6a]">2 hours ago</span>
                </div>
                <p className="text-xs text-[#6a6a6a] mb-2">Regarding the maintenance request at Sunset Apartments...</p>
                <span className="text-[10px] px-2 py-0.5 bg-[#ff385c]/10 text-[#ff385c] rounded-full font-semibold">Property Inquiry</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LandlordMessagesTab;
