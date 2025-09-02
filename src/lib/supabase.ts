import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yxdjxiseovgnangemrip.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZGp4aXNlb3ZnbmFuZ2VtcmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTA3MzUsImV4cCI6MjA3MTY4NjczNX0.yzz9-sbYvm-y9oxHalSpEcc0Mo8pvaH8l6I4ZXy3Rh4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Store = {
  id: number
  store_name: string
  owner?: string
  role?: string
  category?: string
  address?: string
  phone?: string
  business_hours?: string
  services?: string
  features?: string
  is_safe_store: boolean
  has_member_discount: boolean
  facebook_url?: string
  website_url?: string
  created_at: string
  updated_at: string
}

export type FAQ = {
  id: number
  question: string
  answer: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: number
  session_id: string
  message_type: 'user' | 'bot'
  content: string
  is_helpful?: boolean
  created_at: string
}

export type BusinessInfo = {
  id: number
  info_type: string
  title: string
  content: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}