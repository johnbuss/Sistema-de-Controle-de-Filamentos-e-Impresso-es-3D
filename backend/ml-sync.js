import { db } from "./firebase-admin.js";
import { getValidAccessToken } from "./ml-token.js";

/**
 * Traduz status do Mercado Livre para status do sistema
 */
function translateMLStatus(mlOrder) {
  // Status do pedido
  if (mlOrder.status === "cancelled") return "cancelado";
  
  // Status do envio (shipping)
  const shippingStatus = mlOrder.shipping?.status;
  
  if (shippingStatus === "delivered") return "enviado";
  if (shippingStatus === "shipped" || shippingStatus === "handling") return "pronto";
  if (shippingStatus === "ready_to_ship") return "pronto";
  
  // Padrão: a fazer (precisa ser impresso)
  return "afazer";
}

/**
 * Extrai cor da variação do produto (se existir)
 */
function extractColor(item) {
  try {
    // Tenta pegar das variações (attributes_values)
    const variations = item.variation_attributes || [];
    const colorVar = variations.find(v => 
      v.name?.toLowerCase().includes("cor") || 
      v.name?.toLowerCase().includes("color")
    );
    
    if (colorVar?.value_name) {
      return colorVar.value_name;
    }

    // Fallback: tenta extrair do título
    const title = item.title || "";
    const colorMatch = title.match(/cor[:\s]+([a-záàâãéèêíïóôõöúçñ\s]+)/i);
    if (colorMatch) {
      return colorMatch[1].trim();
    }

    return "";
  } catch (error) {
    console.warn("⚠️ Erro ao extrair cor:", error.message);
    return "";
  }
}

/**
 * Handler principal - Sincroniza pedidos do ML
 */
export default async function handler(req, res) {
  // CORS
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log("🔄 Iniciando sincronização com Mercado Livre...");

  try {
    // ============================================
    // 1. Obtém token válido
    // ============================================
    const accessToken = await getValidAccessToken();

    // ============================================
    // 2. Define período de busca
    // ============================================
    // Busca pedidos dos últimos 30 dias para otimizar
    const now = Date.now();
    const daysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const dateFrom = new Date(daysAgo).toISOString();

    console.log(`📅 Buscando pedidos desde: ${dateFrom.split('T')[0]}`);

    // ============================================
    // 3. Busca pedidos do Mercado Livre
    // ============================================
    const mlResponse = await fetch(
      `https://api.mercadolibre.com/orders/search?seller=me&order.date_created.from=${dateFrom}&sort=date_desc&limit=50`,
      { 
        headers: { 
          Authorization: `Bearer ${accessToken}` 
        } 
      }
    );

    if (!mlResponse.ok) {
      throw new Error(`ML API retornou status ${mlResponse.status}`);
    }

    const mlData = await mlResponse.json();
    const orders = mlData.results || [];

    console.log(`📦 ${orders.length} pedido(s) encontrado(s) no ML`);

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        total_synced: 0,
        message: "Nenhum pedido novo encontrado"
      });
    }

    // ============================================
    // 4. Processa e salva no Firestore
    // ============================================
    const batch = db.batch();
    let syncedCount = 0;
    let skippedCount = 0;

    for (const order of orders) {
      try {
        // Usa o ID do pedido do ML como ID do documento
        const orderId = order.id.toString();
        const orderRef = db.collection("orders").doc(orderId);

        // Verifica se já existe (não sobrescreve status editado manualmente)
        const existingDoc = await orderRef.get();
        
        // Se já existe E foi editado recentemente (< 1 hora), pula
        if (existingDoc.exists) {
          const existing = existingDoc.data();
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          
          if (existing.manuallyUpdated && existing.updatedAt > oneHourAgo) {
            console.log(`⏭️  Pulando pedido ${orderId} (editado manualmente)`);
            skippedCount++;
            continue;
          }
        }

        // Pega o primeiro item do pedido (ML agrupa itens)
        const item = order.order_items?.[0]?.item || {};
        const quantity = order.order_items?.[0]?.quantity || 1;

        // Extrai cor
        const cor = extractColor(item);

        // Monta dados do pedido
        const orderData = {
          // Dados do produto
          sku: item.seller_sku || item.id || "SEM-SKU",
          nome: item.title || "Produto sem título",
          cor: cor,
          
          // Dados da venda
          marketplace: "mercadolivre",
          preco: order.total_amount || 0,
          qtd: quantity,
          
          // Datas
          dataVenda: order.date_created?.split("T")[0] || null,
          dataEnvio: order.shipping?.date_first_printed?.split("T")[0] || null,
          
          // Status traduzido
          status: translateMLStatus(order),
          
          // Metadados
          ml_order_id: order.id,
          ml_status: order.status,
          ml_shipping_status: order.shipping?.status || null,
          
          // Dados originais completos (para debug)
          ml_original_data: {
            id: order.id,
            status: order.status,
            date_created: order.date_created,
            buyer: {
              id: order.buyer?.id,
              nickname: order.buyer?.nickname
            },
            shipping: order.shipping?.status
          },
          
          // Controle de sincronização
          syncedAt: Date.now(),
          syncedFrom: "ml-api"
        };

        // Usa merge: true para não apagar campos editados manualmente
        batch.set(orderRef, orderData, { merge: true });
        syncedCount++;

      } catch (error) {
        console.error(`❌ Erro ao processar pedido ${order.id}:`, error.message);
      }
    }

    // ============================================
    // 5. Commit batch no Firestore
    // ============================================
    if (syncedCount > 0) {
      await batch.commit();
      console.log(`✅ ${syncedCount} pedido(s) sincronizado(s) com sucesso`);
    }

    return res.status(200).json({
      success: true,
      total_found: orders.length,
      total_synced: syncedCount,
      total_skipped: skippedCount,
      message: `✅ Sincronização concluída: ${syncedCount} novos, ${skippedCount} pulados`
    });

  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: "Verifique se as variáveis ML_CLIENT_ID, ML_CLIENT_SECRET e FIREBASE_SERVICE_ACCOUNT estão corretas"
    });
  }
}
