import { db } from "./firebase-admin.js";

// Função interna para pegar o token (usada pelo ml-sync.js)
export async function getValidAccessToken() {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const authCode = process.env.ML_AUTH_CODE;
  const redirectUri = process.env.ML_REDIRECT_URI;

  const tokenRef = db.collection("integration").doc("ml-tokens");
  const existing = await tokenRef.get();

  let refreshToken;
  let accessToken;

  // Cenário 1: Primeira vez (sem token no banco)
  if (!existing.exists) {
    if (!authCode) throw new Error("ML_AUTH_CODE não configurado para primeira troca.");
    
    const resp = await fetch(`https://api.mercadolibre.com/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        redirect_uri: redirectUri,
      }),
    });

    const data = await resp.json();
    if (data.error) throw new Error(`Erro ML Auth: ${data.error} - ${data.message}`);

    refreshToken = data.refresh_token;
    accessToken = data.access_token;

  } else {
    // Cenário 2: Refresh token (já existe no banco)
    refreshToken = existing.data().refresh_token;

    const resp = await fetch(`https://api.mercadolibre.com/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = await resp.json();
    if (data.error) throw new Error(`Erro ML Refresh: ${data.error} - ${data.message}`);

    // Se vier novo refresh token, atualiza. Se não, mantém o antigo.
    refreshToken = data.refresh_token || refreshToken;
    accessToken = data.access_token;
  }

  // Salva no banco
  await tokenRef.set({
    refresh_token: refreshToken,
    access_token: accessToken,
    updatedAt: Date.now()
  });

  return accessToken;
}

// Handler da API (para chamar via URL se necessário)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const accessToken = await getValidAccessToken();
    res.status(200).json({ success: true, accessToken: "***hidden***" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
