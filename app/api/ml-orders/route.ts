import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getValidAccessToken } from '@/lib/ml-token';
import {
  isCacheValid,
  getCacheAgeMinutes,
  getCacheWarning,
  extractMLCachedData,
} from '@/lib/ml-cache';
import type { FirebaseOrder, MLOrderFull, MLOrdersResponse, MLCachedData } from '@/types';

/**
 * API para buscar pedidos paginados com cache inteligente
 *
 * Query params:
 * - offset: posição inicial (default: 0)
 * - limit: quantidade de resultados (default: 50)
 * - sku: filtrar por SKU
 *
 * Estratégia de cache:
 * - Se cache válido (<10min): usar cache
 * - Se cache expirado: buscar do ML e atualizar
 * - Se ML falhar: usar cache com warning
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skuFilter = searchParams.get('sku');

    console.log('📋 Buscando pedidos:', { offset, limit, skuFilter });

    // 1. Buscar pedidos do Firebase com filtros
    let query = db.collection('orders').orderBy('syncedAt', 'desc');

    if (skuFilter) {
      query = query.where('sku', '==', skuFilter) as any;
    }

    const snapshot = await query.limit(limit).offset(offset).get();

    if (snapshot.empty) {
      return NextResponse.json({
        orders: [],
        paging: {
          total: 0,
          limit,
          offset,
          has_next: false,
          has_prev: offset > 0,
        },
      });
    }

    // 2. Buscar total de documentos para paginação
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // 3. Processar cada pedido: sempre usar cache, rastrear pedidos stale para refresh em background
    const orders: MLOrderFull[] = [];
    const staleOrderIds: string[] = [];

    for (const doc of snapshot.docs) {
      const firebaseOrder = { id: doc.id, ...doc.data() } as FirebaseOrder;

      // Verificar se cache é válido
      const cacheIsValid = isCacheValid(firebaseOrder.ml_cached_at);

      // SEMPRE usar dados em cache (mesmo se stale)
      if (firebaseOrder.ml_cached_data) {
        const mlData = firebaseOrder.ml_cached_data;

        // Rastrear pedidos com cache expirado para refresh em background
        if (!cacheIsValid) {
          staleOrderIds.push(doc.id);
        }

        // Mesclar dados do Firebase + ML
        const fullOrder: MLOrderFull = {
          ...firebaseOrder,
          ml_data: mlData,
          is_using_cache: !cacheIsValid,
          cache_age_minutes: getCacheAgeMinutes(firebaseOrder.ml_cached_at),
        };

        orders.push(fullOrder);
      } else {
        // Sem cache: pular este pedido (será sincronizado no próximo cron)
        console.error(`❌ Pedido ${doc.id} sem cache, pulando`);
        continue;
      }
    }

    // 4. Disparar refresh em background para pedidos com cache expirado (não aguarda)
    if (staleOrderIds.length > 0) {
      console.log(`🔄 Queueing ${staleOrderIds.length} orders for background refresh`);
      queueOrdersForRefresh(staleOrderIds).catch((err) =>
        console.error('Erro ao adicionar pedidos na fila:', err)
      );
    }

    // 5. Gerar warning se existem pedidos sendo atualizados
    const cacheWarning =
      staleOrderIds.length > 0
        ? `${staleOrderIds.length} pedidos sendo atualizados em background...`
        : undefined;

    const response: MLOrdersResponse = {
      orders,
      paging: {
        total,
        limit,
        offset,
        has_next: offset + limit < total,
        has_prev: offset > 0,
      },
      cache_warning: cacheWarning,
      synced_at: orders[0]?.syncedAt,
      refreshing_count: staleOrderIds.length,
      last_updated: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Erro ao buscar pedidos:', error);

    return NextResponse.json(
      {
        error: error.message,
        hint: 'Erro ao buscar pedidos. Verifique logs do servidor.',
      },
      { status: 500 }
    );
  }
}

/**
 * Adiciona pedidos na fila para refresh em background
 * Não aguarda a conclusão - dispara e esquece
 */
async function queueOrdersForRefresh(orderIds: string[]): Promise<void> {
  const batch = db.batch();

  // Limitar a 10 pedidos por vez para não sobrecarregar a fila
  const limitedOrderIds = orderIds.slice(0, 10);

  for (const orderId of limitedOrderIds) {
    const queueRef = db.collection('refresh_queue').doc();
    batch.set(queueRef, {
      orderId,
      status: 'pending',
      priority: 1,
      createdAt: Date.now(),
      retryCount: 0,
    });
  }

  await batch.commit();

  // Disparar worker para processar fila (fire and forget)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  fetch(`${baseUrl}/api/ml-orders/process-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {
    // Ignora erro - o cron irá processar a fila eventualmente
  });
}
