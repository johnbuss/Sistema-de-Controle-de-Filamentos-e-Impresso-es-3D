'use client';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface HeaderProps {
  onSyncML: () => void;
  isSyncing: boolean;
}

export default function Header({ onSyncML, isSyncing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[var(--surface)]/95 backdrop-blur-lg border-b border-[var(--border-primary)] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center font-bold text-xl text-white shadow-lg">
              3D
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--accent-success)] rounded-full border-2 border-[var(--surface)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              3DSync
            </h1>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              Langeloh • Controle de Impressão 3D
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Firebase Conectado
          </Badge>

          <Button
            variant="outline"
            size="md"
            onClick={onSyncML}
            isLoading={isSyncing}
            disabled={isSyncing}
          >
            {!isSyncing && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar ML'}
          </Button>
        </div>
      </div>
    </header>
  );
}
