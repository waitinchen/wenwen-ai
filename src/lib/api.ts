import { supabase } from '@/lib/supabase'

export interface ChatResponse {
  response: string
  sessionId: string
  timestamp: string
}

export async function sendMessage(
  message: string,
  sessionId?: string,
  lineUid?: string
): Promise<ChatResponse> {
  try {
    // IP地址将由服务器端自动获取，不需要在客户端处理
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        message,
        sessionId,
        line_uid: lineUid
        // userIp 已移除，将由服务器端从请求头获取
      }
    })

    if (error) {
      console.error('Chatbot error:', error)
      throw error
    }

    return data.data as ChatResponse
  } catch (error) {
    console.error('Failed to send message:', error)
    throw error
  }
}

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
export async function getQuickQuestions() {
  return adminRequest('list', 'quick_questions', null, null, { orderBy: 'display_order', orderDirection: 'asc' })
}

export async function createQuickQuestion(question: any) {
  return adminRequest('create', 'quick_questions', question)
}

export async function updateQuickQuestion(id: number, question: any) {
  return adminRequest('update', 'quick_questions', question, id)
}

export async function deleteQuickQuestion(id: number) {
  return adminRequest('delete', 'quick_questions', null, id)
}

export async function bulkUpdateQuickQuestions(items: any[]) {
  return adminRequest('bulk_update', 'quick_questions', items)
}

// 活動管理
export async function getActivities() {
  return adminRequest('list', 'activities', null, null, { orderBy: 'created_at', orderDirection: 'desc' })
}

export async function createActivity(activity: any) {
  return adminRequest('create', 'activities', activity)
}

export async function updateActivity(id: number, activity: any) {
  return adminRequest('update', 'activities', activity, id)
}

export async function deleteActivity(id: number) {
  return adminRequest('delete', 'activities', null, id)
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
    console.error('Failed to fetch stores:', error)
    throw error
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

export async function adminLogin(email: string, password: string): Promise<AdminLoginData> {
  try {
    const { data, error } = await supabase.functions.invoke('admin-auth', {
      body: {
        action: 'login',
        email,
        password
      }
    })

    if (error) throw error
    return data.data as AdminLoginData
  } catch (error) {
    console.error('Admin login error:', error)
    throw error
  }
}

export async function adminVerifyToken(token: string): Promise<AdminLoginData> {
  try {
    const { data, error } = await supabase.functions.invoke('admin-auth', {
      body: {
        action: 'verify',
        token
      }
    })

    if (error) throw error
    // 為verify響應添加token，因為它在驗證時不返回token
    return { 
      ...data.data, 
      token, 
      session: data.data.session || { expires_at: '', created_at: '' }
    } as AdminLoginData
  } catch (error) {
    console.error('Admin token verification error:', error)
    throw error
  }
}

export async function adminLogout(token: string): Promise<void> {
  try {
    await supabase.functions.invoke('admin-auth', {
      body: {
        action: 'logout',
        token
      }
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    throw error
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
    console.error('Failed to fetch training data:', error)
    throw error
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
    console.error('Failed to create training data:', error)
    throw error
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
    console.error('Failed to update training data:', error)
    throw error
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
    console.error('Failed to delete training data:', error)
    throw error
  }
}

// 商家資料管理
export async function createStore(store: any) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .insert(store)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to create store:', error)
    throw error
  }
}

export async function updateStore(id: number, store: any) {
  try {
    const { data, error } = await supabase
      .from('stores')
      .update({ ...store, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to update store:', error)
    throw error
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
    console.error('Failed to delete store:', error)
    throw error
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