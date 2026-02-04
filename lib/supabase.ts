import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we're in build time (server-side without env vars)
  if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    // During build, return a mock client to prevent errors
    return {
      auth: { getUser: async () => ({ data: { user: null }, error: null }) }
    } as any
  }

  // Runtime check - throw error if env vars missing
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase环境变量未配置。请在Vercel中设置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  // Create and cache the instance
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export the client using a getter
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient()
    return client[prop as keyof SupabaseClient]
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          last_login?: string | null
        }
      }
      qrcodes: {
        Row: {
          id: string
          user_id: string
          url: string
          qr_type: 'free' | 'premium'
          size: number
          shape: 'square' | 'circle'
          color: string
          logo_url: string | null
          is_active: boolean
          expires_at: string
          created_at: string
          last_confirmed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          qr_type: 'free' | 'premium'
          size?: number
          shape?: 'square' | 'circle'
          color?: string
          logo_url?: string | null
          is_active?: boolean
          expires_at: string
          created_at?: string
          last_confirmed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          qr_type?: 'free' | 'premium'
          size?: number
          shape?: 'square' | 'circle'
          color?: string
          logo_url?: string | null
          is_active?: boolean
          expires_at?: string
          created_at?: string
          last_confirmed_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: string
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          status: string
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          status?: string
          current_period_end?: string
          created_at?: string
        }
      }
    }
  }
}
