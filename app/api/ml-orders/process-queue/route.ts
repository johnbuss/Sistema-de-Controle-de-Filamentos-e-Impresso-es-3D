import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getValidAccessToken } from '@/lib/ml-token';
import { extractMLCachedData } from '@/lib/ml-cache';
import type { RefreshQueueItem } from '@/types';

const MAX_BATCH_SIZE = 5; // Process 5 orders at a time
const MAX_EXECUTION_TIME = 8000; // 8 seconds (leave 2s buffer for Vercel's 10s limit)

/**
 * Queue processor worker - processes pending refresh queue items
 *
 * Triggered by /api/ml-orders when stale caches are detected
 * Processes up to 5 orders per invocation to respect Vercel timeout
 * Implements retry logic (max 3 attempts per order)
 *
 * Flow:
 * 1. Fetch pending queue items (ordered by priority, then age)
 * 2. For each item: fetch from ML API and update Firebase
 * 3. Delete completed items, retry failed items
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('🔄 Queue processor started');

    // Clean up old queue items first (>1 hour old)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const oldItemsSnapshot = await db.collection('refresh_queue')
      .where('createdAt', '<', oneHourAgo)
      .limit(20) // Limit cleanup batch size
      .get();

    if (!oldItemsSnapshot.empty) {
      console.log(`🗑️ Cleaning up ${oldItemsSnapshot.size} old queue items`);
      const cleanupBatch = db.batch();
      oldItemsSnapshot.docs.forEach(doc => cleanupBatch.delete(doc.ref));
      await cleanupBatch.commit();
    }

    // Fetch pending queue items
    const queueSnapshot = await db.collection('refresh_queue')
      .where('status', '==', 'pending')
      .orderBy('priority', 'desc')
      .orderBy('createdAt', 'asc')
      .limit(MAX_BATCH_SIZE)
      .get();

    if (queueSnapshot.empty) {
      console.log('✅ Queue is empty');
      return NextResponse.json({
        success: true,
        message: 'Queue is empty',
        processed: 0,
        failed: 0,
        remaining: 0,
        cleaned_up: oldItemsSnapshot.size,
      });
    }

    console.log(`📋 Processing ${queueSnapshot.size} queue items`);

    const accessToken = await getValidAccessToken();
    const processed: string[] = [];
    const failed: string[] = [];

    for (const queueDoc of queueSnapshot.docs) {
      // Check if we're running out of time
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.log('⏰ Timeout approaching, stopping batch');
        break;
      }

      const queueItem = queueDoc.data() as RefreshQueueItem;
      const orderId = queueItem.orderId;

      try {
        console.log(`🔄 Processing order ${orderId}`);

        // Mark as processing
        await queueDoc.ref.update({
          status: 'processing',
          processedAt: Date.now(),
        });

        // Fetch from ML API
        const mlOrder = await fetchMLOrderById(accessToken, orderId);
        const mlData = extractMLCachedData(mlOrder);

        // Update Firebase order with fresh cache
        await db.collection('orders').doc(orderId).update({
          ml_cached_data: mlData,
          ml_cached_at: Date.now(),
          syncedAt: Date.now(),
        });

        // Delete queue item on success
        await queueDoc.ref.delete();
        processed.push(orderId);

        console.log(`✅ Order ${orderId} refreshed successfully`);

      } catch (error: any) {
        console.error(`❌ Failed to process order ${orderId}:`, error);

        // Increment retry count
        const retryCount = (queueItem.retryCount || 0) + 1;

        if (retryCount >= 3) {
          // Max retries reached, remove from queue
          console.log(`❌ Max retries reached for ${orderId}, removing from queue`);
          await queueDoc.ref.delete();
          failed.push(orderId);
        } else {
          // Update retry count and reset to pending
          console.log(`⚠️ Retry ${retryCount}/3 for ${orderId}`);
          await queueDoc.ref.update({
            status: 'pending',
            retryCount,
            lastError: error.message || 'Unknown error',
          });
        }
      }
    }

    // Count remaining items
    const remainingSnapshot = await db.collection('refresh_queue')
      .where('status', '==', 'pending')
      .count()
      .get();
    const remaining = remainingSnapshot.data().count;

    const result = {
      success: true,
      processed: processed.length,
      failed: failed.length,
      remaining,
      cleaned_up: oldItemsSnapshot.size,
      execution_time_ms: Date.now() - startTime,
    };

    console.log('🎉 Queue processor completed:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Queue processor error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      execution_time_ms: Date.now() - startTime,
    }, { status: 500 });
  }
}

/**
 * Fetches a specific order from MercadoLivre API
 */
async function fetchMLOrderById(accessToken: string, orderId: string): Promise<any> {
  const response = await fetch(`https://api.mercadolibre.com/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`ML API returned status ${response.status} for order ${orderId}`);
  }

  return response.json();
}
