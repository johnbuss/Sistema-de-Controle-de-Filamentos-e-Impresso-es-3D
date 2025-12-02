'use client';

import Badge from '@/components/ui/Badge';

type Tab = 'cadastros' | 'vendas' | 'fila' | 'impressoes' | 'relatorios';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  {
    id: 'cadastros' as Tab,
    label: 'Cadastros',
    description: 'Filamentos & Produtos',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    id: 'vendas' as Tab,
    label: 'Vendas',
    description: 'Mercado Livre',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    id: 'fila' as Tab,
    label: 'Fila',
    description: 'Impressão',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    id: 'impressoes' as Tab,
    label: 'Impressões',
    description: 'Registro',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
        />
      </svg>
    ),
  },
  {
    id: 'relatorios' as Tab,
    label: 'Relatórios',
    description: 'KPIs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-6">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full group relative flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                    : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}

              {/* Icon */}
              <div className={`flex-shrink-0 ${isActive ? 'text-white' : ''}`}>
                {item.icon}
              </div>

              {/* Text */}
              <div className="flex-1 text-left">
                <div
                  className={`text-sm font-semibold ${
                    isActive ? 'text-white' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {item.label}
                </div>
                <div
                  className={`text-xs ${
                    isActive ? 'text-white/80' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {item.description}
                </div>
              </div>

              {/* Badge for active state */}
              {isActive && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Info Card */}
      <div className="mt-6 p-4 rounded-lg bg-[var(--accent-primary-soft)] border border-[var(--accent-primary-border)]">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
              Sincronização Automática
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Os pedidos do Mercado Livre são sincronizados automaticamente a cada 5 minutos.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
