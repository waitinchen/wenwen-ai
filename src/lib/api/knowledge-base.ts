import { executeSupabaseQuery, supabase } from './database'

// Stores
export function getStores() {
  return executeSupabaseQuery(
    supabase
      .from('stores')
      .select('*')
      .order('store_name'),
    '取得商家列表失敗'
  )
}

export function createStore(store: unknown) {
  return executeSupabaseQuery(
    supabase
      .from('stores')
      .insert(store)
      .select()
      .single(),
    '新增商家失敗'
  )
}

export function updateStore(id: number, store: unknown) {
  return executeSupabaseQuery(
    supabase
      .from('stores')
      .update({ ...store, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single(),
    '更新商家資料失敗'
  )
}

export function deleteStore(id: number) {
  return executeSupabaseQuery(
    supabase
      .from('stores')
      .delete()
      .eq('id', id),
    '刪除商家資料失敗'
  )
}

// FAQs
export function getFAQs() {
  return executeSupabaseQuery(
    supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    '取得常見問題失敗'
  )
}

export function getAllFAQs() {
  return executeSupabaseQuery(
    supabase
      .from('faqs')
      .select('*')
      .order('created_at', { ascending: false }),
    '取得全部常見問題失敗'
  )
}

export function createFAQ(faq: unknown) {
  const timestamp = new Date().toISOString()
  return executeSupabaseQuery(
    supabase
      .from('faqs')
      .insert({
        ...(faq as Record<string, unknown>),
        created_at: timestamp,
        updated_at: timestamp
      })
      .select()
      .single(),
    '新增常見問題失敗'
  )
}

export function updateFAQ(id: number, faq: unknown) {
  return executeSupabaseQuery(
    supabase
      .from('faqs')
      .update({
        ...(faq as Record<string, unknown>),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single(),
    '更新常見問題失敗'
  )
}

export function deleteFAQ(id: number) {
  return executeSupabaseQuery(
    supabase
      .from('faqs')
      .delete()
      .eq('id', id),
    '刪除常見問題失敗'
  )
}

// AI Configurations
export function getAIConfigs() {
  return executeSupabaseQuery(
    supabase
      .from('ai_configs')
      .select('*')
      .order('updated_at', { ascending: false }),
    '取得 AI 設定失敗'
  )
}

export function createAIConfig(config: unknown) {
  return executeSupabaseQuery(
    supabase
      .from('ai_configs')
      .insert(config)
      .select()
      .single(),
    '新增 AI 設定失敗'
  )
}

export function updateAIConfig(id: number, config: unknown) {
  return executeSupabaseQuery(
    supabase
      .from('ai_configs')
      .update({
        ...(config as Record<string, unknown>),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single(),
    '更新 AI 設定失敗'
  )
}

// Training data
export function getTrainingData() {
  return executeSupabaseQuery(
    supabase
      .from('training_data')
      .select('*')
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false }),
    '取得訓練資料失敗'
  )
}

export function createTrainingData(data: unknown) {
  return executeSupabaseQuery(
    supabase
      .from('training_data')
      .insert(data)
      .select()
      .single(),
    '新增訓練資料失敗'
  )
}

export function updateTrainingData(id: number, data: unknown) {
  return executeSupabaseQuery(
    supabase
      .from('training_data')
      .update({
        ...(data as Record<string, unknown>),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single(),
    '更新訓練資料失敗'
  )
}

export function deleteTrainingData(id: number) {
  return executeSupabaseQuery(
    supabase
      .from('training_data')
      .delete()
      .eq('id', id),
    '刪除訓練資料失敗'
  )
}

// Chat analytics
export function getChatAnalytics() {
  return executeSupabaseQuery(
    supabase
      .from('chat_sessions')
      .select('session_id, message_count, created_at, last_activity')
      .order('created_at', { ascending: false })
      .limit(100),
    '取得聊天統計失敗'
  )
}
