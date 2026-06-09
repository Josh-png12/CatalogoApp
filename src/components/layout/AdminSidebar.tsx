'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Tag, Settings, LogOut, Menu, X, Store,
  ExternalLink, BadgePercent, ClipboardList, QrCode, Palette,
  Users, Banknote, PackagePlus, Coins, Users2, Star, FileEdit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navSections = [
  {
    label: 'Catálogo',
    items: [
      { href: '/admin',             label: 'Dashboard',    icon: LayoutDashboard, exact: true,  badge: null },
      { href: '/admin/pedidos',     label: 'Pedidos',      icon: ClipboardList,   exact: false, badge: 'pending' },
      { href: '/admin/productos',   label: 'Productos',    icon: Package,         exact: false, badge: null },
      { href: '/admin/categorias',  label: 'Categorías',   icon: Tag,             exact: false, badge: null },
      { href: '/admin/promociones', label: 'Promociones',  icon: BadgePercent,    exact: false, badge: null },
      { href: '/admin/reseñas',     label: 'Reseñas',      icon: Star,            exact: false, badge: 'reviews' },
    ],
  },
  {
    label: 'Negocio',
    items: [
      { href: '/admin/clientes',    label: 'Clientes',     icon: Users,           exact: false, badge: null },
      { href: '/admin/ventas',      label: 'Ventas',       icon: Banknote,        exact: false, badge: null },
      { href: '/admin/inventario',  label: 'Inventario',   icon: PackagePlus,     exact: false, badge: null },
      { href: '/admin/finanzas',    label: 'Finanzas',     icon: Coins,           exact: false, badge: null },
      { href: '/admin/equipo',      label: 'Mi Equipo',    icon: Users2,          exact: false, badge: null },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { href: '/admin/contenido',    label: 'Contenido',    icon: FileEdit, exact: false, badge: null },
      { href: '/admin/diseno',       label: 'Diseño',       icon: Palette,  exact: false, badge: null },
      { href: '/admin/compartir',    label: 'Compartir',    icon: QrCode,   exact: false, badge: null },
      { href: '/admin/configuracion',label: 'Configuración',icon: Settings, exact: false, badge: null },
    ],
  },
]

// Flatten for isActive usage
const navItems = navSections.flatMap((s) => s.items)

interface AdminSidebarProps {
  userEmail?: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pendingCount, setPendingCount]   = useState(0)
  const [reviewsCount, setReviewsCount]   = useState(0)

  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient()
      const storeId = process.env.NEXT_PUBLIC_STORE_ID!
      const [ordersRes, reviewsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeId)
          .eq('status', 'pending'),
        supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', storeId)
          .eq('approved', false),
      ])
      setPendingCount(ordersRes.count ?? 0)
      setReviewsCount(reviewsRes.count ?? 0)
    }
    fetchCounts()
    const id = setInterval(fetchCounts, 60000)
    return () => clearInterval(id)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">CatálogoApp</p>
          <p className="text-xs text-muted-foreground leading-tight">Panel Admin</p>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-2">
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
                {section.label}
              </p>
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item)
                const showBadge =
                  (item.badge === 'pending' && pendingCount > 0) ||
                  (item.badge === 'reviews' && reviewsCount > 0)
                const badgeCount = item.badge === 'reviews' ? reviewsCount : pendingCount
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-light text-brand border-l-2 border-brand pl-[10px]'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <Separator />
      <div className="p-3 space-y-2">
        <a
          href={process.env.NEXT_PUBLIC_APP_URL ?? '/'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--brand-500)', color: 'var(--brand-500)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-50)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver mi catálogo ↗
        </a>
        {userEmail && (
          <p className="text-xs text-muted-foreground px-3 truncate" title={userEmail}>
            {userEmail}
          </p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex flex-col w-60 border-r min-h-screen bg-white flex-shrink-0">
        <NavContent />
      </aside>

      <div className="md:hidden fixed top-3 left-3 z-50">
        <Button variant="outline" size="icon" onClick={() => setOpen(!open)}>
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-60 bg-white border-r z-50 flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
