export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          slug: string
          name: string
          owner_email: string | null
          plan: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          owner_email?: string | null
          plan?: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          owner_email?: string | null
          plan?: string
          active?: boolean
          created_at?: string
        }
      }
      store_config: {
        Row: {
          id: string
          store_id: string
          whatsapp_number: string
          primary_color: string
          logo_url: string | null
          welcome_message: string | null
          checkout_footer: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          whatsapp_number: string
          primary_color?: string
          logo_url?: string | null
          welcome_message?: string | null
          checkout_footer?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          whatsapp_number?: string
          primary_color?: string
          logo_url?: string | null
          welcome_message?: string | null
          checkout_footer?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          store_id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          active: boolean
          featured: boolean
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          active?: boolean
          featured?: boolean
          stock?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          active?: boolean
          featured?: boolean
          stock?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          sort_order: number
          is_primary: boolean
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          sort_order?: number
          is_primary?: boolean
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          sort_order?: number
          is_primary?: boolean
        }
      }
      variants: {
        Row: {
          id: string
          product_id: string
          name: string
          value: string
          price_delta: number
          stock: number
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          value: string
          price_delta?: number
          stock?: number
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          value?: string
          price_delta?: number
          stock?: number
        }
      }
      orders: {
        Row: {
          id: string
          store_id: string
          customer_name: string | null
          customer_phone: string | null
          customer_address: string | null
          total: number | null
          items: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          total?: number | null
          items: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          customer_name?: string | null
          customer_phone?: string | null
          customer_address?: string | null
          total?: number | null
          items?: Json
          status?: string
          created_at?: string
        }
      }
    }
  }
}
