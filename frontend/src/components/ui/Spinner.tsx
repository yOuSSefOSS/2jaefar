import React from 'react';
import { cn } from '@/lib/utils';

export const Spinner = ({ className }: { className?: string }) => (
  <div
    className={cn('h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent', className)}
    role="status"
    aria-label="Loading"
  />
);

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger';

const badgeVariants: Record<BadgeVariant, string> = {
  default:  'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
  accent:   'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent)]/20',
  success:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger:   'bg-[var(--color-accent-pink)]/10 text-[var(--color-accent-pink)] border-[var(--color-accent-pink)]/20',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border', badgeVariants[variant], className)}>
    {children}
  </span>
);
