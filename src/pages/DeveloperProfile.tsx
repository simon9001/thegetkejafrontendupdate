import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Building2, Calendar, ChevronLeft, BedDouble, Bath, HardHat, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useGetPublicDeveloperProfileQuery } from '../features/Api/DeveloperApi';

// ── Small property card ───────────────────────────────────────────────────────
const PropCard: React.FC<{ p: any; onClick: (id: string) => void }> = ({ p, onClick }) => {
  const media   = Array.isArray(p.property_media) ? p.property_media : [];
  const cover   = media.find((m: any) => m.is_cover)?.url ?? media[0]?.url ?? null;
  const pricing = Array.isArray(p.property_pricing) ? p.property_pricing[0] : p.property_pricing;
  const amount  = pricing?.monthly_rent ?? pricing?.asking_price ?? pricing?.price_per_night ?? 0;
  const currency = pricing?.currency ?? 'KES';
  const loc     = Array.isArray(p.property_locations) ? p.property_locations[0] : p.property_locations;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onClick(p.id)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {cover
          ? <img src={cover} className="w-full h-full object-cover" alt={p.title} />
          : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-300" /></div>
        }
      </div>
      <div className="p-3">
        <p className="font-bold text-[#50757A] text-sm truncate">{p.title}</p>
        {loc && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{[loc.area, loc.county].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {amount > 0 && (
          <p className="text-xs font-bold text-[#DD6E42] mt-1.5">
            {currency} {amount.toLocaleString()}
            {pricing?.monthly_rent ? '/mo' : pricing?.price_per_night ? '/night' : ''}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
          {p.bedrooms > 0 && <span className="flex items-center gap-0.5"><BedDouble className="w-3 h-3" />{p.bedrooms}</span>}
          {p.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{p.bathrooms}</span>}
          {p.listing_category && (
            <span className="capitalize text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">
              {p.listing_category.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const DeveloperProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetPublicDeveloperProfileQuery(
    { devId: id!, page },
    { skip: !id }
  );

  const developer  = data?.developer;
  const listings   = data?.listings ?? [];
  const recommended = data?.recommended ?? [];

  if (isLoading) {
    return (
      <Layout showSearch={false}>
        <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-36 bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-[4/3] bg-gray-100 rounded-2xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !developer) {
    return (
      <Layout showSearch={false}>
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <HardHat className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#50757A]">Developer not found</h2>
          <p className="text-sm text-gray-400 mt-2">This developer profile doesn't exist or is no longer active.</p>
          <button onClick={() => navigate(-1)} className="mt-6 flex items-center gap-2 mx-auto text-sm text-[#50757A] font-semibold hover:underline">
            <ChevronLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </Layout>
    );
  }

  const initials = developer.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const joined = developer.member_since ? new Date(developer.member_since).getFullYear() : null;

  return (
    <Layout showSearch={false}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#50757A] hover:underline font-medium">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Developer hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1A2E30] to-[#0D1E20] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6"
        >
          {/* Avatar / Logo */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-white/10 flex items-center justify-center text-3xl font-black">
            {developer.avatar_url
              ? <img src={developer.avatar_url} className="w-full h-full object-cover" alt={developer.full_name} />
              : <span className="text-white">{initials}</span>
            }
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black">{developer.full_name}</h1>
            <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
              <HardHat className="w-4 h-4 text-[#DD6E42]" />
              <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">Property Developer</p>
            </div>
            {developer.bio && <p className="text-white/80 text-sm mt-3 max-w-xl">{developer.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start text-sm">
              {developer.county && (
                <span className="flex items-center gap-1.5 text-white/80">
                  <MapPin className="w-4 h-4 shrink-0" />{developer.county}
                </span>
              )}
              {joined && (
                <span className="flex items-center gap-1.5 text-white/80">
                  <Calendar className="w-4 h-4 shrink-0" />Active since {joined}
                </span>
              )}
              {developer.phone && (
                <a href={`tel:${developer.phone}`} className="flex items-center gap-1.5 text-[#DD6E42] hover:text-[#FFD4B8] font-semibold">
                  <Phone className="w-4 h-4 shrink-0" />{developer.phone}
                </a>
              )}
            </div>
          </div>

          {/* Stats chip */}
          <div className="bg-white/10 rounded-2xl px-5 py-3 text-center shrink-0">
            <p className="text-3xl font-black">{developer.total_listings}</p>
            <p className="text-xs text-white/60 mt-0.5 font-semibold">Active Projects</p>
          </div>
        </motion.div>

        {/* Listings grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#50757A]">Projects by {developer.full_name}</h2>
            <p className="text-xs text-gray-400">{data?.total ?? 0} project{(data?.total ?? 0) !== 1 ? 's' : ''}</p>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <HardHat className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-[#50757A]">No active projects</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((p: any) => (
                  <PropCard key={p.id} p={p} onClick={(id) => navigate(`/property/${id}`)} />
                ))}
              </div>

              {/* Pagination */}
              {(data?.pages ?? 1) > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: data!.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        page === p ? 'bg-[#50757A] text-white' : 'bg-gray-100 text-[#50757A] hover:bg-gray-200'
                      }`}
                    >{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Recommended section */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#50757A]">Other Properties You May Like</h2>
              <button
                onClick={() => navigate('/properties')}
                className="flex items-center gap-1 text-xs text-[#DD6E42] font-bold hover:underline"
              >
                Browse all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommended.map((p: any) => (
                <PropCard key={p.id} p={p} onClick={(id) => navigate(`/property/${id}`)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default DeveloperProfile;
