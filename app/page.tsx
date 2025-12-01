'use client';

import { useState, useEffect } from 'react';
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
import type { Filament, Product, Print } from '@/types';

type Tab = 'cadastros' | 'vendas' | 'fila' | 'impressoes' | 'relatorios';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('cadastros');
  const [isSyncing, setIsSyncing] = useState(false);

  // State para dados do Firestore (apenas para seções que ainda não foram migradas)
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

  const handleSyncML = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch('/api/ml-sync');
      const data = await resp.json();
      alert(
        `Sincronização concluída.\nPedidos sincronizados: ${data.total_synced ?? '?'}`
      );
    } catch (err) {
      alert('Erro ao sincronizar com o Mercado Livre.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[1320px] bg-gradient-to-br from-slate-900/96 to-slate-900/98 rounded-3xl border border-white/20 shadow-[0_18px_45px_rgba(15,23,42,0.9)] flex flex-col overflow-hidden">
        <Header onSyncML={handleSyncML} isSyncing={isSyncing} />

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-[520px]">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="px-4 py-4 bg-gradient-to-br from-blue-900/50 to-slate-900">
            {activeTab === 'cadastros' && (
              <div>
                <div className="mb-2.5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Filamentos & Produtos
                    <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/60 bg-slate-900/80 text-blue-300">
                      Cadastro base
                    </span>
                  </h2>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    Cadastre filamentos com custo e estoque, e os SKUs 3D da operação.
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
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
              <div>
                <div className="mb-2.5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Vendas
                    <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/60 bg-slate-900/80 text-blue-300">
                      Mercado Livre
                    </span>
                  </h2>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    Pedidos do Mercado Livre com sincronização automática a cada 5 minutos.
                  </span>
                </div>
                <VendasSection />
              </div>
            )}

            {activeTab === 'fila' && (
              <div>
                <div className="mb-2.5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Fila de Impressão
                    <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/60 bg-slate-900/80 text-blue-300">
                      Prioridade por envio
                    </span>
                  </h2>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    Aqui entram automaticamente as vendas com status &quot;A fazer&quot;.
                  </span>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/20">
                  <p className="text-xs text-gray-400">
                    Fila de impressão será implementada em breve...
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'impressoes' && (
              <div>
                <div className="mb-2.5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Registro de Impressões
                    <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/60 bg-slate-900/80 text-blue-300">
                      Custo real
                    </span>
                  </h2>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    Registro simples de impressões com tempo, gramas e custo de energia.
                  </span>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/20">
                  <p className="text-xs text-gray-400">
                    Registro de impressões será implementado em breve...
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Total de impressões: {prints.length}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'relatorios' && (
              <div>
                <div className="mb-2.5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Relatórios & KPIs
                    <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/60 bg-slate-900/80 text-blue-300">
                      Visão geral
                    </span>
                  </h2>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    Aqui vamos concentrar KPIs de filamento gasto, estoque, devoluções e
                    lucratividade.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-blue-600/25 to-transparent p-2">
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Filamento comprado (kg)
                    </div>
                    <div className="text-lg font-semibold text-gray-100">
                      {filaments
                        .reduce((sum, f) => sum + (f.qtdComprada || 0), 0)
                        .toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Soma de todos os filamentos cadastrados
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-blue-600/25 to-transparent p-2">
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Filamento em estoque (kg)
                    </div>
                    <div className="text-lg font-semibold text-gray-100">
                      {filaments
                        .reduce((sum, f) => sum + (f.estoqueKg || 0), 0)
                        .toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Atualizado conforme impressões
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-blue-600/25 to-transparent p-2">
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Produtos cadastrados
                    </div>
                    <div className="text-lg font-semibold text-gray-100">
                      {products.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Total de SKUs no sistema
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/30 bg-gradient-to-br from-blue-600/25 to-transparent p-2">
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      Impressões registradas
                    </div>
                    <div className="text-lg font-semibold text-gray-100">
                      {prints.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Total de impressões concluídas
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
