import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de Cron Job para sincronização automática com ML
 * Configurado no vercel.json para rodar a cada 5 minutos
 *
 * Segurança: Vercel Cron adiciona header 'x-vercel-cron-id' automaticamente
 * Apenas requests com este header serão processados
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica se é uma request do Vercel Cron
    const cronId = request.headers.get('x-vercel-cron-id');

    // Em desenvolvimento, permitir requests diretas
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!cronId && !isDevelopment) {
      console.warn('⚠️ Tentativa de acesso não autorizado ao Cron endpoint');
      return NextResponse.json(
        { error: 'Unauthorized - Este endpoint só pode ser chamado pelo Vercel Cron' },
        { status: 401 }
      );
    }

    console.log('⏰ Cron Job iniciado:', {
      cronId,
      timestamp: new Date().toISOString(),
    });

    // Chama o endpoint de sincronização existente
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const syncResponse = await fetch(`${baseUrl}/api/ml-sync`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const syncData = await syncResponse.json();

    if (!syncResponse.ok) {
      console.error('❌ Erro na sincronização via Cron:', syncData);
      return NextResponse.json(
        {
          success: false,
          error: 'Falha na sincronização',
          details: syncData,
        },
        { status: 500 }
      );
    }

    console.log('✅ Cron Job concluído:', syncData);

    return NextResponse.json({
      success: true,
      cron_id: cronId,
      timestamp: new Date().toISOString(),
      sync_result: syncData,
    });
  } catch (error: any) {
    console.error('❌ Erro no Cron Job:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
