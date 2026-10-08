import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${hover ? 'transition-all duration-300 hover:shadow-md hover:border-slate-300' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'slate';
  className?: string;
}

const badgeColors = {
  primary: 'bg-primary-100 text-primary-700',
  accent: 'bg-accent-100 text-accent-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  slate: 'bg-slate-100 text-slate-600',
};

export function Badge({ children, color = 'slate', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColors[color]} ${className}`}>
      {children}
    </span>
  );
}
