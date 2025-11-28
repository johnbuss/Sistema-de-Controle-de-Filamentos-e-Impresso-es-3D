import { db } from "./firebase-admin.js";
import { getValidAccessToken } from "./ml-token.js"; // Importa a função nova

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // 1. Obtém token válido sem travar a resposta HTTP
    const accessToken = await getValidAccessToken();

    // 2. Busca pedidos (Ex: últimos 15 dias para ser mais rápido)
    const now = Date.now();
    const daysAgo = now - (15 * 24 * 60 * 60 * 1000);
    const dateFrom = new Date(daysAgo).toISOString();

    const resp = await fetch(
      `https://api.mercadolibre.com/orders/search?seller=me&order.date_created.from=${dateFrom}&sort=date_desc`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const data = await resp.json();
    const orders = data.results || [];

    const batch = db.batch();
    let count = 0;

    // 3. Mapeamento ML -> Seu Sistema
    for (const order of orders) {
      const orderRef = db.collection("orders").doc(order.id.toString());
      
      // Pega o primeiro item do pedido
      const item = order.order_items[0]?.item || {};
      const qtd = order.order_items[0]?.quantity || 1;

      // Traduz status do ML para o status do seu sistema
      let sistemaStatus = "afazer";
      if (order.status === "cancelled") sistemaStatus = "cancelado";
      if (order.shipping?.status === "delivered") sistemaStatus = "enviado"; 
      // Nota: O ML não tem status "pronto" ou "emimpressao", isso você controla internamente.

      const orderData = {
        sku: item.seller_sku || "SEM-SKU", // Importante: SKU do vendedor
        nome: item.title || "Produto sem título",
        marketplace: "mercadolivre",
        cor: "", // ML não manda a cor limpa, geralmente está na variação
        preco: order.total_amount,
        qtd: qtd,
        dataVenda: order.date_created.split("T")[0],
        dataEnvio: null, // Preencher manualmente ou calcular via shipping
        status: sistemaStatus,
        ml_original_data: order, // Guarda o original para debug se precisar
        updatedAt: Date.now()
      };

      // Usa set com merge para não apagar dados que você já editou no painel
      batch.set(orderRef, orderData, { merge: true });
      count++;
    }

    if (count > 0) await batch.commit();

    return res.status(200).json({
      success: true,
      total_synced: count
    });

  } catch (error) {
    console.error("Sync Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
