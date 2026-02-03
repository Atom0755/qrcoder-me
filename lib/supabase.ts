import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
