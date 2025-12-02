'use client';

import { useState } from 'react';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!formData.cor) {
      alert('Informe pelo menos a cor do filamento.');
      return;
    }

    setIsSubmitting(true);
    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalComprado = filaments.reduce((sum, f) => sum + (f.qtdComprada || 0), 0);
  const totalEstoque = filaments.reduce((sum, f) => sum + (f.estoqueKg || 0), 0);

  return (
    <Card variant="elevated">
      <CardHeader
        title="Filamentos"
        subtitle="Gerencie o estoque de filamentos, cores e custos"
      />

      <CardContent>
        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Input
            label="Cor"
            value={formData.cor}
            onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
            placeholder="Ex: OFF WHITE"
          />
          <Input
            label="Material"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            placeholder="PLA, PETG, ABS..."
          />
          <Input
            label="Marca"
            value={formData.marca}
            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
            placeholder="FullJoy, 3DFila..."
          />
          <Input
            label="Preço por kg (R$)"
            type="number"
            step="0.01"
            value={formData.precoKg}
            onChange={(e) => setFormData({ ...formData, precoKg: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Quantidade comprada (kg)"
            type="number"
            step="0.01"
            value={formData.qtdComprada}
            onChange={(e) => setFormData({ ...formData, qtdComprada: e.target.value })}
            placeholder="0.000"
          />
          <Input
            label="Estoque atual (kg)"
            type="number"
            step="0.01"
            value={formData.estoqueKg}
            onChange={(e) => setFormData({ ...formData, estoqueKg: e.target.value })}
            placeholder="0.000"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Button onClick={handleAdd} isLoading={isSubmitting} disabled={isSubmitting}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Filamento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-secondary)]">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Total Cadastrado</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{filaments.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">filamentos</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-secondary)]">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Total Comprado</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{totalComprado.toFixed(3)}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">kg de filamento</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-secondary)]">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Estoque Atual</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{totalEstoque.toFixed(3)}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">kg disponível</div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cor</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Preço/kg</TableHead>
                <TableHead>Comprado</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[var(--text-muted)]">
                    Nenhum filamento cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                filaments.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-semibold text-[var(--text-primary)]">
                      {f.cor}
                    </TableCell>
                    <TableCell>{f.material || '-'}</TableCell>
                    <TableCell>{f.marca || '-'}</TableCell>
                    <TableCell>R$ {(f.precoKg || 0).toFixed(2)}</TableCell>
                    <TableCell>{(f.qtdComprada || 0).toFixed(3)} kg</TableCell>
                    <TableCell>
                      <Badge variant={f.estoqueKg && f.estoqueKg < 0.5 ? 'warning' : 'default'}>
                        {(f.estoqueKg || 0).toFixed(3)} kg
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => f.id && onDelete(f.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
