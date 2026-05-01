import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Home, Search, MapPin, Calendar,
  Wifi, Car, ChevronRight, ChevronLeft, Check, X,
  Loader2, MessageCircle, Phone, UserCircle,
  Shield, Cigarette, Dog, Music, Moon, Coffee,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import Layout from '../components/layout/Layout';
import {
  useGetMyRoommateProfilesQuery,
  useCreateRoommateProfileMutation,
  useDeactivateRoommateProfileMutation,
  useGetMatchesAsHostQuery,
  useGetMatchesAsSeekerQuery,
  useSendRoommateConnectionMutation,
  useRespondToRoommateConnectionMutation,
  useGetMyRoommateConnectionsQuery,
  type MatchCard,
  type RoommateConnection,
} from '../features/Api/RoommateApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const LIFESTYLE_TAGS = [
  { key: 'non_smoker',   label: 'Non-Smoker',   emoji: '🚭' },
  { key: 'smoker',       label: 'Smoker',        emoji: '🚬' },
  { key: 'pet_friendly', label: 'Pet-Friendly',  emoji: '🐾' },
  { key: 'night_owl',    label: 'Night Owl',     emoji: '🌙' },
  { key: 'early_bird',   label: 'Early Bird',    emoji: '☀️' },
  { key: 'clean_tidy',   label: 'Clean & Tidy',  emoji: '🧹' },
  { key: 'social',       label: 'Social',        emoji: '☕' },
  { key: 'quiet',        label: 'Quiet',         emoji: '📚' },
  { key: 'gym_lover',    label: 'Gym Lover',     emoji: '💪' },
  { key: 'music_lover',  label: 'Music Lover',   emoji: '🎵' },
];

const HOUSE_RULES = [
  { key: 'no_smoking',            label: 'No Smoking',               emoji: '🚭' },
  { key: 'no_pets',               label: 'No Pets',                  emoji: '🐾' },
  { key: 'no_parties',            label: 'No Parties',               emoji: '🎉' },
  { key: 'quiet_after_10pm',      label: 'Quiet After 10pm',         emoji: '🤫' },
  { key: 'no_overnight_guests',   label: 'No Overnight Guests',      emoji: '🛏️' },
  { key: 'no_drugs',              label: 'No Drugs',                 emoji: '🚫' },
  { key: 'couples_welcome',       label: 'Couples Welcome',          emoji: '💑' },
  { key: 'working_professionals', label: 'Working Professionals',    emoji: '💼' },
  { key: 'vegetarian_household',  label: 'Vegetarian Household',     emoji: '🥗' },
  { key: 'no_loud_music',         label: 'No Loud Music',            emoji: '🎵' },
];

const WORK_SCHEDULES = [
  { key: 'day_shift',   label: '9-5 Day Shift' },
  { key: 'night_shift', label: 'Night Shift'   },
  { key: 'remote',      label: 'Remote / WFH'  },
  { key: 'flexible',    label: 'Flexible Hours' },
  { key: 'student',     label: 'Student'        },
];

const ROOM_TYPES = [
  { key: 'private_room', label: 'Private Room',  emoji: '🔒' },
  { key: 'shared_room',  label: 'Shared Room',   emoji: '👥' },
  { key: 'entire_place', label: 'Entire Place',  emoji: '🏠' },
];

const FURNISHING_OPTS = [
  { key: 'furnished',       label: 'Furnished'        },
  { key: 'semi_furnished',  label: 'Semi-Furnished'   },
  { key: 'unfurnished',     label: 'Unfurnished'      },
];

// ── Small helpers ─────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#50757A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DD6E42]/20 focus:border-[#DD6E42] transition';
const labelCls = 'block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1.5';

const TagPill: React.FC<{
  emoji: string; label: string; selected?: boolean; onClick?: () => void;
}> = ({ emoji, label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
      selected
        ? 'bg-[#50757A] text-white border-[#50757A]'
        : 'bg-white text-[#50757A] border-gray-200 hover:border-[#50757A]/40'
    }`}
  >
    <span>{emoji}</span> {label}
  </button>
);

const ScoreBadge: React.FC<{ score: number; strong: boolean }> = ({ score, strong }) => (
  <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl shrink-0 ${
    strong ? 'bg-[#DD6E42] text-white' : 'bg-[#50757A]/10 text-[#50757A]'
  }`}>
    <span className="text-lg font-black leading-none">{score}</span>
    <span className="text-[9px] font-bold leading-none mt-0.5">%</span>
    {strong && <span className="text-[8px] font-black mt-0.5 tracking-wide">STRONG</span>}
  </div>
);

const StepDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div className="flex gap-1.5 justify-center mb-6">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className={`h-1.5 rounded-full transition-all ${
        i < current ? 'bg-[#DD6E42] w-5' : i === current ? 'bg-[#50757A] w-5' : 'bg-gray-200 w-3'
      }`} />
    ))}
  </div>
);

// ── Host Onboarding (5 steps) ─────────────────────────────────────────────────

interface HostForm {
  roomType: string; bathrooms: string; furnishing: string;
  parking: boolean; wifi: boolean; availableFrom: string;
  rentAmount: string; billsIncluded: boolean;
  houseRules: string[];
  currentTenants: string; housemateGender: string;
  housemateAgeMin: string; housemateAgeMax: string;
  lifestyle: string[]; workSchedule: string;
  displayName: string; age: string; gender: string;
  occupation: string; area: string; county: string;
  bio: string; whatsappNumber: string;
}

const HostOnboarding: React.FC<{
  onDone: () => void;
}> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<HostForm>({
    roomType: '', bathrooms: '', furnishing: '',
    parking: false, wifi: true, availableFrom: '',
    rentAmount: '', billsIncluded: false,
    houseRules: [],
    currentTenants: '0', housemateGender: 'any',
    housemateAgeMin: '18', housemateAgeMax: '99',
    lifestyle: [], workSchedule: '',
    displayName: '', age: '', gender: 'any',
    occupation: '', area: '', county: '',
    bio: '', whatsappNumber: '',
  });

  const [createProfile, { isLoading }] = useCreateRoommateProfileMutation();

  const set = (k: keyof HostForm, v: any) => setForm(p => ({ ...p, [k]: v }));
  const toggle = (k: 'houseRules' | 'lifestyle', val: string) =>
    setForm(p => ({
      ...p,
      [k]: p[k].includes(val) ? p[k].filter((x: string) => x !== val) : [...p[k], val],
    }));

  const canAdvance = () => {
    if (step === 0) return form.roomType && form.bathrooms && form.furnishing && form.availableFrom && form.rentAmount;
    if (step === 4) return form.displayName.trim() && form.age && form.area.trim() && form.county.trim() && form.bio.trim().length >= 20;
    return true;
  };

  const handleSubmit = async () => {
    try {
      await createProfile({
        profileType:     'host',
        roomType:        form.roomType,
        bathrooms:       form.bathrooms,
        furnishing:      form.furnishing,
        parking:         form.parking,
        wifi:            form.wifi,
        availableFrom:   form.availableFrom,
        rentAmount:      Number(form.rentAmount),
        billsIncluded:   form.billsIncluded,
        houseRules:      form.houseRules,
        currentTenants:  Number(form.currentTenants),
        housemateGender: form.housemateGender,
        housemateAgeMin: Number(form.housemateAgeMin),
        housemateAgeMax: Number(form.housemateAgeMax),
        lifestyle:       form.lifestyle,
        workSchedule:    form.workSchedule || undefined,
        displayName:     form.displayName.trim(),
        age:             Number(form.age),
        gender:          form.gender,
        occupation:      form.occupation.trim() || undefined,
        area:            form.area.trim(),
        county:          form.county.trim(),
        bio:             form.bio.trim(),
        whatsappNumber:  form.whatsappNumber.trim() || undefined,
      }).unwrap();
      toast.success('Host profile created! Seekers can now match with you.');
      onDone();
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed to create profile');
    }
  };

  const steps = [
    // Step 0: Room Details
    <div key="room" className="space-y-4">
      <h2 className="text-lg font-black text-[#50757A]">Tell us about the room</h2>
      <div>
        <p className={labelCls}>Room type *</p>
        <div className="grid grid-cols-3 gap-2">
          {ROOM_TYPES.map(r => (
            <button key={r.key} type="button" onClick={() => set('roomType', r.key)}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                form.roomType === r.key ? 'border-[#50757A] bg-[#50757A]/10 text-[#50757A]' : 'border-gray-200 text-gray-400 hover:border-[#50757A]/40'
              }`}>
              <div className="text-xl mb-1">{r.emoji}</div>{r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={labelCls}>Bathroom *</p>
          {['private','shared'].map(b => (
            <button key={b} type="button" onClick={() => set('bathrooms', b)}
              className={`w-full mb-1.5 px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all capitalize ${
                form.bathrooms === b ? 'border-[#50757A] bg-[#50757A]/10 text-[#50757A]' : 'border-gray-200 text-gray-400'
              }`}>{b}
            </button>
          ))}
        </div>
        <div>
          <p className={labelCls}>Furnishing *</p>
          {FURNISHING_OPTS.map(f => (
            <button key={f.key} type="button" onClick={() => set('furnishing', f.key)}
              className={`w-full mb-1.5 px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                form.furnishing === f.key ? 'border-[#50757A] bg-[#50757A]/10 text-[#50757A]' : 'border-gray-200 text-gray-400'
              }`}>{f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.parking} onChange={e => set('parking', e.target.checked)}
            className="w-4 h-4 rounded accent-[#50757A]" />
          <span className="text-sm text-[#50757A] font-semibold flex items-center gap-1"><Car className="w-3.5 h-3.5" /> Parking</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.wifi} onChange={e => set('wifi', e.target.checked)}
            className="w-4 h-4 rounded accent-[#50757A]" />
          <span className="text-sm text-[#50757A] font-semibold flex items-center gap-1"><Wifi className="w-3.5 h-3.5" /> WiFi included</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Available from *</label>
          <input type="date" value={form.availableFrom} min={new Date().toISOString().split('T')[0]}
            onChange={e => set('availableFrom', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Monthly rent (KES) *</label>
          <input type="number" min="0" value={form.rentAmount} onChange={e => set('rentAmount', e.target.value)}
            placeholder="e.g. 18000" className={inputCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.billsIncluded} onChange={e => set('billsIncluded', e.target.checked)}
          className="w-4 h-4 rounded accent-[#50757A]" />
        <span className="text-sm text-[#50757A] font-semibold">Bills included in rent</span>
      </label>
    </div>,

    // Step 1: House Rules
    <div key="rules" className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#50757A]">House rules</h2>
        <p className="text-xs text-gray-400 mt-1">Select rules that apply in your home. Seekers who conflict will be filtered out.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {HOUSE_RULES.map(r => (
          <TagPill key={r.key} emoji={r.emoji} label={r.label}
            selected={form.houseRules.includes(r.key)}
            onClick={() => toggle('houseRules', r.key)} />
        ))}
      </div>
      <p className="text-xs text-gray-400">Selected: {form.houseRules.length || 'none (open household)'}</p>
    </div>,

    // Step 2: Household info
    <div key="household" className="space-y-4">
      <h2 className="text-lg font-black text-[#50757A]">About your household</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Current housemates</label>
          <input type="number" min="0" max="20" value={form.currentTenants}
            onChange={e => set('currentTenants', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Preferred gender</label>
          <select value={form.housemateGender} onChange={e => set('housemateGender', e.target.value)} className={inputCls}>
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Preferred age range</label>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min="18" max="99" value={form.housemateAgeMin}
            onChange={e => set('housemateAgeMin', e.target.value)} placeholder="Min age" className={inputCls} />
          <input type="number" min="18" max="99" value={form.housemateAgeMax}
            onChange={e => set('housemateAgeMax', e.target.value)} placeholder="Max age" className={inputCls} />
        </div>
      </div>
    </div>,

    // Step 3: Your lifestyle
    <div key="lifestyle" className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-[#50757A]">Your lifestyle</h2>
        <p className="text-xs text-gray-400 mt-1">These help seekers understand you and improve compatibility scoring.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {LIFESTYLE_TAGS.map(t => (
          <TagPill key={t.key} emoji={t.emoji} label={t.label}
            selected={form.lifestyle.includes(t.key)}
            onClick={() => toggle('lifestyle', t.key)} />
        ))}
      </div>
      <div>
        <label className={labelCls}>Work schedule</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WORK_SCHEDULES.map(w => (
            <button key={w.key} type="button" onClick={() => set('workSchedule', w.key)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                form.workSchedule === w.key ? 'border-[#50757A] bg-[#50757A]/10 text-[#50757A]' : 'border-gray-200 text-gray-400'
              }`}>{w.label}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 4: Profile
    <div key="profile" className="space-y-4">
      <h2 className="text-lg font-black text-[#50757A]">Your public profile</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Display name / alias *</label>
          <input value={form.displayName} onChange={e => set('displayName', e.target.value)}
            placeholder="e.g. James K." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Age *</label>
          <input type="number" min="18" max="99" value={form.age}
            onChange={e => set('age', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Gender</label>
          <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputCls}>
            <option value="any">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Occupation</label>
          <input value={form.occupation} onChange={e => set('occupation', e.target.value)}
            placeholder="e.g. Software Engineer" className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Area / Neighbourhood *</label>
          <input value={form.area} onChange={e => set('area', e.target.value)}
            placeholder="e.g. Kilimani" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>County *</label>
          <input value={form.county} onChange={e => set('county', e.target.value)}
            placeholder="e.g. Nairobi" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Short bio * (min 20 chars)</label>
        <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
          maxLength={400} placeholder="Tell potential housemates about yourself…"
          className={`${inputCls} resize-none`} />
        <p className="text-[11px] text-gray-300 mt-1">{form.bio.length}/400</p>
      </div>
      <div>
        <label className={labelCls}>WhatsApp number (revealed after mutual match)</label>
        <input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)}
          placeholder="+254 7XX XXX XXX" className={inputCls} />
      </div>
    </div>,
  ];

  return (
    <div className="max-w-lg mx-auto">
      <StepDots total={5} current={step} />
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {steps[step]}
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-[#50757A] hover:bg-gray-50 transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 4 ? (
          <button type="button" disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#50757A] text-white rounded-xl text-sm font-bold hover:bg-[#3d5f63] transition disabled:opacity-40">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" disabled={isLoading || !canAdvance()} onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DD6E42] text-white rounded-xl text-sm font-bold hover:bg-[#C4623B] transition disabled:opacity-40">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Host Profile
          </button>
        )}
      </div>
    </div>
  );
};

// ── Seeker Onboarding (5 steps) ───────────────────────────────────────────────

interface SeekerForm {
  area: string; county: string; preferredMoveIn: string;
  budgetMin: string; budgetMax: string;
  roomTypePref: string[]; maxHousemates: string;
  smokes: boolean; hasPets: boolean; nightOwl: boolean;
  playsMusicLoud: boolean; overnightGuests: boolean;
  lifestyle: string[]; workSchedule: string;
  displayName: string; age: string; gender: string;
  occupation: string; bio: string; whatsappNumber: string;
}

const SeekerOnboarding: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SeekerForm>({
    area: '', county: '', preferredMoveIn: '',
    budgetMin: '', budgetMax: '',
    roomTypePref: [], maxHousemates: '4',
    smokes: false, hasPets: false, nightOwl: false,
    playsMusicLoud: false, overnightGuests: false,
    lifestyle: [], workSchedule: '',
    displayName: '', age: '', gender: 'any',
    occupation: '', bio: '', whatsappNumber: '',
  });

  const [createProfile, { isLoading }] = useCreateRoommateProfileMutation();

  const set = (k: keyof SeekerForm, v: any) => setForm(p => ({ ...p, [k]: v }));
  const toggleArr = (k: 'roomTypePref' | 'lifestyle', val: string) =>
    setForm(p => ({
      ...p,
      [k]: p[k].includes(val) ? p[k].filter((x: string) => x !== val) : [...p[k], val],
    }));

  const canAdvance = () => {
    if (step === 0) return form.area.trim() && form.county.trim() && form.preferredMoveIn && form.budgetMax;
    if (step === 4) return form.displayName.trim() && form.age && form.bio.trim().length >= 20;
    return true;
  };

  // Self-declarations auto-populate lifestyle tags
  const buildLifestyle = () => {
    const tags = new Set(form.lifestyle);
    if (form.smokes)          tags.add('smoker');   else tags.delete('smoker');
    if (form.hasPets)         tags.add('pet_friendly'); else tags.delete('pet_friendly');
    if (form.nightOwl)        tags.add('night_owl'); else tags.delete('night_owl');
    if (form.playsMusicLoud)  tags.add('music_lover'); else tags.delete('music_lover');
    return Array.from(tags);
  };

  const handleSubmit = async () => {
    const lifestyle = buildLifestyle();
    const dealBreakers: string[] = [];
    if (form.smokes)          dealBreakers.push('smoker');
    if (form.hasPets)         dealBreakers.push('pet_friendly');
    if (form.nightOwl)        dealBreakers.push('night_owl');
    if (form.playsMusicLoud)  dealBreakers.push('music_lover');
    if (form.overnightGuests) dealBreakers.push('overnight_guests');
    try {
      await createProfile({
        profileType:     'seeker',
        area:            form.area.trim(),
        county:          form.county.trim(),
        preferredMoveIn: form.preferredMoveIn,
        budgetMin:       Number(form.budgetMin) || 0,
        budgetMax:       Number(form.budgetMax),
        roomTypePref:    form.roomTypePref,
        maxHousemates:   Number(form.maxHousemates),
        lifestyle,
        workSchedule:    form.workSchedule || undefined,
        dealBreakers,
        displayName:     form.displayName.trim(),
        age:             Number(form.age),
        gender:          form.gender,
        occupation:      form.occupation.trim() || undefined,
        bio:             form.bio.trim(),
        whatsappNumber:  form.whatsappNumber.trim() || undefined,
      }).unwrap();
      toast.success('Seeker profile created! Hosts will now match with you.');
      onDone();
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed to create profile');
    }
  };

  const DeclarQuestion: React.FC<{ icon: React.ReactNode; label: string; field: keyof SeekerForm }> = ({ icon, label, field }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="flex items-center gap-2 text-sm text-[#50757A] font-medium">{icon}{label}</span>
      <div className="flex gap-2">
        {([true, false] as const).map(val => (
          <button key={String(val)} type="button" onClick={() => set(field, val)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
              form[field] === val
                ? val ? 'bg-[#DD6E42] text-white border-[#DD6E42]' : 'bg-[#50757A] text-white border-[#50757A]'
                : 'border-gray-200 text-gray-400'
            }`}>{val ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );

  const steps = [
    // Step 0: Where/When/Budget
    <div key="where" className="space-y-4">
      <h2 className="text-lg font-black text-[#50757A]">Where & when are you looking?</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Area / Neighbourhood *</label>
          <input value={form.area} onChange={e => set('area', e.target.value)}
            placeholder="e.g. Kilimani" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>County *</label>
          <input value={form.county} onChange={e => set('county', e.target.value)}
            placeholder="e.g. Nairobi" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Target move-in date *</label>
        <input type="date" value={form.preferredMoveIn} min={new Date().toISOString().split('T')[0]}
          onChange={e => set('preferredMoveIn', e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Monthly budget (KES) *</label>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min="0" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)}
            placeholder="Min (e.g. 8000)" className={inputCls} />
          <input type="number" min="0" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)}
            placeholder="Max (e.g. 20000)" className={inputCls} />
        </div>
      </div>
    </div>,

    // Step 1: Living situation
    <div key="situation" className="space-y-4">
      <h2 className="text-lg font-black text-[#50757A]">Living situation preferences</h2>
      <div>
        <p className={labelCls}>Room types you're OK with</p>
        <div className="grid grid-cols-3 gap-2">
          {ROOM_TYPES.map(r => (
            <button key={r.key} type="button" onClick={() => toggleArr('roomTypePref', r.key)}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                form.roomTypePref.includes(r.key) ? 'border-[#50757A] bg-[#50757A]/10 text-[#50757A]' : 'border-gray-200 text-gray-400'
              }`}>
              <div className="text-xl mb-1">{r.emoji}</div>{r.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Leave blank to accept any type</p>
      </div>
      <div>
        <label className={labelCls}>Max total people in household (including you)</label>
        <select value={form.maxHousemates} onChange={e => set('maxHousemates', e.target.value)} className={inputCls}>
          {[2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} people</option>)}
        </select>
      </div>
    </div>,

    // Step 2: Self declarations
    <div key="declare" className="space-y-2">
      <div className="mb-4">
        <h2 className="text-lg font-black text-[#50757A]">Honest self-check</h2>
        <p className="text-xs text-gray-400 mt-1">Your answers help us find compatible homes. Be honest — it helps everyone.</p>
      </div>
      <div className="bg-gray-50 rounded-2xl px-4 divide-y divide-gray-100">
        <DeclarQuestion icon={<Cigarette className="w-4 h-4 text-gray-400" />} label="Do you smoke?" field="smokes" />
        <DeclarQuestion icon={<Dog className="w-4 h-4 text-gray-400" />} label="Do you have pets?" field="hasPets" />
        <DeclarQuestion icon={<Moon className="w-4 h-4 text-gray-400" />} label="Are you a night owl (up past midnight)?" field="nightOwl" />
        <DeclarQuestion icon={<Music className="w-4 h-4 text-gray-400" />} label="Do you play music/TV loudly at home?" field="playsMusicLoud" />
        <DeclarQuestion icon={<Coffee className="w-4 h-4 text-gray-400" />} label="Do you frequently have overnight guests?" field="overnightGuests" />
      </div>
    </div>,

    // Step 3: Lifestyle & schedule
    <div key="lifestyle" className="space-y-4">
      <h2 className="text-lg font-black text-[#50757A]">Your lifestyle</h2>
      <div className="flex flex-wrap gap-2">
        {LIFESTYLE_TAGS.map(t => (
          <TagPill key={t.key} emoji={t.emoji} label={t.label}
            selected={form.lifestyle.includes(t.key)}
            onClick={() => toggleArr('lifestyle', t.key)} />
        ))}
      </div>
      <div>
        <label className={labelCls}>Work / study schedule</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WORK_SCHEDULES.map(w => (
            <button key={w.key} type="button" onClick={() => set('workSchedule', w.key)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                form.workSchedule === w.key ? 'border-[#50757A] bg-[#50757A]/10 text-[#50757A]' : 'border-gray-200 text-gray-400'
              }`}>{w.label}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 4: Profile
    <div key="profile" className="space-y-4">
      <h2 className="text-lg font-black text-[#50757A]">Your public profile</h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Display name / alias *</label>
          <input value={form.displayName} onChange={e => set('displayName', e.target.value)}
            placeholder="e.g. Aisha M." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Age *</label>
          <input type="number" min="18" max="99" value={form.age}
            onChange={e => set('age', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Gender</label>
          <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputCls}>
            <option value="any">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Occupation</label>
          <input value={form.occupation} onChange={e => set('occupation', e.target.value)}
            placeholder="e.g. Teacher" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Short bio * (min 20 chars)</label>
        <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
          maxLength={400} placeholder="A little about yourself and what you're looking for…"
          className={`${inputCls} resize-none`} />
        <p className="text-[11px] text-gray-300 mt-1">{form.bio.length}/400</p>
      </div>
      <div>
        <label className={labelCls}>WhatsApp number (revealed after mutual match)</label>
        <input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)}
          placeholder="+254 7XX XXX XXX" className={inputCls} />
      </div>
    </div>,
  ];

  return (
    <div className="max-w-lg mx-auto">
      <StepDots total={5} current={step} />
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {steps[step]}
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-[#50757A] hover:bg-gray-50 transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 4 ? (
          <button type="button" disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#50757A] text-white rounded-xl text-sm font-bold hover:bg-[#3d5f63] transition disabled:opacity-40">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" disabled={isLoading || !canAdvance()} onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DD6E42] text-white rounded-xl text-sm font-bold hover:bg-[#C4623B] transition disabled:opacity-40">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Find My Matches
          </button>
        )}
      </div>
    </div>
  );
};

// ── Match Cards ───────────────────────────────────────────────────────────────

const SeekerMatchCard: React.FC<{
  card: MatchCard;
  connectState: 'none' | 'pending' | 'connected';
  myProfileId: string;
  onConnect: (targetId: string, myId: string) => void;
  connecting: boolean;
}> = ({ card, connectState, myProfileId, onConnect, connecting }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
  >
    <div className="bg-gradient-to-br from-[#50757A] to-[#3D5A5E] px-4 pt-4 pb-8">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <UserCircle className="w-8 h-8 text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold">{card.displayName}</p>
          <p className="text-white/70 text-xs mt-0.5">
            {card.age} · {card.gender === 'any' ? 'Any gender' : card.gender}
            {card.occupation && ` · ${card.occupation}`}
          </p>
        </div>
        <ScoreBadge score={card.totalScore} strong={card.isStrongMatch} />
      </div>
    </div>
    <div className="px-4 -mt-4 pb-4 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <span className="bg-white border border-gray-100 shadow-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#50757A] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#DD6E42]" />{card.area}, {card.county}
        </span>
        {card.preferredMoveIn && (
          <span className="bg-white border border-gray-100 shadow-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#50757A] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#DD6E42]" />
            {new Date(card.preferredMoveIn).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {card.budgetMax && (
          <span className="bg-white border border-gray-100 shadow-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#DD6E42]">
            KES {(card.budgetMin ?? 0).toLocaleString()} – {card.budgetMax.toLocaleString()}
          </span>
        )}
      </div>
      <p className="text-xs text-[#50757A] line-clamp-2 leading-relaxed">{card.bio}</p>
      {card.lifestyle.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.lifestyle.slice(0, 4).map(t => {
            const meta = LIFESTYLE_TAGS.find(x => x.key === t);
            return meta ? <span key={t} className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full text-[#50757A] font-semibold">{meta.emoji} {meta.label}</span> : null;
          })}
        </div>
      )}
      <div className="pt-2 border-t border-gray-100">
        {connectState === 'connected' ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><Check className="w-3.5 h-3.5" /> Connected</span>
        ) : connectState === 'pending' ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><Loader2 className="w-3.5 h-3.5" /> Request sent</span>
        ) : (
          <button onClick={() => onConnect(card.id, myProfileId)} disabled={connecting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#50757A] text-white text-xs font-bold rounded-lg hover:bg-[#3d5f63] transition disabled:opacity-60">
            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
            Invite
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

const HostMatchCard: React.FC<{
  card: MatchCard;
  connectState: 'none' | 'pending' | 'connected';
  myProfileId: string;
  onConnect: (targetId: string, myId: string) => void;
  connecting: boolean;
}> = ({ card, connectState, myProfileId, onConnect, connecting }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
  >
    <div className="bg-gradient-to-br from-[#1A2E30] to-[#0D1E20] px-4 pt-4 pb-8">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Home className="w-6 h-6 text-[#DD6E42]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {card.roomType && (
              <span className="text-[10px] bg-[#DD6E42]/20 text-[#DD6E42] px-2 py-0.5 rounded-full font-bold capitalize">
                {card.roomType.replace(/_/g, ' ')}
              </span>
            )}
            {card.furnishing && (
              <span className="text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-semibold capitalize">
                {card.furnishing.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <p className="text-white font-bold mt-1">{card.area}, {card.county}</p>
          <p className="text-[#DD6E42] font-bold text-sm mt-0.5">
            KES {card.rentAmount?.toLocaleString()}/mo
            {card.billsIncluded && <span className="text-white/50 text-[10px] ml-1 font-normal">bills incl.</span>}
          </p>
        </div>
        <ScoreBadge score={card.totalScore} strong={card.isStrongMatch} />
      </div>
    </div>
    <div className="px-4 -mt-4 pb-4 space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <span className="bg-white border border-gray-100 shadow-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#50757A] flex items-center gap-1">
          <Users className="w-3 h-3" />{card.currentTenants ?? 0} current tenant{card.currentTenants !== 1 ? 's' : ''}
        </span>
        {card.availableFrom && (
          <span className="bg-white border border-gray-100 shadow-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#50757A] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#DD6E42]" />
            From {new Date(card.availableFrom).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {card.parking && <span className="bg-white border border-gray-100 shadow-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#50757A] flex items-center gap-1"><Car className="w-3 h-3" /> Parking</span>}
        {card.wifi && <span className="bg-white border border-gray-100 shadow-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#50757A] flex items-center gap-1"><Wifi className="w-3 h-3" /> WiFi</span>}
      </div>
      {(card.houseRules?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.houseRules!.slice(0, 4).map(r => {
            const meta = HOUSE_RULES.find(x => x.key === r);
            return meta ? <span key={r} className="text-[10px] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full text-red-600 font-semibold">{meta.emoji} {meta.label}</span> : null;
          })}
        </div>
      )}
      <p className="text-xs text-[#50757A] line-clamp-2 leading-relaxed">{card.bio}</p>
      <div className="pt-2 border-t border-gray-100">
        {connectState === 'connected' ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><Check className="w-3.5 h-3.5" /> Connected</span>
        ) : connectState === 'pending' ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400"><Loader2 className="w-3.5 h-3.5" /> Request sent</span>
        ) : (
          <button onClick={() => onConnect(card.id, myProfileId)} disabled={connecting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#DD6E42] text-white text-xs font-bold rounded-lg hover:bg-[#C4623B] transition disabled:opacity-60">
            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Request Viewing
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// ── Connections View ──────────────────────────────────────────────────────────

const ConnectionCard: React.FC<{
  conn: RoommateConnection;
  isHostParty: boolean;
  onRespond: (id: string, action: 'accept' | 'reject') => void;
  responding: boolean;
}> = ({ conn, isHostParty, onRespond, responding }) => {
  const theirs = isHostParty ? conn.seekerProfile : conn.hostProfile;
  const myAccepted = isHostParty ? conn.hostAccepted : conn.seekerAccepted;
  const needsMyResponse = !myAccepted && conn.status === 'pending';

  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm ${
      conn.isMutual ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          conn.isMutual ? 'bg-emerald-100' : 'bg-gray-100'
        }`}>
          {conn.isMutual ? <Check className="w-5 h-5 text-emerald-600" /> : <MessageCircle className="w-5 h-5 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#50757A] text-sm">{theirs?.displayName ?? 'Unknown'}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              conn.isMutual ? 'bg-emerald-100 text-emerald-700'
              : conn.status === 'pending' ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
            }`}>
              {conn.isMutual ? 'Connected' : conn.status === 'pending' ? 'Pending' : 'Rejected'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {theirs?.area}{theirs?.county ? `, ${theirs.county}` : ''}
          </p>
          {!isHostParty && conn.hostProfile?.rentAmount && (
            <p className="text-xs font-bold text-[#DD6E42] mt-0.5">
              KES {conn.hostProfile.rentAmount.toLocaleString()}/mo
            </p>
          )}
        </div>
      </div>

      {/* Mutual — reveal contact */}
      {conn.isMutual && theirs?.whatsappNumber && (
        <a
          href={`https://wa.me/${theirs.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition w-fit"
        >
          <Phone className="w-3.5 h-3.5" /> WhatsApp {theirs.displayName}
        </a>
      )}
      {conn.isMutual && !theirs?.whatsappNumber && (
        <p className="mt-2 text-xs text-gray-400 italic">They haven't added a WhatsApp number yet.</p>
      )}

      {/* Needs my response */}
      {needsMyResponse && (
        <div className="mt-3 flex gap-2">
          <button onClick={() => onRespond(conn.id, 'accept')} disabled={responding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition border border-emerald-200 disabled:opacity-60">
            {responding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Accept
          </button>
          <button onClick={() => onRespond(conn.id, 'reject')} disabled={responding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition border border-red-200 disabled:opacity-60">
            <X className="w-3.5 h-3.5" /> Decline
          </button>
        </div>
      )}

      {/* Waiting on them */}
      {!needsMyResponse && !conn.isMutual && conn.status === 'pending' && (
        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3" /> Waiting for their response…
        </p>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

type View = 'type-select' | 'host-onboard' | 'seeker-onboard' | 'host-matches' | 'seeker-matches' | 'connections';

const RoommateFinder: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [view, setView]         = useState<View>('type-select');
  const [matchPage, setMPage]   = useState(1);
  const [connectingId, setCId]  = useState<string | null>(null);
  const [respondingId, setRId]  = useState<string | null>(null);

  const { data: profilesData, isLoading: profilesLoading } =
    useGetMyRoommateProfilesQuery(undefined, { skip: !isAuthenticated });

  const myProfiles    = profilesData?.profiles ?? [];
  const hostProfile   = myProfiles.find(p => p.profileType === 'host');
  const seekerProfile = myProfiles.find(p => p.profileType === 'seeker');

  useEffect(() => {
    if (!profilesLoading && isAuthenticated) {
      if (hostProfile) setView('host-matches');
      else if (seekerProfile) setView('seeker-matches');
      else setView('type-select');
    }
  }, [profilesLoading, isAuthenticated, !!hostProfile, !!seekerProfile]);

  const [deactivate] = useDeactivateRoommateProfileMutation();

  const { data: hostMatchData,   isLoading: hmLoading }  = useGetMatchesAsHostQuery({ page: matchPage },   { skip: view !== 'host-matches' });
  const { data: seekerMatchData, isLoading: smLoading }  = useGetMatchesAsSeekerQuery({ page: matchPage }, { skip: view !== 'seeker-matches' });
  const { data: connData,        isLoading: connLoading } = useGetMyRoommateConnectionsQuery(undefined,    { skip: !isAuthenticated });
  const [sendConnection]    = useSendRoommateConnectionMutation();
  const [respondConnection] = useRespondToRoommateConnectionMutation();

  const connections = connData?.connections ?? [];
  const pendingCount = connections.filter(c => {
    const isH = c.isHostParty;
    return c.status === 'pending' && (isH ? !c.hostAccepted : !c.seekerAccepted);
  }).length;

  // Build connect-state map for current match view
  const connectStateMap = useMemo(() => {
    const map = new Map<string, 'pending' | 'connected'>();
    for (const c of connections) {
      if (view === 'host-matches' && c.isHostParty && c.seekerProfile?.id) {
        map.set(c.seekerProfile.id, c.status === 'connected' ? 'connected' : 'pending');
      }
      if (view === 'seeker-matches' && c.isSeekerParty && c.hostProfile?.id) {
        map.set(c.hostProfile.id, c.status === 'connected' ? 'connected' : 'pending');
      }
    }
    return map;
  }, [connections, view]);

  const handleConnect = async (targetProfileId: string, myProfileId: string) => {
    setCId(targetProfileId);
    try {
      await sendConnection({ targetProfileId, myProfileId }).unwrap();
      toast.success('Connection request sent!');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed to send request');
    } finally {
      setCId(null);
    }
  };

  const handleRespond = async (connectionId: string, action: 'accept' | 'reject') => {
    setRId(connectionId);
    try {
      const res = await respondConnection({ connectionId, action }).unwrap();
      if (action === 'accept' && res.mutual) toast.success('Connected! WhatsApp contact is now revealed.');
      else if (action === 'accept')           toast.success('Accepted — waiting for their response.');
      else                                    toast('Request declined.');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed to respond');
    } finally {
      setRId(null);
    }
  };

  const handleDeactivate = async (profileId: string) => {
    if (!confirm('Deactivate this profile? You can create a new one any time.')) return;
    try {
      await deactivate(profileId).unwrap();
      toast.success('Profile deactivated.');
    } catch { toast.error('Failed to deactivate'); }
  };

  // ── Not authenticated ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Layout showSearch={false}>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[#50757A]/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-[#50757A]" />
          </div>
          <h1 className="text-2xl font-black text-[#50757A] mb-2">Roommate Finder</h1>
          <p className="text-sm text-gray-400 mb-6">Sign in to create a profile and discover your ideal housemate or room.</p>
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#DD6E42] text-white font-bold rounded-xl hover:bg-[#C4623B] transition">
            <LogIn className="w-4 h-4" /> Sign In to Continue
          </button>
        </div>
      </Layout>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────
  if (profilesLoading) {
    return (
      <Layout showSearch={false}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  const matches   = view === 'host-matches' ? (hostMatchData?.matches ?? []) : (seekerMatchData?.matches ?? []);
  const totalPages = view === 'host-matches' ? (hostMatchData?.pages ?? 1)   : (seekerMatchData?.pages ?? 1);
  const matchCount = view === 'host-matches' ? (hostMatchData?.total ?? 0)   : (seekerMatchData?.total ?? 0);
  const matchLoading = view === 'host-matches' ? hmLoading : smLoading;
  const currentProfileId = view === 'host-matches' ? (hostProfile?.id ?? '') : (seekerProfile?.id ?? '');

  return (
    <Layout showSearch={false}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#50757A] to-[#3D5A5E] rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#DD6E42]" /> Roommate Finder
            </h1>
            <p className="text-[#C0D6DF] text-sm mt-1 max-w-sm">
              Smart compatibility matching between hosts with rooms and seekers looking for a place.
            </p>
          </div>
          {myProfiles.length === 0 && (
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setView('host-onboard')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#DD6E42] text-white text-sm font-bold rounded-xl hover:bg-[#C4623B] transition">
                <Home className="w-4 h-4" /> I Have a Room
              </button>
              <button onClick={() => setView('seeker-onboard')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition">
                <Search className="w-4 h-4" /> I Need a Room
              </button>
            </div>
          )}
        </div>

        {/* ── Type select (no profile yet) ── */}
        {(view === 'type-select') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <motion.button whileHover={{ y: -2 }} onClick={() => setView('host-onboard')}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left hover:border-[#50757A]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#50757A]/10 flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-[#50757A]" />
              </div>
              <h3 className="font-black text-[#50757A] text-lg">I have a room</h3>
              <p className="text-sm text-gray-400 mt-1">List your room and find the perfect housemate using smart compatibility matching.</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#DD6E42]">
                Create Host Profile <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.button>
            <motion.button whileHover={{ y: -2 }} onClick={() => setView('seeker-onboard')}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left hover:border-[#DD6E42]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#DD6E42]/10 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#DD6E42]" />
              </div>
              <h3 className="font-black text-[#50757A] text-lg">I need a room</h3>
              <p className="text-sm text-gray-400 mt-1">Set your preferences and get matched with hosts whose rooms and lifestyle fit yours.</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#DD6E42]">
                Create Seeker Profile <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.button>
          </div>
        )}

        {/* ── Onboarding flows ── */}
        {view === 'host-onboard' && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setView('type-select')} className="text-gray-400 hover:text-[#50757A] transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Host Profile Setup</h2>
            </div>
            <HostOnboarding onDone={() => setView('host-matches')} />
          </div>
        )}

        {view === 'seeker-onboard' && (
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <button onClick={() => setView('type-select')} className="text-gray-400 hover:text-[#50757A] transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Seeker Profile Setup</h2>
            </div>
            <SeekerOnboarding onDone={() => setView('seeker-matches')} />
          </div>
        )}

        {/* ── Nav tabs (when user has profiles) ── */}
        {myProfiles.length > 0 && (view === 'host-matches' || view === 'seeker-matches' || view === 'connections') && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
            {hostProfile && (
              <button onClick={() => { setView('host-matches'); setMPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  view === 'host-matches' ? 'bg-white text-[#50757A] shadow-sm' : 'text-[#50757A]/60 hover:text-[#50757A]'
                }`}>
                <Home className="w-3.5 h-3.5" /> My Room
              </button>
            )}
            {seekerProfile && (
              <button onClick={() => { setView('seeker-matches'); setMPage(1); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  view === 'seeker-matches' ? 'bg-white text-[#50757A] shadow-sm' : 'text-[#50757A]/60 hover:text-[#50757A]'
                }`}>
                <Search className="w-3.5 h-3.5" /> Find Rooms
              </button>
            )}
            <button onClick={() => setView('connections')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                view === 'connections' ? 'bg-white text-[#50757A] shadow-sm' : 'text-[#50757A]/60 hover:text-[#50757A]'
              }`}>
              <MessageCircle className="w-3.5 h-3.5" /> Connections
              {pendingCount > 0 && (
                <span className="bg-[#DD6E42] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
            {/* Add second profile type */}
            {hostProfile && !seekerProfile && (
              <button onClick={() => setView('seeker-onboard')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#DD6E42]/80 hover:text-[#DD6E42] transition-all flex items-center gap-1">
                + Also Looking
              </button>
            )}
            {seekerProfile && !hostProfile && (
              <button onClick={() => setView('host-onboard')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#DD6E42]/80 hover:text-[#DD6E42] transition-all flex items-center gap-1">
                + List a Room
              </button>
            )}
          </div>
        )}

        {/* ── Host matches (host sees ranked seekers) ── */}
        {view === 'host-matches' && (
          <div className="space-y-4">
            {hostProfile && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#50757A]">
                    {matchLoading ? 'Finding matches…' : `${matchCount} compatible seeker${matchCount !== 1 ? 's' : ''} found`}
                  </p>
                  <p className="text-xs text-gray-400">Showing seekers who pass your house rules and score ≥55%</p>
                </div>
                <button onClick={() => hostProfile && handleDeactivate(hostProfile.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition">Deactivate profile</button>
              </div>
            )}

            {matchLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <Users className="w-12 h-12 text-gray-200 mb-3" />
                <p className="font-bold text-[#50757A]">No matches yet</p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">Seekers in your area who meet your criteria will appear here. Check back soon!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.map(card => (
                    <SeekerMatchCard
                      key={card.id}
                      card={card}
                      connectState={connectStateMap.get(card.id) ?? 'none'}
                      myProfileId={currentProfileId}
                      onConnect={handleConnect}
                      connecting={connectingId === card.id}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setMPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          matchPage === p ? 'bg-[#50757A] text-white' : 'bg-gray-100 text-[#50757A] hover:bg-gray-200'
                        }`}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Seeker matches (seeker sees ranked hosts) ── */}
        {view === 'seeker-matches' && (
          <div className="space-y-4">
            {seekerProfile && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#50757A]">
                    {matchLoading ? 'Finding rooms…' : `${matchCount} compatible room${matchCount !== 1 ? 's' : ''} found`}
                  </p>
                  <p className="text-xs text-gray-400">Rooms that fit your budget, location, and lifestyle — ranked by compatibility</p>
                </div>
                <button onClick={() => seekerProfile && handleDeactivate(seekerProfile.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition">Deactivate profile</button>
              </div>
            )}

            {matchLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <Home className="w-12 h-12 text-gray-200 mb-3" />
                <p className="font-bold text-[#50757A]">No matching rooms yet</p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">Hosts in {seekerProfile?.county ?? 'your area'} within your budget will appear here as they sign up.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.map(card => (
                    <HostMatchCard
                      key={card.id}
                      card={card}
                      connectState={connectStateMap.get(card.id) ?? 'none'}
                      myProfileId={currentProfileId}
                      onConnect={handleConnect}
                      connecting={connectingId === card.id}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setMPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          matchPage === p ? 'bg-[#50757A] text-white' : 'bg-gray-100 text-[#50757A] hover:bg-gray-200'
                        }`}>{p}</button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Connections view ── */}
        {view === 'connections' && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-[#50757A]">{connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
            {connLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : connections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <MessageCircle className="w-12 h-12 text-gray-200 mb-3" />
                <p className="font-bold text-[#50757A]">No connections yet</p>
                <p className="text-sm text-gray-400 mt-1">Send a connection request from the matches view to get started.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {connections.map(c => (
                  <ConnectionCard
                    key={c.id}
                    conn={c}
                    isHostParty={c.isHostParty}
                    onRespond={handleRespond}
                    responding={respondingId === c.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Privacy note */}
        {myProfiles.length > 0 && view !== 'connections' && (
          <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#50757A]" />
            Full names, exact addresses, and contact details are hidden until both parties accept a connection.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoommateFinder;
