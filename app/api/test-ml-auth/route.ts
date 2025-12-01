import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/ml-token';

/**
 * Endpoint de teste para verificar informações do usuário autenticado
 * Útil para debug de problemas de autenticação
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando autenticação do Mercado Livre...');

    const accessToken = await getValidAccessToken();

    // Busca informações do usuário autenticado
    const userResponse = await fetch('https://api.mercadolibre.com/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao buscar informações do usuário',
          details: errorData,
        },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Token válido! Informações do usuário:',
      user: {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
        site_id: userData.site_id,
        seller_reputation: userData.seller_reputation,
        is_seller: userData.seller_reputation?.transactions?.total > 0,
      },
      full_data: userData,
    });
  } catch (error: any) {
    console.error('❌ Erro ao testar autenticação:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
