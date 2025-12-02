import { HTMLAttributes, forwardRef, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', padding = 'md', className = '', children, ...props },
    ref
  ) => {
    const baseStyles = 'rounded-xl transition-all duration-200';

    const variants = {
      default:
        'bg-[var(--surface)] border border-[var(--border-primary)]',
      elevated:
        'bg-[var(--surface-raised)] border border-[var(--border-primary)] shadow-[var(--shadow-lg)]',
      bordered:
        'bg-[var(--surface)] border-2 border-[var(--border-secondary)]',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

// CardHeader Component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// CardContent Component
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}
