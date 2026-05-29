'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { useStoreConfig } from '@/context/StoreConfigContext'
import { buildWhatsAppURL } from '@/lib/whatsapp'

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('')
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} className="fill-current shrink-0" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.099 1.507 5.829L.057 23.8l6.122-1.428A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 01-5.006-1.37l-.36-.214-3.633.952.969-3.542-.235-.374A9.845 9.845 0 012.182 12c0-5.413 4.405-9.818 9.818-9.818 5.413 0 9.818 4.405 9.818 9.818 0 5.414-4.405 9.818-9.818 9.818z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} className="fill-current" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} className="fill-current" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} className="fill-current" aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
  </svg>
)

export function ConsultantSection() {
  const config  = useStoreConfig()
  const [bioOpen, setBioOpen] = useState(false)

  const name    = config.consultant_name ?? 'Angélica Oñate'
  const bio     = config.consultant_bio  ?? 'Consultora independiente con más de 5 años de experiencia ayudando a mujeres a descubrir y realzar su belleza natural. Mi compromiso es brindarte productos de la más alta calidad con una atención completamente personalizada.'
  const label   = config.certified_label ?? 'Consultora Certificada'
  const initials = getInitials(name)
  const features = [config.feature_1, config.feature_2, config.feature_3].filter(Boolean) as string[]
  const longBio  = bio.length > 200

  const waUrl = config.whatsapp_number
    ? buildWhatsAppURL(
        config.whatsapp_number,
        config.contact_message ?? `Hola ${name}, me gustaría recibir asesoría personalizada 💄`
      )
    : '#'

  return (
    <section
      id="contacto"
      className="py-10 md:py-16 px-4 md:px-6 lg:px-8"
      style={{ background: 'linear-gradient(180deg, var(--brand-50) 0%, #ffffff 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

          {/* ── Photo column ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative mx-auto md:mx-0 shrink-0 w-full md:w-[280px]"
          >
            {/* Decorative offset frame — desktop only */}
            <div
              className="hidden md:block absolute rounded-3xl"
              style={{
                inset: 0,
                transform: 'translate(12px, 12px)',
                border: '2px solid #FCE4F3',
                zIndex: 0,
              }}
            />

            {/* Photo / initials */}
            <div
              className="relative overflow-hidden w-full h-56 md:h-[340px]"
              style={{
                borderRadius: 24,
                border: '3px solid white',
                boxShadow: '0 20px 60px rgba(233,30,140,0.25)',
                zIndex: 1,
              }}
            >
              {config.consultant_photo_url ? (
                <Image
                  src={config.consultant_photo_url}
                  alt={name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #E91E8C, #9A0F61)' }}
                >
                  <span
                    className="text-white select-none font-normal"
                    style={{ fontSize: 64, fontFamily: 'Georgia, serif' }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Certified badge */}
            <div
              className="absolute flex items-center gap-1.5 bg-white rounded-2xl shadow-lg"
              style={{ bottom: 16, left: 16, padding: '8px 14px', zIndex: 2 }}
            >
              <Star style={{ width: 14, height: 14, color: '#C9A84C', fill: '#C9A84C' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#E91E8C' }}>{label}</span>
            </div>

            {/* Years badge — desktop floating, hidden on mobile */}
            <div
              className="hidden md:block absolute bg-white rounded-2xl shadow-lg text-center"
              style={{ top: 16, right: -12, padding: '8px 12px', zIndex: 2 }}
            >
              <p style={{ fontSize: 18, fontWeight: 700, color: '#E91E8C', lineHeight: 1 }}>5+</p>
              <p style={{ fontSize: 10, color: '#888', lineHeight: 1.5 }}>años de<br/>experiencia</p>
            </div>
          </motion.div>

          {/* ── Content column ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex-1 min-w-0"
          >
            {/* Eyebrow */}
            <p
              className="uppercase tracking-widest mb-3"
              style={{ fontSize: 11, color: '#C9A84C', borderLeft: '2px solid #C9A84C', paddingLeft: 12 }}
            >
              Tu consultora personal
            </p>

            {/* Name */}
            <h2
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: 500,
                color: '#1a1a1a',
                marginBottom: 6,
              }}
            >
              {name}
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
              Consultora independiente · Riohacha, La Guajira
            </p>

            {/* Years badge — mobile inline only */}
            <div className="flex md:hidden items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1.5 rounded-full font-medium"
                style={{ fontSize: 12, padding: '4px 12px', background: 'rgba(233,30,140,0.08)', color: '#E91E8C' }}
              >
                ★ 5+ años de experiencia
              </span>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 20 }}>
              <p
                className={!bioOpen && longBio ? 'line-clamp-4' : ''}
                style={{ fontSize: 15, lineHeight: 1.8, color: '#555' }}
              >
                {bio}
              </p>
              {longBio && (
                <button
                  onClick={() => setBioOpen(!bioOpen)}
                  style={{ fontSize: 13, color: '#E91E8C', fontWeight: 500, marginTop: 4 }}
                >
                  {bioOpen ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>

            <div style={{ borderTop: '1px solid #FCE4F3', margin: '20px 0' }} />

            {/* Features */}
            {features.length > 0 && (
              <ul className="flex flex-col gap-2.5" style={{ marginBottom: 20 }}>
                {features.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2.5"
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 24, height: 24, background: 'rgba(233,30,140,0.1)' }}
                    >
                      <Check style={{ width: 13, height: 13, color: '#E91E8C' }} />
                    </div>
                    <span style={{ fontSize: 14, color: '#2a2a2a', fontWeight: 500 }}>{f}</span>
                  </motion.li>
                ))}
              </ul>
            )}

            <div style={{ borderTop: '1px solid #FCE4F3', margin: '20px 0' }} />

            {/* Buttons */}
            <div className="flex flex-wrap gap-3" style={{ marginBottom: 20 }}>
              {config.whatsapp_number && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-medium text-white rounded-full transition-opacity hover:opacity-90 active:scale-95"
                  style={{ background: '#25D366', fontSize: 14, padding: '12px 22px' }}
                >
                  <WhatsAppIcon />
                  Pedir por WhatsApp
                </a>
              )}
              <a
                href="#catalogo"
                className="flex items-center font-medium rounded-full transition-colors hover:bg-pink-50 active:scale-95"
                style={{ border: '1px solid #E91E8C', color: '#E91E8C', fontSize: 14, padding: '12px 22px' }}
              >
                Ver catálogo
              </a>
            </div>

            {/* Social icons */}
            {(config.instagram_url || config.facebook_url || config.tiktok_url) && (
              <div className="flex items-center gap-2">
                {config.instagram_url && (
                  <a
                    href={config.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-full border border-border text-gray-400 transition-colors hover:text-white"
                    style={{ width: 36, height: 36 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E91E8C'; e.currentTarget.style.borderColor = '#E91E8C' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '' }}
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {config.facebook_url && (
                  <a
                    href={config.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-full border border-border text-gray-400 transition-colors hover:text-white"
                    style={{ width: 36, height: 36 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E91E8C'; e.currentTarget.style.borderColor = '#E91E8C' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '' }}
                    aria-label="Facebook"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {config.tiktok_url && (
                  <a
                    href={config.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-full border border-border text-gray-400 transition-colors hover:text-white"
                    style={{ width: 36, height: 36 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E91E8C'; e.currentTarget.style.borderColor = '#E91E8C' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '' }}
                    aria-label="TikTok"
                  >
                    <TikTokIcon />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
