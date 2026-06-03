import { createClient } from '@/lib/supabase/server'
import { CatalogClient } from '@/components/store/CatalogClient'
import { HeroSection } from '@/components/store/HeroSection'
import { PromoBanner } from '@/components/store/PromoBanner'
import { FeaturedSection } from '@/components/store/FeaturedSection'
import { ConsultantSection } from '@/components/store/ConsultantSection'
import { BenefitsSection } from '@/components/store/BenefitsSection'
import { HowItWorksSection } from '@/components/store/HowItWorksSection'
import { FullWidthBanner } from '@/components/store/FullWidthBanner'
import { TestimonialsSection } from '@/components/store/TestimonialsSection'
import { StoreQuizSection } from '@/components/store/StoreQuizSection'
import type { Product, Category, Promotion } from '@/types'

function mergePromos(products: Product[], promos: Promotion[]): Product[] {
  const now = new Date().toISOString()
  const active = promos.filter((p) => p.active && (!p.ends_at || p.ends_at > now))
  const map = new Map(active.map((p) => [p.product_id, p]))
  return products.map((product) => {
    const promo = map.get(product.id)
    if (!promo) return product
    const finalPrice =
      promo.discount_type === 'percentage'
        ? Math.round(product.price - (product.price * promo.discount_value) / 100)
        : Math.max(product.price - promo.discount_value, 0)
    return {
      ...product,
      promo_id: promo.id,
      promo_label: promo.label,
      promo_discount_type: promo.discount_type,
      promo_discount_value: promo.discount_value,
      promo_ends_at: promo.ends_at,
      final_price: finalPrice,
    }
  })
}

export default async function StorePage() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const supabase = await createClient()

  const [productsResult, categoriesResult, promosResult] = await Promise.all([
    supabase
      .from('products')
      .select('*, images:product_images(*), variants(*), category:categories(*)')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('sort_order', { foreignTable: 'categories', ascending: true })
      .order('created_at', { ascending: false })
    supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('promotions')
      .select('*')
      .eq('store_id', storeId)
      .eq('active', true),
  ])

  const rawProducts = (productsResult.data ?? []) as unknown as Product[]
  const categories  = (categoriesResult.data ?? []) as Category[]
  const promos      = (promosResult.data ?? []) as unknown as Promotion[]

  const products         = mergePromos(rawProducts, promos)
  const featuredProducts = products.filter((p) => p.featured)

  return (
    <>
      {/* 1. Hero */}
      <HeroSection featuredProducts={featuredProducts} />

      {/* 2. Promo marquee */}
      <PromoBanner />

      {/* 3. Benefits */}
      <BenefitsSection />

      {/* 4. Editorial banner */}
      <FullWidthBanner />

      {/* 5. Featured products */}
      {featuredProducts.length > 0 && (
        <FeaturedSection products={featuredProducts} />
      )}

      {/* 6. Full catalog */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-16">
        {/* Social proof stats (Part 5) */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 pb-6 border-b"
          style={{ borderColor: '#f0ede8' }}
        >
          {[
            { icon: '⭐', text: '4.9/5 calificación' },
            { icon: '👥', text: '500+ clientas' },
            { icon: '📦', text: 'Entrega rápida' },
          ].map((stat) => (
            <div key={stat.text} className="flex items-center gap-1.5">
              <span>{stat.icon}</span>
              <span className="text-gray-500" style={{ fontSize: 12 }}>{stat.text}</span>
            </div>
          ))}
        </div>
        <CatalogClient initialProducts={products} initialCategories={categories} />
      </section>

      {/* Quiz results + floating trigger */}
      <StoreQuizSection products={products} />

      {/* 7. Testimonials */}
      <TestimonialsSection />

      {/* 8. How it works */}
      <HowItWorksSection />

      {/* 9. Consultant */}
      <ConsultantSection />
    </>
  )
}
