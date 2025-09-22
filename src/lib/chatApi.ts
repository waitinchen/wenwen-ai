// 前台對話完整保存 API 契約
import { supabase } from './supabase'

// 類型定義
export interface UserMeta {
  external_id: string
  display_name: string
  avatar_url?: string
}

export interface ChatContext {
  client_ip?: string
  user_agent: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  session_id?: string
  message: ChatMessage
  user_meta: UserMeta
  context: ChatContext
}

export interface ChatResponse {
  ok: boolean
  session_id: string
  assistant?: {
    content: string
  }
  error?: string
}

// 生成或獲取外部 ID (Cookie/Device ID)
export function getOrSetExternalId(): string {
  const COOKIE_NAME = 'wenwen_client_id'
  const existingId = getCookie(COOKIE_NAME)
  
  if (existingId) {
    return existingId
  }
  
  // 生成新的外部 ID
  const newId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  setCookie(COOKIE_NAME, newId, 365) // 保存一年
  return newId
}

// Cookie 工具函數
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

// 發送聊天訊息
export async function sendChatMessage(
  sessionId: string | null,
  message: string,
  userDisplayName: string,
  userAvatarUrl?: string
): Promise<ChatResponse> {
  const externalId = getOrSetExternalId()
  
  const request: ChatRequest = {
    session_id: sessionId || undefined,
    message: {
      role: 'user',
      content: message
    },
    user_meta: {
      external_id: externalId,
      display_name: userDisplayName,
      avatar_url: userAvatarUrl
    },
    context: {
      client_ip: undefined, // 前端無法獲取真實 IP
      user_agent: navigator.userAgent
    }
  }

  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ChatResponse = await response.json()
    return result
  } catch (error) {
    console.error('發送聊天訊息失敗:', error)
    return {
      ok: false,
      session_id: '',
      error: error instanceof Error ? error.message : '未知錯誤'
    }
  }
}

// 獲取會話歷史
export async function getChatHistory(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        role,
        content,
        created_at,
        chat_sessions!inner(
          user_profiles!inner(
            display_name,
            avatar_url
          )
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('獲取聊天歷史失敗:', error)
    return { data: null, error }
  }
}

// 獲取會話列表 (後台用)
export async function getChatSessions(page = 1, limit = 20) {
  try {
    const offset = (page - 1) * limit
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        last_active,
        message_count,
        last_message_preview,
        user_profiles!inner(
          display_name,
          avatar_url
        )
      `)
      .order('last_active', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('獲取會話列表失敗:', error)
    return { data: null, error }
  }
}
