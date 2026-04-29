import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Plus, X, MapPin, Calendar, Filter, Search,
  MessageCircle, CheckCircle2, ChevronDown, ArrowLeft,
  UserCircle, Loader2,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  useListRoommateProfilesQuery,
  useCreateRoommateProfileMutation,
  useSendRoommateConnectMutation,
  useGetMyRoommateConnectionsQuery,
  type RoommateProfile,
} from '../features/Api/RoommateApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type Gender       = 'male' | 'female' | 'any';
type LifestyleTag =
  | 'non_smoker' | 'smoker' | 'pet_friendly' | 'night_owl'
  | 'early_bird' | 'clean_tidy' | 'social' | 'quiet' | 'gym_lover' | 'music_lover';

// ─── Lifestyle meta ───────────────────────────────────────────────────────────

const LIFESTYLE_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  non_smoker:  { emoji: '🚭', label: 'Non-Smoker',   color: '#DD6E42', bg: '#FEF2F2' },
  smoker:      { emoji: '🚬', label: 'Smoker',        color: '#C0D6DF', bg: '#EAEAEA' },
  pet_friendly:{ emoji: '🐾', label: 'Pet-Friendly',  color: '#DD6E42', bg: '#E8DAB2' },
  night_owl:   { emoji: '🌙', label: 'Night Owl',     color: '#C0D6DF', bg: '#C0D6DF' },
  early_bird:  { emoji: '☀️', label: 'Early Bird',    color: '#DD6E42', bg: '#FFFCE8' },
  clean_tidy:  { emoji: '🧹', label: 'Clean & Tidy',  color: '#50757A', bg: '#E8DAB2' },
  social:      { emoji: '☕', label: 'Social',         color: '#50757A', bg: '#E8DAB2' },
  quiet:       { emoji: '🤫', label: 'Quiet',          color: '#C0D6DF', bg: '#EAEAEA' },
  gym_lover:   { emoji: '💪', label: 'Gym Lover',      color: '#DD6E42', bg: '#E8DAB2' },
  music_lover: { emoji: '🎵', label: 'Music Lover',    color: '#50757A', bg: '#E8DAB2' },
};

const ALL_LIFESTYLE_TAGS: LifestyleTag[] = [
  'non_smoker','smoker','pet_friendly','night_owl','early_bird',
  'clean_tidy','social','quiet','gym_lover','music_lover',
];

// ─── Clock inline ─────────────────────────────────────────────────────────────

const Clock: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── Post Profile Modal ────────────────────────────────────────────────────────

const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-[#50757A] placeholder:text-[#C0D6DF] focus:outline-none focus:ring-2 focus:ring-[#DD6E42]/20 focus:border-[#DD6E42] transition';

interface PostModalProps { onClose: () => void; }

const PostProfileModal: React.FC<PostModalProps> = ({ onClose }) => {
  const [createProfile, { isLoading }] = useCreateRoommateProfileMutation();
  const [form, setForm] = useState({
    displayName: '', age: '', gender: 'any' as Gender,
    occupation: '', budgetMin: '', budgetMax: '',
    moveInDate: '', area: '', county: '', bio: '',
    lifestyle: [] as LifestyleTag[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTag = (t: LifestyleTag) =>
    setForm(p => ({
      ...p,
      lifestyle: p.lifestyle.includes(t) ? p.lifestyle.filter(x => x !== t) : [...p.lifestyle, t],
    }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.displayName.trim()) e.displayName = 'Name or alias is required';
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 18) e.age = 'Age must be 18+';
    if (!form.budgetMin || !form.budgetMax) e.budget = 'Budget range is required';
    if (Number(form.budgetMin) > Number(form.budgetMax)) e.budget = 'Min must be ≤ max';
    if (!form.moveInDate) e.moveInDate = 'Move-in date is required';
    if (!form.area.trim()) e.area = 'Area is required';
    if (!form.county.trim()) e.county = 'County is required';
    if (!form.bio.trim() || form.bio.length < 20) e.bio = 'Bio must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createProfile({
        displayName: form.displayName.trim(),
        age:         Number(form.age),
        gender:      form.gender,
        occupation:  form.occupation.trim() || undefined,
        budgetMin:   Number(form.budgetMin),
        budgetMax:   Number(form.budgetMax),
        moveInDate:  form.moveInDate,
        area:        form.area.trim(),
        county:      form.county.trim(),
        bio:         form.bio.trim(),
        lifestyle:   form.lifestyle,
      } as any).unwrap();
      toast.success('Profile posted! Others can now find and connect with you.');
      onClose();
    } catch {
      toast.error('Failed to post profile. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg relative my-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EAEAEA]">
          <h2 className="text-lg font-bold text-[#50757A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#DD6E42]" />
            Post Your Roommate Profile
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#EAEAEA] transition" aria-label="Close">
            <X className="w-4 h-4 text-[#50757A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Name / Alias *</label>
              <input value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} placeholder="e.g. Grace W." className={inputCls} />
              {errors.displayName && <p className="text-xs text-red-500 mt-1">{errors.displayName}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Age *</label>
              <input type="number" min="18" max="99" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} className={inputCls} />
              {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as Gender }))} className={inputCls}>
                <option value="any">Any / Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Occupation</label>
              <input value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} placeholder="e.g. Software Engineer" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Monthly Budget (KES) *</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="0" value={form.budgetMin} onChange={e => setForm(p => ({ ...p, budgetMin: e.target.value }))} placeholder="Min (e.g. 8000)" className={inputCls} />
              <input type="number" min="0" value={form.budgetMax} onChange={e => setForm(p => ({ ...p, budgetMax: e.target.value }))} placeholder="Max (e.g. 15000)" className={inputCls} />
            </div>
            {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Move-in Date *</label>
              <input type="date" value={form.moveInDate} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(p => ({ ...p, moveInDate: e.target.value }))} className={inputCls} />
              {errors.moveInDate && <p className="text-xs text-red-500 mt-1">{errors.moveInDate}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">County *</label>
              <input value={form.county} onChange={e => setForm(p => ({ ...p, county: e.target.value }))} placeholder="e.g. Nairobi" className={inputCls} />
              {errors.county && <p className="text-xs text-red-500 mt-1">{errors.county}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Area / Neighbourhood *</label>
            <input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} placeholder="e.g. Kilimani, Westlands, Parklands…" className={inputCls} />
            {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-2">Lifestyle Preferences</label>
            <div className="flex flex-wrap gap-2">
              {ALL_LIFESTYLE_TAGS.map(t => {
                const sel  = form.lifestyle.includes(t);
                const meta = LIFESTYLE_META[t];
                return (
                  <button key={t} type="button" onClick={() => toggleTag(t)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                      sel ? 'border-transparent text-white' : 'border-[#EAEAEA] text-[#50757A] bg-white'
                    }`}
                    style={sel ? { background: meta.color } : {}}>
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Short Bio *</label>
            <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} maxLength={400}
              placeholder="Tell potential roommates about yourself…"
              className={`${inputCls} resize-none`} />
            <p className="text-[11px] text-[#C0D6DF] mt-1">{form.bio.length}/400</p>
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#EAEAEA] rounded-xl text-sm font-semibold text-[#50757A] hover:bg-[#EAEAEA] transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 bg-[#DD6E42] text-white rounded-xl text-sm font-bold transition disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Roommate Card ────────────────────────────────────────────────────────────

interface RoommateCardProps {
  profile:      RoommateProfile;
  connectState: 'none' | 'pending' | 'connected';
  onConnect:    (id: string) => void;
  connecting:   boolean;
}

const RoommateCard: React.FC<RoommateCardProps> = ({ profile, connectState, onConnect, connecting }) => {
  const genderLabel = profile.gender === 'any' ? 'Any gender' : profile.gender === 'male' ? 'Male' : 'Female';

  return (
    <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="bg-gradient-to-br from-[#50757A] to-[#3D5A5E] px-5 pt-5 pb-8 relative">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-full bg-[#DD6E42]/20 flex items-center justify-center shrink-0 border-2 border-[#DD6E42]/30">
            <UserCircle className="w-8 h-8 text-[#DD6E42]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-tight">{profile.displayName}</p>
            <p className="text-[#C0D6DF] text-xs mt-0.5">{profile.age} · {genderLabel}</p>
            {profile.occupation && (
              <p className="text-[#DD6E42] text-xs font-medium mt-0.5">{profile.occupation}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[#DD6E42] font-bold text-sm">KES {profile.budgetMin.toLocaleString()}</p>
            <p className="text-[#C0D6DF] text-[10px]">to {profile.budgetMax.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 pb-5 space-y-3 relative">
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-white border border-[#EAEAEA] px-2.5 py-1 rounded-full text-[#50757A] shadow-sm">
            <MapPin className="w-3 h-3 text-[#DD6E42]" />
            {profile.area}, {profile.county}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold bg-white border border-[#EAEAEA] px-2.5 py-1 rounded-full text-[#50757A] shadow-sm">
            <Calendar className="w-3 h-3 text-[#DD6E42]" />
            {new Date(profile.moveInDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <p className="text-sm text-[#50757A] leading-relaxed line-clamp-3">{profile.bio}</p>

        {profile.lifestyle.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.lifestyle.map(t => {
              const m = LIFESTYLE_META[t] ?? { emoji: '', label: t, color: '#50757A', bg: '#EAEAEA' };
              return (
                <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: m.bg, color: m.color }}>
                  {m.emoji} {m.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#EAEAEA]">
          <div className="flex items-center gap-1 text-[11px] text-[#C0D6DF]">
            <MessageCircle className="w-3.5 h-3.5" />
            {profile.connectedCount} connect{profile.connectedCount !== 1 ? 's' : ''}
          </div>

          {connectState === 'connected' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#DD6E42]">
              <CheckCircle2 className="w-4 h-4" /> Connected
            </span>
          ) : connectState === 'pending' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#C0D6DF]">
              <Clock className="w-4 h-4" /> Request sent
            </span>
          ) : (
            <button
              onClick={() => onConnect(profile.id)}
              disabled={connecting}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#50757A] hover:bg-[#3D5A5E] text-white text-xs font-bold rounded-xl transition disabled:opacity-60"
            >
              {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const RoommateFinder: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]       = useState('');
  const [filterGender, setGender] = useState<'all' | Gender>('all');
  const [filterBudgetMax, setBMax]= useState('');
  const [filterArea, setArea]     = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Debounce search so we don't hammer the API on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams = useMemo(() => ({
    search:    debouncedSearch || undefined,
    gender:    filterGender !== 'all' ? filterGender : undefined,
    budgetMax: filterBudgetMax ? Number(filterBudgetMax) : undefined,
    area:      filterArea || undefined,
  }), [debouncedSearch, filterGender, filterBudgetMax, filterArea]);

  const { data, isLoading, isFetching } = useListRoommateProfilesQuery(queryParams);
  const { data: connectionsData }       = useGetMyRoommateConnectionsQuery(undefined, { skip: !isAuthenticated });
  const [sendConnect]                   = useSendRoommateConnectMutation();

  const profiles    = data?.profiles ?? [];
  const connections = connectionsData?.connections ?? [];

  const getConnectState = (profileId: string): 'none' | 'pending' | 'connected' => {
    const conn = connections.find(c => c.profile_id === profileId);
    if (!conn) return 'none';
    return conn.status === 'connected' ? 'connected' : 'pending';
  };

  const handleConnect = async (profileId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to connect with roommates.');
      return;
    }
    setConnectingId(profileId);
    try {
      await sendConnect(profileId).unwrap();
      toast.success('Connection request sent!');
    } catch (err: any) {
      toast.error(err?.data?.message ?? 'Failed to send request.');
    } finally {
      setConnectingId(null);
    }
  };

  const handlePost = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to post your profile.');
      return;
    }
    setShowModal(true);
  };

  return (
    <Layout showSearch={false}>
      {showModal && <PostProfileModal onClose={() => setShowModal(false)} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm text-[#50757A] hover:text-[#DD6E42] mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to properties
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#50757A] to-[#3D5A5E] rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#DD6E42]" /> Roommate Finder
            </h1>
            <p className="text-[#C0D6DF] text-sm max-w-sm">
              Find the perfect flatmate to share rent and costs. Browse profiles, send a connect request, and chat if both sides match.
            </p>
            <div className="flex items-center gap-4 mt-4 text-[#C0D6DF] text-xs">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#DD6E42]" />
                {data?.total ?? 0} active profiles
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#DD6E42]" /> Nairobi & surrounds
              </span>
            </div>
          </div>
          <button onClick={handlePost}
            className="flex items-center gap-2 px-6 py-3 bg-[#DD6E42] hover:bg-[#C4623B] text-white font-bold rounded-xl transition shrink-0">
            <Plus className="w-4 h-4" /> Post Your Profile
          </button>
        </div>

        {/* Search & filters */}
        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C0D6DF]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, area, or occupation…"
                className="w-full pl-9 pr-4 py-2.5 bg-[#EAEAEA] border border-[#EAEAEA] rounded-xl text-sm text-[#50757A] placeholder:text-[#C0D6DF] focus:outline-none focus:border-[#DD6E42] transition"
              />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                showFilters ? 'bg-[#50757A] text-white border-[#50757A]' : 'border-[#EAEAEA] text-[#50757A]'
              }`}>
              <Filter className="w-4 h-4" /> Filters
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#EAEAEA]">
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Gender preference</label>
                <select value={filterGender} onChange={e => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#EAEAEA] rounded-lg text-sm focus:outline-none focus:border-[#DD6E42]">
                  <option value="all">Any gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Max budget (KES/mo)</label>
                <input type="number" value={filterBudgetMax} onChange={e => setBMax(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full px-3 py-2 border border-[#EAEAEA] rounded-lg text-sm focus:outline-none focus:border-[#DD6E42]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Area / County</label>
                <input value={filterArea} onChange={e => setArea(e.target.value)} placeholder="e.g. Kilimani"
                  className="w-full px-3 py-2 border border-[#EAEAEA] rounded-lg text-sm focus:outline-none focus:border-[#DD6E42]" />
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#50757A]">
            <span className="font-semibold">{data?.total ?? 0}</span> profiles found
            {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin inline ml-2 text-[#DD6E42]" />}
          </p>
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EAEAEA] h-64 animate-pulse" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#DD6E42]/10 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-[#DD6E42]" />
            </div>
            <h3 className="text-xl font-bold text-[#50757A] mb-2">No profiles found</h3>
            <p className="text-[#50757A] text-sm max-w-xs mb-6">
              No one matches your current filters. Try broadening your search, or be the first to post!
            </p>
            <button onClick={handlePost}
              className="flex items-center gap-2 px-6 py-3 bg-[#DD6E42] text-white font-semibold rounded-xl hover:bg-[#C4623B] transition">
              <Plus className="w-4 h-4" /> Post Your Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map(p => (
              <RoommateCard
                key={p.id}
                profile={p}
                connectState={getConnectState(p.id)}
                onConnect={handleConnect}
                connecting={connectingId === p.id}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoommateFinder;
