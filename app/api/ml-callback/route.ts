import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/ml-token';

/**
 * Callback OAuth do Mercado Livre
 * Este endpoint recebe o código de autorização e o troca por tokens de acesso
 *
 * Fluxo:
 * 1. Usuário é redirecionado para: https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=$APP_ID&redirect_uri=$YOUR_URL
 * 2. Após autorizar, ML redireciona para este endpoint com o código
 * 3. Este endpoint troca o código por access_token e refresh_token
 *
 * Documentação: https://developers.mercadolivre.com.br/en_us/authentication-and-authorization
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json(
        { error: 'Autorização negada pelo usuário', details: error },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Código de autorização não fornecido' },
        { status: 400 }
      );
    }

    // Troca código por tokens
    const tokenData = await exchangeCodeForToken(code);

    // IMPORTANTE: Em produção, salve o refresh_token em um banco de dados seguro
    // Aqui apenas retornamos para visualização (NÃO FAÇA ISSO EM PRODUÇÃO!)
    return NextResponse.json({
      success: true,
      message: 'Autorização concluída com sucesso!',
      important: '⚠️ SALVE O REFRESH_TOKEN abaixo em um lugar seguro (variável de ambiente ML_REFRESH_TOKEN)',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(tokenData.expires_at).toISOString(),
      instructions: [
        '1. Copie o refresh_token acima',
        '2. Adicione no arquivo .env.local: ML_REFRESH_TOKEN=<refresh_token>',
        '3. Reinicie o servidor',
        '4. Agora a sincronização ML funcionará automaticamente',
      ],
    });
  } catch (error: any) {
    console.error('❌ Erro no callback OAuth:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        hint: 'Verifique se ML_CLIENT_ID, ML_CLIENT_SECRET e ML_REDIRECT_URI estão corretos',
      },
      { status: 500 }
    );
  }
}
