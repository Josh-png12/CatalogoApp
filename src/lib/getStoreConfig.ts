import { createClient } from '@/lib/supabase/server'
import type { StoreConfig } from '@/types'

export async function getStoreConfig(): Promise<StoreConfig | null> {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  if (!storeId) return null
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('store_config')
    .select('*')
    .eq('store_id', storeId)
    .single()
  if (error || !data) return null
  return data as unknown as StoreConfig
}
