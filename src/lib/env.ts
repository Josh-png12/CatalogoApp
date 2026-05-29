import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:    z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY:   z.string().min(20),
  NEXT_PUBLIC_STORE_ID:        z.string().uuid(),
  NEXT_PUBLIC_STORE_SLUG:      z.string().min(1),
  NEXT_PUBLIC_APP_URL:         z.string().url().optional(),
})

// Validated at server startup — throws at build time if any required var is missing.
// Only import this in server components and API routes (not client code).
export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_STORE_ID:          process.env.NEXT_PUBLIC_STORE_ID,
  NEXT_PUBLIC_STORE_SLUG:        process.env.NEXT_PUBLIC_STORE_SLUG,
  NEXT_PUBLIC_APP_URL:           process.env.NEXT_PUBLIC_APP_URL,
})
