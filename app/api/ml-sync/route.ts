import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getValidAccessToken } from '@/lib/ml-token';
import { buildFirebaseOrder } from '@/lib/ml-cache';
import type { FirebaseOrder } from '@/types';

/**
 * API de sincronização com Mercado Livre
 * Nova arquitetura: sincroniza primeiras 2 páginas (100 pedidos) e cacheia dados
 *
 * Documentação: https://developers.mercadolivre.com.br/en_us/sales-management-mshops
 * Endpoint: https://api.mercadolibre.com/orders/search
 */

interface MLOrder {
  id: number;
  status: string;
  shipping?: {
    status?: string;
    date_first_printed?: string;
  };
  order_items?: Array<{
    item?: {
      id?: string;
      title?: string;
      seller_sku?: string;
      variation_attributes?: Array<{
        name?: string;
        value_name?: string;
      }>;
    };
    quantity?: number;
  }>;
  total_amount?: number;
  date_created?: string;
  buyer?: {
    id?: number;
    nickname?: string;
  };
}

/**
 * Busca pedidos de uma página específica da API do ML
 */
async function fetchMLOrders(
  accessToken: string,
  sellerId: string,
  offset: number,
  limit: number = 50
): Promise<MLOrder[]> {
  const daysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const dateFrom = new Date(daysAgo).toISOString();

  const mlResponse = await fetch(
    `https://api.mercadolibre.com/orders/search?seller=${sellerId}&order.date_created.from=${dateFrom}&sort=date_desc&limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-format-new': 'true',
      },
    }
  );

  if (!mlResponse.ok) {
    const errorData = await mlResponse.json();
    console.error('❌ Erro da API do Mercado Livre:', errorData);
    throw new Error(
      `ML API retornou status ${mlResponse.status}: ${JSON.stringify(errorData)}`
    );
  }

  const mlData = await mlResponse.json();
  return mlData.results || [];
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Iniciando sincronização com Mercado Livre...');

    // 1. Obtém token válido (com renovação automática se necessário)
    const accessToken = await getValidAccessToken();

    // 2. Busca ID do usuário autenticado
    console.log('👤 Buscando ID do usuário...');
    const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('❌ Erro ao buscar usuário:', errorData);
      throw new Error(`Falha ao buscar ID do usuário: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const sellerId = userData.id;
    console.log(`✅ Vendedor: ${userData.nickname} (ID: ${sellerId})`);

    // 3. Busca primeiras 2 páginas (100 pedidos) para navegação fluida
    console.log('📦 Buscando primeiras 2 páginas de pedidos...');

    const page1 = await fetchMLOrders(accessToken, sellerId, 0, 50);
    const page2 = await fetchMLOrders(accessToken, sellerId, 50, 50);

    const allOrders = [...page1, ...page2];
    console.log(`📦 ${allOrders.length} pedido(s) encontrado(s) no ML`);

    if (allOrders.length === 0) {
      return NextResponse.json({
        success: true,
        total_synced: 0,
        message: 'Nenhum pedido novo encontrado',
      });
    }

    // 4. Processa e salva no Firestore com nova estrutura otimizada
    let syncedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const order of allOrders) {
      try {
        const orderId = order.id.toString();
        const orderRef = db.collection('orders').doc(orderId);

        // Busca dados existentes para preservar metadados internos
        const existingDoc = await orderRef.get();
        const existingData = existingDoc.exists ? (existingDoc.data() as Partial<FirebaseOrder>) : undefined;

        // Verifica se foi editado manualmente recentemente (não sobrescrever)
        if (existingData?.manuallyUpdated && existingData?.updatedAt) {
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          if (existingData.updatedAt > oneHourAgo) {
            console.log(`⏭️  Pulando pedido ${orderId} (editado manualmente há menos de 1 hora)`);
            skippedCount++;
            continue;
          }
        }

        // Constrói objeto otimizado para Firebase (apenas IDs + cache + metadados internos)
        const firebaseOrder = buildFirebaseOrder(orderId, order, existingData);

        await orderRef.set(firebaseOrder, { merge: true });

        if (existingDoc.exists) {
          updatedCount++;
        } else {
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar pedido ${order.id}:`, error);
      }
    }

    const totalProcessed = syncedCount + updatedCount;
    console.log(`✅ Sincronização concluída: ${syncedCount} novos, ${updatedCount} atualizados, ${skippedCount} pulados`);

    return NextResponse.json({
      success: true,
      total_found: allOrders.length,
      total_synced: syncedCount,
      total_updated: updatedCount,
      total_skipped: skippedCount,
      message: `✅ ${totalProcessed} pedidos sincronizados (${syncedCount} novos, ${updatedCount} atualizados)`,
    });
  } catch (error: any) {
    console.error('❌ Erro na sincronização:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: 'Verifique se as variáveis ML_CLIENT_ID, ML_CLIENT_SECRET e FIREBASE_SERVICE_ACCOUNT estão corretas',
      },
      { status: 500 }
    );
  }
}
