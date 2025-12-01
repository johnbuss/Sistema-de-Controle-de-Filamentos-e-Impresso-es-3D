/**
 * Gerenciamento de tokens OAuth do Mercado Livre
 * Baseado em: https://developers.mercadolivre.com.br/en_us/authentication-and-authorization
 */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user_id: number;
  scope: string;
}

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Storage simples em memória (em produção, use banco de dados)
let tokenCache: TokenData | null = null;

/**
 * Obtém um token de acesso válido
 * Renova automaticamente se expirado
 */
export async function getValidAccessToken(): Promise<string> {
  // Se tem token em cache e ainda é válido (com margem de 5 min)
  if (tokenCache && tokenCache.expires_at > Date.now() + 5 * 60 * 1000) {
    return tokenCache.access_token;
  }

  // Se tem refresh token no cache, usa ele para renovar
  if (tokenCache?.refresh_token) {
    try {
      const newToken = await refreshAccessToken(tokenCache.refresh_token);
      return newToken;
    } catch (error) {
      console.error('Erro ao renovar token do cache:', error);
    }
  }

  // Tenta usar refresh token do ambiente
  const envRefreshToken = process.env.ML_REFRESH_TOKEN;
  if (envRefreshToken) {
    try {
      console.log('Renovando token usando ML_REFRESH_TOKEN do ambiente...');
      const newToken = await refreshAccessToken(envRefreshToken);
      return newToken;
    } catch (error) {
      console.error('Erro ao renovar token do ambiente:', error);
    }
  }

  // Fallback: pega token do ambiente (deve ser renovado manualmente após 6h)
  const envToken = process.env.ML_ACCESS_TOKEN;
  if (!envToken) {
    throw new Error(
      'ML_ACCESS_TOKEN ou ML_REFRESH_TOKEN devem estar configurados. ' +
      'Siga o guia em MERCADO_LIVRE_SETUP.md para obter as credenciais.'
    );
  }

  console.warn('⚠️ Usando ML_ACCESS_TOKEN. Este token expira em 6 horas!');
  console.warn('⚠️ Configure ML_REFRESH_TOKEN para renovação automática.');

  // Cache o token do ambiente (sem refresh token)
  tokenCache = {
    access_token: envToken,
    refresh_token: '',
    expires_at: Date.now() + 6 * 60 * 60 * 1000, // 6 horas
  };

  return envToken;
}

/**
 * Renova o access token usando o refresh token
 * Endpoint: POST https://api.mercadolibre.com/oauth/token
 */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('ML_CLIENT_ID e ML_CLIENT_SECRET devem estar configurados');
  }

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao renovar token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();

  // Atualiza cache
  tokenCache = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Obtém token inicial usando o código de autorização
 * Use isso apenas na primeira vez, depois guarde o refresh_token
 */
export async function exchangeCodeForToken(code: string): Promise<TokenData> {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const redirectUri = process.env.ML_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Variáveis ML não configuradas');
  }

  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter token: ${response.status}`);
  }

  const data: TokenResponse = await response.json();

  tokenCache = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  console.log('✅ Token obtido com sucesso!');
  console.log('⚠️  IMPORTANTE: Salve este refresh_token em um lugar seguro:');
  console.log(data.refresh_token);

  return tokenCache;
}
