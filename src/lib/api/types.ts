export interface ChatResponse {
  response: string
  sessionId: string
  timestamp: string
}

export interface AdminInfo {
  id: number
  email: string
  full_name: string
  role: string
  permissions?: string[]
}

export interface AdminSession {
  expires_at: string
  created_at?: string
}

export interface AdminLoginData {
  token: string
  admin: AdminInfo
  expires_at?: string
  session?: AdminSession
}

export interface AdminRequestFilters {
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  limit?: number
  where?: Record<string, string | number | boolean>
}

export interface AdminManagementPayload {
  action: string
  table: string
  data?: unknown
  id?: number
  filters?: AdminRequestFilters
}

export interface AnalyticsRequestPayload {
  action: string
  dateRange?: unknown
  filters?: Record<string, unknown>
}

export interface QuickQuestionRecord {
  id: number
  question: string
  display_order: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export type QuickQuestionInput = Pick<QuickQuestionRecord, 'question' | 'display_order' | 'is_enabled'>
