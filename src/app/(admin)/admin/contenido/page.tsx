import { getStoreConfig } from '@/lib/getStoreConfig'
import { ContenidoForm } from '@/components/admin/ContenidoForm'

export const metadata = { title: 'Editar contenido · Admin' }

export default async function ContenidoPage() {
  const config = await getStoreConfig()

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
          ✏️ Editar contenido del sitio
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          Cambia los textos, fotos y datos de contacto que aparecen en tu catálogo.
          Los cambios se reflejan en el sitio de inmediato al guardar.
        </p>
      </div>
      <ContenidoForm initialConfig={config} />
    </div>
  )
}
