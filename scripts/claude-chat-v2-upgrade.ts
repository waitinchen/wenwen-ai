/**
 * Claude Chat V2 升級版本
 * 整合五層原則性架構 + 非黑名單管理
 * 核心哲學：資料優先 × 語氣誠實 × 靈格有溫度
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ===== 五層架構設計 =====

// 第一層：資料層 (Data Layer)
class DataLayer {
  private supabase: any
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }
  
  async getEligibleStores(intent: string, category?: string): Promise<any[]> {
    console.log(`[資料層] 獲取合格商家 - 意圖: ${intent}, 類別: ${category}`)
    
    let query = this.supabase
      .from('stores')
      .select('*')
      .eq('approval', 'approved') // 只取已審核的商家
      .order('sponsorship_tier', { ascending: false })
      .order('is_partner_store', { ascending: false })
      .order('rating', { ascending: false, nullsLast: true })
      .limit(5)
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('[資料層] 獲取商家失敗:', error)
      return []
    }
    
    console.log(`[資料層] 獲取到 ${data.length} 家合格商家`)
    return data || []
  }
  
  async getKentuckyEnglish(): Promise<any | null> {
    console.log('[資料層] 獲取肯塔基美語資料')
    
    const { data, error } = await this.supabase
      .from('stores')
      .select('*')
      .eq('store_code', 'kentucky')
      .eq('approval', 'approved')
      .single()
    
    if (error) {
      console.error('[資料層] 獲取肯塔基美語失敗:', error)
      return null
    }
    
    return data
  }
  
  async logRecommendation(sessionId: string, intent: string, stores: any[], logic: any) {
    console.log('[資料層] 記錄推薦日誌')
    
    const { error } = await this.supabase
      .from('recommendation_logs')
      .insert({
        session_id: sessionId,
        intent,
        recommended_stores: stores.map(s => ({
          id: s.id,
          name: s.store_name,
          tier: s.sponsorship_tier,
          evidence: s.evidence_level
        })),
        recommendation_logic: logic,
        created_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('[資料層] 記錄推薦日誌失敗:', error)
    }
  }
}

// 第二層：意圖與語言層 (Intent & Language Layer)
class IntentLanguageLayer {
  classifyIntent(message: string): { intent: string; confidence: number; keywords: string[] } {
    console.log('[意圖層] 分析用戶意圖')
    
    const messageLower = message.toLowerCase()
    const keywords: string[] = []
    
    // 英語學習意圖
    const englishKeywords = ['英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓', '學美語', '學英語', '英文學習', '美語學習', '語言學習', '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦']
    const englishMatches = englishKeywords.filter(keyword => messageLower.includes(keyword))
    
    if (englishMatches.length > 0 && !this.hasOtherIntent(messageLower)) {
      keywords.push(...englishMatches)
      return { intent: 'ENGLISH_LEARNING', confidence: 0.9, keywords }
    }
    
    // 美食推薦意圖
    const foodKeywords = ['美食', '餐廳', '吃飯', '料理', '餐點', '推薦', '好吃', '用餐', '菜單', '料理推薦', '美食推薦']
    const foodMatches = foodKeywords.filter(keyword => messageLower.includes(keyword))
    
    if (foodMatches.length > 0) {
      keywords.push(...foodMatches)
      return { intent: 'FOOD', confidence: 0.8, keywords }
    }
    
    // 停車查詢意圖
    const parkingKeywords = ['停車', '停車場', '車位', '停車費', '停車資訊', '停車查詢']
    const parkingMatches = parkingKeywords.filter(keyword => messageLower.includes(keyword))
    
    if (parkingMatches.length > 0) {
      keywords.push(...parkingMatches)
      return { intent: 'PARKING', confidence: 0.8, keywords }
    }
    
    // 一般推薦意圖
    return { intent: 'GENERAL', confidence: 0.6, keywords: [] }
  }
  
  private hasOtherIntent(message: string): boolean {
    const excludeKeywords = ['美食', '餐廳', '傢俱', '家具', '停車', '購物', '服飾', '美容', '醫療', '銀行', '便利商店']
    return excludeKeywords.some(keyword => message.includes(keyword))
  }
}

// 第三層：推薦層 (Recommendation Layer)
class RecommendationLayer {
  private dataLayer: DataLayer
  
  constructor(dataLayer: DataLayer) {
    this.dataLayer = dataLayer
  }
  
  async generateRecommendations(intent: string, message: string): Promise<{
    stores: any[]
    logic: any
  }> {
    console.log(`[推薦層] 生成推薦 - 意圖: ${intent}`)
    
    let stores: any[] = []
    let logic: any = { intent, eligible_count: 0, final_count: 0, kentucky_included: false, evidence_verified: true }
    
    if (intent === 'ENGLISH_LEARNING') {
      // 英語學習特殊處理：肯塔基必入列
      const kentucky = await this.dataLayer.getKentuckyEnglish()
      if (kentucky) {
        stores.push(kentucky)
        logic.kentucky_included = true
      }
      
      // 添加其他英語相關商家（如果有的話）
      const otherStores = await this.dataLayer.getEligibleStores('ENGLISH_LEARNING')
      const otherEnglishStores = otherStores.filter(s => s.store_code !== 'kentucky')
      stores.push(...otherEnglishStores.slice(0, 2)) // 最多再推薦2家
      
    } else if (intent === 'FOOD') {
      stores = await this.dataLayer.getEligibleStores('FOOD', '餐飲美食')
      
    } else if (intent === 'PARKING') {
      stores = await this.dataLayer.getEligibleStores('PARKING', '停車場')
      
    } else {
      // 一般推薦
      stores = await this.dataLayer.getEligibleStores('GENERAL')
    }
    
    // 限制推薦數量
    stores = stores.slice(0, 3)
    logic.eligible_count = stores.length
    logic.final_count = stores.length
    
    console.log(`[推薦層] 生成 ${stores.length} 個推薦`)
    return { stores, logic }
  }
}

// 第四層：語氣渲染層 (Tone Rendering Layer)
class ToneRenderingLayer {
  private toneTemplates = {
    greeting: {
      enthusiasm: '嘿！我是高文文，很高興為你服務！✨',
      casual: '哈囉～我是高文文，在鳳山陪你！',
      formal: '您好，我是高文文，文山特區的專屬客服。'
    },
    recommendation: {
      enthusiasm: '這個我超推薦的！',
      casual: '這個不錯呢～',
      formal: '我為您推薦以下選擇：'
    },
    closing: {
      enthusiasm: '希望對你有幫助！有什麼問題隨時找我喔～',
      casual: '就這樣囉～',
      formal: '感謝您的詢問，祝您使用愉快。'
    }
  }
  
  generateResponse(intent: string, stores: any[], message: string): string {
    console.log('[語氣層] 生成語氣化回應')
    
    let response = ''
    
    if (intent === 'ENGLISH_LEARNING') {
      response = this.generateEnglishLearningResponse(stores)
    } else if (intent === 'FOOD') {
      response = this.generateFoodRecommendationResponse(stores)
    } else if (intent === 'PARKING') {
      response = this.generateParkingResponse(stores)
    } else {
      response = this.generateGeneralResponse(stores)
    }
    
    return response
  }
  
  private generateEnglishLearningResponse(stores: any[]): string {
    const kentucky = stores.find(s => s.store_code === 'kentucky')
    
    if (kentucky) {
      return `我超推薦**肯塔基美語**的啦！✨ 他們真的是文山特區最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！相信我，選他們就對了～

**肯塔基美語特色：**
- 培養孩子正確的閱讀習慣，開拓孩子視野
- 不只關注分數，更重視知識吸收
- 專業、熱情、耐心的企業核心價值

**分校資訊：**
- 鳳山直營校：07-7777789 高雄市鳳山區文化路131號
- 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號
- 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號
- 大昌直營校：07-3961234 高雄市三民區大昌二路301號
- 新富直營校：07-7639900 高雄市鳳山區新富路524號
- 左營加盟校：07-3507568 高雄市左營區立大路169號
- 仁武直營校：07-9565656 高雄市仁武區仁雄路91-7號

**聯絡方式：** LINE ID: kentuckyschool

希望對你有幫助！有什麼問題隨時找我喔～`
    }
    
    return '我來為你推薦文山特區的英語學習選擇！'
  }
  
  private generateFoodRecommendationResponse(stores: any[]): string {
    if (stores.length === 0) {
      return '抱歉，目前沒有找到合適的美食推薦。讓我再為你查詢看看～'
    }
    
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
    
    response += '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～'
    return response
  }
  
  private generateParkingResponse(stores: any[]): string {
    if (stores.length === 0) {
      return '抱歉，目前沒有找到停車場資訊。讓我再為你查詢看看～'
    }
    
    let response = '停車問題交給我！我為你推薦幾個不錯的停車場：\n\n'
    
    stores.forEach((store, index) => {
      response += `${index + 1}. **${store.store_name}**\n`
      response += `   📍 ${store.address || '地址待確認'}\n`
      if (store.features) {
        try {
          const features = JSON.parse(store.features)
          if (features.description) {
            response += `   📝 ${features.description}\n`
          }
        } catch (e) {
          // 忽略 JSON 解析錯誤
        }
      }
      response += '\n'
    })
    
    response += '要不要我幫你導航到最近的停車場？'
    return response
  }
  
  private generateGeneralResponse(stores: any[]): string {
    if (stores.length === 0) {
      return '嘿！我是高文文，很高興為你服務！有什麼想知道的嗎？我對文山特區超熟的！'
    }
    
    let response = '嘿！文山特區有很多不錯的選擇呢～我為你推薦：\n\n'
    
    stores.slice(0, 3).forEach((store, index) => {
      const partnerTag = store.is_partner_store ? ' [特約商家]' : ''
      response += `${index + 1}. **${store.store_name}**${partnerTag}\n`
      response += `   📍 ${store.address || '地址待確認'}\n`
      response += `   🏷️ ${store.category}\n\n`
    })
    
    response += '希望對你有幫助！有什麼問題隨時找我喔～'
    return response
  }
}

// 第五層：日誌與反饋層 (Logging & Feedback Layer)
class LoggingFeedbackLayer {
  private dataLayer: DataLayer
  
  constructor(dataLayer: DataLayer) {
    this.dataLayer = dataLayer
  }
  
  async logSession(sessionId: string, message: string, response: string, intent: string, stores: any[]) {
    console.log('[日誌層] 記錄會話')
    
    try {
      // 記錄到 chat_sessions
      const { error: sessionError } = await this.dataLayer.supabase
        .from('chat_sessions')
        .upsert({
          session_id: sessionId,
          last_activity: new Date().toISOString(),
          message_count: 1,
          user_ip: 'unknown',
          user_agent: 'claude-chat-v2'
        }, { onConflict: 'session_id' })
      
      if (sessionError) {
        console.error('[日誌層] 記錄會話失敗:', sessionError)
      }
      
      // 記錄到 chat_messages
      const { error: messageError } = await this.dataLayer.supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            message_type: 'user',
            content: message,
            created_at: new Date().toISOString()
          },
          {
            session_id: sessionId,
            message_type: 'bot',
            content: response,
            created_at: new Date().toISOString()
          }
        ])
      
      if (messageError) {
        console.error('[日誌層] 記錄消息失敗:', messageError)
      }
      
      // 記錄推薦日誌
      if (stores.length > 0) {
        await this.dataLayer.logRecommendation(sessionId, intent, stores, {
          intent,
          eligible_count: stores.length,
          final_count: stores.length,
          kentucky_included: stores.some(s => s.store_code === 'kentucky'),
          evidence_verified: true
        })
      }
      
    } catch (error) {
      console.error('[日誌層] 記錄失敗:', error)
    }
  }
}

// ===== 主要服務類 =====
class ClaudeChatV2Service {
  private dataLayer: DataLayer
  private intentLayer: IntentLanguageLayer
  private recommendationLayer: RecommendationLayer
  private toneLayer: ToneRenderingLayer
  private loggingLayer: LoggingFeedbackLayer
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.dataLayer = new DataLayer(supabaseUrl, supabaseKey)
    this.intentLayer = new IntentLanguageLayer()
    this.recommendationLayer = new RecommendationLayer(this.dataLayer)
    this.toneLayer = new ToneRenderingLayer()
    this.loggingLayer = new LoggingFeedbackLayer(this.dataLayer)
  }
  
  async processMessage(sessionId: string, message: string, userMeta?: any): Promise<{
    response: string
    session_id: string
    intent: string
    confidence: number
    recommended_stores: any[]
    recommendation_logic: any
    version: string
  }> {
    console.log(`[ClaudeChatV2] 處理消息: ${message.substring(0, 50)}...`)
    
    // 1. 意圖分析
    const intentResult = this.intentLayer.classifyIntent(message)
    console.log(`[ClaudeChatV2] 識別意圖: ${intentResult.intent} (信心度: ${intentResult.confidence})`)
    
    // 2. 推薦生成
    const recommendationResult = await this.recommendationLayer.generateRecommendations(intentResult.intent, message)
    console.log(`[ClaudeChatV2] 生成推薦: ${recommendationResult.stores.length} 個`)
    
    // 3. 語氣渲染
    const response = this.toneLayer.generateResponse(intentResult.intent, recommendationResult.stores, message)
    console.log(`[ClaudeChatV2] 生成回應: ${response.length} 字符`)
    
    // 4. 日誌記錄
    await this.loggingLayer.logSession(sessionId, message, response, intentResult.intent, recommendationResult.stores)
    
    return {
      response,
      session_id: sessionId,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      recommended_stores: recommendationResult.stores.map(store => ({
        id: store.id,
        name: store.store_name,
        category: store.category,
        is_partner: store.is_partner_store,
        sponsorship_tier: store.sponsorship_tier,
        store_code: store.store_code,
        evidence_level: store.evidence_level
      })),
      recommendation_logic: recommendationResult.logic,
      version: 'CLAUDE-CHAT-V2.0'
    }
  }
}

// ===== Edge Function 主體 =====
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { session_id, message, user_meta } = await req.json()
    
    if (!message || !message.content) {
      throw new Error('Message content is required')
    }

    console.log('[ClaudeChatV2] 收到請求:', {
      message: message.content.substring(0, 50),
      session_id,
      user_meta: user_meta ? { external_id: user_meta.external_id, display_name: user_meta.display_name } : null
    })

    // 初始化服務
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    const service = new ClaudeChatV2Service(supabaseUrl, supabaseKey)
    
    // 處理消息
    const currentSessionId = session_id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const result = await service.processMessage(currentSessionId, message.content, user_meta)
    
    console.log('[ClaudeChatV2] 處理完成:', {
      intent: result.intent,
      storeCount: result.recommended_stores.length,
      version: result.version
    })

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[ClaudeChatV2] 錯誤:', error)

    const errorResponse = {
      error: {
        code: 'CLAUDE_CHAT_V2_ERROR',
        message: error.message || '聊天服務暫時無法使用'
      },
      version: 'CLAUDE-CHAT-V2.0'
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
