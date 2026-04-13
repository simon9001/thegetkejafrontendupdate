// components/dashboard/landlord/LandlordPropertiesTab.tsx
import React, { useState } from 'react';
import { Building2, Plus, Search, Filter, MapPin, MoreVertical, Edit3, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader, Badge, Pagination, EmptyState, ConfirmModal } from '../shared';
import { useGetMyPropertiesQuery, useDeletePropertyMutation } from '../../../features/Api/PropertiesApi';
import { toast } from 'react-hot-toast';

const LandlordPropertiesTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetMyPropertiesQuery({ page, limit: 12, search: search || undefined });
  const [deleteProperty] = useDeletePropertyMutation();

  const properties = data?.properties ?? [];
  const totalPages = data?.pages ?? 1;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProperty(deleteId).unwrap();
      toast.success('Property deleted successfully');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Delete failed');
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="My Properties" sub="Manage and track your property listings" action={
        <Link to="/dashboard/add-property" className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all">
          <Plus className="w-4 h-4" /> Add New
        </Link>
      } />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a]" />
          <input type="text" placeholder="Search properties..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#ff385c]/30" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState icon={Building2} message="No properties found" sub="Start by adding your first property listing." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
              <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                {p.media?.[0]?.url 
                  ? <img src={p.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300"><Building2 className="w-12 h-12" /></div>
                }
                <div className="absolute top-3 left-3">
                  <Badge status={p.status ?? 'active'} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#222222] truncate mb-1">{p.title}</h3>
                <p className="text-xs text-[#6a6a6a] flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" /> {[p.location?.area, p.location?.town].filter(Boolean).join(', ') || 'Remote'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-sm font-bold text-[#ff385c]">
                    KES {(p.pricing?.monthly_rent ?? 0).toLocaleString()}
                    <span className="text-[10px] text-[#6a6a6a] font-normal">/mo</span>
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => window.open(`/property/${p.id}`, '_blank')}
                      className="p-1.5 text-[#6a6a6a] hover:bg-gray-50 rounded-lg"
                      title="View Listing"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-[#6a6a6a] hover:bg-gray-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmLabel="Delete"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default LandlordPropertiesTab;
