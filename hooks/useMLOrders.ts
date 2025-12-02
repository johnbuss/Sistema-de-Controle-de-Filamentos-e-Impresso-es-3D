import { useState, useEffect, useCallback, useRef } from 'react';
import type { MLOrdersResponse, MLOrderFull } from '@/types';

interface UseMLOrdersParams {
  offset?: number;
  limit?: number;
  sku?: string;
  autoFetch?: boolean; // Auto-fetch on mount (default: true)
}

interface UseMLOrdersReturn {
  orders: MLOrderFull[];
  paging: {
    total: number;
    limit: number;
    offset: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  cacheWarning: string | undefined;
  refreshingCount: number; // NEW: Number of orders being refreshed in background
  refetch: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (offset: number) => void;
}

/**
 * Hook para buscar pedidos do ML com cache inteligente e paginação
 *
 * @example
 * ```tsx
 * const { orders, loading, paging, nextPage, prevPage } = useMLOrders({ limit: 50 });
 * ```
 */
export function useMLOrders({
  offset: initialOffset = 0,
  limit = 50,
  sku,
  autoFetch = true,
}: UseMLOrdersParams = {}): UseMLOrdersReturn {
  const [orders, setOrders] = useState<MLOrderFull[]>([]);
  const [paging, setPaging] = useState<UseMLOrdersReturn['paging']>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheWarning, setCacheWarning] = useState<string | undefined>(undefined);
  const [offset, setOffset] = useState(initialOffset);
  const [refreshingCount, setRefreshingCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Ref to store polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      });

      if (sku) {
        params.append('sku', sku);
      }

      const response = await fetch(`/api/ml-orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.status}`);
      }

      const data: MLOrdersResponse = await response.json();

      setOrders(data.orders);
      setPaging(data.paging);
      setCacheWarning(data.cache_warning);
      setRefreshingCount(data.refreshing_count || 0);
      setLastUpdated(data.last_updated || Date.now());
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err);
      setError(err.message || 'Erro desconhecido');
      setOrders([]);
      setPaging(null);
    } finally {
      setLoading(false);
    }
  }, [offset, limit, sku]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [fetchOrders, autoFetch]);

  // Setup auto-polling when orders are being refreshed in background
  useEffect(() => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Only poll if orders are being refreshed
    if (refreshingCount > 0) {
      console.log(`🔄 Starting auto-poll for ${refreshingCount} refreshing orders`);

      pollingIntervalRef.current = setInterval(() => {
        console.log('📡 Auto-polling for updates...');
        fetchOrders();
      }, 10000); // Poll every 10 seconds
    } else {
      console.log('✅ No orders refreshing, polling stopped');
    }

    // Cleanup on unmount or when refreshingCount changes
    return () => {
      if (pollingIntervalRef.current) {
        console.log('🛑 Cleaning up polling interval');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [refreshingCount, fetchOrders]);

  const nextPage = useCallback(() => {
    if (paging?.has_next) {
      setOffset((prev) => prev + limit);
    }
  }, [paging, limit]);

  const prevPage = useCallback(() => {
    if (paging?.has_prev) {
      setOffset((prev) => Math.max(0, prev - limit));
    }
  }, [paging, limit]);

  const goToPage = useCallback((newOffset: number) => {
    setOffset(Math.max(0, newOffset));
  }, []);

  return {
    orders,
    paging,
    loading,
    error,
    cacheWarning,
    refreshingCount,
    refetch: fetchOrders,
    nextPage,
    prevPage,
    goToPage,
  };
}
