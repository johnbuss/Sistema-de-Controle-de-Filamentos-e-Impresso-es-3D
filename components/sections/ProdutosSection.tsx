'use client';

import { useState } from 'react';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!formData.sku || !formData.nome) {
      alert('Informe pelo menos o SKU e nome do produto.');
      return;
    }

    setIsSubmitting(true);
    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const produtos3D = products.filter((p) => p.is3d);
  const outrosProdutos = products.filter((p) => !p.is3d);

  return (
    <Card variant="elevated">
      <CardHeader
        title="Produtos"
        subtitle="Gerencie SKUs, custos médios e estoque"
      />

      <CardContent>
        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Ex: 3D-VASO-P"
          />
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Vaso Pequeno"
          />
          <Input
            label="Cor Padrão"
            value={formData.corPadrao}
            onChange={(e) => setFormData({ ...formData, corPadrao: e.target.value })}
            placeholder="Ex: Branco"
          />
          <Input
            label="Custo Médio (R$)"
            type="number"
            step="0.01"
            value={formData.custoMedio}
            onChange={(e) => setFormData({ ...formData, custoMedio: e.target.value })}
            placeholder="0.00"
          />
          <Input
            label="Estoque"
            type="number"
            step="1"
            value={formData.estoque}
            onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
            placeholder="0"
          />
        </div>

        <div className="flex justify-end mb-6">
          <Button onClick={handleAdd} isLoading={isSubmitting} disabled={isSubmitting}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Produto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-secondary)]">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Total de Produtos</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{products.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">cadastrados</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--accent-primary-soft)] border border-[var(--accent-primary-border)]">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Produtos 3D</div>
            <div className="text-2xl font-bold text-[var(--accent-primary)]">{produtos3D.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">impressão 3D</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-secondary)]">
            <div className="text-xs text-[var(--text-tertiary)] mb-1">Outros Produtos</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{outrosProdutos.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">não 3D</div>
          </div>
        </div>

        {/* Produtos 3D Table */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Produtos 3D
            <Badge variant="info" size="sm">{produtos3D.length}</Badge>
          </h3>
          <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cor Padrão</TableHead>
                  <TableHead>Custo Médio</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos3D.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[var(--text-muted)]">
                      Nenhum produto 3D cadastrado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  produtos3D.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-[var(--accent-primary)] font-semibold">
                        {p.sku}
                      </TableCell>
                      <TableCell className="font-semibold text-[var(--text-primary)]">
                        {p.nome}
                      </TableCell>
                      <TableCell>{p.corPadrao || '-'}</TableCell>
                      <TableCell>R$ {(p.custoMedio || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={p.estoque && p.estoque < 5 ? 'warning' : 'default'}>
                          {p.estoque || 0} un.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => p.id && onDelete(p.id)}
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
        </div>

        {/* Outros Produtos Table */}
        {outrosProdutos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Outros Produtos
              <Badge variant="default" size="sm">{outrosProdutos.length}</Badge>
            </h3>
            <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cor Padrão</TableHead>
                    <TableHead>Custo Médio</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outrosProdutos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono font-semibold">
                        {p.sku}
                      </TableCell>
                      <TableCell className="text-[var(--text-primary)]">
                        {p.nome}
                      </TableCell>
                      <TableCell>{p.corPadrao || '-'}</TableCell>
                      <TableCell>R$ {(p.custoMedio || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {p.estoque || 0} un.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => p.id && onDelete(p.id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
