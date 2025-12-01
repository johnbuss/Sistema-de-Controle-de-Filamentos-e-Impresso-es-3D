export type Marketplace = 'mercadolivre' | 'shopee' | 'amazon' | 'magalu' | 'outro';

export type OrderStatus =
  | 'afazer'
  | 'emimpressao'
  | 'pronto'
  | 'enviado'
  | 'cancelado'
  | 'devolvido';

export type PrintStatus = 'sucesso' | 'erro' | 'erroparcial';

export type Printer =
  | 'bambu_a1_1'
  | 'bambu_a1_2'
  | 'bambu_a1_3'
  | 'bambu_x1';

export interface Filament {
  id?: string;
  cor: string;
  material: string;
  marca: string;
  precoKg: number;
  qtdComprada: number;
  estoqueKg: number;
  createdAt?: number;
}

export interface Product {
  id?: string;
  sku: string;
  nome: string;
  corPadrao?: string;
  custoMedio: number;
  estoque: number;
  is3d: boolean;
  createdAt?: number;
}

export interface Order {
  id?: string;
  sku: string;
  nome: string;
  marketplace: Marketplace;
  cor?: string;
  preco: number;
  qtd: number;
  dataVenda?: string;
  dataEnvio?: string;
  status: OrderStatus;
  createdAt?: number;

  // Mercado Livre specific
  ml_order_id?: string;
  ml_status?: string;
  ml_shipping_status?: string;
  ml_original_data?: any;
  syncedAt?: number;
  syncedFrom?: string;
  manuallyUpdated?: boolean;
  updatedAt?: number;
}

export interface Print {
  id?: string;
  nome?: string;
  impressora: Printer;
  cor: string;
  gramas: number;
  tempoMin: number;
  status: PrintStatus;
  custoEnergia: number;
  createdAt?: number;
}

export interface KPIs {
  filamentoComprado: number;
  filamentoEstoque: number;
  vendas3D: number;
  devolucoes: number;
}

export interface MLSyncResponse {
  success: boolean;
  total_found?: number;
  total_synced?: number;
  total_skipped?: number;
  message?: string;
  error?: string;
}

// ========================
// NOVA ARQUITETURA - ML API + Firebase
// ========================

/**
 * Dados cacheados da API do Mercado Livre
 * TTL: 5-10 minutos
 */
export interface MLCachedData {
  title: string;
  seller_sku: string;
  quantity: number;
  price: number;
  color: string;
  status: string;
  shipping_status: string;
  buyer_nickname: string;
  date_created: string;
  date_shipped?: string;
}

/**
 * Estrutura otimizada de pedido no Firebase
 * Armazena apenas: ID, SKU (índice), cache da ML API, e metadados internos
 */
export interface FirebaseOrder {
  id: string;                    // ID do documento = ml_order_id

  // Índice para busca rápida
  sku: string;                   // SKU do produto (para filtro)

  // Cache da API do ML (TTL: 5-10 min)
  ml_cached_data?: MLCachedData;
  ml_cached_at?: number;         // Timestamp do cache

  // Metadados internos do sistema
  internalStatus?: OrderStatus;  // Status NOSSO (afazer, emimpressao, pronto, enviado)
  internalNotes?: string;        // Notas internas
  priority?: number;             // Prioridade de impressão (1-5)
  assignedPrinter?: Printer;     // Impressora designada

  // Dados de fulfillment
  printStartedAt?: number;       // Timestamp de início de impressão
  printCompletedAt?: number;     // Timestamp de conclusão
  filamentUsedGrams?: number;    // Gramas de filamento gastas
  printCost?: number;            // Custo calculado da impressão

  // Metadados de sincronização
  syncedAt: number;              // Última sincronização com ML
  createdAt: number;             // Criação no nosso sistema
  updatedAt?: number;            // Última atualização manual
  manuallyUpdated?: boolean;     // Flag se foi editado manualmente
}

/**
 * Pedido completo mesclado (Firebase + ML API em tempo real)
 * Usado no frontend para exibição
 */
export interface MLOrderFull extends FirebaseOrder {
  // Dados da ML API (sempre atualizados ou do cache)
  ml_data: MLCachedData;

  // Indicadores de estado
  is_using_cache?: boolean;      // True se usando cache por falha da API
  cache_age_minutes?: number;    // Idade do cache em minutos
}

/**
 * Resposta paginada da API /api/ml-orders
 */
export interface MLOrdersResponse {
  orders: MLOrderFull[];
  paging: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
  };
  cache_warning?: string;        // Warning se usando cache por falha da API
  synced_at?: number;            // Última sincronização
}
