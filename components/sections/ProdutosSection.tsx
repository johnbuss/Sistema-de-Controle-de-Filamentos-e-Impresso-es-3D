'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { Product } from '@/types';

interface ProdutosSectionProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id' | 'createdAt' | 'is3d'>) => Promise<string>;
  onUpdate: (id: string, product: Partial<Product>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ProdutosSection({
  products,
  onAdd,
  onUpdate,
  onDelete,
}: ProdutosSectionProps) {
  const [formData, setFormData] = useState({
    sku: '',
    nome: '',
    corPadrao: '',
    custoMedio: '',
    estoque: '',
  });

  const handleAdd = async () => {
    if (!formData.sku || !formData.nome) {
      alert('Informe pelo menos o SKU e nome do produto.');
      return;
    }

    await onAdd({
      sku: formData.sku,
      nome: formData.nome,
      corPadrao: formData.corPadrao,
      custoMedio: parseFloat(formData.custoMedio) || 0,
      estoque: parseFloat(formData.estoque) || 0,
    });

    setFormData({
      sku: '',
      nome: '',
      corPadrao: '',
      custoMedio: '',
      estoque: '',
    });
  };

  const produtos3D = products.filter((p) => p.is3d);
  const outrosProdutos = products.filter((p) => !p.is3d);

  return (
    <Card>
      <CardHeader
        title="Produtos 3D"
        subtitle="SKUs da operação, custos médios e estoque."
        action={<Button icon="➕" onClick={handleAdd}>Adicionar</Button>}
      />

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Ex: 3D-VASO-P"
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Vaso Pequeno"
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Cor Padrão</label>
            <input
              type="text"
              value={formData.corPadrao}
              onChange={(e) => setFormData({ ...formData, corPadrao: e.target.value })}
              placeholder="Ex: Branco"
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Custo Médio (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.custoMedio}
              onChange={(e) => setFormData({ ...formData, custoMedio: e.target.value })}
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Estoque</label>
            <input
              type="number"
              step="1"
              value={formData.estoque}
              onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
              className="rounded-lg border border-white/35 bg-slate-900/90 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/70"
            />
          </div>
        </div>

        {/* Produtos 3D */}
        <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-blue-600/20 to-transparent overflow-hidden mb-3">
          <div className="px-2.5 py-2 text-xs uppercase tracking-wider text-gray-400 border-b border-white/30 flex items-center justify-between">
            <span>Produtos 3D</span>
            <span className="text-gray-500">{produtos3D.length} cadastrados</span>
          </div>
          <div className="overflow-auto max-h-48">
            {produtos3D.length === 0 ? (
              <div className="p-4 text-xs text-gray-500 text-center">
                Nenhum produto 3D cadastrado ainda
              </div>
            ) : (
              <table className="w-full text-xs border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-slate-900/96 sticky top-0 z-10">
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">SKU</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Nome</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Cor</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Custo</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Estoque</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos3D.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/90 hover:bg-slate-900/80">
                      <td className="px-2 py-1.5 whitespace-nowrap font-mono text-blue-300">{p.sku}</td>
                      <td className="px-2 py-1.5">{p.nome}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">{p.corPadrao || '-'}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">R$ {(p.custoMedio || 0).toFixed(2)}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">{p.estoque || 0}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <button
                          onClick={() => p.id && onDelete(p.id)}
                          className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Outros Produtos */}
        {outrosProdutos.length > 0 && (
          <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-slate-600/20 to-transparent overflow-hidden">
            <div className="px-2.5 py-2 text-xs uppercase tracking-wider text-gray-400 border-b border-white/30 flex items-center justify-between">
              <span>Outros Produtos</span>
              <span className="text-gray-500">{outrosProdutos.length} cadastrados</span>
            </div>
            <div className="overflow-auto max-h-32">
              <table className="w-full text-xs border-collapse min-w-[520px]">
                <thead>
                  <tr className="bg-slate-900/96 sticky top-0 z-10">
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">SKU</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Nome</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Cor</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Custo</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Estoque</th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {outrosProdutos.map((p) => (
                    <tr key={p.id} className="border-b border-slate-800/90 hover:bg-slate-900/80">
                      <td className="px-2 py-1.5 whitespace-nowrap font-mono">{p.sku}</td>
                      <td className="px-2 py-1.5">{p.nome}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">{p.corPadrao || '-'}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">R$ {(p.custoMedio || 0).toFixed(2)}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">{p.estoque || 0}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <button
                          onClick={() => p.id && onDelete(p.id)}
                          className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
