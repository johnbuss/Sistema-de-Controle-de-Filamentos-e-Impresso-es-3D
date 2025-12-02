import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * Cron job to cleanup old queue items
 *
 * Scheduled to run every hour (0 * * * *)
 * Deletes queue items older than 1 hour that are stuck in 'processing' or failed state
 *
 * This prevents the queue from growing indefinitely with stale items
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (Vercel Cron sends special header)
    const cronId = request.headers.get('x-vercel-cron-id');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!cronId && !isDevelopment) {
      console.warn('❌ Unauthorized cleanup attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🧹 Queue cleanup started', { cronId, isDevelopment });

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    // Find old queue items
    const oldItemsSnapshot = await db.collection('refresh_queue')
      .where('createdAt', '<', oneHourAgo)
      .get();

    if (oldItemsSnapshot.empty) {
      console.log('✅ No old items to cleanup');
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: 'No old items found',
      });
    }

    console.log(`🗑️ Found ${oldItemsSnapshot.size} old items to delete`);

    // Delete in batch
    const batch = db.batch();
    oldItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - Deleting ${doc.id} (orderId: ${data.orderId}, status: ${data.status})`);
      batch.delete(doc.ref);
    });

    await batch.commit();

    const result = {
      success: true,
      deleted: oldItemsSnapshot.size,
      timestamp: new Date().toISOString(),
      cron_id: cronId,
    };

    console.log('✅ Queue cleanup completed:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Queue cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
