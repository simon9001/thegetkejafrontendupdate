import React, { useMemo } from 'react';
import { Droplets, Zap, Flame, Wifi, Trash2, Calculator } from 'lucide-react';
import type { UtilitiesConfig } from './UtilityPricingConfig';

interface UtilitiesBreakdownCardProps {
  utilities: UtilitiesConfig;
  /** Monthly rent — used as base for "Estimated total move-in costs" */
  monthlyRent?: number;
}

const META = [
  { key: 'water'       as const, label: 'Water',       Icon: Droplets, color: '#C0D6DF', bg: '#C0D6DF' },
  { key: 'electricity' as const, label: 'Electricity', Icon: Zap,      color: '#DD6E42', bg: '#FFFCE8' },
  { key: 'gas'         as const, label: 'Gas / LPG',   Icon: Flame,    color: '#DD6E42', bg: '#E8DAB2' },
  { key: 'internet'    as const, label: 'Internet',    Icon: Wifi,     color: '#C0D6DF', bg: '#F5F3FF' },
  { key: 'garbage'     as const, label: 'Garbage',     Icon: Trash2,   color: '#50757A', bg: '#E8DAB2' },
];

function estimateMonthly(u: UtilitiesConfig[keyof UtilitiesConfig]): number | null {
  if (!u.enabled || !u.billedSeparately) return null;
  if (u.flatMonthlyRate) return Number(u.flatMonthlyRate);
  if (u.pricePerUnit && u.estimatedMonthlyUnits) {
    return Number(u.pricePerUnit) * Number(u.estimatedMonthlyUnits);
  }
  return null;
}

export const UtilitiesBreakdownCard: React.FC<UtilitiesBreakdownCardProps> = ({
  utilities,
  monthlyRent = 0,
}) => {
  const rows = useMemo(
    () =>
      META.map(m => ({
        ...m,
        entry: utilities[m.key],
        estimate: estimateMonthly(utilities[m.key]),
      })).filter(r => r.entry.enabled),
    [utilities],
  );

  const totalEstimate = useMemo(
    () => rows.reduce((sum, r) => sum + (r.estimate ?? 0), 0),
    [rows],
  );

  if (rows.length === 0) return null;

  return (
    <div className="border border-[#EAEAEA] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#50757A] to-[#3D5A5E]">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#DD6E42]" />
          Utilities Breakdown
        </h3>
        <p className="text-[11px] text-[#C0D6DF] mt-0.5">
          Costs in addition to monthly rent
        </p>
      </div>

      <div className="p-5 space-y-3 bg-white">
        {rows.map(r => (
          <div
            key={r.key}
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: r.bg }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: r.color }}
              >
                <r.Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#50757A]">{r.label}</p>
                <p className="text-[11px] text-[#50757A]">
                  {r.entry.billedSeparately ? (
                    <>
                      {r.key === 'internet' || r.key === 'garbage'
                        ? 'Flat monthly rate'
                        : `KES ${r.entry.pricePerUnit || '—'} per unit · ${r.entry.meterType === 'individual' ? 'Individual meter' : 'Shared meter'}`}
                    </>
                  ) : (
                    'Included in rent'
                  )}
                </p>
                {r.entry.notes && (
                  <p className="text-[10px] text-[#C0D6DF] mt-0.5 italic">{r.entry.notes}</p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              {r.estimate !== null ? (
                <>
                  <p className="text-sm font-bold" style={{ color: r.color }}>
                    ~KES {r.estimate.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#C0D6DF]">/month est.</p>
                </>
              ) : r.entry.billedSeparately ? (
                <p className="text-xs text-[#C0D6DF]">Ask landlord</p>
              ) : (
                <p className="text-xs font-semibold text-[#50757A]">Included</p>
              )}
            </div>
          </div>
        ))}

        {/* Total estimator */}
        {totalEstimate > 0 && (
          <div className="mt-2 pt-3 border-t border-[#EAEAEA] flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#50757A]">Estimated monthly bills</p>
              <p className="text-[11px] text-[#50757A]">
                {monthlyRent > 0 && (
                  <>Total with rent: <span className="font-semibold text-[#50757A]">KES {(monthlyRent + totalEstimate).toLocaleString()}</span></>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-[#DD6E42]">
                KES {totalEstimate.toLocaleString()}
              </p>
              <p className="text-[10px] text-[#C0D6DF]">utilities/month</p>
            </div>
          </div>
        )}

        <p className="text-[10px] text-[#C0D6DF]">
          * Estimates based on landlord-provided unit costs and average consumption. Actual bills may vary.
        </p>
      </div>
    </div>
  );
};

export default UtilitiesBreakdownCard;
