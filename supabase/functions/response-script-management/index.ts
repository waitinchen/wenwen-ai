/**
 * 回應腳本管理系統 API
 * 版本: WEN 1.4.0
 * 功能: 完整的回應腳本管理工作流程
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

interface QuestionType {
  id?: string
  type_name: string
  description?: string
  category: string
  keywords: string[]
  intent_pattern?: string
  is_active?: boolean
  priority?: number
}

interface ResponseScript {
  id?: string
  question_type_id: string
  script_name: string
  script_content: string
  script_type: 'TEXT' | 'TEMPLATE' | 'DYNAMIC'
  variables?: Record<string, any>
  conditions?: Record<string, any>
  version?: string
  is_active?: boolean
  usage_count?: number
  success_rate?: number
}

interface ScriptReview {
  id?: string
  script_id: string
  reviewer_id: string
  review_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'
  review_notes?: string
  suggested_changes?: string
  review_score?: number
}

class ResponseScriptManager {
  private supabase: any

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  // ========================================
  // 問題類型管理
  // ========================================

  async createQuestionType(data: QuestionType) {
    try {
      const { data: result, error } = await this.supabase
        .from('question_types')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getQuestionTypes(category?: string) {
    try {
      let query = this.supabase
        .from('question_types')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async updateQuestionType(id: string, data: Partial<QuestionType>) {
    try {
      const { data: result, error } = await this.supabase
        .from('question_types')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ========================================
  // 回應腳本管理
  // ========================================

  async createResponseScript(data: ResponseScript) {
    try {
      const { data: result, error } = await this.supabase
        .from('response_scripts')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getResponseScripts(questionTypeId?: string) {
    try {
      let query = this.supabase
        .from('response_scripts')
        .select(`
          *,
          question_types (
            type_name,
            category,
            keywords
          )
        `)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      if (questionTypeId) {
        query = query.eq('question_type_id', questionTypeId)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async updateResponseScript(id: string, data: Partial<ResponseScript>) {
    try {
      const { data: result, error } = await this.supabase
        .from('response_scripts')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ========================================
  // 腳本審核管理
  // ========================================

  async createScriptReview(data: ScriptReview) {
    try {
      const { data: result, error } = await this.supabase
        .from('script_reviews')
        .insert([data])
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getScriptReviews(scriptId?: string) {
    try {
      let query = this.supabase
        .from('script_reviews')
        .select(`
          *,
          response_scripts (
            script_name,
            question_types (
              type_name,
              category
            )
          ),
          auth.users (
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (scriptId) {
        query = query.eq('script_id', scriptId)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async updateScriptReview(id: string, data: Partial<ScriptReview>) {
    try {
      const updateData = {
        ...data,
        reviewed_at: new Date().toISOString()
      }

      const { data: result, error } = await this.supabase
        .from('script_reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ========================================
  // 知識庫管理
  // ========================================

  async generateKnowledgeTrainingData(scriptId: string) {
    try {
      // 獲取腳本信息
      const { data: script, error: scriptError } = await this.supabase
        .from('response_scripts')
        .select(`
          *,
          question_types (
            type_name,
            category,
            keywords,
            intent_pattern
          )
        `)
        .eq('id', scriptId)
        .single()

      if (scriptError) throw scriptError

      // 生成訓練資料
      const trainingData = {
        question_type_id: script.question_type_id,
        script_id: scriptId,
        training_content: this.formatTrainingContent(script),
        content_type: 'ANSWER',
        is_approved: false
      }

      const { data: result, error } = await this.supabase
        .from('knowledge_training_data')
        .insert([trainingData])
        .select()
        .single()

      if (error) throw error
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  private formatTrainingContent(script: any): string {
    const questionType = script.question_types
    return `問題類型: ${questionType.type_name}
分類: ${questionType.category}
關鍵字: ${questionType.keywords.join(', ')}
意圖模式: ${questionType.intent_pattern}

回應腳本:
${script.script_content}

腳本類型: ${script.script_type}
版本: ${script.version}`
  }

  // ========================================
  // 使用統計
  // ========================================

  async logScriptUsage(data: {
    script_id: string
    session_id?: string
    user_query: string
    matched_intent?: string
    response_generated: string
    user_satisfaction?: number
    execution_time_ms?: number
    success?: boolean
    error_message?: string
  }) {
    try {
      const { data: result, error } = await this.supabase
        .from('script_usage_logs')
        .insert([data])
        .select()
        .single()

      if (error) throw error

      // 更新腳本使用統計
      await this.updateScriptStats(data.script_id, data.success)

      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  private async updateScriptStats(scriptId: string, success?: boolean) {
    try {
      // 獲取當前統計
      const { data: script, error: scriptError } = await this.supabase
        .from('response_scripts')
        .select('usage_count, success_rate')
        .eq('id', scriptId)
        .single()

      if (scriptError) throw scriptError

      // 計算新的統計數據
      const newUsageCount = (script.usage_count || 0) + 1
      let newSuccessRate = script.success_rate || 0

      if (success !== undefined) {
        const totalSuccesses = Math.round((script.success_rate || 0) * (script.usage_count || 0) / 100)
        const newTotalSuccesses = success ? totalSuccesses + 1 : totalSuccesses
        newSuccessRate = Math.round((newTotalSuccesses / newUsageCount) * 100)
      }

      // 更新統計
      await this.supabase
        .from('response_scripts')
        .update({
          usage_count: newUsageCount,
          success_rate: newSuccessRate
        })
        .eq('id', scriptId)

    } catch (error) {
      console.error('更新腳本統計失敗:', error)
    }
  }

  async getScriptStats(scriptId?: string) {
    try {
      let query = this.supabase
        .from('script_usage_stats')
        .select('*')

      if (scriptId) {
        query = query.eq('script_id', scriptId)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ========================================
  // 智能匹配
  // ========================================

  async findMatchingScript(userQuery: string, intent: string) {
    try {
      // 根據意圖和關鍵字查找匹配的腳本
      const { data: scripts, error } = await this.supabase
        .from('active_response_scripts')
        .select('*')
        .eq('category', intent)
        .order('success_rate', { ascending: false })
        .order('usage_count', { ascending: false })

      if (error) throw error

      // 簡單的關鍵字匹配邏輯
      const matchingScripts = scripts.filter(script => {
        const keywords = script.keywords || []
        return keywords.some(keyword => 
          userQuery.toLowerCase().includes(keyword.toLowerCase())
        )
      })

      return { 
        success: true, 
        data: matchingScripts.length > 0 ? matchingScripts[0] : null 
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // 初始化管理器
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const manager = new ResponseScriptManager(supabaseUrl, supabaseKey)

    // 解析請求數據
    let requestData = {}
    if (method !== 'GET') {
      try {
        requestData = await req.json()
      } catch (e) {
        // 忽略解析錯誤
      }
    }

    let result

    // 路由處理
    switch (true) {
      // 問題類型管理
      case path.endsWith('/question-types') && method === 'GET':
        result = await manager.getQuestionTypes(requestData.category)
        break

      case path.endsWith('/question-types') && method === 'POST':
        result = await manager.createQuestionType(requestData)
        break

      case path.includes('/question-types/') && method === 'PUT':
        const questionTypeId = path.split('/').pop()
        result = await manager.updateQuestionType(questionTypeId, requestData)
        break

      // 回應腳本管理
      case path.endsWith('/response-scripts') && method === 'GET':
        result = await manager.getResponseScripts(requestData.question_type_id)
        break

      case path.endsWith('/response-scripts') && method === 'POST':
        result = await manager.createResponseScript(requestData)
        break

      case path.includes('/response-scripts/') && method === 'PUT':
        const scriptId = path.split('/').pop()
        result = await manager.updateResponseScript(scriptId, requestData)
        break

      // 腳本審核管理
      case path.endsWith('/script-reviews') && method === 'GET':
        result = await manager.getScriptReviews(requestData.script_id)
        break

      case path.endsWith('/script-reviews') && method === 'POST':
        result = await manager.createScriptReview(requestData)
        break

      case path.includes('/script-reviews/') && method === 'PUT':
        const reviewId = path.split('/').pop()
        result = await manager.updateScriptReview(reviewId, requestData)
        break

      // 知識庫管理
      case path.includes('/generate-training-data/') && method === 'POST':
        const trainingScriptId = path.split('/').pop()
        result = await manager.generateKnowledgeTrainingData(trainingScriptId)
        break

      // 使用統計
      case path.endsWith('/usage-logs') && method === 'POST':
        result = await manager.logScriptUsage(requestData)
        break

      case path.endsWith('/stats') && method === 'GET':
        result = await manager.getScriptStats(requestData.script_id)
        break

      // 智能匹配
      case path.endsWith('/find-matching-script') && method === 'POST':
        result = await manager.findMatchingScript(requestData.user_query, requestData.intent)
        break

      default:
        return new Response(JSON.stringify({ 
          error: 'Endpoint not found',
          available_endpoints: [
            'GET /question-types',
            'POST /question-types',
            'PUT /question-types/:id',
            'GET /response-scripts',
            'POST /response-scripts',
            'PUT /response-scripts/:id',
            'GET /script-reviews',
            'POST /script-reviews',
            'PUT /script-reviews/:id',
            'POST /generate-training-data/:scriptId',
            'POST /usage-logs',
            'GET /stats',
            'POST /find-matching-script'
          ]
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Response Script Management Error:', error)
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})