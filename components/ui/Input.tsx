import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            px-3 py-2 rounded-lg
            bg-[var(--surface-raised)]
            border border-[var(--border-secondary)]
            text-[var(--text-primary)]
            placeholder:text-[var(--text-muted)]
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent
            hover:border-[var(--border-accent)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--accent-danger)] focus:ring-[var(--accent-danger)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-[var(--accent-danger)]">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-xs text-[var(--text-muted)]">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
