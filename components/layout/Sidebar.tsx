'use client';

import { useState } from 'react';

type Tab = 'cadastros' | 'vendas' | 'fila' | 'impressoes' | 'relatorios';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'cadastros' as Tab, label: 'Filamentos & Produtos', pill: 'Base' },
  { id: 'vendas' as Tab, label: 'Vendas', pill: 'Entrada' },
  { id: 'fila' as Tab, label: 'Fila de Impressão', pill: 'Produção' },
  { id: 'impressoes' as Tab, label: 'Registro de Impressões', pill: 'Máquinas' },
  { id: 'relatorios' as Tab, label: 'Relatórios & KPIs', pill: 'Gestão' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="border-r border-white/10 px-3.5 py-4 bg-gradient-to-b from-blue-600/20 to-slate-900">
      <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 px-1">
        Navegação
      </div>
      <div className="flex flex-col gap-1 mb-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              rounded-lg px-2.5 py-2 text-sm border transition-all
              flex items-center justify-between gap-2
              ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600/25 to-slate-900/95 border-blue-500/70 text-gray-100'
                  : 'border-transparent text-gray-400 hover:border-white/20 hover:text-gray-200'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  activeTab === item.id
                    ? 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.35)]'
                    : 'bg-gray-500/65'
                }`}
              />
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-900/72 border border-white/30 text-gray-400 uppercase tracking-wide">
              {item.pill}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 p-2.5 rounded-xl border border-white/30 bg-gradient-to-br from-cyan-400/20 to-transparent text-xs text-gray-400">
        <strong className="text-gray-100 font-semibold">Lembrete:</strong> a
        integração com Mercado Livre roda no backend. Aqui você está conectado
        direto ao Firestore.
      </div>
    </aside>
  );
}
