'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toaster'
import type { StoreConfig } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────
async function resizeToJpeg(file: File, maxDim = 800): Promise<Blob> {
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

async function uploadImage(file: File, slot: string, storeId: string): Promise<string | null> {
  const supabase = createClient()
  try {
    const blob = await resizeToJpeg(file)
    const path = `${storeId}/branding/${slot}.jpg`
    const { error } = await supabase.storage.from('product-images').upload(path, blob, {
      contentType: 'image/jpeg', upsert: true,
    })
    if (error) return null
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
    return `${publicUrl}?t=${Date.now()}`
  } catch { return null }
}

// ─── sub-components ──────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Textarea({ value, onChange, rows = 3, placeholder, maxLength }: {
  value: string; onChange: (v: string) => void
  rows?: number; placeholder?: string; maxLength?: number
}) {
  return (
    <div className="space-y-1">
      <textarea
        rows={rows} placeholder={placeholder} maxLength={maxLength} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
      />
      {maxLength && (
        <p className="text-xs text-muted-foreground text-right">{value.length}/{maxLength}</p>
      )}
    </div>
  )
}

function ImgUpload({ label, slot, storeId, currentUrl, onUploaded, shape = 'circle' }: {
  label: string; slot: string; storeId: string; currentUrl?: string | null
  onUploaded: (url: string) => void; shape?: 'circle' | 'rect'
}) {
  const { toast } = useToast()
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file, slot, storeId)
    setUploading(false)
    if (url) { setPreview(url); onUploaded(url); toast('Imagen subida') }
    else toast('Error al subir imagen', 'error')
  }

  const cls = shape === 'circle' ? 'rounded-full' : 'rounded-lg'

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className={`relative h-16 w-16 overflow-hidden border-2 border-input flex-shrink-0 ${cls}`}>
            <Image src={preview} alt={label} fill className="object-cover" sizes="64px" />
          </div>
        ) : (
          <div className={`h-16 w-16 bg-muted flex items-center justify-center text-muted-foreground text-2xl flex-shrink-0 ${cls}`}>
            {slot === 'logo' ? '🏪' : slot === 'og-image' ? '🖼' : '👤'}
          </div>
        )}
        <div className="space-y-1">
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => ref.current?.click()}>
            {uploading ? 'Subiendo...' : preview ? 'Cambiar' : 'Subir imagen'}
          </Button>
          {preview && (
            <button
              type="button"
              className="block text-xs text-destructive hover:underline"
              onClick={() => { setPreview(null); onUploaded('') }}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

function GoogleSnippet({ url, title, description }: { url: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-1 font-sans shadow-sm">
      <p className="text-xs" style={{ color: '#202124', opacity: 0.7 }}>{url || 'tu-tienda.vercel.app'}</p>
      <p className="text-base leading-snug line-clamp-1" style={{ color: '#1a0dab' }}>
        {title || 'Título de tu tienda — Cosméticos en Riohacha'}
      </p>
      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#4d5156' }}>
        {description || 'Descripción de tu tienda. Aparece en los resultados de Google.'}
      </p>
    </div>
  )
}

const COLOR_PRESETS = [
  { label: 'Rosa Beauty',     hex: '#E91E8C' },
  { label: 'Coral',          hex: '#FF6B6B' },
  { label: 'Púrpura',        hex: '#8B5CF6' },
  { label: 'Azul marino',    hex: '#1E40AF' },
  { label: 'Esmeralda',      hex: '#059669' },
  { label: 'Dorado',         hex: '#C9A84C' },
]

// ─── types ───────────────────────────────────────────────────────────────────
type TabId = 'identidad' | 'hero' | 'beneficios' | 'consultora' | 'comofunciona' | 'colores' | 'seo'
const TABS: { id: TabId; label: string }[] = [
  { id: 'identidad',    label: 'Identidad' },
  { id: 'hero',         label: 'Hero' },
  { id: 'beneficios',   label: 'Beneficios' },
  { id: 'consultora',   label: 'Consultora' },
  { id: 'comofunciona', label: 'Cómo funciona' },
  { id: 'colores',      label: 'Colores' },
  { id: 'seo',          label: 'SEO' },
]

// ─── main component ──────────────────────────────────────────────────────────
export function DisenoEditor({ storeId, initialConfig }: { storeId: string; initialConfig: StoreConfig | null }) {
  const { toast } = useToast()
  const c = initialConfig
  const [tab, setTab] = useState<TabId>('identidad')
  const [saving, setSaving] = useState(false)

  // ── Identidad ──
  const [storeName,  setStoreName]  = useState(c?.store_name ?? 'Beauty')
  const [whatsapp,   setWhatsapp]   = useState(c?.whatsapp_number ?? '')
  const [logoUrl,    setLogoUrl]    = useState(c?.logo_url ?? '')
  const [instagram,  setInstagram]  = useState(c?.instagram_url ?? '')
  const [facebook,   setFacebook]   = useState(c?.facebook_url ?? '')
  const [tiktok,     setTiktok]     = useState(c?.tiktok_url ?? '')

  // ── Hero ──
  const [heroBadge,    setHeroBadge]    = useState(c?.hero_badge_text ?? '')
  const [heroLine1,    setHeroLine1]    = useState(() => (c?.hero_title ?? 'Descubre tu\nbelleza ideal').split('\n')[0] ?? '')
  const [heroLine2,    setHeroLine2]    = useState(() => (c?.hero_title ?? 'Descubre tu\nbelleza ideal').split('\n')[1] ?? '')
  const [heroSubtitle, setHeroSubtitle] = useState(c?.hero_subtitle ?? '')
  const [bannerText,   setBannerText]   = useState(c?.promo_banner_text ?? '')
  const [stat1n, setStat1n] = useState(c?.stat_1_number ?? '150+')
  const [stat1l, setStat1l] = useState(c?.stat_1_label  ?? 'Productos')
  const [stat2n, setStat2n] = useState(c?.stat_2_number ?? 'Rápida')
  const [stat2l, setStat2l] = useState(c?.stat_2_label  ?? 'Entrega')
  const [stat3n, setStat3n] = useState(c?.stat_3_number ?? '100%')
  const [stat3l, setStat3l] = useState(c?.stat_3_label  ?? 'Original')

  // ── Beneficios ──
  const [b1t, setB1t] = useState(c?.benefit_1_title ?? '100% Originales')
  const [b1x, setB1x] = useState(c?.benefit_1_text  ?? 'Todos nuestros productos son directamente de la marca')
  const [b2t, setB2t] = useState(c?.benefit_2_title ?? 'Entrega a domicilio')
  const [b2x, setB2x] = useState(c?.benefit_2_text  ?? 'Llevamos tus productos hasta tu casa en Riohacha')
  const [b3t, setB3t] = useState(c?.benefit_3_title ?? 'Asesoría gratuita')
  const [b3x, setB3x] = useState(c?.benefit_3_text  ?? 'Te ayudamos a elegir los productos perfectos para ti')
  const [b4t, setB4t] = useState(c?.benefit_4_title ?? 'Paga al recibir')
  const [b4x, setB4x] = useState(c?.benefit_4_text  ?? 'No necesitas pagar en línea, paga cuando recibas')

  // ── Consultora ──
  const [consultantName,  setConsultantName]  = useState(c?.consultant_name ?? '')
  const [consultantPhoto, setConsultantPhoto] = useState(c?.consultant_photo_url ?? '')
  const [consultantBio,   setConsultantBio]   = useState(c?.consultant_bio ?? '')
  const [certLabel,       setCertLabel]       = useState(c?.certified_label ?? 'Consultora Certificada')
  const [feat1, setFeat1] = useState(c?.feature_1 ?? '')
  const [feat2, setFeat2] = useState(c?.feature_2 ?? '')
  const [feat3, setFeat3] = useState(c?.feature_3 ?? '')
  const [contactMsg, setContactMsg] = useState(c?.contact_message ?? '')

  // ── Cómo funciona ──
  const [s1t, setS1t] = useState(c?.how_step1_title ?? 'Explora el catálogo')
  const [s1x, setS1x] = useState(c?.how_step1_text  ?? 'Navega todos nuestros productos')
  const [s2t, setS2t] = useState(c?.how_step2_title ?? 'Arma tu carrito')
  const [s2x, setS2x] = useState(c?.how_step2_text  ?? 'Agrega los productos que quieras')
  const [s3t, setS3t] = useState(c?.how_step3_title ?? 'Pide por WhatsApp')
  const [s3x, setS3x] = useState(c?.how_step3_text  ?? 'Enviamos tu pedido completo a la consultora')

  // ── Colores ──
  const [color, setColor] = useState(c?.primary_color ?? '#E91E8C')

  // ── SEO ──
  const [seoTitle, setSeoTitle] = useState(c?.seo_title ?? '')
  const [seoDesc,  setSeoDesc]  = useState(c?.seo_description ?? '')
  const [seoKeys,  setSeoKeys]  = useState(c?.seo_keywords ?? '')
  const [keyword,  setKeyword]  = useState('')
  const [ogUrl,    setOgUrl]    = useState('')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'tu-tienda.vercel.app'

  const upsert = async (fields: Record<string, unknown>) => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('store_config').upsert(
      { store_id: storeId, ...fields },
      { onConflict: 'store_id' }
    )
    setSaving(false)
    if (error) toast('Error al guardar', 'error')
    else toast('Guardado ✓')
  }

  const addKeyword = () => {
    if (!keyword.trim()) return
    const current = seoKeys ? seoKeys.split(',').map((k) => k.trim()).filter(Boolean) : []
    if (!current.includes(keyword.trim())) {
      const next = [...current, keyword.trim()].join(', ')
      setSeoKeys(next)
    }
    setKeyword('')
  }

  const removeKeyword = (kw: string) => {
    const next = seoKeys.split(',').map((k) => k.trim()).filter((k) => k && k !== kw).join(', ')
    setSeoKeys(next)
  }

  const keywordList = seoKeys ? seoKeys.split(',').map((k) => k.trim()).filter(Boolean) : []

  return (
    <div className="flex flex-col md:flex-row gap-0 border rounded-xl overflow-hidden bg-white">
      {/* ── Tab sidebar ── */}
      <div className="flex md:flex-col overflow-x-auto md:overflow-visible border-b md:border-b-0 md:border-r bg-gray-50 md:w-44 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium text-left whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'border-b-2 md:border-b-0 md:border-l-2 border-brand text-brand bg-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-white'
            }`}
            style={{ borderColor: tab === t.id ? 'var(--brand-500)' : undefined, color: tab === t.id ? 'var(--brand-500)' : undefined }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 p-6 space-y-5 overflow-auto" style={{ maxHeight: '80vh' }}>

        {/* ══ IDENTIDAD ══ */}
        {tab === 'identidad' && (
          <>
            <h2 className="font-semibold text-base">Identidad de la tienda</h2>
            <Field label="Nombre de la tienda">
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Beauty" />
            </Field>
            <ImgUpload label="Logo" slot="logo" storeId={storeId} currentUrl={logoUrl} onUploaded={setLogoUrl} />
            <Field label="Número de WhatsApp" hint="Solo los 10 dígitos, sin +57">
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-input bg-muted text-sm text-muted-foreground">+57</span>
                <Input type="tel" placeholder="3001234567" className="rounded-l-none" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
            </Field>
            <Separator />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Redes sociales</p>
            <Field label="Instagram">
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/tu_perfil" />
            </Field>
            <Field label="Facebook">
              <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/tu_pagina" />
            </Field>
            <Field label="TikTok">
              <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="https://tiktok.com/@tu_perfil" />
            </Field>
            <Button className="w-full text-white" style={{ backgroundColor: 'var(--brand-500)' }} disabled={saving}
              onClick={() => upsert({ store_name: storeName, whatsapp_number: whatsapp, logo_url: logoUrl || null, instagram_url: instagram || null, facebook_url: facebook || null, tiktok_url: tiktok || null })}>
              {saving ? 'Guardando...' : 'Guardar identidad'}
            </Button>
          </>
        )}

        {/* ══ HERO ══ */}
        {tab === 'hero' && (
          <>
            <h2 className="font-semibold text-base">Sección Hero</h2>
            <Field label="Badge / eyebrow">
              <Input value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} placeholder="Catálogo Oficial · Beauty" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Título línea 1 (blanco)">
                <Input value={heroLine1} onChange={(e) => setHeroLine1(e.target.value)} placeholder="Descubre tu" />
              </Field>
              <Field label="Título línea 2 (rosa)">
                <Input value={heroLine2} onChange={(e) => setHeroLine2(e.target.value)} placeholder="belleza ideal" />
              </Field>
            </div>
            <Field label="Subtítulo">
              <Textarea value={heroSubtitle} onChange={setHeroSubtitle} rows={2} placeholder="Productos seleccionados por tu consultora personal..." />
            </Field>

            {/* Mini hero preview */}
            <div className="rounded-xl p-4 text-white space-y-1.5" style={{ background: 'linear-gradient(135deg, #4A0830, #9A0F61 50%, #E91E8C)' }}>
              {heroBadge && <p className="text-xs uppercase tracking-widest" style={{ color: '#C9A84C' }}>{heroBadge}</p>}
              <p className="font-bold text-lg leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {heroLine1 || 'Descubre tu'}<br />
                <span style={{ color: '#F9C2E6' }}>{heroLine2 || 'belleza ideal'}</span>
              </p>
              {heroSubtitle && <p className="text-xs opacity-70">{heroSubtitle}</p>}
            </div>

            <Separator />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estadísticas</p>
            {[
              [stat1n, setStat1n, stat1l, setStat1l],
              [stat2n, setStat2n, stat2l, setStat2l],
              [stat3n, setStat3n, stat3l, setStat3l],
            ].map(([num, setNum, lbl, setLbl], i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <Field label={`Stat ${i + 1} — Valor`}>
                  <Input value={num as string} onChange={(e) => (setNum as (v: string) => void)(e.target.value)} placeholder="150+" />
                </Field>
                <Field label="Etiqueta">
                  <Input value={lbl as string} onChange={(e) => (setLbl as (v: string) => void)(e.target.value)} placeholder="Productos" />
                </Field>
              </div>
            ))}

            <Separator />
            <Field label="Banner marquee" hint="Separa mensajes con •. Deja vacío para ocultarlo.">
              <Textarea value={bannerText} onChange={setBannerText} rows={2} placeholder="✨ Envío a domicilio  •  💄 Productos originales" />
            </Field>

            <Button className="w-full text-white" style={{ backgroundColor: 'var(--brand-500)' }} disabled={saving}
              onClick={() => upsert({
                hero_badge_text: heroBadge || null,
                hero_title: heroLine2 ? `${heroLine1}\n${heroLine2}` : heroLine1,
                hero_subtitle: heroSubtitle || null,
                promo_banner_text: bannerText || null,
                stat_1_number: stat1n, stat_1_label: stat1l,
                stat_2_number: stat2n, stat_2_label: stat2l,
                stat_3_number: stat3n, stat_3_label: stat3l,
              })}>
              {saving ? 'Guardando...' : 'Guardar hero'}
            </Button>
          </>
        )}

        {/* ══ BENEFICIOS ══ */}
        {tab === 'beneficios' && (
          <>
            <h2 className="font-semibold text-base">Sección Beneficios</h2>
            {[
              { t: b1t, setT: setB1t, x: b1x, setX: setB1x, n: 1 },
              { t: b2t, setT: setB2t, x: b2x, setX: setB2x, n: 2 },
              { t: b3t, setT: setB3t, x: b3x, setX: setB3x, n: 3 },
              { t: b4t, setT: setB4t, x: b4x, setX: setB4x, n: 4 },
            ].map(({ t, setT, x, setX, n }) => (
              <div key={n} className="border rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase">Beneficio {n}</p>
                <Field label="Título">
                  <Input value={t} onChange={(e) => setT(e.target.value)} placeholder="100% Originales" />
                </Field>
                <Field label="Descripción">
                  <Input value={x} onChange={(e) => setX(e.target.value)} placeholder="Descripción breve del beneficio" />
                </Field>
              </div>
            ))}
            <Button className="w-full text-white" style={{ backgroundColor: 'var(--brand-500)' }} disabled={saving}
              onClick={() => upsert({
                benefit_1_title: b1t, benefit_1_text: b1x,
                benefit_2_title: b2t, benefit_2_text: b2x,
                benefit_3_title: b3t, benefit_3_text: b3x,
                benefit_4_title: b4t, benefit_4_text: b4x,
              })}>
              {saving ? 'Guardando...' : 'Guardar beneficios'}
            </Button>
          </>
        )}

        {/* ══ CONSULTORA ══ */}
        {tab === 'consultora' && (
          <>
            <h2 className="font-semibold text-base">Sección Consultora</h2>
            <Field label="Nombre completo">
              <Input value={consultantName} onChange={(e) => setConsultantName(e.target.value)} placeholder="Angélica Oñate" />
            </Field>
            <ImgUpload label="Foto de la consultora" slot="consultant-photo" storeId={storeId} currentUrl={consultantPhoto} onUploaded={setConsultantPhoto} shape="rect" />
            <Field label="Biografía">
              <Textarea value={consultantBio} onChange={setConsultantBio} rows={4} maxLength={400} placeholder="Cuéntale a tus clientas sobre ti y tu experiencia..." />
            </Field>
            <Field label="Label de certificación">
              <Input value={certLabel} onChange={(e) => setCertLabel(e.target.value)} placeholder="Consultora Certificada" />
            </Field>
            <Separator />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Características (features)</p>
            <Field label="Característica 1">
              <Input value={feat1} onChange={(e) => setFeat1(e.target.value)} placeholder="Asesoría personalizada gratuita" />
            </Field>
            <Field label="Característica 2">
              <Input value={feat2} onChange={(e) => setFeat2(e.target.value)} placeholder="Entrega a domicilio en Riohacha" />
            </Field>
            <Field label="Característica 3">
              <Input value={feat3} onChange={(e) => setFeat3(e.target.value)} placeholder="Garantía de satisfacción" />
            </Field>
            <Field label="Mensaje de contacto WhatsApp" hint="Se envía al hacer clic en Contactar">
              <Textarea value={contactMsg} onChange={setContactMsg} rows={2} placeholder="Hola Angélica, me gustaría recibir asesoría personalizada 💄" />
            </Field>
            <Button className="w-full text-white" style={{ backgroundColor: 'var(--brand-500)' }} disabled={saving}
              onClick={() => upsert({
                consultant_name: consultantName, consultant_photo_url: consultantPhoto || null,
                consultant_bio: consultantBio || null, certified_label: certLabel || null,
                feature_1: feat1 || null, feature_2: feat2 || null, feature_3: feat3 || null,
                contact_message: contactMsg || null,
              })}>
              {saving ? 'Guardando...' : 'Guardar consultora'}
            </Button>
          </>
        )}

        {/* ══ CÓMO FUNCIONA ══ */}
        {tab === 'comofunciona' && (
          <>
            <h2 className="font-semibold text-base">Sección ¿Cómo funciona?</h2>
            {[
              { t: s1t, setT: setS1t, x: s1x, setX: setS1x, n: 1, icon: '🗂' },
              { t: s2t, setT: setS2t, x: s2x, setX: setS2x, n: 2, icon: '🛒' },
              { t: s3t, setT: setS3t, x: s3x, setX: setS3x, n: 3, icon: '💬' },
            ].map(({ t, setT, x, setX, n, icon }) => (
              <div key={n} className="border rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase">Paso {n} {icon}</p>
                <Field label="Título">
                  <Input value={t} onChange={(e) => setT(e.target.value)} placeholder={`Paso ${n}`} />
                </Field>
                <Field label="Descripción corta">
                  <Input value={x} onChange={(e) => setX(e.target.value)} placeholder="Descripción del paso" />
                </Field>
              </div>
            ))}
            <Button className="w-full text-white" style={{ backgroundColor: 'var(--brand-500)' }} disabled={saving}
              onClick={() => upsert({
                how_step1_title: s1t, how_step1_text: s1x,
                how_step2_title: s2t, how_step2_text: s2x,
                how_step3_title: s3t, how_step3_text: s3x,
              })}>
              {saving ? 'Guardando...' : 'Guardar pasos'}
            </Button>
          </>
        )}

        {/* ══ COLORES ══ */}
        {tab === 'colores' && (
          <>
            <h2 className="font-semibold text-base">Color principal</h2>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-14 rounded-lg border border-input cursor-pointer bg-transparent p-0.5"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#E91E8C" className="flex-1 font-mono text-sm" />
              <div className="h-10 w-10 rounded-lg border border-input flex-shrink-0" style={{ backgroundColor: color }} />
            </div>

            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2">Colores presets</p>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  onClick={() => setColor(p.hex)}
                  className="flex items-center gap-2 p-2 rounded-lg border hover:border-gray-400 transition-colors text-left"
                  style={{ borderColor: color === p.hex ? p.hex : undefined }}
                >
                  <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: p.hex }} />
                  <span className="text-xs text-muted-foreground">{p.label}</span>
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-xs text-muted-foreground">Vista previa</p>
              <button className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: color }}>
                Ver catálogo
              </button>
              <span className="inline-block text-xs font-medium rounded-full px-3 py-1 ml-2" style={{ background: `${color}20`, color }}>
                ✓ Consultora Certificada
              </span>
              <div className="h-2 rounded-full w-32" style={{ backgroundColor: color }} />
            </div>

            <Button className="w-full text-white" style={{ backgroundColor: 'var(--brand-500)' }} disabled={saving}
              onClick={() => upsert({ primary_color: color })}>
              {saving ? 'Guardando...' : 'Guardar color'}
            </Button>
          </>
        )}

        {/* ══ SEO ══ */}
        {tab === 'seo' && (
          <>
            <h2 className="font-semibold text-base">SEO de la tienda</h2>

            {/* Google snippet live preview */}
            <GoogleSnippet
              url={appUrl}
              title={seoTitle || `${storeName} — Catálogo`}
              description={seoDesc || `Catálogo de cosméticos Mary Kay con entrega a domicilio en Riohacha. Asesoría personalizada gratuita.`}
            />

            <Field label="Título de la página (Google)" hint={`${seoTitle.length}/60 caracteres`}>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`${storeName} — Cosméticos en Riohacha`}
                maxLength={60}
              />
            </Field>
            <Field label="Meta descripción" hint={`${seoDesc.length}/160 caracteres`}>
              <Textarea
                value={seoDesc}
                onChange={setSeoDesc}
                rows={3}
                maxLength={160}
                placeholder="Catálogo de cosméticos Mary Kay con entrega a domicilio en Riohacha. Asesoría personalizada gratis."
              />
            </Field>

            {/* Keywords */}
            <Field label="Palabras clave (tags)" hint="Escribe una palabra y presiona Enter">
              <div className="flex gap-2">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword() } }}
                  placeholder="cosméticos Riohacha"
                />
                <Button type="button" variant="outline" size="sm" onClick={addKeyword}>+</Button>
              </div>
              {keywordList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywordList.map((kw) => (
                    <span key={kw} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="text-muted-foreground hover:text-destructive">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['cosméticos Riohacha', 'Mary Kay La Guajira', 'maquillaje Riohacha', 'skincare Colombia'].map((s) => (
                  <button key={s} onClick={() => { setKeyword(s); }} className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                    + {s}
                  </button>
                ))}
              </div>
            </Field>

            <Separator />
            <ImgUpload label="Imagen Open Graph (1200×630)" slot="og-image" storeId={storeId} currentUrl={ogUrl} onUploaded={setOgUrl} shape="rect" />
            <p className="text-xs text-muted-foreground">Esta imagen aparece cuando compartes el link en WhatsApp o Facebook</p>

            <Separator />
            {/* Checklist */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Verificaciones SEO</p>
            <div className="space-y-2">
              {[
                { ok: !!seoTitle,   label: 'Título SEO definido' },
                { ok: !!seoDesc,    label: 'Meta descripción definida' },
                { ok: !!logoUrl,    label: 'Logo subido' },
                { ok: !!ogUrl,      label: 'Imagen OG subida' },
                { ok: keywordList.length >= 3, label: 'Al menos 3 palabras clave' },
              ].map(({ ok, label }, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span style={{ color: ok ? '#22c55e' : '#ef4444' }}>{ok ? '✓' : '✗'}</span>
                  <span className={ok ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                </div>
              ))}
            </div>

            <Button className="w-full text-white" style={{ backgroundColor: 'var(--brand-500)' }} disabled={saving}
              onClick={() => upsert({
                seo_title: seoTitle || null,
                seo_description: seoDesc || null,
                seo_keywords: seoKeys || null,
              })}>
              {saving ? 'Guardando...' : 'Guardar SEO'}
            </Button>
          </>
        )}

      </div>
    </div>
  )
}
