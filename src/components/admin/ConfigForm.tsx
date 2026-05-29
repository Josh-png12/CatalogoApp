'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toaster'
import type { StoreConfig } from '@/types'

// ─── Image resize helper ────────────────────────────────────────────────────
async function resizeToJpeg(file: File, maxDim = 600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim }
        else { width = Math.round((width * maxDim) / height); height = maxDim }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.85)
    }
    img.onerror = reject
    img.src = url
  })
}

async function uploadBrandingImage(file: File, slot: 'logo' | 'consultant-photo'): Promise<string | null> {
  const supabase = createClient()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  try {
    const blob = await resizeToJpeg(file)
    const path = `${storeId}/branding/${slot}.jpg`
    const { error } = await supabase.storage.from('product-images').upload(path, blob, {
      contentType: 'image/jpeg', upsert: true,
    })
    if (error) return null
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
    // Cache-bust so Next.js Image sees the new file
    return `${publicUrl}?t=${Date.now()}`
  } catch { return null }
}

// ─── Textarea component ─────────────────────────────────────────────────────
function Textarea({ id, value, onChange, rows = 3, placeholder, maxLength }: {
  id: string; value: string; onChange: (v: string) => void
  rows?: number; placeholder?: string; maxLength?: number
}) {
  return (
    <div className="space-y-1">
      <textarea
        id={id} rows={rows} placeholder={placeholder} maxLength={maxLength} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
      />
      {maxLength && (
        <p className="text-xs text-muted-foreground text-right">{value.length}/{maxLength}</p>
      )}
    </div>
  )
}

// ─── Image upload field ─────────────────────────────────────────────────────
function ImageUploadField({
  label, slot, currentUrl, onUploaded,
}: {
  label: string; slot: 'logo' | 'consultant-photo'; currentUrl?: string | null; onUploaded: (url: string) => void
}) {
  const { toast } = useToast()
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadBrandingImage(file, slot)
    setUploading(false)
    if (url) { setPreview(url); onUploaded(url); toast('Imagen subida') }
    else toast('Error al subir imagen', 'error')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-input flex-shrink-0">
            <Image src={preview} alt={label} fill className="object-cover" sizes="64px" />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-2xl flex-shrink-0">
            {slot === 'logo' ? '🏪' : '👤'}
          </div>
        )}
        <div>
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => ref.current?.click()}>
            {uploading ? 'Subiendo...' : preview ? 'Cambiar' : 'Subir imagen'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">JPG/PNG, máx 5 MB</p>
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

// ─── Hero preview ──────────────────────────────────────────────────────────
function HeroPreview({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div
      className="rounded-xl p-4 text-white text-center space-y-1.5"
      style={{ background: 'linear-gradient(135deg, var(--brand-900), var(--brand-600) 60%, var(--brand-400))', minHeight: 100 }}
    >
      {badge && <p className="text-xs uppercase tracking-widest opacity-80" style={{ color: 'var(--gold-400)' }}>{badge}</p>}
      {title && <p className="font-bold text-lg leading-snug" style={{ fontFamily: 'var(--font-display)' }}>{title.replace('\\n', ' ')}</p>}
      {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
    </div>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────
interface ConfigFormProps {
  storeId: string
  initialConfig: StoreConfig | null
}

// ─── Main component ─────────────────────────────────────────────────────────
export function ConfigForm({ storeId, initialConfig }: ConfigFormProps) {
  const { toast } = useToast()
  const c = initialConfig

  // Section 1 — Identity
  const [storeName,   setStoreName]   = useState(c?.store_name ?? 'Beauty')
  const [color,       setColor]       = useState(c?.primary_color ?? '#E91E8C')
  const [logoUrl,     setLogoUrl]     = useState(c?.logo_url ?? '')
  const [whatsapp,    setWhatsapp]    = useState(c?.whatsapp_number ?? '')
  const [instagram,   setInstagram]   = useState(c?.instagram_url ?? '')
  const [facebook,    setFacebook]    = useState(c?.facebook_url ?? '')
  const [tiktok,      setTiktok]      = useState(c?.tiktok_url ?? '')

  // Section 2 — Hero
  const [heroBadge,    setHeroBadge]    = useState(c?.hero_badge_text ?? 'Catálogo Oficial')
  const [heroTitle,    setHeroTitle]    = useState(c?.hero_title ?? 'Descubre tu belleza ideal')
  const [heroSubtitle, setHeroSubtitle] = useState(c?.hero_subtitle ?? '')

  // Section 3 — Banner
  const [bannerText, setBannerText] = useState(c?.promo_banner_text ?? '')

  // Section 4 — Consultant
  const [consultantName,     setConsultantName]     = useState(c?.consultant_name ?? '')
  const [consultantPhotoUrl, setConsultantPhotoUrl] = useState(c?.consultant_photo_url ?? '')
  const [consultantBio,      setConsultantBio]      = useState(c?.consultant_bio ?? '')
  const [certifiedLabel,     setCertifiedLabel]     = useState(c?.certified_label ?? 'Consultora Certificada')
  const [feature1, setFeature1] = useState(c?.feature_1 ?? '')
  const [feature2, setFeature2] = useState(c?.feature_2 ?? '')
  const [feature3, setFeature3] = useState(c?.feature_3 ?? '')
  const [contactMsg, setContactMsg] = useState(c?.contact_message ?? '')

  // Section 5 — Checkout
  const [welcomeMsg,     setWelcomeMsg]     = useState(c?.welcome_message ?? '')
  const [checkoutFooter, setCheckoutFooter] = useState(c?.checkout_footer ?? '')
  const [footerText,     setFooterText]     = useState(c?.footer_text ?? '')

  const [saving, setSaving] = useState<number | null>(null)

  const upsert = async (fields: Record<string, unknown>, section: number) => {
    setSaving(section)
    const supabase = createClient()
    const { error } = await supabase.from('store_config').upsert(
      { store_id: storeId, ...fields },
      { onConflict: 'store_id' }
    )
    setSaving(null)
    if (error) toast('Error al guardar', 'error')
    else toast('Guardado correctamente')
  }

  return (
    <div className="space-y-6">
      {/* ── SECCIÓN 1: Identidad ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">1 · Identidad de la tienda</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="store_name">Nombre de la tienda</Label>
            <Input id="store_name" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Beauty" />
          </div>

          <div className="space-y-1.5">
            <Label>Color principal</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-9 w-16 rounded-lg border border-input cursor-pointer bg-transparent p-0.5"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#E91E8C" className="flex-1 font-mono text-sm" />
              <div className="h-9 w-9 rounded-lg border border-input flex-shrink-0" style={{ backgroundColor: color }} />
            </div>
          </div>

          <ImageUploadField
            label="Logo de la tienda"
            slot="logo"
            currentUrl={logoUrl || null}
            onUploaded={setLogoUrl}
          />

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">Número de WhatsApp *</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">+57</span>
              <Input id="whatsapp" type="tel" placeholder="3001234567" className="rounded-l-none" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">Este número recibirá los pedidos por WhatsApp.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input id="instagram" placeholder="https://instagram.com/..." value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input id="facebook" placeholder="https://facebook.com/..." value={facebook} onChange={(e) => setFacebook(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tiktok">TikTok URL</Label>
              <Input id="tiktok" placeholder="https://tiktok.com/@..." value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
            </div>
          </div>

          <Button
            className="w-full text-white"
            style={{ backgroundColor: 'var(--brand-500)' }}
            disabled={saving === 1}
            onClick={() => upsert({
              store_name: storeName, primary_color: color,
              logo_url: logoUrl || null, whatsapp_number: whatsapp,
              instagram_url: instagram || null, facebook_url: facebook || null, tiktok_url: tiktok || null,
            }, 1)}
          >
            {saving === 1 ? 'Guardando...' : 'Guardar identidad'}
          </Button>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 2: Hero ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">2 · Hero (página principal)</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="hero_badge">Badge / eyebrow text</Label>
            <Input id="hero_badge" value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} placeholder="Catálogo Oficial" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero_title">Título principal</Label>
            <Input id="hero_title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Descubre tu belleza ideal" />
            <p className="text-xs text-muted-foreground">Usa \n para dividir en dos líneas (ej: "Descubre tu\nbelleza ideal")</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero_subtitle">Subtítulo / descripción</Label>
            <Textarea id="hero_subtitle" value={heroSubtitle} onChange={setHeroSubtitle} rows={2} placeholder="Productos seleccionados por tu consultora..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Vista previa</Label>
            <HeroPreview badge={heroBadge} title={heroTitle} subtitle={heroSubtitle} />
          </div>

          <Button
            className="w-full text-white"
            style={{ backgroundColor: 'var(--brand-500)' }}
            disabled={saving === 2}
            onClick={() => upsert({
              hero_badge_text: heroBadge, hero_title: heroTitle, hero_subtitle: heroSubtitle || null,
            }, 2)}
          >
            {saving === 2 ? 'Guardando...' : 'Guardar hero'}
          </Button>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 3: Banner ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">3 · Banner promocional</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="banner_text">Texto del banner</Label>
            <Textarea
              id="banner_text"
              value={bannerText}
              onChange={setBannerText}
              rows={3}
              placeholder="✨ Envío a domicilio  •  💄 Productos originales  •  🎁 Consulta gratis"
            />
            <p className="text-xs text-muted-foreground">Separa los mensajes con •. Deja vacío para ocultar el banner.</p>
          </div>
          <Button
            className="w-full text-white"
            style={{ backgroundColor: 'var(--brand-500)' }}
            disabled={saving === 3}
            onClick={() => upsert({ promo_banner_text: bannerText || null }, 3)}
          >
            {saving === 3 ? 'Guardando...' : 'Guardar banner'}
          </Button>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 4: Consultora ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">4 · Sobre la consultora</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="consultant_name">Nombre de la consultora</Label>
            <Input id="consultant_name" value={consultantName} onChange={(e) => setConsultantName(e.target.value)} placeholder="Angélica Oñate" />
          </div>

          <ImageUploadField
            label="Foto de la consultora"
            slot="consultant-photo"
            currentUrl={consultantPhotoUrl || null}
            onUploaded={setConsultantPhotoUrl}
          />

          <div className="space-y-1.5">
            <Label htmlFor="consultant_bio">Biografía</Label>
            <Textarea id="consultant_bio" value={consultantBio} onChange={setConsultantBio} rows={4} maxLength={300} placeholder="Cuéntale a tus clientas sobre ti..." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="certified_label">Label de certificación</Label>
            <Input id="certified_label" value={certifiedLabel} onChange={(e) => setCertifiedLabel(e.target.value)} placeholder="Consultora Certificada" />
          </div>

          <div className="space-y-2">
            <Label>Características (3 líneas)</Label>
            <Input value={feature1} onChange={(e) => setFeature1(e.target.value)} placeholder="Asesoría personalizada gratuita" />
            <Input value={feature2} onChange={(e) => setFeature2(e.target.value)} placeholder="Entrega a domicilio" />
            <Input value={feature3} onChange={(e) => setFeature3(e.target.value)} placeholder="Garantía de satisfacción" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact_msg">Mensaje de contacto WhatsApp</Label>
            <Input id="contact_msg" value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} placeholder="Hola, me gustaría recibir asesoría personalizada 💄" />
          </div>

          <Button
            className="w-full text-white"
            style={{ backgroundColor: 'var(--brand-500)' }}
            disabled={saving === 4}
            onClick={() => upsert({
              consultant_name: consultantName,
              consultant_photo_url: consultantPhotoUrl || null,
              consultant_bio: consultantBio || null,
              certified_label: certifiedLabel || null,
              feature_1: feature1 || null, feature_2: feature2 || null, feature_3: feature3 || null,
              contact_message: contactMsg || null,
            }, 4)}
          >
            {saving === 4 ? 'Guardando...' : 'Guardar consultora'}
          </Button>
        </CardContent>
      </Card>

      {/* ── SECCIÓN 5: Checkout ── */}
      <Card>
        <CardHeader><CardTitle className="text-base">5 · Checkout y mensajes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="welcome_msg">Mensaje de bienvenida al chat</Label>
            <Textarea id="welcome_msg" value={welcomeMsg} onChange={setWelcomeMsg} rows={2} placeholder="¡Bienvenida a mi catálogo!" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="checkout_footer">Texto adicional en el checkout</Label>
            <Textarea id="checkout_footer" value={checkoutFooter} onChange={setCheckoutFooter} rows={2} placeholder="Recuerda que el pago es contra entrega" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="footer_text">Texto del footer</Label>
            <Input id="footer_text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="Hecho con ♥ en Riohacha · Beauty by Angélica" />
          </div>
          <Button
            className="w-full text-white"
            style={{ backgroundColor: 'var(--brand-500)' }}
            disabled={saving === 5}
            onClick={() => upsert({
              welcome_message: welcomeMsg || null,
              checkout_footer: checkoutFooter || null,
              footer_text: footerText || null,
            }, 5)}
          >
            {saving === 5 ? 'Guardando...' : 'Guardar mensajes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
