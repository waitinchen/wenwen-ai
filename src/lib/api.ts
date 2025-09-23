import { supabase } from '@/lib/supabase'
import { mockAdminLogin, mockAdminVerifyToken, mockAdminLogout } from '@/lib/mockAdminAuth'

export interface ChatResponse {
  response: string
  sessionId: string
  timestamp: string
}

export async function sendMessage(
  message: string,
  sessionId?: string,
  lineUid?: string,
  userMeta?: { external_id?: string, display_name?: string, avatar_url?: string }
): Promise<ChatResponse> {
  try {
    // 使用新的 API 格式
    console.log('使用修復後的 Edge Function API')
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: sessionId,
        message: { 
          role: 'user', 
          content: message 
        },
        user_meta: {
          external_id: userMeta?.external_id || lineUid || getClientId(),
          display_name: userMeta?.display_name,
          avatar_url: userMeta?.avatar_url
        }
      }
    })

    if (error) {
      console.error('Chatbot error:', error)
      throw error
    }

    return data.data as ChatResponse
  } catch (error) {
    console.warn('Edge Function failed, using mock chat API:', error)
    // 如果 Edge Function 失敗，使用模擬聊天 API
    const { mockSendMessage } = await import('./mockClaudeChat')
    return await mockSendMessage(message, sessionId, lineUid)
  }
}

// 生成客戶端 ID 的輔助函數
function getClientId(): string {
  let clientId = localStorage.getItem('wenwen-client-id')
  if (!clientId) {
    clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('wenwen-client-id', clientId)
  }
  return clientId
}

// 布林值轉換函數
const toBool = (v: any): boolean => v === true || v === 'true'

// ===== 新增管理後台API =====

// ===== 新增管理後臺 API =====

// 內容合理性檢渭 API
export async function validateContent(content: string, contentType: string, sourceTable?: string, sourceId?: number) {
  try {
    const { data, error } = await supabase.functions.invoke('content-validation', {
      body: {
        action: 'check-content',
        content,
        contentType,
        sourceTable,
        sourceId
      }
    })

    if (error) throw error
    return data.data
  } catch (error) {
    console.error('Content validation error:', error)
    throw error
  }
}

export async function getContentWarnings(sourceTable?: string, sourceId?: number) {
  try {
    const { data, error } = await supabase.functions.invoke('content-validation', {
      body: {
        action: 'get-warnings',
        sourceTable,
        sourceId
      }
    })

    if (error) throw error
    return data.data
  } catch (error) {
    console.error('Failed to get content warnings:', error)
    throw error
  }
}

export async function getAllContentWarnings() {
  try {
    const { data, error } = await supabase.functions.invoke('content-validation', {
      body: {
        action: 'get-all-warnings'
      }
    })

    if (error) throw error
    return data.data
  } catch (error) {
    console.error('Failed to get all content warnings:', error)
    throw error
  }
}

export async function resolveContentWarning(warningId: number) {
  try {
    const { data, error } = await supabase.functions.invoke('content-validation', {
      body: {
        action: 'resolve-warning',
        sourceId: warningId
      }
    })

    if (error) throw error
    return data.data
  } catch (error) {
    console.error('Failed to resolve content warning:', error)
    throw error
  }
}

export async function batchValidateContent(items: any[]) {
  try {
    const { data, error } = await supabase.functions.invoke('content-validation', {
      body: {
        action: 'batch-check',
        batchCheck: items
      }
    })

    if (error) throw error
    return data.data
  } catch (error) {
    console.error('Batch content validation error:', error)
    throw error
  }
}

// 通用CRUD操作（加入身份驗證）
export async function adminRequest(action: string, table: string, data?: any, id?: number, filters?: any) {
  try {
    // 獲取管理員令牌
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登入或登入已過期')
    }

    const { data: result, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action,
        table,
        data,
        id,
        filters,
        token // 傳遞認證令牌
      }
    })

    if (error) {
      // 如果是認證錯誤，清除本地儲存的令牌
      if (error.message?.includes('未授權') || error.message?.includes('權限不足')) {
        localStorage.removeItem('admin_token')
        window.location.reload()
      }
      throw error
    }
    return result.data
  } catch (error) {
    console.error(`Admin ${action} error:`, error)
    throw error
  }
}

// 新增：通用管理後台API函數（支持Claude API密鑰操作）
export async function adminManagement(action: string, table: string, data?: any, id?: number, filters?: any) {
  try {
    // 獲取管理員令牌
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登入或登入已過期')
    }

    const { data: result, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action,
        table,
        data,
        id,
        filters,
        token // 傳遞認證令牌
      }
    })

    if (error) {
      // 如果是認證錯誤，清除本地儲存的令牌
      if (error.message?.includes('未授權') || error.message?.includes('權限不足')) {
        localStorage.removeItem('admin_token')
        window.location.reload()
      }
      throw error
    }
    return result
  } catch (error) {
    console.error(`Admin management ${action} error:`, error)
    throw error
  }
}

// 數據分析API（加入身份驗證）
export async function analyticsRequest(action: string, dateRange?: any, filters?: any) {
  try {
    // 獲取管理員令牌
    const token = localStorage.getItem('admin_token')
    if (!token) {
      throw new Error('未登入或登入已過期')
    }

    const { data, error } = await supabase.functions.invoke('analytics-service', {
      body: {
        action,
        dateRange,
        filters,
        token // 傳遞認證令牌
      }
    })

    if (error) {
      // 如果是認證錯誤，清除本地儲存的令牌
      if (error.message?.includes('未授權') || error.message?.includes('權限不足')) {
        localStorage.removeItem('admin_token')
        window.location.reload()
      }
      throw error
    }
    return data.data
  } catch (error) {
    console.error(`Analytics ${action} error:`, error)
    throw error
  }
}

// 常用問題管理
export async function getQuickQuestions(): Promise<QuickQuestion[]> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'list',
        table: 'quick_questions',
        filters: { orderBy: 'display_order', orderDirection: 'asc' }
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      const { mockGetQuickQuestions } = await import('./mockQuickQuestions')
      return await mockGetQuickQuestions()
    }
    
    return data.data as QuickQuestion[]
  } catch (error) {
    console.warn('Quick questions error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    const { mockGetQuickQuestions } = await import('./mockQuickQuestions')
    return await mockGetQuickQuestions()
  }
}

export async function createQuickQuestion(question: Partial<QuickQuestion>): Promise<QuickQuestion> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'create',
        table: 'quick_questions',
        data: question
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      const { mockCreateQuickQuestion } = await import('./mockQuickQuestions')
      return await mockCreateQuickQuestion(question)
    }
    
    return data.data as QuickQuestion
  } catch (error) {
    console.warn('Create quick question error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    const { mockCreateQuickQuestion } = await import('./mockQuickQuestions')
    return await mockCreateQuickQuestion(question)
  }
}

export async function updateQuickQuestion(id: number, question: Partial<QuickQuestion>): Promise<QuickQuestion> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'update',
        table: 'quick_questions',
        data: question,
        id
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      const { mockUpdateQuickQuestion } = await import('./mockQuickQuestions')
      return await mockUpdateQuickQuestion(id, question)
    }
    
    return data.data as QuickQuestion
  } catch (error) {
    console.warn('Update quick question error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    const { mockUpdateQuickQuestion } = await import('./mockQuickQuestions')
    return await mockUpdateQuickQuestion(id, question)
  }
}

export async function deleteQuickQuestion(id: number): Promise<void> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    await supabase.functions.invoke('admin-management', {
      body: {
        action: 'delete',
        table: 'quick_questions',
        id
      }
    })
  } catch (error) {
    console.warn('Edge Function failed, using mock API:', error)
    // 如果 Edge Function 失敗，使用模擬 API
    const { mockDeleteQuickQuestion } = await import('./mockQuickQuestions')
    await mockDeleteQuickQuestion(id)
  }
}

export async function bulkUpdateQuickQuestions(items: QuickQuestion[]): Promise<void> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    await supabase.functions.invoke('admin-management', {
      body: {
        action: 'bulk_update',
        table: 'quick_questions',
        data: items
      }
    })
  } catch (error) {
    console.warn('Edge Function failed, using mock API:', error)
    // 如果 Edge Function 失敗，使用模擬 API
    const { mockBulkUpdateQuickQuestions } = await import('./mockQuickQuestions')
    await mockBulkUpdateQuickQuestions(items)
  }
}

// 活動管理
export async function getActivities(): Promise<any[]> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'list',
        table: 'activities',
        filters: { orderBy: 'created_at', orderDirection: 'desc' }
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      const { mockGetActivities } = await import('./mockActivities')
      return await mockGetActivities()
    }
    
    return data.data as any[]
  } catch (error) {
    console.warn('Get activities error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    const { mockGetActivities } = await import('./mockActivities')
    return await mockGetActivities()
  }
}

export async function createActivity(activity: any): Promise<any> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'create',
        table: 'activities',
        data: activity
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      const { mockCreateActivity } = await import('./mockActivities')
      return await mockCreateActivity(activity)
    }
    
    return data.data as any
  } catch (error) {
    console.warn('Create activity error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    const { mockCreateActivity } = await import('./mockActivities')
    return await mockCreateActivity(activity)
  }
}

export async function updateActivity(id: number, activity: any): Promise<any> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'update',
        table: 'activities',
        data: activity,
        id
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      const { mockUpdateActivity } = await import('./mockActivities')
      return await mockUpdateActivity(id, activity)
    }
    
    return data.data as any
  } catch (error) {
    console.warn('Update activity error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    const { mockUpdateActivity } = await import('./mockActivities')
    return await mockUpdateActivity(id, activity)
  }
}

export async function deleteActivity(id: number): Promise<void> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    await supabase.functions.invoke('admin-management', {
      body: {
        action: 'delete',
        table: 'activities',
        id
      }
    })
  } catch (error) {
    console.warn('Edge Function failed, using mock API:', error)
    // 如果 Edge Function 失敗，使用模擬 API
    const { mockDeleteActivity } = await import('./mockActivities')
    await mockDeleteActivity(id)
  }
}

// 互动栅栏管理
export async function getInteractionFilters() {
  return adminRequest('list', 'interaction_filters', null, null, { orderBy: 'created_at', orderDirection: 'desc' })
}

export async function createInteractionFilter(filter: any) {
  return adminRequest('create', 'interaction_filters', filter)
}

export async function updateInteractionFilter(id: number, filter: any) {
  return adminRequest('update', 'interaction_filters', filter, id)
}

export async function deleteInteractionFilter(id: number) {
  return adminRequest('delete', 'interaction_filters', null, id)
}

// 人格配置管理
export async function getPersonalityConfigs() {
  return adminRequest('list', 'personality_configs', null, null, { orderBy: 'created_at', orderDirection: 'desc' })
}

export async function createPersonalityConfig(config: any) {
  return adminRequest('create', 'personality_configs', config)
}

export async function updatePersonalityConfig(id: number, config: any) {
  return adminRequest('update', 'personality_configs', config, id)
}

export async function deletePersonalityConfig(id: number) {
  return adminRequest('delete', 'personality_configs', null, id)
}

export async function activatePersonalityConfig(id: number) {
  // 先取消所有配置的活動状态
  await supabase
    .from('personality_configs')
    .update({ is_active: false })
    .neq('id', 0)
  
  // 激活指定配置
  return adminRequest('update', 'personality_configs', { is_active: true }, id)
}

// 數據分析特定方法
export async function getDashboardStats(dateRange?: any) {
  return analyticsRequest('dashboard_stats', dateRange)
}

export async function getConversationTrends(dateRange: any) {
  return analyticsRequest('conversation_trends', dateRange)
}

export async function getPopularQuestions(dateRange: any) {
  return analyticsRequest('popular_questions', dateRange)
}

export async function getUsageHeatmap(dateRange: any) {
  return analyticsRequest('usage_heatmap', dateRange)
}

export async function getUserSatisfaction(dateRange: any) {
  return analyticsRequest('user_satisfaction', dateRange)
}

export async function getBlockedQuestionsStats(dateRange: any) {
  return analyticsRequest('blocked_questions_stats', dateRange)
}

// ===== 保留原有API =====

export async function getStores() {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('store_name')

    if (error) throw error
    return data
  } catch (error) {
    console.warn('Failed to fetch stores from database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { getAllMockStores } = await import('./mockStores')
    const mockData = getAllMockStores()
    console.log('=== getStores API 調試 ===')
    console.log('Mock data length:', mockData.length)
    console.log('Mock data:', mockData)
    console.log('Partner stores in mock data:', mockData.filter(store => store.is_partner_store))
    console.log('=== getStores API 調試結束 ===')
    return mockData
  }
}

export async function getFAQs() {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch FAQs:', error)
    throw error
  }
}

// FAQ 管理 CRUD 操作
export async function getAllFAQs() {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch all FAQs:', error)
    throw error
  }
}

export async function createFAQ(faq: any) {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        ...faq,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to create FAQ:', error)
    throw error
  }
}

export async function updateFAQ(id: number, faq: any) {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .update({
        ...faq,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to update FAQ:', error)
    throw error
  }
}

export async function deleteFAQ(id: number) {
  try {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Failed to delete FAQ:', error)
    throw error
  }
}

export async function toggleFAQStatus(id: number, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to toggle FAQ status:', error)
    throw error
  }
}

export async function getBusinessInfo() {
  try {
    const { data, error } = await supabase
      .from('business_info')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch business info:', error)
    throw error
  }
}

// ===== 管理後台API ===== 

// 管理員身份認證
export interface AdminLoginData {
  token: string
  admin: {
    id: number
    email: string
    full_name: string
    role: string
    permissions: string[]
  }
  session: {
    expires_at: string
    created_at: string
  }
}

export interface QuickQuestion {
  id: number
  question: string
  display_order: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginData> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-auth', {
      body: {
        action: 'login',
        email,
        password
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      return await mockAdminLogin(email, password)
    }
    
    return data.data as AdminLoginData
  } catch (error) {
    console.warn('Admin login error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    return await mockAdminLogin(email, password)
  }
}

export async function adminVerifyToken(token: string): Promise<AdminLoginData> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('admin-auth', {
      body: {
        action: 'verify',
        token
      }
    })

    if (error) {
      console.warn('Edge Function failed, using mock API:', error.message)
      // 如果 Edge Function 失敗，使用模擬 API
      return await mockAdminVerifyToken(token)
    }
    
    // 為verify響應添加token，因為它在驗證時不返回token
    return { 
      ...data.data, 
      token, 
      session: data.data.session || { expires_at: '', created_at: '' }
    } as AdminLoginData
  } catch (error) {
    console.warn('Admin token verification error, using mock API:', error)
    // 如果發生錯誤，使用模擬 API
    return await mockAdminVerifyToken(token)
  }
}

export async function adminLogout(token: string): Promise<void> {
  try {
    // 首先嘗試使用 Supabase Edge Function
    await supabase.functions.invoke('admin-auth', {
      body: {
        action: 'logout',
        token
      }
    })
  } catch (error) {
    console.warn('Edge Function failed, using mock API:', error)
    // 如果 Edge Function 失敗，使用模擬 API
    await mockAdminLogout(token)
  }
}

// AI配置管理
export async function getAIConfigs() {
  try {
    const { data, error } = await supabase
      .from('ai_configs')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch AI configs:', error)
    throw error
  }
}

export async function updateAIConfig(id: number, config: any) {
  try {
    const { data, error } = await supabase
      .from('ai_configs')
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to update AI config:', error)
    throw error
  }
}

export async function createAIConfig(config: any) {
  try {
    const { data, error } = await supabase
      .from('ai_configs')
      .insert(config)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to create AI config:', error)
    throw error
  }
}

// 訓練資料管理
export async function getTrainingData() {
  try {
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.warn('Failed to fetch training data from database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { mockGetTrainingData } = await import('./mockTrainingData')
    return await mockGetTrainingData()
  }
}

export async function createTrainingData(data: any) {
  try {
    const { data: result, error } = await supabase
      .from('training_data')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  } catch (error) {
    console.warn('Failed to create training data in database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { mockCreateTrainingData } = await import('./mockTrainingData')
    return await mockCreateTrainingData(data)
  }
}

export async function updateTrainingData(id: number, data: any) {
  try {
    const { data: result, error } = await supabase
      .from('training_data')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  } catch (error) {
    console.warn('Failed to update training data in database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { mockUpdateTrainingData } = await import('./mockTrainingData')
    return await mockUpdateTrainingData(id, data)
  }
}

export async function deleteTrainingData(id: number) {
  try {
    const { error } = await supabase
      .from('training_data')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.warn('Failed to delete training data in database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { mockDeleteTrainingData } = await import('./mockTrainingData')
    await mockDeleteTrainingData(id)
  }
}

// 商家資料管理
export async function createStore(store: any) {
  console.log('createStore called with store:', store)
  
  // 強化布林值轉換邏輯 - 明確處理各種輸入類型
  // 使用新的 toBool 函數
  const sanitizeBoolean = (value: any, defaultValue: boolean = false): boolean => {
    return toBool(value) || defaultValue
  }
  
  const sanitizedStore = {
    ...store,
    is_partner_store: sanitizeBoolean(store.is_partner_store, false),
    is_safe_store: sanitizeBoolean(store.is_safe_store, false),
    has_member_discount: sanitizeBoolean(store.has_member_discount, false),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  console.log('=== 建立商家布林值轉換詳情 ===')
  console.log('原始 is_partner_store:', store.is_partner_store, typeof store.is_partner_store)
  console.log('轉換後 is_partner_store:', sanitizedStore.is_partner_store, typeof sanitizedStore.is_partner_store)
  console.log('原始 is_safe_store:', store.is_safe_store, typeof store.is_safe_store)
  console.log('轉換後 is_safe_store:', sanitizedStore.is_safe_store, typeof sanitizedStore.is_safe_store)
  console.log('原始 has_member_discount:', store.has_member_discount, typeof store.has_member_discount)
  console.log('轉換後 has_member_discount:', sanitizedStore.has_member_discount, typeof sanitizedStore.has_member_discount)
  console.log('=== 轉換完成 ===')
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .insert(sanitizedStore)
      .select()
      .single()

    if (error) throw error
    console.log('Database create successful:', data)
    console.log('DB 回傳的 is_partner_store:', data.is_partner_store, typeof data.is_partner_store)
    
    // 確保回傳的資料包含正確的布林值
    const responseData = {
      ...data,
      is_partner_store: Boolean(data.is_partner_store),
      is_safe_store: Boolean(data.is_safe_store),
      has_member_discount: Boolean(data.has_member_discount)
    }
    
    console.log('最終回傳資料:', responseData)
    return responseData
  } catch (error) {
    console.warn('Failed to create store in database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { createMockStore } = await import('./mockStores')
    const newStore = createMockStore(sanitizedStore)
    
    // 確保 mock 資料也回傳正確的布林值
    const mockResponseData = {
      ...newStore,
      is_partner_store: Boolean(newStore.is_partner_store),
      is_safe_store: Boolean(newStore.is_safe_store),
      has_member_discount: Boolean(newStore.has_member_discount)
    }
    
    console.log('Mock 最終回傳資料:', mockResponseData)
    return mockResponseData
  }
}

export async function updateStore(id: number, store: any) {
  console.log('updateStore called with id:', id, 'store:', store)
  
  // 強化布林值轉換邏輯 - 明確處理各種輸入類型
  // 使用新的 toBool 函數
  const sanitizeBoolean = (value: any, defaultValue: boolean = false): boolean => {
    return toBool(value) || defaultValue
  }
  
  const sanitizedStore = {
    ...store,
    is_partner_store: sanitizeBoolean(store.is_partner_store, false),
    is_safe_store: sanitizeBoolean(store.is_safe_store, false),
    has_member_discount: sanitizeBoolean(store.has_member_discount, false),
    updated_at: new Date().toISOString()
  }
  
  console.log('=== 布林值轉換詳情 ===')
  console.log('原始 is_partner_store:', store.is_partner_store, typeof store.is_partner_store)
  console.log('轉換後 is_partner_store:', sanitizedStore.is_partner_store, typeof sanitizedStore.is_partner_store)
  console.log('原始 is_safe_store:', store.is_safe_store, typeof store.is_safe_store)
  console.log('轉換後 is_safe_store:', sanitizedStore.is_safe_store, typeof sanitizedStore.is_safe_store)
  console.log('原始 has_member_discount:', store.has_member_discount, typeof store.has_member_discount)
  console.log('轉換後 has_member_discount:', sanitizedStore.has_member_discount, typeof sanitizedStore.has_member_discount)
  console.log('=== 轉換完成 ===')
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .update(sanitizedStore)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    console.log('Database update successful:', data)
    console.log('DB 回傳的 is_partner_store:', data.is_partner_store, typeof data.is_partner_store)
    
    // 確保回傳的資料包含正確的布林值
    const responseData = {
      ...data,
      is_partner_store: Boolean(data.is_partner_store),
      is_safe_store: Boolean(data.is_safe_store),
      has_member_discount: Boolean(data.has_member_discount)
    }
    
    console.log('最終回傳資料:', responseData)
    return responseData
  } catch (error) {
    console.warn('Failed to update store in database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { updateMockStore, createMockStore } = await import('./mockStores')
    const updatedStore = updateMockStore(id, sanitizedStore)
    if (updatedStore) {
      console.log('Updated store in mock data:', updatedStore)
      // 確保 mock 資料也回傳正確的布林值
      const mockResponseData = {
        ...updatedStore,
        is_partner_store: Boolean(updatedStore.is_partner_store),
        is_safe_store: Boolean(updatedStore.is_safe_store),
        has_member_discount: Boolean(updatedStore.has_member_discount)
      }
      console.log('Mock 最終回傳資料:', mockResponseData)
      return mockResponseData
    } else {
      console.warn(`Store with id ${id} not found in mock data, creating new one`)
      const newStore = createMockStore({ ...sanitizedStore, id })
      console.log('Created new store in mock data:', newStore)
      // 確保新建立的 mock 資料也回傳正確的布林值
      const newMockResponseData = {
        ...newStore,
        is_partner_store: Boolean(newStore.is_partner_store),
        is_safe_store: Boolean(newStore.is_safe_store),
        has_member_discount: Boolean(newStore.has_member_discount)
      }
      console.log('新 Mock 最終回傳資料:', newMockResponseData)
      return newMockResponseData
    }
  }
}

export async function deleteStore(id: number) {
  try {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.warn('Failed to delete store in database, using mock data:', error)
    // 如果數據庫失敗，使用模擬數據
    const { deleteMockStore } = await import('./mockStores')
    deleteMockStore(id)
  }
}

// 統計數據
export async function getChatAnalytics() {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('session_id, message_count, created_at, last_activity')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to fetch chat analytics:', error)
    throw error
  }
}