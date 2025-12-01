import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  icon?: string;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    rounded-full px-3.5 py-2 text-xs border
    inline-flex items-center gap-1.5 transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    whitespace-nowrap
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-500
      border-blue-500/60 text-white
      shadow-[0_12px_25px_rgba(37,99,235,0.45)]
      hover:-translate-y-0.5
      hover:shadow-[0_14px_30px_rgba(37,99,235,0.6)]
    `,
    ghost: `
      border-white/35 text-gray-400 bg-slate-900/60
      hover:border-white/70 hover:text-gray-100 hover:bg-slate-900/90
    `,
    danger: `
      border-red-500/60 text-red-200 bg-red-500/12
      hover:bg-red-500/18
    `,
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="text-sm">{icon}</span>}
      {children}
    </button>
  );
}
