'use client';

interface HeaderProps {
  onSyncML: () => void;
  isSyncing: boolean;
}

export default function Header({ onSyncML, isSyncing }: HeaderProps) {
  return (
    <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 via-blue-700 to-slate-900 flex items-center justify-center font-extrabold text-lg text-white shadow-[0_0_18px_rgba(59,130,246,0.9)]">
          3D
        </div>
        <div>
          <h1 className="text-lg uppercase tracking-wider font-semibold text-gray-100">
            Controle 3D • Langeloh
          </h1>
          <span className="block text-xs uppercase tracking-widest text-gray-400 mt-0.5">
            Filamentos • Impressões • Vendas • KPIs
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <div className="rounded-full border border-white/20 px-3 py-1.5 text-xs uppercase tracking-widest text-gray-400 bg-slate-900/80 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.25)]" />
          Conectado ao Firebase
        </div>
        <button
          onClick={onSyncML}
          disabled={isSyncing}
          className={`
            rounded-full px-3.5 py-2 text-xs border border-white/35
            text-gray-300 bg-slate-900/60 flex items-center gap-1.5
            transition-all hover:border-white/70 hover:text-gray-100 hover:bg-slate-900/90
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className="text-sm">{isSyncing ? '⏳' : '🔄'}</span>
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Mercado Livre'}
        </button>
      </div>
    </header>
  );
}
