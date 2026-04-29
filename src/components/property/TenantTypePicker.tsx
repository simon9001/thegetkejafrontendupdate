import React from 'react';
import {
  GraduationCap, Users, Briefcase, Heart, Globe, Building2,
} from 'lucide-react';

export type TenantType =
  | 'students'
  | 'families'
  | 'working_professionals'
  | 'retirees'
  | 'expatriates'
  | 'corporate';

export interface TenantTargeting {
  types: TenantType[];
  notes: string;
}

export const DEFAULT_TENANT_TARGETING: TenantTargeting = { types: [], notes: '' };

interface TenantOption {
  value: TenantType;
  label: string;
  emoji: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  accentColor: string;
  bgColor: string;
}

const TENANT_OPTIONS: TenantOption[] = [
  {
    value: 'students',
    label: 'Students',
    emoji: '🎓',
    description: 'University or college students near campus',
    Icon: GraduationCap,
    accentColor: '#C0D6DF',
    bgColor: '#C0D6DF',
  },
  {
    value: 'families',
    label: 'Families',
    emoji: '👨‍👩‍👧',
    description: 'Families with children needing space',
    Icon: Users,
    accentColor: '#DD6E42',
    bgColor: '#E8DAB2',
  },
  {
    value: 'working_professionals',
    label: 'Working Professionals',
    emoji: '💼',
    description: 'Employed adults with steady income',
    Icon: Briefcase,
    accentColor: '#DD6E42',
    bgColor: '#E8DAB2',
  },
  {
    value: 'retirees',
    label: 'Retirees / Seniors',
    emoji: '👴',
    description: 'Senior citizens seeking quiet living',
    Icon: Heart,
    accentColor: '#EC4899',
    bgColor: '#FDF2F8',
  },
  {
    value: 'expatriates',
    label: 'Expatriates',
    emoji: '🌍',
    description: 'Foreign nationals living in Kenya',
    Icon: Globe,
    accentColor: '#C0D6DF',
    bgColor: '#F0F9FF',
  },
  {
    value: 'corporate',
    label: 'Corporate / Company',
    emoji: '🏢',
    description: 'Company leases for staff accommodation',
    Icon: Building2,
    accentColor: '#50757A',
    bgColor: '#EAEAEA',
  },
];

/** Label+value badge to display on listing cards / detail pages */
export const TenantTypeBadge: React.FC<{ type: TenantType }> = ({ type }) => {
  const opt = TENANT_OPTIONS.find(o => o.value === type);
  if (!opt) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: opt.bgColor, color: opt.accentColor }}
    >
      {opt.emoji} {opt.label}
    </span>
  );
};

// ────────────────────────────────────────────────────────────────────────────
interface TenantTypePickerProps {
  value: TenantTargeting;
  onChange: (v: TenantTargeting) => void;
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-white border border-[#EAEAEA] rounded-lg text-sm text-[#50757A] placeholder:text-[#EAEAEA] focus:outline-none focus:ring-2 focus:ring-[#DD6E42]/20 focus:border-[#DD6E42] transition resize-none';

export const TenantTypePicker: React.FC<TenantTypePickerProps> = ({ value, onChange }) => {
  const toggle = (type: TenantType) => {
    const next = value.types.includes(type)
      ? value.types.filter(t => t !== type)
      : [...value.types, type];
    onChange({ ...value, types: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#50757A] mb-1">
          Who is this property best suited for?
        </h3>
        <p className="text-xs text-[#50757A]">
          Select all that apply — these tags help seekers filter for properties that match their profile.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TENANT_OPTIONS.map(opt => {
          const selected = value.types.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                selected
                  ? 'border-transparent shadow-md'
                  : 'border-[#EAEAEA] hover:border-[#EAEAEA] bg-white'
              }`}
              style={selected ? { borderColor: opt.accentColor, background: opt.bgColor } : {}}
              aria-pressed={selected}
            >
              {/* Selection tick */}
              {selected && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                  style={{ background: opt.accentColor }}
                >
                  ✓
                </span>
              )}

              <span className="text-2xl leading-none">{opt.emoji}</span>
              <div>
                <p
                  className="text-sm font-bold leading-tight"
                  style={{ color: selected ? opt.accentColor : '#50757A' }}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] text-[#50757A] mt-0.5 leading-snug">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected tags summary */}
      {value.types.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.types.map(t => (
            <TenantTypeBadge key={t} type={t} />
          ))}
        </div>
      )}

      {/* Landlord notes field */}
      <div>
        <label className="block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1.5">
          Tenant Preferences Note <span className="text-[#C0D6DF] normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={value.notes}
          onChange={e => onChange({ ...value, notes: e.target.value })}
          placeholder="Describe your ideal tenant — e.g. 'Quiet, employed professional. No parties. Pets negotiable.'"
          rows={3}
          maxLength={400}
          className={inputCls}
        />
        <p className="text-[11px] text-[#C0D6DF] mt-1">{value.notes.length}/400</p>
      </div>
    </div>
  );
};

export default TenantTypePicker;
