import { getStoreConfig } from '@/lib/getStoreConfig'
import { ConfigForm } from '@/components/admin/ConfigForm'

export default async function ConfiguracionPage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const config = await getStoreConfig()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Personaliza el contenido de tu tienda sin tocar código.</p>
      </div>
      <ConfigForm initialConfig={config} storeId={storeId} />
    </div>
  )
}
