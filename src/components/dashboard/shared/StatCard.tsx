// components/dashboard/shared/StatCard.tsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon: React.ElementType;
  accent: string;
  loading?: boolean;
  urgent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label, value, sub, trend, icon: Icon, accent, loading, urgent,
}) => (
  <div
    className={`bg-white rounded-2xl p-5 border shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow ${
      urgent && Number(value) > 0 ? 'border-red-200' : 'border-gray-100'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend !== undefined && (
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold ${
            trend >= 0 ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {trend >= 0 ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          {Math.abs(trend)}%
        </span>
      )}
      {urgent && Number(value) > 0 && (
        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          Action needed
        </span>
      )}
    </div>
    {loading ? (
      <div className="space-y-2">
        <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
      </div>
    ) : (
      <>
        <p
          className={`text-2xl font-bold tracking-tight ${
            urgent && Number(value) > 0 ? 'text-red-600' : 'text-[#222222]'
          }`}
        >
          {value}
        </p>
        <p className="text-xs text-[#6a6a6a] mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-[#6a6a6a] mt-1 font-medium">{sub}</p>}
      </>
    )}
  </div>
);

export default StatCard;
