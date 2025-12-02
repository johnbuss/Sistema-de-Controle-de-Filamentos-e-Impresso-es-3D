'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  addFilament,
  updateFilament,
  deleteFilament,
  addProduct,
  updateProduct,
  deleteProduct,
  addPrint,
  deletePrint,
} from '@/lib/firestore-service';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import FilamentosSection from '@/components/sections/FilamentosSection';
import ProdutosSection from '@/components/sections/ProdutosSection';
import VendasSection from '@/components/sections/VendasSection';
import Card from '@/components/ui/Card';
import type { Filament, Product, Print } from '@/types';

type Tab = 'cadastros' | 'vendas' | 'fila' | 'impressoes' | 'relatorios';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('cadastros');
  const [isSyncing, setIsSyncing] = useState(false);

  // State para dados do Firestore
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prints, setPrints] = useState<Print[]>([]);

  // Listeners em tempo real do Firestore
  useEffect(() => {
    const unsubFilaments = onSnapshot(collection(db, 'filaments'), (snapshot) => {
      setFilaments(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Filament))
      );
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      );
    });

    const unsubPrints = onSnapshot(collection(db, 'prints'), (snapshot) => {
      setPrints(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Print))
      );
    });

    return () => {
      unsubFilaments();
      unsubProducts();
      unsubPrints();
    };
  }, []);

  const handleSyncML = useCallback(async (silent = false) => {
    setIsSyncing(true);
    try {
      const resp = await fetch('/api/ml-sync');
      const data = await resp.json();

      // Store last sync timestamp
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastMLSync', Date.now().toString());
      }

      if (!silent) {
        alert(
          `Sincronização concluída.\nPedidos sincronizados: ${data.total_synced ?? '?'}`
        );
      } else {
        console.log('🔄 Auto-sync completed:', data.total_synced, 'orders synced');
      }
    } catch (err) {
      if (!silent) {
        alert('Erro ao sincronizar com o Mercado Livre.');
      }
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Auto-sync on mount if last sync was >5 minutes ago
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lastSync = localStorage.getItem('lastMLSync');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (!lastSync || (now - parseInt(lastSync)) > fiveMinutes) {
      console.log('🔄 Auto-triggering ML sync (>5 min since last sync)');
      // Delay to avoid blocking initial render
      setTimeout(() => {
        handleSyncML(true); // silent = true
      }, 2000);
    } else {
      const nextSyncIn = Math.ceil((fiveMinutes - (now - parseInt(lastSync))) / 1000 / 60);
      console.log(`⏰ Next auto-sync in ${nextSyncIn} minutes`);
    }
  }, [handleSyncML]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header onSyncML={handleSyncML} isSyncing={isSyncing} />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'cadastros' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Cadastros Base
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Gerencie filamentos e produtos do seu estoque de impressão 3D
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <FilamentosSection
                    filaments={filaments}
                    onAdd={addFilament}
                    onUpdate={updateFilament}
                    onDelete={deleteFilament}
                  />

                  <ProdutosSection
                    products={products}
                    onAdd={addProduct}
                    onUpdate={updateProduct}
                    onDelete={deleteProduct}
                  />
                </div>
              </div>
            )}

            {activeTab === 'vendas' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Vendas do Mercado Livre
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Acompanhe seus pedidos em tempo real com sincronização automática
                  </p>
                </div>
                <VendasSection />
              </div>
            )}

            {activeTab === 'fila' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Fila de Impressão
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Organize e priorize as impressões por data de envio
                  </p>
                </div>
                <Card variant="elevated" padding="lg">
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      Fila de Impressão
                    </h3>
                    <p className="text-sm text-[var(--text-tertiary)] max-w-md mx-auto">
                      Esta funcionalidade está em desenvolvimento. Em breve você poderá gerenciar
                      a fila de impressão com priorização automática por data de envio.
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'impressoes' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Registro de Impressões
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Registre o consumo real de filamento e custos de energia
                  </p>
                </div>
                <Card variant="elevated" padding="lg">
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-[var(--text-muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      Registro de Impressões
                    </h3>
                    <p className="text-sm text-[var(--text-tertiary)] max-w-md mx-auto mb-4">
                      Esta funcionalidade está em desenvolvimento. Em breve você poderá registrar
                      tempo, gramas e custos de cada impressão realizada.
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Total de impressões registradas: {prints.length}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'relatorios' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Relatórios e KPIs
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Visão geral do seu negócio de impressão 3D
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card variant="elevated" padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                          Filamento Comprado
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">
                          {filaments
                            .reduce((sum, f) => sum + (f.qtdComprada || 0), 0)
                            .toFixed(3)}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">kg total</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--accent-primary-soft)]">
                        <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      Soma de todos os filamentos cadastrados
                    </div>
                  </Card>

                  <Card variant="elevated" padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                          Estoque Atual
                        </div>
                        <div className="text-3xl font-bold text-[var(--accent-success)]">
                          {filaments
                            .reduce((sum, f) => sum + (f.estoqueKg || 0), 0)
                            .toFixed(3)}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">kg disponível</div>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <svg className="w-6 h-6 text-[var(--accent-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      Atualizado conforme impressões
                    </div>
                  </Card>

                  <Card variant="elevated" padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                          Produtos
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">
                          {products.length}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">SKUs cadastrados</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--accent-primary-soft)]">
                        <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      Total de SKUs no sistema
                    </div>
                  </Card>

                  <Card variant="elevated" padding="md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                          Impressões
                        </div>
                        <div className="text-3xl font-bold text-[var(--text-primary)]">
                          {prints.length}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">registradas</div>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--accent-primary-soft)]">
                        <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)]">
                      Total de impressões concluídas
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
