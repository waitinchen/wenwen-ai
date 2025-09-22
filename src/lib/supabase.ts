import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

// 環境變數檢查
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ 缺少 Supabase 環境變數，使用預設值。請設置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
} else {
  console.log('✅ Supabase 環境變數已載入')
  console.log('📍 資料庫 URL:', supabaseUrl)
  console.log('🔑 環境:', import.meta.env.VITE_ENVIRONMENT || 'development')
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