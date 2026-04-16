// components/dashboard/admin/AdminFeesTab.tsx
import React, { useState } from 'react';
import { Settings, Save, DollarSign, Award, ArrowUpRight, CheckCircle } from 'lucide-react';
import { SectionHeader } from '../shared';
import {
  useGetFeeConfigQuery,
  useUpdateFeeConfigEntryMutation,
} from '../../../features/Api/AdminApi';

const AdminFeesTab: React.FC = () => {
  const { data, isLoading } = useGetFeeConfigQuery();
  const [updateConfig] = useUpdateFeeConfigEntryMutation();
  const [editingValues, setEditingValues] = useState<Record<string, number>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const feeConfig = data?.fee_config ?? [];
  const viewingFees = data?.viewing_fees ?? [];
  const listingTiers = data?.listing_tiers ?? [];
  const boostPackages = data?.boost_packages ?? [];

  const handleUpdateConfig = async (key: string) => {
    const val = editingValues[key];
    if (val === undefined) return;
    try {
      await updateConfig({ key, value: val }).unwrap();
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      console.error('Failed to update config:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <SectionHeader title="Fee Configuration" sub="Global system fees, viewing charges, and listing tiers" />

      {/* Global Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
           <h3 className="text-sm font-bold text-[#222222] mb-5 flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-[#ff385c]/10 text-[#ff385c]">
               <Settings className="w-4 h-4" />
             </div>
             Global Coefficients
           </h3>
           <div className="space-y-4">
             {feeConfig.map((item: any) => (
               <div key={item.config_key} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100">
                 <div className="flex-1 mr-4">
                   <p className="text-xs font-bold text-[#222222] capitalize">{item.config_key.replace(/_/g, ' ')}</p>
                   <p className="text-[10px] text-[#6a6a6a] mt-0.5 leading-relaxed">{item.description}</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <input 
                    type="number" 
                    step="0.01"
                    defaultValue={item.config_value} 
                    onChange={e => setEditingValues(prev => ({ ...prev, [item.config_key]: parseFloat(e.target.value) }))}
                    className="w-20 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-right text-xs font-bold text-[#222222] focus:ring-2 focus:ring-[#ff385c]/20 outline-none" 
                   />
                   <button 
                    onClick={() => handleUpdateConfig(item.config_key)}
                    disabled={editingValues[item.config_key] === undefined && savedKey !== item.config_key}
                    className={`p-2 rounded-xl transition-all ${savedKey === item.config_key ? 'bg-emerald-50 text-emerald-600' : 'text-[#ff385c] hover:bg-white border border-transparent hover:border-gray-100'}`}
                   >
                     {savedKey === item.config_key ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                   </button>
                 </div>
               </div>
             ))}
             {isLoading && <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}</div>}
           </div>
        </div>

        {/* Viewing Fees */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all hover:shadow-md">
           <h3 className="text-sm font-bold text-[#222222] mb-5 flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
               <DollarSign className="w-4 h-4" />
             </div>
             Viewing Unlock Fees
           </h3>
           <div className="space-y-3">
             {viewingFees.map((v: any) => (
               <div key={v.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50/30 rounded-xl transition-colors">
                 <div>
                   <p className="text-sm font-semibold text-[#222222]">{v.category_name} · {v.property_type}</p>
                   <p className="text-xs text-[#6a6a6a] font-medium">KES {(v.fee_kes ?? 0).toLocaleString()}</p>
                 </div>
                 <button className="text-xs font-bold text-[#ff385c] px-3 py-1.5 rounded-lg hover:bg-[#ff385c]/5 transition-all">Edit</button>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Listing Tiers & Boosts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Tiers */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <h3 className="text-sm font-bold text-[#222222] mb-5 flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
               <Award className="w-4 h-4" />
             </div>
             Listing Tiers
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-xs text-left">
               <thead>
                 <tr className="text-[#6a6a6a] font-bold border-b border-gray-100 uppercase tracking-widest text-[10px]">
                   <th className="pb-3 px-2">Tier</th>
                   <th className="pb-3 px-2 text-right">Price (KES)</th>
                   <th className="pb-3 px-2 text-center">Photos</th>
                   <th className="pb-3 px-2 text-right">Edit</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {listingTiers.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 font-bold text-[#222222] capitalize">{t.tier_name}</td>
                      <td className="py-3 px-2 text-right font-semibold text-[#222222]">{(t.base_price_kes ?? 0).toLocaleString()}</td>

                      <td className="py-3 px-2 text-center text-[#6a6a6a] font-medium">{t.max_photos}</td>
                      <td className="py-3 px-2 text-right"><button className="p-1.5 text-[#6a6a6a] hover:text-[#ff385c] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"><Settings className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* Boost Packages */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <h3 className="text-sm font-bold text-[#222222] mb-5 flex items-center gap-2">
             <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
               <ArrowUpRight className="w-4 h-4" />
             </div>
             Boost Packages
           </h3>
           <div className="space-y-3">
             {boostPackages.map((b: any) => (
               <div key={b.id} className="p-4 bg-violet-50/30 rounded-2xl border border-violet-100/50 flex items-center justify-between group hover:border-violet-200 transition-all cursor-default">
                 <div>
                   <p className="text-sm font-bold text-[#222222] flex items-center gap-2">
                     {b.package_name}
                     <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-violet-100">+{b.score_boost} score</span>
                   </p>
                   <p className="text-xs text-[#6a6a6a] mt-0.5">Duration: {b.duration_days} days · Full Featured Placement</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold text-violet-700">KES {(b.price_kes ?? 0).toLocaleString()}</p>
                   <button className="text-[10px] font-bold text-violet-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeesTab;
