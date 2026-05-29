import { createClient } from '@/lib/supabase/server'
import { DisenoEditor } from '@/components/admin/DisenoEditor'
import type { StoreConfig } from '@/types'

export default async function DisenoPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const supabase = await createClient()
  const { data } = await supabase
    .from('store_config')
    .select('*')
    .eq('store_id', storeId)
    .single()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Editor de diseño</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza cada sección de tu catálogo en tiempo real
        </p>
      </div>
      <DisenoEditor storeId={storeId} initialConfig={(data ?? null) as StoreConfig | null} />
    </div>
  )
}
