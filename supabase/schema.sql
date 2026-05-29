-- ============================================================
-- CatálogoApp — Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS stores (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  owner_email text,
  plan        text DEFAULT 'free',
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_config (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  whatsapp_number  text NOT NULL,
  primary_color    text DEFAULT '#E91E8C',
  logo_url         text,
  welcome_message  text,
  checkout_footer  text,
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       text NOT NULL,
  slug       text NOT NULL,
  sort_order integer DEFAULT 0,
  UNIQUE (store_id, slug)
);

CREATE TABLE IF NOT EXISTS products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name        text NOT NULL,
  description text,
  price       decimal(12, 2) NOT NULL,
  active      boolean DEFAULT true,
  featured    boolean DEFAULT false,
  stock       integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        text NOT NULL,
  sort_order integer DEFAULT 0,
  is_primary boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS variants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name        text NOT NULL,
  value       text NOT NULL,
  price_delta decimal(12, 2) DEFAULT 0,
  stock       integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id         uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name    text,
  customer_phone   text,
  customer_address text,
  total            decimal(12, 2),
  items            jsonb NOT NULL,
  status           text DEFAULT 'pending',
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- FUNCIÓN auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_store_config_updated_at
  BEFORE UPDATE ON store_config
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE stores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_config    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;

-- stores: público solo lectura
CREATE POLICY "stores_select_public" ON stores
  FOR SELECT USING (active = true);

-- store_config: lectura pública por store activo
CREATE POLICY "store_config_select_public" ON store_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_config.store_id
        AND stores.active = true
    )
  );

CREATE POLICY "store_config_write_auth" ON store_config
  FOR ALL USING (auth.role() = 'authenticated');

-- categories: lectura pública
CREATE POLICY "categories_select_public" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = categories.store_id
        AND stores.active = true
    )
  );

CREATE POLICY "categories_write_auth" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

-- products: lectura pública (solo activos)
CREATE POLICY "products_select_public" ON products
  FOR SELECT USING (
    active = true AND
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
        AND stores.active = true
    )
  );

CREATE POLICY "products_write_auth" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- product_images: lectura pública
CREATE POLICY "product_images_select_public" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.active = true
    )
  );

CREATE POLICY "product_images_write_auth" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

-- variants: lectura pública
CREATE POLICY "variants_select_public" ON variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = variants.product_id
        AND products.active = true
    )
  );

CREATE POLICY "variants_write_auth" ON variants
  FOR ALL USING (auth.role() = 'authenticated');

-- orders: INSERT público, SELECT/UPDATE solo autenticados
CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_select_auth" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_update_auth" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED: Tienda Mary Kay — Laura
-- IMPORTANTE: Reemplaza el UUID con tu NEXT_PUBLIC_STORE_ID
-- ============================================================

INSERT INTO stores (id, slug, name, owner_email, plan, active)
VALUES (
  '3f77c1b5-1cb5-4b87-98bb-deb8a32bbc3d',   -- ← REEMPLAZAR con tu UUID real
  'mary-kay-laura',
  'Mary Kay — Laura',
  'tu-email@ejemplo.com', -- ← REEMPLAZAR con tu email
  'free',
  true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO store_config (store_id, whatsapp_number, primary_color, welcome_message)
VALUES (
  'tu-store-uuid-aqui',   -- ← REEMPLAZAR con el mismo UUID
  '3000000000',           -- ← REEMPLAZAR con tu número WhatsApp (sin +57)
  '#E91E8C',
  '¡Hola! Bienvenida al catálogo de Mary Kay con Laura 💄'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STORAGE BUCKET para imágenes de productos
-- Crear manualmente en: Supabase > Storage > New Bucket
-- Nombre: product-images
-- Public: true
-- ============================================================
