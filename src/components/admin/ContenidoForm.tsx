'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { StoreConfig } from '@/types'

// ─── Upload to site-assets bucket ────────────────────────────────────────────
async function uploadSiteAsset(file: File, slot: string): Promise<string | null> {
  const supabase = createClient()
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${storeId}/site/${slot}.${ext}`
  const { data, error } = await supabase.storage
    .from('site-assets')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error || !data) return null
  const { data: urlData } = supabase.storage.from('site-assets').getPublicUrl(data.path)
  return `${urlData.publicUrl}?t=${Date.now()}`
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCss: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  color: '#111827',
  background: '#fafafa',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const textareaCss: React.CSSProperties = {
  ...inputCss,
  resize: 'vertical' as const,
  minHeight: 88,
  lineHeight: 1.65,
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        border: '1px solid #f0ede8',
        padding: '24px 24px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span role="img" aria-hidden>{icon}</span>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {children}
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#374151',
          marginBottom: hint ? 2 : 6,
        }}
      >
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, lineHeight: 1.45 }}>{hint}</p>
      )}
      {children}
    </div>
  )
}

function ImageField({
  label,
  hint,
  value,
  slot,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  slot: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const ref = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no puede superar 5 MB.')
      return
    }
    setUploadError(null)
    setUploading(true)
    const url = await uploadSiteAsset(file, slot)
    setUploading(false)
    if (url) {
      onChange(url)
    } else {
      setUploadError('No se pudo subir la imagen. Verifica que el bucket "site-assets" exista en Supabase.')
    }
    if (ref.current) ref.current.value = ''
  }

  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            flexShrink: 0,
            background: '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {value ? (
            <Image src={value} alt={label} fill style={{ objectFit: 'cover' }} unoptimized />
          ) : (
            <span style={{ fontSize: 28, opacity: 0.4 }}>🖼️</span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={uploading}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1.5px solid #e91e8c',
              background: 'white',
              color: '#e91e8c',
              fontSize: 13,
              fontWeight: 500,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? '⏳ Subiendo...' : '📷 Cambiar imagen'}
          </button>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
            JPG, PNG o WebP · máx. 5 MB
          </p>
          {uploadError && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{uploadError}</p>
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      </div>
    </Field>
  )
}

function UrlField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string
  hint?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="url"
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? 'https://'}
          style={{ ...inputCss, flex: 1 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#e91e8c')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: '#e91e8c',
              whiteSpace: 'nowrap',
              textDecoration: 'underline',
              flexShrink: 0,
            }}
          >
            Ver ↗
          </a>
        )}
      </div>
    </Field>
  )
}

// ─── Main form ─────────────────────────────────────────────────────────────────
export function ContenidoForm({ initialConfig }: { initialConfig: StoreConfig | null }) {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID!

  const [fields, setFields] = useState({
    hero_title:           initialConfig?.hero_title           ?? '',
    hero_subtitle:        initialConfig?.hero_subtitle        ?? '',
    hero_badge_text:      initialConfig?.hero_badge_text      ?? '',
    hero_cta_text:        initialConfig?.hero_cta_text        ?? 'Explorar catálogo',
    hero_image_url:       initialConfig?.hero_image_url       ?? '',
    consultant_name:      initialConfig?.consultant_name      ?? '',
    consultant_bio:       initialConfig?.consultant_bio       ?? '',
    consultant_photo_url: initialConfig?.consultant_photo_url ?? '',
    certified_label:      initialConfig?.certified_label      ?? '',
    whatsapp_number:      initialConfig?.whatsapp_number      ?? '',
    contact_message:      initialConfig?.contact_message      ?? '',
    instagram_url:        initialConfig?.instagram_url        ?? '',
    facebook_url:         initialConfig?.facebook_url         ?? '',
    tiktok_url:           initialConfig?.tiktok_url           ?? '',
    promo_banner_text:    initialConfig?.promo_banner_text    ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const set =
    (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }))

  const setVal = (key: keyof typeof fields) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('store_config')
      .update({
        hero_title:           fields.hero_title           || null,
        hero_subtitle:        fields.hero_subtitle        || null,
        hero_badge_text:      fields.hero_badge_text      || null,
        hero_cta_text:        fields.hero_cta_text        || null,
        hero_image_url:       fields.hero_image_url       || null,
        consultant_name:      fields.consultant_name      || null,
        consultant_bio:       fields.consultant_bio       || null,
        consultant_photo_url: fields.consultant_photo_url || null,
        certified_label:      fields.certified_label      || null,
        whatsapp_number:      fields.whatsapp_number      || null,
        contact_message:      fields.contact_message      || null,
        instagram_url:        fields.instagram_url        || null,
        facebook_url:         fields.facebook_url         || null,
        tiktok_url:           fields.tiktok_url           || null,
        promo_banner_text:    fields.promo_banner_text    || null,
      })
      .eq('store_id', storeId)
    setSaving(false)
    if (error) {
      setSaveError('Error al guardar: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 5000)
    }
  }

  const focusStyle = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = '#e91e8c'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = '#e5e7eb'
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 100 }}>

      {/* ── 1. Inicio (Hero) ── */}
      <Card icon="🌟" title="Sección de inicio">
        <Field
          label="📝 Título principal"
          hint="El texto grande que aparece al entrar al sitio. Usa palabras cortas, una por línea."
        >
          <input
            type="text"
            value={fields.hero_title}
            onChange={set('hero_title')}
            placeholder="Descubre tu belleza ideal"
            style={inputCss}
            {...focusStyle}
          />
        </Field>
        <Field
          label="📝 Subtítulo"
          hint="Texto pequeño debajo del título. Describe tu servicio en 1-2 oraciones."
        >
          <textarea
            value={fields.hero_subtitle}
            onChange={set('hero_subtitle')}
            placeholder="Productos seleccionados por tu consultora personal..."
            style={textareaCss}
            {...focusStyle}
          />
        </Field>
        <Field
          label="📝 Texto del badge / etiqueta"
          hint='Texto pequeño en dorado que aparece encima del título. Ej: "Catálogo Oficial · Beauty"'
        >
          <input
            type="text"
            value={fields.hero_badge_text}
            onChange={set('hero_badge_text')}
            placeholder="Catálogo Oficial · Beauty"
            style={inputCss}
            {...focusStyle}
          />
        </Field>
        <Field
          label="📝 Texto del botón principal"
          hint='Lo que dice el botón rosa grande. Ej: "Ver catálogo" o "Explorar productos"'
        >
          <input
            type="text"
            value={fields.hero_cta_text}
            onChange={set('hero_cta_text')}
            placeholder="Explorar catálogo"
            style={inputCss}
            {...focusStyle}
          />
        </Field>
        <ImageField
          label="🖼️ Imagen de fondo del inicio (opcional)"
          hint="Si subes una imagen, se mostrará como fondo en la sección de inicio. Tamaño recomendado: 1920×1080 px."
          value={fields.hero_image_url}
          slot="hero_bg"
          onChange={setVal('hero_image_url')}
        />
      </Card>

      {/* ── 2. Sobre mí ── */}
      <Card icon="👤" title="Sobre mí (tu presentación)">
        <Field
          label="📝 Tu nombre completo"
          hint="Nombre que aparece en tu sección de presentación y en el botón de WhatsApp."
        >
          <input
            type="text"
            value={fields.consultant_name}
            onChange={set('consultant_name')}
            placeholder="Angélica Oñate"
            style={inputCss}
            {...focusStyle}
          />
        </Field>
        <Field
          label="📝 Tu presentación / bio"
          hint="Cuéntales a tus clientas quién eres. Aparece en la sección de consultora."
        >
          <textarea
            value={fields.consultant_bio}
            onChange={set('consultant_bio')}
            placeholder="Soy consultora independiente con más de 5 años de experiencia..."
            style={{ ...textareaCss, minHeight: 110 }}
            {...focusStyle}
          />
        </Field>
        <ImageField
          label="🖼️ Tu foto"
          hint="Foto tuya que aparece en la sección de presentación. Recomendado: foto de perfil vertical."
          value={fields.consultant_photo_url}
          slot="consultant_photo"
          onChange={setVal('consultant_photo_url')}
        />
        <Field
          label="📝 Badge de certificación"
          hint='Texto del badge dorado que aparece sobre tu foto. Ej: "Consultora Certificada"'
        >
          <input
            type="text"
            value={fields.certified_label}
            onChange={set('certified_label')}
            placeholder="Consultora Certificada"
            style={inputCss}
            {...focusStyle}
          />
        </Field>
      </Card>

      {/* ── 3. WhatsApp ── */}
      <Card icon="📱" title="WhatsApp">
        <Field
          label="📱 Número de WhatsApp"
          hint="Número con código de país, sin espacios ni guiones. Ej: 573154764675"
        >
          <input
            type="tel"
            value={fields.whatsapp_number}
            onChange={set('whatsapp_number')}
            placeholder="573154764675"
            style={inputCss}
            {...focusStyle}
          />
        </Field>
        <Field
          label="📝 Mensaje predeterminado"
          hint="Texto que se envía automáticamente cuando alguien hace clic en el botón de WhatsApp."
        >
          <textarea
            value={fields.contact_message}
            onChange={set('contact_message')}
            placeholder="Hola Angélica, me gustaría recibir asesoría personalizada 💄"
            style={textareaCss}
            {...focusStyle}
          />
        </Field>
      </Card>

      {/* ── 4. Banner de texto ── */}
      <Card icon="📣" title="Banner de anuncios">
        <Field
          label="📝 Texto del banner"
          hint="Texto que se mueve en la franja rosada. Deja vacío para ocultar el banner. Puedes usar • para separar frases."
        >
          <input
            type="text"
            value={fields.promo_banner_text}
            onChange={set('promo_banner_text')}
            placeholder="✨ Envíos disponibles  •  💄 Productos originales  •  🎁 Consulta gratis"
            style={inputCss}
            {...focusStyle}
          />
        </Field>
      </Card>

      {/* ── 5. Redes sociales ── */}
      <Card icon="🔗" title="Redes sociales">
        <UrlField
          label="📸 Instagram"
          hint="URL completa de tu perfil de Instagram."
          value={fields.instagram_url}
          onChange={set('instagram_url')}
          placeholder="https://instagram.com/tu_usuario"
        />
        <UrlField
          label="👤 Facebook"
          hint="URL completa de tu página o perfil de Facebook."
          value={fields.facebook_url}
          onChange={set('facebook_url')}
          placeholder="https://facebook.com/tu_pagina"
        />
        <UrlField
          label="🎵 TikTok"
          hint="URL completa de tu perfil de TikTok."
          value={fields.tiktok_url}
          onChange={set('tiktok_url')}
          placeholder="https://tiktok.com/@tu_usuario"
        />
      </Card>

      {/* ── Save bar ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #e5e7eb',
          padding: '14px 24px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {saveError && (
          <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>❌ {saveError}</p>
        )}
        {saved && (
          <p style={{ fontSize: 14, color: '#16a34a', fontWeight: 600, margin: 0 }}>
            ✅ ¡Cambios guardados! Recarga el sitio para verlos.
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '13px 40px',
            background: saving ? '#9ca3af' : '#e91e8c',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            width: '100%',
            maxWidth: 480,
            transition: 'background 0.15s',
          }}
        >
          {saving ? '⏳ Guardando...' : '💾 Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
