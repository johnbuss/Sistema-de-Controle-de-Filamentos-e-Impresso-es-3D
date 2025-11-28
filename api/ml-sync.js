import { db } from "./firebase-admin.js";
import mlToken from "./ml-token.js";

export default async function handler(req, res) {
  // --- CORS (coloque aqui no topo) ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // ------------------------------------

  await mlToken(req, res); // Garantir token atualizado

  const tokenRef = await db.collection("integration").doc("ml-tokens").get();
  const accessToken = tokenRef.data().access_token;

  const now = Date.now();
  const days30 = now - (30 * 24 * 60 * 60 * 1000);

  const resp = await fetch(
    `https://api.mercadolibre.com/orders/search?seller=me&order.date_created.from=${new Date(days30).toISOString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  const data = await resp.json();
  const orders = data.results || [];

  const batch = db.batch();

  for (const order of orders) {
    const orderRef = db.collection("orders").doc(order.id.toString());
    batch.set(orderRef, order, { merge: true });
  }

  await batch.commit();

  return res.status(200).json({
    success: true,
    total: orders.length
  });
}
