import React from 'react';
import { Calendar, User, MapPin, Phone, Mail } from 'lucide-react';
import { SectionHeader, EmptyState, Badge } from '../shared';
import { useGetMyHostBookingsQuery } from '../../../features/Api/ShortStayApi';

const LandlordBookingsTab: React.FC = () => {
  const { data, isLoading, isError, error } = useGetMyHostBookingsQuery({ limit: 20 });
  const bookings = data?.bookings ?? [];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Active Bookings" sub="Current tenants and upcoming move-ins" />

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : isError ? (
        <div className="p-10 text-center bg-red-50 rounded-2xl border border-red-100">
          <p className="text-red-800 font-bold">Failed to load bookings</p>
          <p className="text-red-600 text-sm mt-1">{(error as any)?.data?.message || 'Please check your connection or permissions.'}</p>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Calendar} message="No active bookings" sub="Once guests book your property, they will appear here." />
      ) : (
        <div className="grid gap-4">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
               <div className="flex items-start justify-between mb-4">
                 <div className="flex gap-4">
                   <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                     <User className="w-6 h-6 text-[#6a6a6a]" />
                   </div>
                   <div>
                     <h4 className="font-bold text-[#222222]">{b.guest_name ?? 'Guest Name'}</h4>
                     <p className="text-xs text-[#6a6a6a] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {b.properties?.title || 'Unknown Property'}</p>
                   </div>
                 </div>
                 <Badge status={b.status} />
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                 <div>
                   <p className="text-[10px] text-[#6a6a6a] font-bold uppercase">Check In</p>
                   <p className="text-xs font-bold text-[#222222]">{new Date(b.check_in_date).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-[#6a6a6a] font-bold uppercase">Check Out</p>
                   <p className="text-xs font-bold text-[#222222]">{new Date(b.check_out_date).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-[#6a6a6a] font-bold uppercase">Net Earnings</p>
                   <p className="text-xs font-bold text-emerald-600">KES {b.host_payout_kes?.toLocaleString()}</p>
                 </div>
                 <div className="flex justify-end items-center gap-2">
                    <button className="p-2 bg-gray-50 rounded-lg text-[#6a6a6a] hover:bg-gray-100"><Phone className="w-4 h-4" /></button>
                    <button className="p-2 bg-gray-50 rounded-lg text-[#6a6a6a] hover:bg-gray-100"><Mail className="w-4 h-4" /></button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordBookingsTab;
