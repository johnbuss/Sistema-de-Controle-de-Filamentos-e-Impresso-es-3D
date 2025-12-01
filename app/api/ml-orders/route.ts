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

    // 3. Processar cada pedido: verificar cache e buscar do ML se necessário
    const accessToken = await getValidAccessToken();
    const orders: MLOrderFull[] = [];
    let usingCacheCount = 0;

    for (const doc of snapshot.docs) {
      const firebaseOrder = { id: doc.id, ...doc.data() } as FirebaseOrder;

      // Verificar se cache é válido
      const cacheIsValid = isCacheValid(firebaseOrder.ml_cached_at);

      let mlData: MLCachedData;
      let isUsingCache = false;

      if (cacheIsValid && firebaseOrder.ml_cached_data) {
        // Cache válido: usar cache
        mlData = firebaseOrder.ml_cached_data;
        isUsingCache = false; // Cache normal, não é fallback
      } else {
        // Cache expirado ou inexistente: buscar do ML
        try {
          const mlOrder = await fetchMLOrderById(accessToken, doc.id);
          mlData = extractMLCachedData(mlOrder);

          // Atualizar cache no Firebase (async, não bloqueia resposta)
          updateFirebaseCache(doc.id, mlData).catch((err) =>
            console.error(`Erro ao atualizar cache de ${doc.id}:`, err)
          );
        } catch (error) {
          console.warn(`⚠️ Falha ao buscar pedido ${doc.id} do ML, usando cache`, error);

          // Fallback para cache (mesmo que velho)
          if (firebaseOrder.ml_cached_data) {
            mlData = firebaseOrder.ml_cached_data;
            isUsingCache = true;
            usingCacheCount++;
          } else {
            // Sem cache e sem ML: pular este pedido
            console.error(`❌ Pedido ${doc.id} sem cache e ML indisponível`);
            continue;
          }
        }
      }

      // Mesclar dados do Firebase + ML
      const fullOrder: MLOrderFull = {
        ...firebaseOrder,
        ml_data: mlData,
        is_using_cache: isUsingCache,
        cache_age_minutes: getCacheAgeMinutes(firebaseOrder.ml_cached_at),
      };

      orders.push(fullOrder);
    }

    // 4. Gerar warning se muitos pedidos usando cache por falha
    const cacheWarning =
      usingCacheCount > 0
        ? getCacheWarning(Date.now() - 20 * 60 * 1000) // Warning genérico
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
 * Busca um pedido específico da API do ML
 */
async function fetchMLOrderById(accessToken: string, orderId: string): Promise<any> {
  const response = await fetch(`https://api.mercadolibre.com/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`ML API retornou status ${response.status} para pedido ${orderId}`);
  }

  return response.json();
}

/**
 * Atualiza o cache de um pedido no Firebase
 */
async function updateFirebaseCache(orderId: string, mlData: MLCachedData): Promise<void> {
  await db.collection('orders').doc(orderId).update({
    ml_cached_data: mlData,
    ml_cached_at: Date.now(),
    syncedAt: Date.now(),
  });
}
