'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Filament } from '@/types';

interface FilamentosSectionProps {
  filaments: Filament[];
  onAdd: (filament: Omit<Filament, 'id' | 'createdAt'>) => Promise<string>;
  onUpdate: (id: string, filament: Partial<Filament>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function FilamentosSection({
  filaments,
  onAdd,
  onUpdate,
  onDelete,
}: FilamentosSectionProps) {
  const [formData, setFormData] = useState({
    cor: '',
    material: '',
    marca: '',
    precoKg: '',
    qtdComprada: '',
    estoqueKg: '',
  });

  const handleAdd = async () => {
    if (!formData.cor) {
      alert('Informe pelo menos a cor do filamento.');
      return;
    }

    await onAdd({
      cor: formData.cor,
      material: formData.material,
      marca: formData.marca,
      precoKg: parseFloat(formData.precoKg) || 0,
      qtdComprada: parseFloat(formData.qtdComprada) || 0,
      estoqueKg: parseFloat(formData.estoqueKg) || 0,
    });

    setFormData({
      cor: '',
      material: '',
      marca: '',
      precoKg: '',
      qtdComprada: '',
      estoqueKg: '',
    });
  };

  const totalComprado = filaments.reduce((sum, f) => sum + (f.qtdComprada || 0), 0);
  const totalEstoque = filaments.reduce((sum, f) => sum + (f.estoqueKg || 0), 0);

  return (
    <Card>
      <CardHeader
        title="Cadastro de Filamentos"
        subtitle="Cor, material, marca, custo/kg e estoque."
        action={<Button icon="➕" onClick={handleAdd}>Adicionar</Button>}
      />

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Cor</label>
            <input
              type="text"
              value={formData.cor}
              onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
              placeholder="Ex: OFF WHITE"
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Material</label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              placeholder="PLA, PETG..."
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Marca</label>
            <input
              type="text"
              value={formData.marca}
              onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              placeholder="FullJoy, 3DFila..."
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Preço por kg (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.precoKg}
              onChange={(e) => setFormData({ ...formData, precoKg: e.target.value })}
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Quantidade comprada (kg)</label>
            <input
              type="number"
              step="0.01"
              value={formData.qtdComprada}
              onChange={(e) => setFormData({ ...formData, qtdComprada: e.target.value })}
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Estoque atual (kg)</label>
            <input
              type="number"
              step="0.01"
              value={formData.estoqueKg}
              onChange={(e) => setFormData({ ...formData, estoqueKg: e.target.value })}
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-blue-600/20 to-transparent overflow-hidden">
          <div className="px-2.5 py-2 text-xs uppercase tracking-wider text-gray-400 border-b border-white/30 flex items-center justify-between">
            <span>Filamentos cadastrados</span>
            <span className="text-gray-500">
              Comprado: {totalComprado.toFixed(3)} kg • Estoque: {totalEstoque.toFixed(3)} kg
            </span>
          </div>
          <div className="overflow-auto max-h-72">
            <table className="w-full text-xs border-collapse min-w-[520px]">
              <thead>
                <tr className="bg-slate-900/96 sticky top-0 z-10">
                  <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Cor</th>
                  <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Material</th>
                  <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Marca</th>
                  <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Preço/kg</th>
                  <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Comprado</th>
                  <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Estoque</th>
                  <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filaments.map((f) => (
                  <tr key={f.id} className="border-b border-slate-800/90 hover:bg-slate-900/80">
                    <td className="px-2 py-1.5 whitespace-nowrap">{f.cor}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{f.material || ''}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{f.marca || ''}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">R$ {(f.precoKg || 0).toFixed(2)}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{(f.qtdComprada || 0).toFixed(3)} kg</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{(f.estoqueKg || 0).toFixed(3)} kg</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          onClick={() => f.id && onDelete(f.id)}
                          className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
