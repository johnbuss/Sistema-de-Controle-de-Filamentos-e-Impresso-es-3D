import { db } from "./firebase-admin.js";

/**
 * Função reutilizável para obter token válido do Mercado Livre
 * Gerencia automaticamente refresh tokens e primeira autenticação
 */
export async function getValidAccessToken() {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const redirectUri = process.env.ML_REDIRECT_URI;

  // Validação de variáveis obrigatórias
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("❌ Variáveis ML obrigatórias faltando (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)");
  }

  const tokenRef = db.collection("integration").doc("ml-tokens");
  
  let tokenDoc;
  try {
    tokenDoc = await tokenRef.get();
  } catch (error) {
    throw new Error(`❌ Erro ao acessar Firestore: ${error.message}`);
  }

  let refreshToken;
  let accessToken;

  // ============================================
  // CASO 1: Primeira autenticação (usa CODE)
  // ============================================
  if (!tokenDoc.exists) {
    const authCode = process.env.ML_AUTH_CODE;
    
    if (!authCode) {
      throw new Error(
        "❌ Primeira autenticação: ML_AUTH_CODE não encontrado.\n" +
        "Obtenha em: https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirectUri
      );
    }

    console.log("🔑 Primeira autenticação: trocando CODE por tokens...");

    try {
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

      if (data.error) {
        throw new Error(`Erro ML: ${data.message || data.error}`);
      }

      refreshToken = data.refresh_token;
      accessToken = data.access_token;

      console.log("✅ Tokens obtidos com sucesso! Salvando no Firestore...");
    } catch (error) {
      throw new Error(`❌ Erro na troca de CODE: ${error.message}`);
    }
  } 
  // ============================================
  // CASO 2: Renovação usando Refresh Token
  // ============================================
  else {
    refreshToken = tokenDoc.data().refresh_token;

    if (!refreshToken) {
      throw new Error("❌ Refresh token não encontrado no Firestore. Delete o documento 'integration/ml-tokens' e tente novamente.");
    }

    console.log("🔄 Renovando access token...");

    try {
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

      if (data.error) {
        throw new Error(`Erro ML: ${data.message || data.error}`);
      }

      // ML pode retornar novo refresh_token ou reutilizar o antigo
      refreshToken = data.refresh_token || refreshToken;
      accessToken = data.access_token;

      console.log("✅ Token renovado com sucesso!");
    } catch (error) {
      throw new Error(`❌ Erro ao renovar token: ${error.message}`);
    }
  }

  // ============================================
  // Salva no Firestore
  // ============================================
  try {
    await tokenRef.set({
      refresh_token: refreshToken,
      access_token: accessToken,
      updatedAt: new Date().toISOString(),
      lastRefresh: Date.now()
    });
  } catch (error) {
    console.error("⚠️ Aviso: Não foi possível salvar tokens no Firestore:", error.message);
  }

  return accessToken;
}

/**
 * Handler da API (endpoint público)
 * Permite forçar renovação manual do token
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

  try {
    const token = await getValidAccessToken();
    
    res.status(200).json({ 
      success: true, 
      message: "✅ Token atualizado com sucesso",
      tokenPreview: token.substring(0, 20) + "..." // Mostra apenas início do token
    });
  } catch (error) {
    console.error("❌ Erro no handler ml-token:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
