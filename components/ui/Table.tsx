import { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export default function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="border-b border-[var(--border-primary)]">
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="divide-y divide-[var(--border-primary)]">{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = '', onClick }: TableRowProps) {
  return (
    <tr
      className={`transition-colors ${
        onClick ? 'cursor-pointer hover:bg-[var(--bg-hover)]' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  title?: string;
}

export function TableCell({ children, className = '', colSpan, title }: TableCellProps) {
  return (
    <td colSpan={colSpan} title={title} className={`px-4 py-3 text-sm text-[var(--text-secondary)] ${className}`}>
      {children}
    </td>
  );
}
