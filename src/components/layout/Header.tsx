'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Search, Heart, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { useStoreConfig } from '@/context/StoreConfigContext'
import { buildWhatsAppURL } from '@/lib/whatsapp'

const navLinks = [
  { label: 'Inicio',      href: '/' },
  { label: 'Catálogo',   href: '/#catalogo' },
  { label: 'Destacados', href: '/#destacados' },
  { label: 'Contacto',   href: '/#contacto' },
]

interface HeaderProps {
  onSearchOpen?: () => void
  onWishlistOpen?: () => void
}

export function Header({ onSearchOpen, onWishlistOpen }: HeaderProps) {
  const { openCart, totalItems } = useCart()
  const { totalItems: wishlistCount } = useWishlist()
  const config = useStoreConfig()
  const count = totalItems()
  const wCount = wishlistCount()
  const prevCount = useRef(count)

  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [badgeBounce, setBadgeBounce] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (count > prevCount.current) {
      setBadgeBounce(true)
      setTimeout(() => setBadgeBounce(false), 400)
    }
    prevCount.current = count
  }, [count])

  const waUrl = config.whatsapp_number
    ? buildWhatsAppURL(
        config.whatsapp_number,
        config.contact_message ?? `Hola ${config.consultant_name}, me gustaría recibir asesoría 💄`
      )
    : '#'

  const iconColor = scrolled ? '#1a1a1a' : 'white'
  const iconHoverBg = scrolled ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)'

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          height: 56,
          background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '0.5px solid rgba(0,0,0,0.08)' : '0.5px solid rgba(255,255,255,0.1)',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="flex h-full items-center justify-between px-5 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col leading-none">
            {config.logo_url ? (
              <div className="relative h-7 w-24">
                <Image
                  src={config.logo_url}
                  alt={config.store_name}
                  fill
                  className="object-contain object-left"
                  sizes="96px"
                />
              </div>
            ) : (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontSize: 20,
                    fontWeight: 400,
                    color: scrolled ? 'var(--brand)' : 'white',
                    letterSpacing: '0.5px',
                    lineHeight: 1,
                    transition: 'color 300ms ease',
                  }}
                >
                  {config.store_name} •
                </span>
                {config.consultant_name && (
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize: 10,
                      color: scrolled ? '#9ca3af' : 'rgba(255,255,255,0.6)',
                      letterSpacing: '0.5px',
                      transition: 'color 300ms ease',
                    }}
                  >
                    by {config.consultant_name}
                  </span>
                )}
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link uppercase transition-colors"
                style={{
                  fontSize: 11,
                  letterSpacing: '1px',
                  color: scrolled ? '#6b7280' : 'rgba(255,255,255,0.85)',
                  paddingBottom: 2,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = scrolled ? '#1a1a1a' : 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = scrolled ? '#6b7280' : 'rgba(255,255,255,0.85)'
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ color: iconColor }}
              onMouseEnter={(e) => { e.currentTarget.style.background = iconHoverBg }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              aria-label="Buscar productos"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Wishlist — desktop only */}
            <button
              onClick={onWishlistOpen}
              className="hidden md:flex relative h-9 w-9 items-center justify-center rounded-full transition-colors"
              style={{ color: iconColor }}
              onMouseEnter={(e) => { e.currentTarget.style.background = iconHoverBg }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              aria-label="Mi lista de deseos"
            >
              <Heart className="h-4 w-4" />
              <AnimatePresence>
                {wCount > 0 && (
                  <motion.span
                    key="wbadge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full text-white font-bold"
                    style={{ fontSize: 9, background: 'var(--brand)' }}
                  >
                    {wCount > 9 ? '9+' : wCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Cart */}
            <button
              onClick={openCart}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${badgeBounce ? 'animate-wiggle' : ''}`}
              style={{ color: iconColor }}
              onMouseEnter={(e) => { e.currentTarget.style.background = iconHoverBg }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="h-4 w-4" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full text-white font-bold"
                    style={{ fontSize: 9, background: 'var(--brand)' }}
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full transition-colors"
              style={{ color: iconColor }}
              onMouseEnter={(e) => { e.currentTarget.style.background = iconHoverBg }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white flex flex-col md:hidden"
              style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
            >
              <div
                className="flex items-center justify-between px-5 h-14 border-b"
                style={{ borderColor: '#E8E6DF' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-editorial)',
                    fontSize: 18,
                    color: 'var(--brand)',
                  }}
                >
                  {config.store_name}
                </span>
                <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 px-5 py-4 flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center h-12 text-gray-600 hover:text-gray-900 transition-colors border-b"
                    style={{ fontSize: 15, borderColor: '#F0EDE8' }}
                  >
                    {link.label}
                  </a>
                ))}

                <div className="mt-4 border-t pt-4" style={{ borderColor: '#E8E6DF' }}>
                  <button
                    onClick={() => { openCart(); setMobileOpen(false) }}
                    className="flex items-center gap-2 text-gray-600 h-10"
                    style={{ fontSize: 14 }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Carrito
                    {count > 0 && (
                      <span
                        className="ml-1 text-white font-bold rounded-full h-5 w-5 flex items-center justify-center"
                        style={{ fontSize: 10, background: 'var(--brand)' }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                  {onSearchOpen && (
                    <button
                      onClick={() => { onSearchOpen(); setMobileOpen(false) }}
                      className="flex items-center gap-2 text-gray-600 h-10"
                      style={{ fontSize: 14 }}
                    >
                      <Search className="h-4 w-4" />
                      Buscar productos
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t" style={{ borderColor: '#E8E6DF' }}>
                  {config.whatsapp_number && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full font-medium text-white rounded-full"
                      style={{ background: '#25D366', fontSize: 13, padding: '10px 0' }}
                    >
                      Escribir por WhatsApp
                    </a>
                  )}
                  <p className="text-center mt-4" style={{ fontSize: 11, color: '#bbb' }}>
                    {config.store_name} by {config.consultant_name}
                  </p>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
