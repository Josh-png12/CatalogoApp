import type { Metadata } from 'next'
import { TopBar } from '@/components/layout/TopBar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/store/CartDrawer'
import { FloatingCartButton } from '@/components/store/FloatingCartButton'
import { StoreShell } from '@/components/store/StoreShell'
import { StoreConfigProvider } from '@/context/StoreConfigContext'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { getStoreConfig } from '@/lib/getStoreConfig'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStoreConfig()
  const storeName = config?.store_name ?? 'Beauty'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return {
    title: {
      default: config?.seo_title ?? `${storeName} — Catálogo`,
      template: `%s | ${storeName}`,
    },
    description: config?.seo_description ?? config?.hero_subtitle ?? `Catálogo de ${storeName}`,
    keywords: config?.seo_keywords ?? undefined,
    openGraph: {
      type: 'website',
      locale: 'es_CO',
      url: baseUrl,
      siteName: storeName,
      title: config?.seo_title ?? storeName,
      description: config?.seo_description ?? config?.hero_subtitle ?? undefined,
      images: config?.logo_url
        ? [{ url: config.logo_url, width: 1200, height: 630, alt: storeName }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: config?.seo_title ?? storeName,
      description: config?.seo_description ?? undefined,
    },
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const config = await getStoreConfig()
  return (
    <StoreConfigProvider config={config}>
      <div className="flex min-h-screen flex-col bg-white">
        <TopBar />
        <StoreShell />
        <main className="flex-1">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Footer />
        <ErrorBoundary><CartDrawer /></ErrorBoundary>
        <FloatingCartButton />
      </div>
    </StoreConfigProvider>
  )
}
