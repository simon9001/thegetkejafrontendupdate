// components/dashboard/shared/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
  sub?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon, message, sub, action, className = '',
}) => (
  <div
    className={`flex flex-col items-center justify-center h-48 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200 ${className}`}
  >
    <Icon className="w-12 h-12 opacity-20" />
    <p className="text-sm font-medium">{message}</p>
    {sub && <p className="text-xs opacity-60">{sub}</p>}
    {action}
  </div>
);

export default EmptyState;
