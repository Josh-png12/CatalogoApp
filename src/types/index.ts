export interface Store {
  id: string
  slug: string
  name: string
  whatsapp_number: string
  primary_color: string
  logo_url: string | null
}

export interface StoreConfig {
  id: string
  store_id: string
  whatsapp_number: string
  primary_color: string
  logo_url?: string | null
  store_name: string
  consultant_name: string
  consultant_bio?: string | null
  consultant_photo_url?: string | null
  hero_title: string
  hero_subtitle?: string | null
  hero_badge_text?: string | null
  promo_banner_text?: string | null
  certified_label?: string | null
  feature_1?: string | null
  feature_2?: string | null
  feature_3?: string | null
  contact_message?: string | null
  footer_text?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
  tiktok_url?: string | null
  welcome_message?: string | null
  checkout_footer?: string | null
  updated_at?: string
  // SEO
  seo_title?: string | null
  seo_description?: string | null
  seo_keywords?: string | null
  // Benefits section
  benefit_1_title?: string | null
  benefit_1_text?: string | null
  benefit_2_title?: string | null
  benefit_2_text?: string | null
  benefit_3_title?: string | null
  benefit_3_text?: string | null
  benefit_4_title?: string | null
  benefit_4_text?: string | null
  // How it works
  how_step1_title?: string | null
  how_step1_text?: string | null
  how_step2_title?: string | null
  how_step2_text?: string | null
  how_step3_title?: string | null
  how_step3_text?: string | null
  // Hero stats
  stat_1_number?: string | null
  stat_1_label?: string | null
  stat_2_number?: string | null
  stat_2_label?: string | null
  stat_3_number?: string | null
  stat_3_label?: string | null
}

export interface Category {
  id: string
  store_id: string
  name: string
  slug: string
  sort_order: number
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
  is_primary: boolean
}

export interface Variant {
  id: string
  product_id: string
  name: string
  value: string
  price_delta: number
  stock: number
}

export interface Product {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  active: boolean
  featured: boolean
  stock: number
  images: ProductImage[]
  variants: Variant[]
  category?: Category
  seo_title?: string | null
  seo_description?: string | null
  // Promo fields — populated when product has an active promotion
  promo_id?: string
  promo_label?: string
  promo_discount_type?: 'percentage' | 'fixed'
  promo_discount_value?: number
  promo_ends_at?: string | null
  final_price?: number
}

export interface Order {
  id: string
  store_id: string
  customer_name?: string | null
  customer_phone?: string | null
  customer_address?: string | null
  total?: number | null
  items: CartItem[] | string
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  notes?: string | null
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  store_id: string
  event_type: 'product_view' | 'add_to_cart' | 'whatsapp_click' | 'order_created'
  product_id?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface AnalyticsSummary {
  total_views: number
  total_add_to_cart: number
  total_whatsapp_clicks: number
  total_orders: number
  views_last_7d: number
  clicks_last_7d: number
}

export interface DailyMetric {
  date: string
  day: string
  carts: number
  clicks: number
  orders: number
}

export interface Promotion {
  id: string
  store_id: string
  product_id: string
  label: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  starts_at: string
  ends_at?: string | null
  active: boolean
  created_at?: string
}

export interface CartItem {
  product: Product
  variant?: Variant
  quantity: number
  final_price?: number
}

export interface OrderData {
  items: CartItem[]
  customer_name: string
  customer_phone?: string
  customer_address: string
  note?: string
}

export interface Customer {
  id: string
  store_id: string
  name: string
  phone?: string | null
  whatsapp?: string | null
  address?: string | null
  neighborhood?: string | null
  city?: string | null
  birthday?: string | null
  skin_type?: string | null
  skin_tone?: string | null
  notes?: string | null
  tags: string[]
  assigned_consultant_id?: string | null
  total_spent: number
  last_purchase_at?: string | null
  active: boolean
  created_at: string
}

export interface SaleItem {
  product_id: string
  product_name: string
  variant?: string
  quantity: number
  unit_price: number
  total: number
}

export interface Sale {
  id: string
  store_id: string
  customer_id?: string | null
  customer_name?: string | null
  customer_phone?: string | null
  channel: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  payment_method: string
  payment_received: boolean
  payment_received_at?: string | null
  status: string
  notes?: string | null
  consultant_id?: string | null
  consultant_name?: string | null
  sale_date: string
  created_at: string
}

export interface InventoryMovement {
  id: string
  store_id: string
  product_id: string
  variant_id?: string | null
  type: 'entry' | 'exit' | 'adjustment'
  quantity: number
  unit_cost?: number | null
  previous_stock?: number | null
  new_stock?: number | null
  reason?: string | null
  notes?: string | null
  created_at: string
  product?: { name: string; stock: number }
}

export interface Expense {
  id: string
  store_id: string
  category: string
  description?: string | null
  amount: number
  receipt_url?: string | null
  payment_method?: string | null
  expense_date: string
  notes?: string | null
  created_at: string
}

export interface Review {
  id: string
  store_id: string
  product_id: string
  reviewer_name: string
  reviewer_phone?: string | null
  rating: number
  comment?: string | null
  photo_url?: string | null
  verified: boolean
  approved: boolean
  skin_type?: string | null
  skin_tone?: string | null
  created_at: string
}

export interface Consultant {
  id: string
  store_id: string
  name: string
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  address?: string | null
  join_date?: string | null
  monthly_goal: number
  commission_rate: number
  active: boolean
  notes?: string | null
  created_at: string
}
