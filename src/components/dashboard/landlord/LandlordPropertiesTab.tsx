// components/dashboard/landlord/LandlordPropertiesTab.tsx
import React, { useState } from 'react';
import { Building2, Plus, Search, MapPin, Edit3, Trash2, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader, Badge, Pagination, EmptyState, ConfirmModal } from '../shared';
import { useGetMyPropertiesQuery, useDeletePropertyMutation } from '../../../features/Api/PropertiesApi';
import { toast } from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '',          label: 'All' },
  { value: 'available', label: 'Live' },
  { value: 'off_market', label: 'Off Market' },
];

const LandlordPropertiesTab: React.FC = () => {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetMyPropertiesQuery({
    page,
    limit: 12,
    search:  search        || undefined,
    status:  statusFilter  || undefined,
  });
  const [deleteProperty] = useDeletePropertyMutation();

  const properties  = data?.properties ?? [];
  const totalPages  = data?.pages      ?? 1;
  // Properties with published_at === null are awaiting staff review
  const pendingCount = !statusFilter
    ? (data?.properties ?? []).filter((p: any) => !p.published_at).length
    : 0;

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
      <SectionHeader
        title="My Properties"
        sub="Manage and track your property listings"
        action={
          <Link
            to="/dashboard/add-property"
            className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all"
          >
            <Plus className="w-4 h-4" /> Add New
          </Link>
        }
      />

      {/* Pending review notice */}
      {pendingCount > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendingCount} listing{pendingCount > 1 ? 's' : ''} awaiting approval
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              New listings are reviewed by staff before going live on the platform.
              Head to the <strong>Staff Dashboard → Listing Review</strong> to approve them.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a] pointer-events-none" />
          <input
            type="text"
            placeholder="Search properties…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#ff385c]/30"
          />
        </div>
        {/* Status pills */}
        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === f.value
                  ? 'bg-white text-[#222222] shadow-sm'
                  : 'text-[#6a6a6a] hover:text-[#222222]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          message={statusFilter ? `No ${statusFilter.replace('_', ' ')} properties` : 'No properties yet'}
          sub="Start by adding your first property listing."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p: any) => {
            const isPending = !p.published_at && p.status === 'available';
            const coverImg  = (p.media ?? []).find((m: any) => m.is_cover)?.url ?? p.media?.[0]?.url;
            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${
                  isPending ? 'border-amber-200' : 'border-gray-100'
                }`}
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                  {coverImg
                    ? <img src={coverImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><Building2 className="w-12 h-12" /></div>
                  }
                  <div className="absolute top-3 left-3">
                    <Badge status={p.status ?? 'active'} />
                  </div>
                  {isPending && (
                    <div className="absolute inset-0 bg-amber-900/10 flex items-center justify-center">
                      <div className="bg-white/90 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">Awaiting Approval</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#222222] truncate mb-1">{p.title}</h3>
                  <p className="text-xs text-[#6a6a6a] flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {[p.location?.area, p.location?.county].filter(Boolean).join(', ') || 'Location not set'}
                  </p>

                  {isPending ? (
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Under review — approve in Staff Dashboard
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-sm font-bold text-[#ff385c]">
                        KES {(p.pricing?.monthly_rent ?? p.pricing?.asking_price ?? 0).toLocaleString()}
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
                        <button className="p-1.5 text-[#6a6a6a] hover:bg-gray-50 rounded-lg" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
