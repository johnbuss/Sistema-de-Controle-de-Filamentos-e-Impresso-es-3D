import { db } from "./firebase-admin.js";

// Função reutilizável para pegar o token válido
export async function getValidAccessToken() {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const authCode = process.env.ML_AUTH_CODE;
  const redirectUri = process.env.ML_REDIRECT_URI;

  const tokenRef = db.collection("integration").doc("ml-tokens");
  const existing = await tokenRef.get();

  let refreshToken;
  let accessToken;

  // Caso 1: Primeira autorização (usando o CODE)
  if (!existing.exists) {
    if (!authCode) throw new Error("ML_AUTH_CODE ausente para primeira troca.");
    
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
    if (data.error) throw new Error(`Erro Auth ML: ${data.message}`);

    refreshToken = data.refresh_token;
    accessToken = data.access_token;
  } 
  // Caso 2: Renovação (usando Refresh Token)
  else {
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
    if (data.error) throw new Error(`Erro Refresh ML: ${data.message}`);

    // Atualiza se vier novo refresh_token, senão mantém o antigo
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

// Handler da API (endpoint)
export default async function handler(req, res) {
  // CORS: Permite que seu site no GitHub acesse este backend
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await getValidAccessToken();
    res.status(200).json({ success: true, message: "Token atualizado com sucesso." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
