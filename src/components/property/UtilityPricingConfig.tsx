import React, { useState } from 'react';
import { Droplets, Zap, Flame, Wifi, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BillingCycle = 'monthly' | 'per_reading' | 'per_consumption';
export type MeterType    = 'shared' | 'individual';

export interface UtilityEntry {
  enabled: boolean;
  billedSeparately: boolean;
  pricePerUnit: string;
  currency: string;
  billingCycle: BillingCycle;
  meterType: MeterType;
  estimatedMonthlyUnits: string;
  flatMonthlyRate: string;
  notes: string;
}

export interface UtilitiesConfig {
  water:       UtilityEntry;
  electricity: UtilityEntry;
  gas:         UtilityEntry;
  internet:    UtilityEntry;
  garbage:     UtilityEntry;
}

const defaultEntry = (): UtilityEntry => ({
  enabled: false,
  billedSeparately: true,
  pricePerUnit: '',
  currency: 'KES',
  billingCycle: 'monthly',
  meterType: 'individual',
  estimatedMonthlyUnits: '',
  flatMonthlyRate: '',
  notes: '',
});

export const DEFAULT_UTILITIES: UtilitiesConfig = {
  water:       defaultEntry(),
  electricity: defaultEntry(),
  gas:         defaultEntry(),
  internet:    defaultEntry(),
  garbage:     defaultEntry(),
};

// ─── Utility meta ─────────────────────────────────────────────────────────────

type UtilityKey = keyof UtilitiesConfig;

interface UtilityMeta {
  key: UtilityKey;
  label: string;
  unit: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  hasMeter: boolean;
}

const UTILITIES: UtilityMeta[] = [
  { key: 'water',       label: 'Water',       unit: 'per m³',   Icon: Droplets, color: '#C0D6DF', bg: '#F0F9FF', hasMeter: true  },
  { key: 'electricity', label: 'Electricity', unit: 'per kWh',  Icon: Zap,      color: '#DD6E42', bg: '#E8DAB2', hasMeter: true  },
  { key: 'gas',         label: 'Gas / LPG',   unit: 'per kg',   Icon: Flame,    color: '#DD6E42', bg: '#FEF2F2', hasMeter: false },
  { key: 'internet',    label: 'Internet',    unit: 'flat rate', Icon: Wifi,     color: '#C0D6DF', bg: '#C0D6DF', hasMeter: false },
  { key: 'garbage',     label: 'Garbage',     unit: 'flat rate', Icon: Trash2,   color: '#50757A', bg: '#E8DAB2', hasMeter: false },
];

// ─── Single utility panel ─────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 bg-white border border-[#EAEAEA] rounded-lg text-sm text-[#50757A] placeholder:text-[#EAEAEA] focus:outline-none focus:ring-2 focus:ring-[#DD6E42]/20 focus:border-[#DD6E42] transition';
const selectCls = inputCls;
const labelCls  = 'block text-[11px] font-bold text-[#50757A] uppercase tracking-wider mb-1';

interface UtilityPanelProps {
  meta: UtilityMeta;
  entry: UtilityEntry;
  onChange: (patch: Partial<UtilityEntry>) => void;
}

const UtilityPanel: React.FC<UtilityPanelProps> = ({ meta, entry, onChange }) => {
  const [open, setOpen] = useState(false);

  const isFlat = meta.key === 'internet' || meta.key === 'garbage';

  return (
    <div
      className="border-2 rounded-2xl overflow-hidden transition-all"
      style={{ borderColor: entry.enabled ? meta.color : '#EAEAEA' }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: entry.enabled ? meta.bg : '#EAEAEA' }}
        onClick={() => { if (entry.enabled) setOpen(o => !o); }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: entry.enabled ? meta.color : '#EAEAEA' }}
          >
            <meta.Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#50757A]">{meta.label}</p>
            {entry.enabled && !open && (
              <p className="text-[11px] text-[#50757A]">
                {entry.billedSeparately
                  ? isFlat
                    ? entry.flatMonthlyRate
                      ? `KES ${entry.flatMonthlyRate}/month`
                      : 'Configure pricing below'
                    : entry.pricePerUnit
                      ? `KES ${entry.pricePerUnit} ${meta.unit}`
                      : 'Configure pricing below'
                  : 'Included in rent'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {entry.enabled && (
            <span className="text-[#50757A]">
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          )}
          {/* Toggle */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              const next = !entry.enabled;
              onChange({ enabled: next });
              if (next) setOpen(true);
            }}
            className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
              entry.enabled ? 'bg-[#DD6E42]' : 'bg-[#EAEAEA]'
            }`}
            aria-label={`Toggle ${meta.label}`}
          >
            <span
              className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform ${
                entry.enabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded config */}
      {entry.enabled && open && (
        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-[#EAEAEA] bg-white">
          {/* Billed separately toggle */}
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-[#50757A]">Billed separately from rent?</p>
              <p className="text-xs text-[#50757A]">
                Tenants will see this cost itemised on the listing
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange({ billedSeparately: !entry.billedSeparately })}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                entry.billedSeparately ? 'bg-[#DD6E42]' : 'bg-[#EAEAEA]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform ${
                  entry.billedSeparately ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          {entry.billedSeparately && (
            <>
              {isFlat ? (
                <div>
                  <label className={labelCls}>Flat Monthly Rate (KES)</label>
                  <input
                    type="number"
                    min="0"
                    value={entry.flatMonthlyRate}
                    onChange={e => onChange({ flatMonthlyRate: e.target.value })}
                    placeholder="e.g. 2500"
                    className={inputCls}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Price {meta.unit}</label>
                    <input
                      type="number"
                      min="0"
                      value={entry.pricePerUnit}
                      onChange={e => onChange({ pricePerUnit: e.target.value })}
                      placeholder="e.g. 85"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Est. monthly units</label>
                    <input
                      type="number"
                      min="0"
                      value={entry.estimatedMonthlyUnits}
                      onChange={e => onChange({ estimatedMonthlyUnits: e.target.value })}
                      placeholder="For tenant estimate"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Billing cycle</label>
                  <select
                    value={entry.billingCycle}
                    onChange={e => onChange({ billingCycle: e.target.value as BillingCycle })}
                    className={selectCls}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="per_reading">Per Meter Reading</option>
                    <option value="per_consumption">Per Consumption</option>
                  </select>
                </div>

                {meta.hasMeter && (
                  <div>
                    <label className={labelCls}>Meter type</label>
                    <select
                      value={entry.meterType}
                      onChange={e => onChange({ meterType: e.target.value as MeterType })}
                      className={selectCls}
                    >
                      <option value="individual">Individual per unit</option>
                      <option value="shared">Shared meter</option>
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <label className={labelCls}>Notes (optional)</label>
            <input
              value={entry.notes}
              onChange={e => onChange({ notes: e.target.value })}
              placeholder={`e.g. Water token purchased at gate`}
              className={inputCls}
              maxLength={120}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

interface UtilityPricingConfigProps {
  value: UtilitiesConfig;
  onChange: (v: UtilitiesConfig) => void;
}

export const UtilityPricingConfig: React.FC<UtilityPricingConfigProps> = ({ value, onChange }) => {
  const updateEntry = (key: UtilityKey, patch: Partial<UtilityEntry>) =>
    onChange({ ...value, [key]: { ...value[key], ...patch } });

  const enabledCount = UTILITIES.filter(u => value[u.key].enabled).length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#50757A] mb-1 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#DD6E42]" />
          Utilities &amp; Bills
        </h3>
        <p className="text-xs text-[#50757A]">
          Toggle each utility on to configure its pricing. Tenants see an itemised
          cost breakdown and estimated monthly total on the listing.
        </p>
        {enabledCount > 0 && (
          <p className="text-[11px] text-[#DD6E42] font-semibold mt-1">
            {enabledCount} utilit{enabledCount === 1 ? 'y' : 'ies'} configured
          </p>
        )}
      </div>

      <div className="space-y-3">
        {UTILITIES.map(meta => (
          <UtilityPanel
            key={meta.key}
            meta={meta}
            entry={value[meta.key]}
            onChange={patch => updateEntry(meta.key, patch)}
          />
        ))}
      </div>
    </div>
  );
};

export default UtilityPricingConfig;
