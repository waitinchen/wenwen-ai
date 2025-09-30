/**
 * Claude Chat V3 - 整合回應腳本管理系統
 * 版本: WEN 1.4.0
 * 功能: 完整的知識庫工作流程整合
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

class KnowledgeBaseService {
  private supabase: any
  private scriptManagerUrl: string

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.scriptManagerUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/response-script-management'
  }

  async findBestResponseScript(userQuery: string, intent: string): Promise<{
    script: any | null
    confidence: number
    source: string
  }> {
    try {
      const scriptResponse = await fetch(`${this.scriptManagerUrl}/find-matching-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_query: userQuery,
          intent: intent
        })
      })

      const scriptResult = await scriptResponse.json()
      
      if (scriptResult.success && scriptResult.data) {
        return {
          script: scriptResult.data,
          confidence: 0.9,
          source: 'knowledge_base'
        }
      }

      return {
        script: null,
        confidence: 0.0,
        source: 'fallback'
      }

    } catch (error) {
      console.error('知識庫查詢失敗:', error)
      return {
        script: null,
        confidence: 0.0,
        source: 'error'
      }
    }
  }

  async generateDynamicResponse(script: any, context: any): Promise<string> {
    try {
      let response = script.script_content

      if (script.script_type === 'TEMPLATE' && script.variables) {
        for (const [key, value] of Object.entries(script.variables)) {
          const placeholder = `{{${key}}}`
          if (response.includes(placeholder)) {
            switch (key) {
              case 'store_list':
                response = response.replace(placeholder, await this.generateStoreList(context.stores))
                break
              case 'user_name':
                response = response.replace(placeholder, context.userName || '朋友')
                break
              case 'current_time':
                response = response.replace(placeholder, new Date().toLocaleString('zh-TW'))
                break
              default:
                response = response.replace(placeholder, String(value))
            }
          }
        }
      }

      return response

    } catch (error) {
      console.error('動態回應生成失敗:', error)
      return script.script_content
    }
  }

  private async generateStoreList(stores: any[]): Promise<string> {
    if (!stores || stores.length === 0) {
      return '目前沒有找到相關商家'
    }

    let storeList = ''
    stores.slice(0, 5).forEach((store, index) => {
      const partnerTag = store.is_partner_store ? ' [特約商家]' : ''
      const tierTag = store.sponsorship_tier > 0 ? ` [贊助等級 ${store.sponsorship_tier}]` : ''
      
      storeList += `${index + 1}. **${store.store_name}**${partnerTag}${tierTag}\n`
      storeList += `   📍 ${store.address || '地址待確認'}\n`
      storeList += `   🏷️ ${store.category}\n`
      if (store.rating && store.rating > 0) {
        storeList += `   ⭐ 評分：${store.rating}/5\n`
      }
      storeList += '\n'
    })

    return storeList
  }

  async logScriptUsage(data: any) {
    try {
      await fetch(`${this.scriptManagerUrl}/usage-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error('記錄腳本使用情況失敗:', error)
    }
  }
}

class ClaudeChatV3Service {
  private supabase: any
  private knowledgeBase: KnowledgeBaseService

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.knowledgeBase = new KnowledgeBaseService(supabaseUrl, supabaseKey)
  }

  async processMessage(sessionId: string, message: string, userMeta?: any): Promise<any> {
    const startTime = Date.now()

    console.log(`[ClaudeChatV3] 處理消息開始: ${message.substring(0, 50)}...`)

    try {
      const intentResult = this.classifyIntent(message)
      console.log(`[V3] 識別意圖: ${intentResult.intent} (信心度: ${intentResult.confidence})`)

      const knowledgeResult = await this.knowledgeBase.findBestResponseScript(message, intentResult.intent)
      console.log(`[V3] 知識庫查詢: ${knowledgeResult.source}, 信心度: ${knowledgeResult.confidence}`)

      let response: string
      let scriptUsed: any = null

      if (knowledgeResult.script && knowledgeResult.confidence > 0.5) {
        scriptUsed = knowledgeResult.script
        
        let stores: any[] = []
        if (intentResult.intent === 'FOOD') {
          stores = await this.getFoodStores()
        }

        response = await this.knowledgeBase.generateDynamicResponse(
          knowledgeResult.script,
          { stores, userName: userMeta?.display_name }
        )

        await this.knowledgeBase.logScriptUsage({
          script_id: knowledgeResult.script.id,
          session_id: sessionId,
          user_query: message,
          matched_intent: intentResult.intent,
          response_generated: response,
          execution_time_ms: Date.now() - startTime,
          success: true
        })

      } else {
        const recommendationResult = await this.generateRecommendations(intentResult.intent, message)
        response = this.generateResponse(intentResult.intent, recommendationResult.stores, message, recommendationResult.needsFallback, recommendationResult.fallbackMessage)
      }

      const processingTime = Date.now() - startTime

      console.log(`[V3] 處理完成: ${response.length} 字符, 腳本: ${scriptUsed?.script_name || '無'}`)

      return {
        response,
        session_id: sessionId,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        recommended_stores: [],
        recommendation_logic: {
          knowledge_base_used: !!knowledgeResult.script,
          script_source: knowledgeResult.source,
          script_confidence: knowledgeResult.confidence
        },
        version: 'WEN 1.4.0-V3',
        processing_time: processingTime,
        script_used: scriptUsed
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error('[V3] 處理失敗:', error)

      return {
        response: '抱歉，我暫時無法處理您的請求。請稍後再試。',
        session_id: sessionId,
        intent: 'ERROR',
        confidence: 0,
        recommended_stores: [],
        recommendation_logic: { error: error.message },
        version: 'WEN 1.4.0-V3',
        processing_time: processingTime
      }
    }
  }

  private classifyIntent(message: string): any {
    const messageLower = message.toLowerCase()
    
    if (messageLower.includes('美食') || messageLower.includes('餐廳') || messageLower.includes('吃飯')) {
      return { intent: 'FOOD', confidence: 0.9, subcategory: undefined }
    }
    
    if (messageLower.includes('英語') || messageLower.includes('美語') || messageLower.includes('補習班')) {
      return { intent: 'ENGLISH_LEARNING', confidence: 0.9, subcategory: undefined }
    }
    
    if (messageLower.includes('停車') || messageLower.includes('停車場')) {
      return { intent: 'PARKING', confidence: 0.8, subcategory: undefined }
    }
    
    if (messageLower.includes('你好') || messageLower.includes('嗨') || messageLower.includes('哈囉')) {
      return { intent: 'VAGUE_CHAT', confidence: 0.7, subcategory: undefined }
    }
    
    return { intent: 'GENERAL', confidence: 0.6, subcategory: undefined }
  }

  private async getFoodStores(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('stores')
        .select('id, store_name, category, address, approval, is_partner_store, sponsorship_tier, rating, store_code, features, business_hours')
        .eq('approval', 'approved')
        .eq('category', '餐飲美食')
        .order('is_partner_store', { ascending: false })
        .order('sponsorship_tier', { ascending: false })
        .order('rating', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('獲取美食商家失敗:', error)
      return []
    }
  }

  private async generateRecommendations(intent: string, message: string): Promise<any> {
    if (intent === 'FOOD') {
      const stores = await this.getFoodStores()
      return {
        stores: stores.slice(0, 5),
        needsFallback: stores.length === 0,
        fallbackMessage: '抱歉，沒有找到符合您需求的美食推薦。目前資料庫中尚未收錄這類店家，歡迎推薦我們新增喔～ 😊'
      }
    }
    
    return {
      stores: [],
      needsFallback: true,
      fallbackMessage: '抱歉，我暫時無法處理您的請求。'
    }
  }

  private generateResponse(intent: string, stores: any[], message: string, needsFallback: boolean, fallbackMessage?: string): string {
    if (needsFallback && fallbackMessage) {
      return fallbackMessage
    }

    if (intent === 'FOOD' && stores.length > 0) {
      let response = '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：\n\n'
      
      stores.forEach((store, index) => {
        const partnerTag = store.is_partner_store ? ' [特約商家]' : ''
        const tierTag = store.sponsorship_tier > 0 ? ` [贊助等級 ${store.sponsorship_tier}]` : ''
        
        response += `${index + 1}. **${store.store_name}**${partnerTag}${tierTag}\n`
        response += `   📍 ${store.address || '地址待確認'}\n`
        response += `   🏷️ ${store.category}\n`
        if (store.rating && store.rating > 0) {
          response += `   ⭐ 評分：${store.rating}/5\n`
        }
        response += '\n'
      })
      
      response += '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～\n\n---\n*WEN 1.4.0-V3*'
      return response
    }

    return '嘿！我是高文文，很高興為你服務！有什麼想知道的嗎？我對文山特區超熟的！'
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      throw new Error('Invalid JSON in request body')
    }

    const { session_id, message, user_meta } = requestData

    console.log('[ClaudeChatV3] 收到請求:', {
      message: message.content.substring(0, 50),
      session_id
    })

    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

    const service = new ClaudeChatV3Service(supabaseUrl, supabaseKey)

    const currentSessionId = session_id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const result = await service.processMessage(currentSessionId, message.content, user_meta)

    console.log('[ClaudeChatV3] 處理完成:', {
      intent: result.intent,
      version: result.version,
      processingTime: result.processing_time,
      scriptUsed: result.script_used?.script_name || '無'
    })

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[ClaudeChatV3] 錯誤:', error)

    const errorResponse = {
      error: {
        code: 'CLAUDE_CHAT_V3_ERROR',
        message: error.message || '聊天服務暫時無法使用'
      },
      version: 'WEN 1.4.0-V3'
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})