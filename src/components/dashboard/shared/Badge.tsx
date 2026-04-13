// components/dashboard/shared/Badge.tsx
import React from 'react';

const STATUS_MAP: Record<string, string> = {
  active:              'bg-emerald-50 text-emerald-700 border-emerald-200',
  available:           'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed:           'bg-blue-50   text-blue-700   border-blue-200',
  approved:            'bg-emerald-50 text-emerald-700 border-emerald-200',
  published:           'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed:           'bg-blue-50   text-blue-700   border-blue-200',
  pending:             'bg-amber-50  text-amber-700  border-amber-200',
  pending_review:      'bg-amber-50  text-amber-700  border-amber-200',
  under_review:        'bg-blue-50   text-blue-700   border-blue-200',
  in_progress:         'bg-blue-50   text-blue-700   border-blue-200',
  paid:                'bg-emerald-50 text-emerald-700 border-emerald-200',
  open:                'bg-red-50    text-red-700    border-red-200',
  rejected:            'bg-red-50    text-red-700    border-red-200',
  cancelled:           'bg-red-50    text-red-700    border-red-200',
  suspended:           'bg-red-50    text-red-700    border-red-200',
  held_for_moderation: 'bg-red-50    text-red-700    border-red-200',
  escalated:           'bg-violet-50 text-violet-700 border-violet-200',
  resolved_guest:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved_host:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft:               'bg-gray-50   text-gray-500   border-gray-200',
  inactive:            'bg-gray-50   text-gray-500   border-gray-200',
  closed:              'bg-gray-50   text-gray-500   border-gray-200',
  expired:             'bg-gray-50   text-gray-500   border-gray-200',
  off_plan:            'bg-violet-50 text-violet-700 border-violet-200',
  under_construction:  'bg-orange-50 text-orange-700 border-orange-200',
  urgent:              'bg-red-50    text-red-700    border-red-200',
};

interface BadgeProps {
  status: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${
      STATUS_MAP[status] ?? 'bg-gray-50 text-gray-500 border-gray-200'
    } ${className}`}
  >
    {(status ?? '').replace(/_/g, ' ')}
  </span>
);

export default Badge;
