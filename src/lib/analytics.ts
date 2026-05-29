import { createClient } from '@/lib/supabase/client'
import type { AnalyticsEvent } from '@/types'

export async function trackEvent(
  eventType: AnalyticsEvent['event_type'],
  productId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  if (!storeId) return
  try {
    const supabase = createClient()
    await supabase.from('analytics_events').insert({
      store_id: storeId,
      event_type: eventType,
      product_id: productId ?? null,
      metadata: metadata ?? null,
    })
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[analytics] trackEvent failed:', err)
    }
  }
}
