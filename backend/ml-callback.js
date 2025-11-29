import { db } from "./firebase-admin.js";

/**
 * Callback do OAuth do Mercado Livre
 * Recebe o CODE e salva no Firestore para uso posterior
 */
export default async function handler(req, res) {
  // CORS
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Pega o CODE da query string
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: "❌ CODE não fornecido na URL",
      hint: "Você deve ser redirecionado aqui após autorizar no Mercado Livre"
    });
  }

  console.log("📥 CODE recebido do Mercado Livre");

  try {
    // Salva o CODE no Firestore IMEDIATAMENTE
    const codeRef = db.collection("integration").doc("ml-auth-code");
    
    await codeRef.set({
      code: code,
      receivedAt: new Date().toISOString(),
      timestamp: Date.now(),
      used: false
    });

    console.log("✅ CODE salvo no Firestore com sucesso");

    // Agora tenta trocar o CODE por tokens IMEDIATAMENTE
    const clientId = process.env.ML_CLIENT_ID;
    const clientSecret = process.env.ML_CLIENT_SECRET;
    const redirectUri = process.env.ML_REDIRECT_URI;

    console.log("🔄 Trocando CODE por tokens...");

    const resp = await fetch(`https://api.mercadolibre.com/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await resp.json();

    if (data.error) {
      // Salva o erro para debug
      await codeRef.update({
        error: data.error,
        errorMessage: data.message,
        used: true
      });

      return res.status(400).json({
        success: false,
        error: `❌ Erro ao trocar CODE: ${data.message || data.error}`,
        code_saved: true,
        hint: "O CODE foi salvo mas a troca falhou. Verifique as configurações."
      });
    }

    // Tokens obtidos com sucesso!
    const tokenRef = db.collection("integration").doc("ml-tokens");
    
    await tokenRef.set({
      refresh_token: data.refresh_token,
      access_token: data.access_token,
      updatedAt: new Date().toISOString(),
      lastRefresh: Date.now(),
      obtainedFrom: "callback"
    });

    // Marca o CODE como usado
    await codeRef.update({ used: true });

    console.log("✅ Tokens salvos no Firestore!");

    // Retorna página HTML de sucesso
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Autorização Concluída</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            color: white;
          }
          .container {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 500px;
          }
          h1 { font-size: 48px; margin: 0 0 20px; }
          p { font-size: 18px; line-height: 1.6; opacity: 0.9; }
          .emoji { font-size: 64px; margin-bottom: 20px; }
          .code { 
            background: rgba(0,0,0,0.2);
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            margin: 20px 0;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">🎉</div>
          <h1>Sucesso!</h1>
          <p><strong>Autorização concluída com sucesso!</strong></p>
          <p>Seus tokens do Mercado Livre foram salvos e você já pode sincronizar os pedidos.</p>
          <div class="code">Token: ${data.access_token.substring(0, 30)}...</div>
          <p style="font-size: 14px; margin-top: 30px;">Você pode fechar esta página.</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("❌ Erro no callback:", error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      hint: "Verifique os logs no Vercel"
    });
  }
}
