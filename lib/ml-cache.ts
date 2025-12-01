import type { MLCachedData, FirebaseOrder } from '@/types';

/**
 * Constantes de cache
 */
export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos em milliseconds
export const CACHE_WARNING_AGE_MS = 5 * 60 * 1000; // 5 minutos (metade do TTL)

/**
 * Verifica se o cache ainda é válido
 * @param cachedAt Timestamp de quando o cache foi criado
 * @param ttl Time-to-live em milliseconds (padrão: 10min)
 * @returns true se o cache ainda é válido
 */
export function isCacheValid(cachedAt: number | undefined, ttl: number = CACHE_TTL_MS): boolean {
  if (!cachedAt) return false;
  const now = Date.now();
  const age = now - cachedAt;
  return age < ttl;
}

/**
 * Calcula a idade do cache em minutos
 * @param cachedAt Timestamp de quando o cache foi criado
 * @returns Idade em minutos
 */
export function getCacheAgeMinutes(cachedAt: number | undefined): number {
  if (!cachedAt) return Infinity;
  const now = Date.now();
  const ageMs = now - cachedAt;
  return Math.floor(ageMs / (60 * 1000));
}

/**
 * Extrai dados do pedido da API do ML para cache
 * @param mlOrder Pedido retornado pela API do ML
 * @returns Dados formatados para cache
 */
export function extractMLCachedData(mlOrder: any): MLCachedData {
  const item = mlOrder.order_items?.[0]?.item || {};
  const quantity = mlOrder.order_items?.[0]?.quantity || 1;

  // Extrai cor da variação do produto
  const color = extractColor(item);

  const cachedData: MLCachedData = {
    title: item.title || 'Produto sem título',
    seller_sku: item.seller_sku || item.id || 'SEM-SKU',
    quantity: quantity,
    price: mlOrder.total_amount || 0,
    color: color || '',
    status: mlOrder.status || 'unknown',
    shipping_status: mlOrder.shipping?.status || 'unknown',
    buyer_nickname: mlOrder.buyer?.nickname || 'Desconhecido',
    date_created: mlOrder.date_created?.split('T')[0] || '',
  };

  // Adiciona date_shipped apenas se existir (evita undefined no Firestore)
  if (mlOrder.shipping?.date_first_printed) {
    cachedData.date_shipped = mlOrder.shipping.date_first_printed.split('T')[0];
  }

  return cachedData;
}

/**
 * Extrai cor da variação do produto
 * Helper function para extractMLCachedData
 */
function extractColor(item: any): string {
  try {
    const variations = item.variation_attributes || [];
    const colorVar = variations.find(
      (v: any) =>
        v.name?.toLowerCase().includes('cor') ||
        v.name?.toLowerCase().includes('color')
    );

    if (colorVar?.value_name) {
      return colorVar.value_name;
    }

    const title = item.title || '';
    const colorMatch = title.match(/cor[:\s]+([a-záàâãéèêíïóôõöúçñ\s]+)/i);
    if (colorMatch) {
      return colorMatch[1].trim();
    }

    return '';
  } catch (error) {
    console.warn('⚠️ Erro ao extrair cor:', error);
    return '';
  }
}

/**
 * Cria ou atualiza o cache de um pedido no Firebase
 * @param orderId ID do pedido
 * @param mlOrder Dados do pedido da API do ML
 * @param existingData Dados existentes no Firebase (para preservar metadados internos)
 * @returns Objeto completo para salvar no Firebase
 */
export function buildFirebaseOrder(
  orderId: string,
  mlOrder: any,
  existingData?: Partial<FirebaseOrder>
): Partial<FirebaseOrder> {
  const cachedData = extractMLCachedData(mlOrder);
  const now = Date.now();

  return {
    id: orderId,
    sku: cachedData.seller_sku,
    ml_cached_data: cachedData,
    ml_cached_at: now,
    syncedAt: now,
    createdAt: existingData?.createdAt || now,

    // Preservar metadados internos existentes
    internalStatus: existingData?.internalStatus,
    internalNotes: existingData?.internalNotes,
    priority: existingData?.priority,
    assignedPrinter: existingData?.assignedPrinter,
    printStartedAt: existingData?.printStartedAt,
    printCompletedAt: existingData?.printCompletedAt,
    filamentUsedGrams: existingData?.filamentUsedGrams,
    printCost: existingData?.printCost,
    updatedAt: existingData?.updatedAt,
    manuallyUpdated: existingData?.manuallyUpdated,
  };
}

/**
 * Gera mensagem de warning se o cache estiver velho
 * @param cachedAt Timestamp do cache
 * @returns Mensagem de warning ou undefined
 */
export function getCacheWarning(cachedAt: number | undefined): string | undefined {
  if (!cachedAt) return 'Dados nunca sincronizados';

  const ageMinutes = getCacheAgeMinutes(cachedAt);

  if (ageMinutes >= CACHE_TTL_MS / (60 * 1000)) {
    return `⚠️ Dados com mais de ${ageMinutes} minutos. Sincronize para atualizar.`;
  }

  if (ageMinutes >= CACHE_WARNING_AGE_MS / (60 * 1000)) {
    return `⚠️ Usando cache com ${ageMinutes} minutos de idade.`;
  }

  return undefined;
}
