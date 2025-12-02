'use client';

import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useMLOrders } from '@/hooks/useMLOrders';

export default function VendasSection() {
  const { orders, loading, paging, cacheWarning, refreshingCount, nextPage, prevPage, refetch } = useMLOrders({
    limit: 50,
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    if (status === 'paid' || status === 'delivered') return 'success';
    if (status === 'payment_in_process' || status === 'pending' || status === 'handling') return 'warning';
    if (status === 'cancelled' || status === 'invalid' || status === 'not_delivered') return 'danger';
    if (status === 'confirmed' || status === 'ready_to_ship') return 'info';
    return 'default';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const totalVendas = orders.reduce((sum, o) => sum + (o.ml_data.price || 0), 0);
  const vendas3D = orders.filter((o) => o.sku.toUpperCase().includes('3D'));

  return (
    <Card variant="elevated">
      <CardHeader
        title="Vendas do Mercado Livre"
        subtitle="Pedidos sincronizados automaticamente da API do ML"
        action={
          <Button variant="outline" onClick={refetch} isLoading={loading} disabled={loading}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Atualizar
          </Button>
        }
      />

      <CardContent>
        {/* Cache Warning */}
        {cacheWarning && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="text-sm font-semibold text-amber-400 mb-1">Aviso de Cache</div>
              <div className="text-xs text-[var(--text-tertiary)]">{cacheWarning}</div>
            </div>
          </div>
        )}

        {/* Refreshing Indicator */}
        {refreshingCount > 0 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <div className="text-sm text-blue-400">
              Atualizando {refreshingCount} pedido{refreshingCount > 1 ? 's' : ''} em background...
              <span className="text-xs text-[var(--text-tertiary)] ml-1">(auto-atualização a cada 10s)</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-secondary)]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-[var(--text-tertiary)]">Total de Vendas</div>
              <svg className="w-4 h-4 text-[var(--accent-success)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">R$ {totalVendas.toFixed(2)}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">valor total</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--accent-primary-soft)] border border-[var(--accent-primary-border)]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-[var(--text-tertiary)]">Vendas 3D</div>
              <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[var(--accent-primary)]">{vendas3D.length}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">pedidos</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-secondary)]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-[var(--text-tertiary)]">Total de Pedidos</div>
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{paging?.total || 0}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">sincronizados</div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-[var(--border-primary)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
              <div className="mt-4 text-sm text-[var(--text-tertiary)]">Carregando pedidos...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <div className="mt-4 text-sm text-[var(--text-tertiary)]">
                Nenhuma venda encontrada
              </div>
              <div className="mt-2 text-xs text-[var(--text-muted)]">
                Use o botão de sincronizar no topo da página
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID ML</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Envio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs text-[var(--accent-primary)]">
                        {order.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(order.ml_data.date_created)}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-[var(--text-primary)]">
                        {order.sku}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={order.ml_data.title}>
                        {order.ml_data.title}
                      </TableCell>
                      <TableCell>{order.ml_data.color || '-'}</TableCell>
                      <TableCell>{order.ml_data.buyer_nickname}</TableCell>
                      <TableCell className="text-center">{order.ml_data.quantity}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {(order.ml_data.price || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.ml_data.status)} size="sm">
                          {formatStatus(order.ml_data.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.ml_data.shipping_status)} size="sm">
                          {formatStatus(order.ml_data.shipping_status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {paging && paging.total > 0 && (
            <div className="px-4 py-3 border-t border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]">
              <div className="text-sm text-[var(--text-tertiary)]">
                Mostrando {paging.offset + 1} - {Math.min(paging.offset + paging.limit, paging.total)}{' '}
                de {paging.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={prevPage}
                  disabled={!paging.has_prev || loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={nextPage}
                  disabled={!paging.has_next || loading}
                >
                  Próxima
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
