'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useMLOrders } from '@/hooks/useMLOrders';
import type { OrderStatus } from '@/types';

export default function VendasSection() {
  const { orders, loading, paging, cacheWarning, nextPage, prevPage, refetch } = useMLOrders({
    limit: 50,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-500/20 text-green-300 border-green-500/40',
      confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      payment_in_process: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      payment_required: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/40',
      invalid: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const getShippingStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      handling: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      ready_to_ship: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      shipped: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      delivered: 'bg-green-500/20 text-green-300 border-green-500/40',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/40',
      not_delivered: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const totalVendas = orders.reduce((sum, o) => sum + (o.ml_data.price || 0), 0);
  const vendas3D = orders.filter((o) => o.sku.toUpperCase().includes('3D'));

  return (
    <Card>
      <CardHeader
        title="Vendas do Mercado Livre"
        subtitle="Dados em tempo real da API do ML com cache inteligente."
        action={
          <Button icon="🔄" onClick={refetch} disabled={loading}>
            {loading ? 'Carregando...' : 'Atualizar'}
          </Button>
        }
      />

      <CardContent>
        {/* Cache Warning */}
        {cacheWarning && (
          <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs">
            {cacheWarning}
          </div>
        )}

        {/* KPIs rápidos */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-xl border border-white/30 bg-gradient-to-br from-blue-600/20 to-transparent p-2">
            <div className="text-xs text-gray-400">Total de Vendas</div>
            <div className="text-lg font-semibold">R$ {totalVendas.toFixed(2)}</div>
          </div>
          <div className="rounded-xl border border-white/30 bg-gradient-to-br from-blue-600/20 to-transparent p-2">
            <div className="text-xs text-gray-400">Vendas 3D</div>
            <div className="text-lg font-semibold">{vendas3D.length}</div>
          </div>
          <div className="rounded-xl border border-white/30 bg-gradient-to-br from-blue-600/20 to-transparent p-2">
            <div className="text-xs text-gray-400">Total de Pedidos</div>
            <div className="text-lg font-semibold">{paging?.total || 0}</div>
          </div>
        </div>

        {/* Lista de vendas */}
        <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-blue-600/20 to-transparent overflow-hidden">
          <div className="px-2.5 py-2 text-xs uppercase tracking-wider text-gray-400 border-b border-white/30 flex items-center justify-between">
            <span>Pedidos (Página {Math.floor((paging?.offset || 0) / 50) + 1})</span>
            <span className="text-gray-500">{paging?.total || 0} total</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-pulse">Carregando pedidos...</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-4 text-xs text-gray-500 text-center">
              Nenhuma venda encontrada. Sincronize com o ML usando o botão no header.
            </div>
          ) : (
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-xs border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900/96 sticky top-0 z-10">
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      ID ML
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Data
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      SKU
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Produto
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Cor
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Comprador
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Qtd
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Preço
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Status
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs uppercase tracking-wide text-gray-400">
                      Envio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-800/90 hover:bg-slate-900/80"
                    >
                      <td className="px-2 py-1.5 whitespace-nowrap font-mono text-xs text-blue-400">
                        {order.id}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {order.ml_data.date_created}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap font-mono text-blue-300">
                        {order.sku}
                      </td>
                      <td className="px-2 py-1.5 max-w-[200px] truncate" title={order.ml_data.title}>
                        {order.ml_data.title}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {order.ml_data.color || '-'}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {order.ml_data.buyer_nickname}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        {order.ml_data.quantity}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        R$ {(order.ml_data.price || 0).toFixed(2)}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${getStatusColor(
                            order.ml_data.status
                          )}`}
                        >
                          {formatStatus(order.ml_data.status)}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${getShippingStatusColor(
                            order.ml_data.shipping_status
                          )}`}
                        >
                          {formatStatus(order.ml_data.shipping_status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {paging && paging.total > 0 && (
            <div className="px-2.5 py-2 border-t border-white/30 flex items-center justify-between text-xs text-gray-400">
              <div>
                Mostrando {paging.offset + 1} - {Math.min(paging.offset + paging.limit, paging.total)}{' '}
                de {paging.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevPage}
                  disabled={!paging.has_prev || loading}
                  className="px-3 py-1 rounded bg-slate-700/50 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600/50"
                >
                  ← Anterior
                </button>
                <button
                  onClick={nextPage}
                  disabled={!paging.has_next || loading}
                  className="px-3 py-1 rounded bg-slate-700/50 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600/50"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
