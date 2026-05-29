import { createClient } from '@/lib/supabase/server'
import { OrdersClient } from '@/components/admin/OrdersClient'
import { getStoreConfig } from '@/lib/getStoreConfig'
import type { Order } from '@/types'

export default async function PedidosPage(props: {
  searchParams: Promise<{ status?: string }> | { status?: string }
}) {
  const params = await props.searchParams
  const statusFilter = params?.status ?? 'all'

  const supabase = await createClient()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const [config, ordersRes] = await Promise.all([
    getStoreConfig(),
    supabase
      .from('orders')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false }),
  ])

  const orders = (ordersRes.data ?? []) as unknown as Order[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
        </p>
      </div>
      <OrdersClient
        orders={orders}
        currentStatus={statusFilter}
        storeId={storeId}
        storeWhatsapp={config?.whatsapp_number ?? ''}
      />
    </div>
  )
}
