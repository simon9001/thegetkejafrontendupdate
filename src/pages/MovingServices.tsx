import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, Star, MapPin, Phone, MessageCircle,
  Filter, Search, ChevronDown, X,
  CheckCircle2, ArrowLeft, Plus, Shield, Clock, DollarSign, Loader2,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { toast } from 'react-hot-toast';
import {
  useListMovingCompaniesQuery,
  useSubmitMovingQuoteMutation,
  useRegisterMovingCompanyMutation,
  type MovingCompany,
} from '../features/Api/MovingApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type PriceRange = 'budget' | 'mid' | 'premium';
type Service    = 'packing' | 'transport' | 'heavy_lifting' | 'assembly' | 'storage' | 'cleaning';

interface QuoteForm {
  fromLocation:   string;
  toLocation:     string;
  moveDate:       string;
  furnitureCount: string;
  boxCount:       string;
  specialItems:   string;
  name:           string;
  phone:          string;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const SERVICE_META: Record<Service, { emoji: string; label: string }> = {
  packing:       { emoji: '📦', label: 'Packing'            },
  transport:     { emoji: '🚛', label: 'Transport'          },
  heavy_lifting: { emoji: '🏗',  label: 'Heavy Lifting'     },
  assembly:      { emoji: '🛋',  label: 'Furniture Assembly' },
  storage:       { emoji: '🏚',  label: 'Storage'           },
  cleaning:      { emoji: '🧹', label: 'Post-Move Cleaning' },
};

const PRICE_META: Record<PriceRange, { label: string; coins: number; color: string; bg: string }> = {
  budget:  { label: 'Budget',    coins: 1, color: '#50757A', bg: '#E8DAB2' },
  mid:     { label: 'Mid-Range', coins: 2, color: '#DD6E42', bg: '#E8DAB2' },
  premium: { label: 'Premium',   coins: 3, color: '#C0D6DF', bg: '#C0D6DF' },
};

// ─── Get Quote Modal ──────────────────────────────────────────────────────────

const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-[#50757A] placeholder:text-[#C0D6DF] focus:outline-none focus:ring-2 focus:ring-[#DD6E42]/20 focus:border-[#DD6E42] transition';

interface QuoteModalProps { company: MovingCompany; onClose: () => void; }

const QuoteModal: React.FC<QuoteModalProps> = ({ company, onClose }) => {
  const [submitQuote, { isLoading }] = useSubmitMovingQuoteMutation();
  const [form, setForm]   = useState<QuoteForm>({
    fromLocation: '', toLocation: '', moveDate: '',
    furnitureCount: '', boxCount: '', specialItems: '',
    name: '', phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [estimatedKes, setEstimatedKes] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<QuoteForm>>({});

  const validate = (): boolean => {
    const e: Partial<QuoteForm> = {};
    if (!form.fromLocation.trim()) e.fromLocation = 'Required';
    if (!form.toLocation.trim())   e.toLocation   = 'Required';
    if (!form.moveDate)            e.moveDate      = 'Required';
    if (!form.name.trim())         e.name          = 'Required';
    if (!form.phone.trim())        e.phone         = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await submitQuote({
        companyId:      company.id,
        fromLocation:   form.fromLocation,
        toLocation:     form.toLocation,
        moveDate:       form.moveDate,
        furnitureCount: form.furnitureCount ? Number(form.furnitureCount) : undefined,
        boxCount:       form.boxCount       ? Number(form.boxCount)       : undefined,
        specialItems:   form.specialItems   || undefined,
        name:           form.name,
        phone:          form.phone,
      }).unwrap();
      setEstimatedKes(result.estimatedKes);
      setSubmitted(true);
    } catch {
      toast.error('Failed to get quote. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EAEAEA]">
          <div>
            <h2 className="text-lg font-bold text-[#50757A]">Get a Quote</h2>
            <p className="text-xs text-[#50757A] mt-0.5">{company.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#EAEAEA] transition" aria-label="Close">
            <X className="w-4 h-4 text-[#50757A]" />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Moving From *</label>
                <input value={form.fromLocation} onChange={e => setForm(p => ({ ...p, fromLocation: e.target.value }))} placeholder="e.g. Kilimani" className={inputCls} />
                {errors.fromLocation && <p className="text-xs text-red-500 mt-1">{errors.fromLocation}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Moving To *</label>
                <input value={form.toLocation} onChange={e => setForm(p => ({ ...p, toLocation: e.target.value }))} placeholder="e.g. Westlands" className={inputCls} />
                {errors.toLocation && <p className="text-xs text-red-500 mt-1">{errors.toLocation}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Move Date *</label>
              <input type="date" value={form.moveDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, moveDate: e.target.value }))} className={inputCls} />
              {errors.moveDate && <p className="text-xs text-red-500 mt-1">{errors.moveDate}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Furniture pieces</label>
                <input type="number" min="0" value={form.furnitureCount} onChange={e => setForm(p => ({ ...p, furnitureCount: e.target.value }))} placeholder="e.g. 8" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Boxes / cartons</label>
                <input type="number" min="0" value={form.boxCount} onChange={e => setForm(p => ({ ...p, boxCount: e.target.value }))} placeholder="e.g. 15" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Special items</label>
              <input value={form.specialItems} onChange={e => setForm(p => ({ ...p, specialItems: e.target.value }))}
                placeholder="e.g. Piano, washing machine, server rack" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Your Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className={inputCls} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Phone *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+254…" className={inputCls} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-[#DD6E42] hover:bg-[#C4623B] text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Get Instant Quote
            </button>
          </form>
        ) : (
          <div className="px-6 py-8 space-y-6 text-center">
            <CheckCircle2 className="w-14 h-14 text-[#DD6E42] mx-auto" />
            <div>
              <h3 className="text-xl font-black text-[#50757A]">Estimated Quote</h3>
              <p className="text-[#50757A] text-sm mt-1">{form.fromLocation} → {form.toLocation}</p>
            </div>
            <div className="bg-gradient-to-r from-[#50757A] to-[#3D5A5E] rounded-2xl p-6">
              <p className="text-[#C0D6DF] text-xs mb-1">Estimated total</p>
              <p className="text-4xl font-black text-[#DD6E42]">KES {estimatedKes?.toLocaleString()}</p>
              <p className="text-[#C0D6DF] text-xs mt-2">* Final price confirmed after site assessment</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#50757A]">Confirm this booking with {company.name}:</p>
              <div className="flex gap-2">
                <a href={`tel:${company.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#50757A] text-[#50757A] font-semibold rounded-xl hover:bg-[#50757A] hover:text-white transition text-sm">
                  <Phone className="w-4 h-4" />Call
                </a>
                <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hi! I got a quote of KES ${estimatedKes?.toLocaleString()} on GETKEJA for a move from ${form.fromLocation} to ${form.toLocation} on ${form.moveDate}. My name is ${form.name}. Can we confirm?`
                )}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1ebe5a] transition text-sm">
                  <MessageCircle className="w-4 h-4" />WhatsApp
                </a>
              </div>
            </div>
            <button onClick={onClose} className="text-sm text-[#50757A] underline">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Register Company Modal ───────────────────────────────────────────────────

const RegisterModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [register, { isLoading }] = useRegisterMovingCompanyMutation();
  const [form, setForm] = useState({ companyName: '', contactName: '', phone: '', email: '', areas: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.contactName.trim()) e.contactName = 'Required';
    if (!form.phone.trim())       e.phone       = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(form).unwrap();
      toast.success('Registration submitted! Our team will be in touch shortly.');
      onClose();
    } catch {
      toast.error('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EAEAEA]">
          <h2 className="text-lg font-bold text-[#50757A] flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#DD6E42]" /> Register Your Company
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#EAEAEA] transition">
            <X className="w-4 h-4 text-[#50757A]" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {[
            { key: 'companyName', label: 'Company Name', placeholder: 'e.g. SwiftMove Kenya' },
            { key: 'contactName', label: 'Contact Person', placeholder: 'Your full name' },
            { key: 'phone',       label: 'Phone Number',   placeholder: '+254…'             },
            { key: 'email',       label: 'Email',           placeholder: 'info@company.co.ke'},
            { key: 'areas',       label: 'Coverage Areas (optional)', placeholder: 'e.g. Nairobi, Mombasa' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder} className={inputCls} />
              {(errors as any)[f.key] && <p className="text-xs text-red-500 mt-1">{(errors as any)[f.key]}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#EAEAEA] rounded-xl text-sm font-semibold text-[#50757A] hover:bg-[#EAEAEA] transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-3 bg-[#50757A] hover:bg-[#3D5A5E] text-white rounded-xl text-sm font-bold transition disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Company Card ─────────────────────────────────────────────────────────────

interface CompanyCardProps { company: MovingCompany; onGetQuote: (c: MovingCompany) => void; }

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onGetQuote }) => {
  const priceM = PRICE_META[company.priceRange] ?? PRICE_META.mid;

  return (
    <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="p-5 flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0"
          style={{ background: company.logoColor }}>
          {company.logoInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-[#50757A] text-sm leading-tight">{company.name}</h3>
              {company.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#DD6E42] mt-0.5">
                  <Shield className="w-3 h-3" />Verified
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0"
              style={{ background: priceM.bg, color: priceM.color }}>
              {'💰'.repeat(priceM.coins)} {priceM.label}
            </span>
          </div>
          {company.tagline && (
            <p className="text-[11px] text-[#50757A] mt-1 leading-snug">{company.tagline}</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-3 flex items-center gap-4 text-xs text-[#50757A]">
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold">{company.rating.toFixed(1)}</span>
          ({company.reviewCount})
        </span>
        <span className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-[#DD6E42]" />
          {company.totalMoves.toLocaleString()} moves
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#DD6E42]" />
          {company.yearsActive}yr{company.yearsActive !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="px-5 pb-3">
        <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-1.5">Coverage</p>
        <div className="flex flex-wrap gap-1.5">
          {company.coverageAreas.map(a => (
            <span key={a} className="flex items-center gap-1 text-[10px] bg-[#EAEAEA] text-[#50757A] px-2 py-0.5 rounded-full">
              <MapPin className="w-2.5 h-2.5 text-[#DD6E42]" />{a}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pb-4 flex-1">
        <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-1.5">Services</p>
        <div className="flex flex-wrap gap-1.5">
          {company.services.map(s => {
            const meta = SERVICE_META[s as Service] ?? { emoji: '', label: s };
            return (
              <span key={s} className="text-[11px] bg-[#E8DAB2] text-[#50757A] font-semibold px-2 py-0.5 rounded-full">
                {meta.emoji} {meta.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5 flex gap-2 border-t border-[#EAEAEA] pt-4">
        <a href={`tel:${company.phone}`}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#EAEAEA] rounded-xl text-xs font-semibold text-[#50757A] hover:bg-[#EAEAEA] transition">
          <Phone className="w-3.5 h-3.5" />Call
        </a>
        <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#1ebe5a] transition">
          <MessageCircle className="w-3.5 h-3.5" />WhatsApp
        </a>
        <button onClick={() => onGetQuote(company)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#50757A] hover:bg-[#3D5A5E] text-white rounded-xl text-xs font-bold transition">
          <DollarSign className="w-3.5 h-3.5" />Get Quote
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const MovingServices: React.FC = () => {
  const [search, setSearch]         = useState('');
  const [filterRange, setRange]     = useState<'all' | PriceRange>('all');
  const [filterService, setService] = useState<'all' | Service>('all');
  const [quoteCompany, setQuote]    = useState<MovingCompany | null>(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [debouncedSearch, setDebounced] = useState('');
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useListMovingCompaniesQuery({
    search:     debouncedSearch || undefined,
    priceRange: filterRange !== 'all' ? filterRange : undefined,
    service:    filterService !== 'all' ? filterService : undefined,
  });

  const companies = data?.companies ?? [];
  const topRated  = useMemo(() => [...companies].sort((a, b) => b.rating - a.rating).slice(0, 2), [companies]);

  const totalMoves = useMemo(() => companies.reduce((s, c) => s + c.totalMoves, 0), [companies]);
  const avgRating  = useMemo(() => companies.length
    ? (companies.reduce((s, c) => s + c.rating, 0) / companies.length).toFixed(1)
    : '—', [companies]);

  return (
    <Layout showSearch={false}>
      {quoteCompany    && <QuoteModal    company={quoteCompany} onClose={() => setQuote(null)} />}
      {showRegister    && <RegisterModal onClose={() => setShowRegister(false)} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm text-[#50757A] hover:text-[#DD6E42] mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to properties
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#50757A] to-[#3D5A5E] rounded-3xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#DD6E42]" /> Moving Services
              </h1>
              <p className="text-[#C0D6DF] text-sm max-w-sm">
                Book trusted, verified moving companies for your next relocation. Get instant quotes, compare prices, and book in minutes.
              </p>
            </div>
            {!isLoading && (
              <div className="flex gap-4 text-center">
                <div><p className="text-2xl font-black text-[#DD6E42]">{companies.length}</p><p className="text-[11px] text-[#C0D6DF]">Companies</p></div>
                <div className="w-px bg-[#ffffff20]" />
                <div><p className="text-2xl font-black text-[#DD6E42]">{avgRating}</p><p className="text-[11px] text-[#C0D6DF]">Avg Rating</p></div>
                <div className="w-px bg-[#ffffff20]" />
                <div><p className="text-2xl font-black text-[#DD6E42]">{totalMoves >= 1000 ? `${Math.round(totalMoves / 1000)}k+` : totalMoves}</p><p className="text-[11px] text-[#C0D6DF]">Moves done</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EAEAEA] h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Top Rated */}
            {topRated.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#50757A] mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> Top Rated
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {topRated.map(c => <CompanyCard key={c.id} company={c} onGetQuote={setQuote} />)}
                </div>
              </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C0D6DF]" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by company name or area…"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#EAEAEA] border border-[#EAEAEA] rounded-xl text-sm text-[#50757A] placeholder:text-[#C0D6DF] focus:outline-none focus:border-[#DD6E42] transition" />
                </div>
                <button onClick={() => setShowFilters(f => !f)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    showFilters ? 'bg-[#50757A] text-white border-[#50757A]' : 'border-[#EAEAEA] text-[#50757A]'
                  }`}>
                  <Filter className="w-4 h-4" /> Filters
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EAEAEA]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Price range</label>
                    <select value={filterRange} onChange={e => setRange(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#EAEAEA] rounded-lg text-sm focus:outline-none focus:border-[#DD6E42]">
                      <option value="all">All ranges</option>
                      <option value="budget">💰 Budget</option>
                      <option value="mid">💰💰 Mid-Range</option>
                      <option value="premium">💰💰💰 Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Service needed</label>
                    <select value={filterService} onChange={e => setService(e.target.value as any)}
                      className="w-full px-3 py-2 border border-[#EAEAEA] rounded-lg text-sm focus:outline-none focus:border-[#DD6E42]">
                      <option value="all">All services</option>
                      {(Object.keys(SERVICE_META) as Service[]).map(s => (
                        <option key={s} value={s}>{SERVICE_META[s].emoji} {SERVICE_META[s].label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* All companies */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#50757A]">All Moving Companies</h2>
              <p className="text-sm text-[#50757A]">{companies.length} result{companies.length !== 1 ? 's' : ''}</p>
            </div>

            {companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EAEAEA] flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-[#C0D6DF]" />
                </div>
                <p className="text-lg font-bold text-[#50757A]">No companies found</p>
                <p className="text-sm text-[#50757A] mt-1">Try broadening your search or clearing filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {companies.map(c => <CompanyCard key={c.id} company={c} onGetQuote={setQuote} />)}
              </div>
            )}
          </>
        )}

        {/* Register CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#DD6E42]/10 to-[#50757A]/5 border border-[#DD6E42]/20 rounded-2xl p-8 text-center">
          <Truck className="w-10 h-10 text-[#DD6E42] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#50757A] mb-2">Are you a moving company?</h3>
          <p className="text-sm text-[#50757A] mb-5 max-w-sm mx-auto">
            Register on GETKEJA to reach thousands of tenants actively looking for relocation services every day.
          </p>
          <button onClick={() => setShowRegister(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#50757A] hover:bg-[#3D5A5E] text-white font-bold rounded-xl transition">
            <Plus className="w-4 h-4" /> Register Your Company
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MovingServices;
