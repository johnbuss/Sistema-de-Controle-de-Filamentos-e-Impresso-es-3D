import { NextRequest, NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/ml-token';

/**
 * Endpoint de teste para diferentes variações da API de pedidos
 * Testa múltiplos endpoints para encontrar o correto
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando diferentes endpoints de pedidos...');

    const accessToken = await getValidAccessToken();

    const results: any = {
      user_id: 1470934489,
      tests: [],
    };

    // Teste 1: /orders/search?seller=me (atual)
    console.log('\n📦 Teste 1: /orders/search?seller=me');
    try {
      const response1 = await fetch(
        'https://api.mercadolibre.com/orders/search?seller=me&limit=5',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-format-new': 'true',
          },
        }
      );
      const data1 = response1.ok ? await response1.json() : await response1.json();
      results.tests.push({
        name: 'Teste 1: /orders/search?seller=me',
        status: response1.status,
        ok: response1.ok,
        response: data1,
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Teste 1: /orders/search?seller=me',
        error: error.message,
      });
    }

    // Teste 2: /orders/search?seller=USER_ID
    console.log('\n📦 Teste 2: /orders/search?seller=1470934489');
    try {
      const response2 = await fetch(
        'https://api.mercadolibre.com/orders/search?seller=1470934489&limit=5',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-format-new': 'true',
          },
        }
      );
      const data2 = response2.ok ? await response2.json() : await response2.json();
      results.tests.push({
        name: 'Teste 2: /orders/search?seller=1470934489',
        status: response2.status,
        ok: response2.ok,
        response: data2,
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Teste 2: /orders/search?seller=1470934489',
        error: error.message,
      });
    }

    // Teste 3: /orders/search sem parâmetro seller
    console.log('\n📦 Teste 3: /orders/search (sem seller)');
    try {
      const response3 = await fetch(
        'https://api.mercadolibre.com/orders/search?limit=5',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-format-new': 'true',
          },
        }
      );
      const data3 = response3.ok ? await response3.json() : await response3.json();
      results.tests.push({
        name: 'Teste 3: /orders/search (sem seller)',
        status: response3.status,
        ok: response3.ok,
        response: data3,
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Teste 3: /orders/search (sem seller)',
        error: error.message,
      });
    }

    // Teste 4: /orders/search?seller=USER_ID&tags=mshops
    console.log('\n📦 Teste 4: /orders/search?seller=1470934489&tags=mshops');
    try {
      const response4 = await fetch(
        'https://api.mercadolibre.com/orders/search?seller=1470934489&tags=mshops&limit=5',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-format-new': 'true',
          },
        }
      );
      const data4 = response4.ok ? await response4.json() : await response4.json();
      results.tests.push({
        name: 'Teste 4: /orders/search?seller=1470934489&tags=mshops',
        status: response4.status,
        ok: response4.ok,
        response: data4,
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Teste 4: /orders/search?seller=1470934489&tags=mshops',
        error: error.message,
      });
    }

    // Teste 5: /marketplace/orders/search
    console.log('\n📦 Teste 5: /marketplace/orders/search');
    try {
      const response5 = await fetch(
        'https://api.mercadolibre.com/marketplace/orders/search?seller=1470934489&limit=5',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-format-new': 'true',
          },
        }
      );
      const data5 = response5.ok ? await response5.json() : await response5.json();
      results.tests.push({
        name: 'Teste 5: /marketplace/orders/search',
        status: response5.status,
        ok: response5.ok,
        response: data5,
      });
    } catch (error: any) {
      results.tests.push({
        name: 'Teste 5: /marketplace/orders/search',
        error: error.message,
      });
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('❌ Erro ao testar endpoints:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
