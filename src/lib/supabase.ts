import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 類型定義
export type Database = {
  public: {
    Tables: {
      line_users: {
        Row: {
          id: number
          line_uid: string
          line_display_name: string
          line_avatar_url: string | null
          is_active: boolean
          first_interaction_at: string
          last_interaction_at: string
          total_conversations: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          line_uid: string
          line_display_name: string
          line_avatar_url?: string | null
          is_active?: boolean
          first_interaction_at?: string
          last_interaction_at?: string
          total_conversations?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          line_uid?: string
          line_display_name?: string
          line_avatar_url?: string | null
          is_active?: boolean
          first_interaction_at?: string
          last_interaction_at?: string
          total_conversations?: number
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: number
          session_id: string
          user_ip: string | null
          user_agent: string | null
          line_user_id: number | null
          started_at: string
          last_activity: string
          message_count: number
        }
        Insert: {
          id?: number
          session_id: string
          user_ip?: string | null
          user_agent?: string | null
          line_user_id?: number | null
          started_at?: string
          last_activity?: string
          message_count?: number
        }
        Update: {
          id?: number
          session_id?: string
          user_ip?: string | null
          user_agent?: string | null
          line_user_id?: number | null
          started_at?: string
          last_activity?: string
          message_count?: number
        }
      }
      chat_messages: {
        Row: {
          id: number
          session_id: number
          message_type: 'user' | 'bot' | 'system'
          message_text: string
          response_time: number | null
          user_feedback: number | null
          created_at: string
          metadata: any | null
        }
        Insert: {
          id?: number
          session_id: number
          message_type?: 'user' | 'bot' | 'system'
          message_text: string
          response_time?: number | null
          user_feedback?: number | null
          created_at?: string
          metadata?: any | null
        }
        Update: {
          id?: number
          session_id?: number
          message_type?: 'user' | 'bot' | 'system'
          message_text?: string
          response_time?: number | null
          user_feedback?: number | null
          created_at?: string
          metadata?: any | null
        }
      }
    }
  }
}