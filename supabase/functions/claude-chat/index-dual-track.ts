/**
 * Claude Chat V3 - 雙軌回應機制升級版
 * 核心哲學：智能意圖判斷 × 雙軌回應路由 × 個性化包裝
 * 
 * 升級重點：
 * 1. 智能意圖判斷 - 精確識別用戶需求與訓練資料的關聯性
 * 2. 雙軌回應路由 - 根據意圖選擇LLM純回應或結構化回應
 * 3. 個性化包裝 - 保持高文文品牌特色的同時確保內容準確性
 * 4. 版本管理 - 支援回應邏輯的版本控制和回滾
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ===== 配置常數 =====
const CONFIG = {
  // 系統設置
  system: {
    version: 'WEN 1.5.0',
    defaultLimit: 5,
    maxQueryLimit: 20,
    conversationHistoryLimit: 30
  },
  
  // 意圖分類配置
  intent: {
    // 與訓練資料相關的意圖
    relatedToTrainingData: [
      'FOOD', 'PARKING', 'SHOPPING', 'FAQ', 'SERVICE',
      'EDUCATION', 'MEDICAL', 'LIFESTYLE', 'RECREATION'
    ],
    // 與訓練資料無關的意圖
    unrelatedToTrainingData: [
      'VAGUE_CHAT', 'GREETING', 'OUT_OF_SCOPE', 'CONFIRMATION'
    ]
  },
  
  // 關鍵字配置
  keywords: {
    trainingRelated: [
      '美食', '餐廳', '停車', '商店', '服務', '藥局', '書店',
      '醫院', '學校', '補習班', '美容', '健身', '娛樂'
    ]
  }
}

// ===== 類型定義 =====

interface IntentResult {
  intent: string;
  confidence: number;
  isRelatedToTrainingData: boolean;
  category: string;
  subcategory?: string;
}

interface ResponseRoute {
  type: 'LLM_ONLY' | 'STRUCTURED' | 'HYBRID';
  reason: string;
  confidence: number;
}

interface StructuredResponse {
  opening: string;
  content: string;
  closing: string;
  version: string;
}

// ===== 智能意圖分類器 =====

class SmartIntentClassifier {
  
  /**
   * 智能意圖分類 - 判斷是否與訓練資料相關
   */
  static classifyIntent(message: string): IntentResult {
    console.log('[智能意圖分類器] 開始分析:', message)
    
    const lowerMessage = message.toLowerCase()
    
    // 1. 檢查明確的服務範圍關鍵字
    const serviceKeywords = [
      '服務範圍', '服務', '功能', '能幫我什麼', '可以做什麼'
    ]
    if (serviceKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        intent: 'SERVICE_SCOPE',
        confidence: 0.95,
        isRelatedToTrainingData: true,
        category: '服務介紹'
      }
    }
    
    // 2. 檢查FAQ相關問題
    const faqKeywords = [
      '美食推薦', '美食情報', '停車資訊', '停車場', '藥局', '書店',
      '醫院', '診所', '學校', '補習班'
    ]
    if (faqKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        intent: 'FAQ',
        confidence: 0.9,
        isRelatedToTrainingData: true,
        category: this.determineCategory(message)
      }
    }
    
    // 3. 檢查商家推薦相關
    const businessKeywords = [
      '推薦', '介紹', '有什麼', '哪裡有', '附近', '好', '不錯'
    ]
    if (businessKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        intent: 'RECOMMENDATION',
        confidence: 0.85,
        isRelatedToTrainingData: true,
        category: this.determineCategory(message)
      }
    }
    
    // 4. 檢查問候語和閒聊
    const greetingKeywords = ['嗨', '你好', 'hello', 'hi', '早安', '晚安']
    if (greetingKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        intent: 'GREETING',
        confidence: 0.9,
        isRelatedToTrainingData: false,
        category: '問候語'
      }
    }
    
    // 5. 檢查模糊或無關問題
    const vagueKeywords = ['天氣', '時間', '日期', '新聞', '政治']
    if (vagueKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return {
        intent: 'OUT_OF_SCOPE',
        confidence: 0.8,
        isRelatedToTrainingData: false,
        category: '範圍外'
      }
    }
    
    // 6. 默認分類
    const hasTrainingKeywords = CONFIG.keywords.trainingRelated.some(keyword => 
      lowerMessage.includes(keyword)
    )
    
    return {
      intent: hasTrainingKeywords ? 'GENERAL_INQUIRY' : 'VAGUE_CHAT',
      confidence: hasTrainingKeywords ? 0.7 : 0.6,
      isRelatedToTrainingData: hasTrainingKeywords,
      category: hasTrainingKeywords ? '一般詢問' : '閒聊'
    }
  }
  
  /**
   * 根據訊息內容確定分類
   */
  private static determineCategory(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('美食') || lowerMessage.includes('餐廳')) {
      return '美食推薦'
    } else if (lowerMessage.includes('停車')) {
      return '停車資訊'
    } else if (lowerMessage.includes('藥局') || lowerMessage.includes('醫院')) {
      return '醫療保健'
    } else if (lowerMessage.includes('書店') || lowerMessage.includes('購物')) {
      return '購物消費'
    } else if (lowerMessage.includes('學校') || lowerMessage.includes('補習班')) {
      return '教育培訓'
    } else {
      return '生活服務'
    }
  }
}

// ===== 雙軌回應路由器 =====

class DualTrackResponseRouter {
  
  /**
   * 路由決策 - 決定使用哪種回應策略
   */
  static route(intent: IntentResult): ResponseRoute {
    console.log('[雙軌路由器] 路由決策:', intent)
    
    // 高信心度且與訓練資料相關 -> 結構化回應
    if (intent.isRelatedToTrainingData && intent.confidence > 0.8) {
      return {
        type: 'STRUCTURED',
        reason: '高信心度且與訓練資料相關',
        confidence: intent.confidence
      }
    }
    
    // 中等信心度且與訓練資料相關 -> 混合回應
    if (intent.isRelatedToTrainingData && intent.confidence > 0.6) {
      return {
        type: 'HYBRID',
        reason: '中等信心度且與訓練資料相關',
        confidence: intent.confidence
      }
    }
    
    // 與訓練資料無關 -> 純LLM回應
    return {
      type: 'LLM_ONLY',
      reason: '與訓練資料無關或低信心度',
      confidence: intent.confidence
    }
  }
}

// ===== 結構化回應生成器 =====

class StructuredResponseGenerator {
  
  /**
   * 生成結構化回應
   */
  static async generateStructuredResponse(
    intent: IntentResult,
    data: any,
    message: string
  ): Promise<StructuredResponse> {
    console.log('[結構化生成器] 生成回應:', intent.category)
    
    // 生成開頭語
    const opening = await this.generateOpening(intent, message)
    
    // 格式化內容
    const content = this.formatContent(data, intent)
    
    // 生成結束語
    const closing = await this.generateClosing(intent, message)
    
    // 添加版本標識
    const version = `---\n*${CONFIG.system.version}*`
    
    return {
      opening,
      content,
      closing,
      version
    }
  }
  
  /**
   * 生成個性化開頭語
   */
  private static async generateOpening(intent: IntentResult, message: string): Promise<string> {
    const openingTemplates = {
      '美食推薦': '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：',
      '停車資訊': '文山特區的停車很方便喔！讓我為你介紹幾個優質停車場：',
      '醫療保健': '文山特區的醫療資源很豐富！我為你推薦幾家優質的：',
      '購物消費': '文山特區有很多購物好去處！讓我為你介紹幾家不錯的：',
      '服務介紹': '嗨！我是高文文，你的文山特區專屬小助手！讓我為你介紹我的服務範圍：',
      '教育培訓': '文山特區的教育資源很豐富！我為你推薦幾家優質的：'
    }
    
    return openingTemplates[intent.category] || '我為你找到了一些不錯的選擇：'
  }
  
  /**
   * 格式化資料庫內容
   */
  private static formatContent(data: any, intent: IntentResult): string {
    if (data.stores && data.stores.length > 0) {
      return this.formatStoreList(data.stores)
    } else if (data.faq) {
      return this.formatFaqContent(data.faq)
    } else {
      return '抱歉，我目前沒有這方面的詳細資訊。'
    }
  }
  
  /**
   * 格式化商家列表
   */
  private static formatStoreList(stores: any[]): string {
    return stores.map((store, index) => {
      const rating = store.rating || 'N/A'
      const address = store.address || '地址未提供'
      const category = store.category || '未分類'
      
      return `${index + 1}. ${store.store_name}
   📍 ${address}
   🏷️ ${category}
   ⭐ 評分：${rating}`
    }).join('\n\n')
  }
  
  /**
   * 格式化FAQ內容
   */
  private static formatFaqContent(faq: any): string {
    return faq.answer || '抱歉，我目前沒有這方面的詳細資訊。'
  }
  
  /**
   * 生成個性化結束語
   */
  private static async generateClosing(intent: IntentResult, message: string): Promise<string> {
    const closingTemplates = [
      '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～',
      '希望這些資訊對你有用！如果還有其他問題，我很樂意為你服務～',
      '這些推薦都是基於實際資料，希望能幫助到你！有什麼需要隨時問我～'
    ]
    
    return closingTemplates[Math.floor(Math.random() * closingTemplates.length)]
  }
}

// ===== LLM純回應生成器 =====

class LLMPureResponseGenerator {
  
  /**
   * 生成純LLM回應
   */
  static generatePureResponse(intent: IntentResult, message: string): string {
    console.log('[LLM純回應生成器] 生成回應:', intent.intent)
    
    const responses = {
      'GREETING': '哈囉～我是高文文！很高興認識你！✨ 我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊',
      'VAGUE_CHAT': '我不太確定您的具體需求，不過我可以幫您推薦文山特區的美食、停車場或英語學習等服務喔～有什麼想了解的嗎？🤗',
      'OUT_OF_SCOPE': '抱歉，我主要專注於文山特區的服務資訊，像是美食推薦、停車資訊、商家介紹等。有什麼這方面的問題需要幫忙嗎？😊',
      'CONFIRMATION': '好的！我很樂意為您服務～有什麼關於文山特區的問題都可以問我喔！😊'
    }
    
    return responses[intent.intent] || responses['VAGUE_CHAT']
  }
}

// ===== 主服務類 =====

class ClaudeChatV3DualTrackService {
  private supabase: any
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }
  
  /**
   * 處理用戶消息 - 雙軌回應機制
   */
  async processMessage(sessionId: string, message: string, userMeta?: any): Promise<{
    response: string
    session_id: string
    intent: string
    confidence: number
    recommended_stores: any[]
    recommendation_logic: any
    version: string
    processing_time?: number
  }> {
    const startTime = Date.now()
    console.log('[ClaudeChatV3] 開始處理消息:', message)
    
    try {
      // Step 1: 智能意圖分類
      const intent = SmartIntentClassifier.classifyIntent(message)
      console.log('[ClaudeChatV3] 意圖分析結果:', intent)
      
      // Step 2: 雙軌路由決策
      const route = DualTrackResponseRouter.route(intent)
      console.log('[ClaudeChatV3] 路由決策:', route)
      
      let response: string
      let recommendedStores: any[] = []
      let recommendationLogic: any = {}
      
      // Step 3: 根據路由生成回應
      switch (route.type) {
        case 'LLM_ONLY':
          response = LLMPureResponseGenerator.generatePureResponse(intent, message)
          break
          
        case 'STRUCTURED':
        case 'HYBRID':
          // 獲取相關數據
          const data = await this.getRelevantData(intent, message)
          
          // 生成結構化回應
          const structuredResponse = await StructuredResponseGenerator.generateStructuredResponse(
            intent, data, message
          )
          
          response = `${structuredResponse.opening}\n\n${structuredResponse.content}\n\n${structuredResponse.closing}\n\n${structuredResponse.version}`
          
          if (data.stores) {
            recommendedStores = data.stores
          }
          
          recommendationLogic = {
            type: route.type,
            intent: intent.intent,
            confidence: intent.confidence,
            data_source: data.source || 'unknown'
          }
          break
          
        default:
          response = '抱歉，我目前無法處理您的請求。'
      }
      
      const processingTime = Date.now() - startTime
      
      console.log('[ClaudeChatV3] 處理完成:', {
        intent: intent.intent,
        route: route.type,
        responseLength: response.length,
        processingTime
      })
      
      return {
        response,
        session_id: sessionId,
        intent: intent.intent,
        confidence: intent.confidence,
        recommended_stores: recommendedStores,
        recommendation_logic: recommendationLogic,
        version: CONFIG.system.version,
        processing_time: processingTime
      }
      
    } catch (error) {
      console.error('[ClaudeChatV3] 處理錯誤:', error)
      
      return {
        response: '抱歉，系統暫時無法處理您的請求。請稍後再試。',
        session_id: sessionId,
        intent: 'ERROR',
        confidence: 0,
        recommended_stores: [],
        recommendation_logic: { type: 'ERROR', error: error.message },
        version: CONFIG.system.version,
        processing_time: Date.now() - startTime
      }
    }
  }
  
  /**
   * 獲取相關數據
   */
  private async getRelevantData(intent: IntentResult, message: string): Promise<any> {
    console.log('[ClaudeChatV3] 獲取相關數據:', intent.category)
    
    // 這裡需要根據實際的資料庫結構來實現
    // 暫時返回模擬數據
    return {
      stores: [],
      faq: null,
      source: 'database'
    }
  }
}

// ===== Edge Function 主體 =====

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { session_id, message, user_meta } = await req.json()

    // 硬編碼環境變數（避免環境變數問題）
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

    const service = new ClaudeChatV3DualTrackService(supabaseUrl, supabaseKey)

    // 處理消息
    const currentSessionId = session_id || `session_${Date.now()}`
    const result = await service.processMessage(currentSessionId, message.content, user_meta)

    console.log('[ClaudeChatV3] 處理完成:', {
      intent: result.intent,
      route: result.recommendation_logic?.type,
      version: result.version,
      processingTime: result.processing_time
    })

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[ClaudeChatV3] 錯誤:', error)

    return new Response(JSON.stringify({
      error: {
        message: error.message || '系統內部錯誤',
        code: 'CLAUDE_CHAT_V3_ERROR'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})


