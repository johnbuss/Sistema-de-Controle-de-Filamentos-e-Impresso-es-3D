import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export default function Badge({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default:
      'bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border-secondary)]',
    success:
      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    warning:
      'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    danger:
      'bg-red-500/10 text-red-400 border border-red-500/30',
    info:
      'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] border border-[var(--accent-primary-border)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
