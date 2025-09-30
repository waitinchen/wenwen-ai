/**
 * Claude Chat V3 - 全面性原則性回應策略
 * 核心哲學：通用原則 × 智能分層 × 透明化回應
 * 
 * 設計原則：
 * 1. 意圖分類層級化 - 特定實體 > 類別查詢 > 模糊查詢 > 範圍外查詢
 * 2. 回應策略矩陣化 - 根據意圖類型選擇最佳回應策略
 * 3. 透明化說明 - 找不到時明確說明原因並提供替代
 * 4. 一致性格式 - 統一的回應結構和語氣
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ===== 配置常數 =====
const CONFIG = {
  system: {
    version: 'WEN 1.5.0',
    defaultLimit: 5,
    maxQueryLimit: 20,
    conversationHistoryLimit: 30
  },
  
  // 意圖分類層級
  intentHierarchy: {
    'SPECIFIC_ENTITY': {
      priority: 1,
      description: '特定實體查詢',
      examples: ['丁丁連鎖藥局', '麥當勞', '肯塔基美語', 'STORY Restaurant'],
      responseStrategy: '優先查找特定實體，找不到時說明並提供替代'
    },
    'CATEGORY_QUERY': {
      priority: 2,
      description: '類別查詢',
      examples: ['有藥局嗎', '推薦餐廳', '停車資訊', '美食推薦'],
      responseStrategy: '提供該類別的所有選項'
    },
    'VAGUE_QUERY': {
      priority: 3,
      description: '模糊查詢',
      examples: ['有什麼建議', '幫幫我', '你好', '嗨'],
      responseStrategy: '引導用戶明確需求'
    },
    'OUT_OF_SCOPE': {
      priority: 4,
      description: '範圍外查詢',
      examples: ['天氣', '政治', '台北', '股票'],
      responseStrategy: '禮貌拒絕並引導到服務範圍'
    }
  }
}

// ===== 類型定義 =====
interface IntentResult {
  intent: string
  confidence: number
  keywords: string[]
  subcategory?: string
  entity?: string
  entityType?: string
  responseMode?: string
  emotion?: string
  multiIntent?: string[]
}

interface ResponseStrategy {
  type: 'SPECIFIC_ENTITY' | 'CATEGORY_QUERY' | 'VAGUE_QUERY' | 'OUT_OF_SCOPE'
  priority: number
  description: string
  responseMethod: string
}

// ===== 全面性意圖分類器 =====
class UniversalIntentClassifier {
  
  /**
   * 全面性意圖分類 - 基於層級化原則
   */
  classifyIntent(message: string, conversationHistory?: any[]): IntentResult {
    console.log('[全面性意圖分類器] 開始分析:', message)
    
    const messageLower = message.toLowerCase()
    
    // 1. 特定實體查詢檢測（最高優先級）
    const specificEntityResult = this.detectSpecificEntityQuery(messageLower)
    if (specificEntityResult.isSpecific) {
      return {
        intent: 'SPECIFIC_ENTITY',
        confidence: 0.95,
        keywords: [specificEntityResult.entity],
        subcategory: specificEntityResult.category,
        entity: specificEntityResult.entity,
        entityType: specificEntityResult.type,
        responseMode: 'specific_entity'
      }
    }
    
    // 2. 類別查詢檢測
    const categoryResult = this.detectCategoryQuery(messageLower)
    if (categoryResult.isCategory) {
      return {
        intent: 'CATEGORY_QUERY',
        confidence: 0.85,
        keywords: categoryResult.keywords,
        subcategory: categoryResult.category,
        responseMode: 'category_query'
      }
    }
    
    // 3. 模糊查詢檢測
    const vagueResult = this.detectVagueQuery(messageLower, conversationHistory)
    if (vagueResult.isVague) {
      return {
        intent: 'VAGUE_QUERY',
        confidence: 0.7,
        keywords: vagueResult.keywords,
        responseMode: 'vague_query',
        emotion: vagueResult.emotion
      }
    }
    
    // 4. 範圍外查詢檢測
    const outOfScopeResult = this.detectOutOfScopeQuery(messageLower)
    if (outOfScopeResult.isOutOfScope) {
      return {
        intent: 'OUT_OF_SCOPE',
        confidence: 0.8,
        keywords: outOfScopeResult.keywords,
        responseMode: 'out_of_scope'
      }
    }
    
    // 5. 默認一般查詢
    return {
      intent: 'GENERAL',
      confidence: 0.6,
      keywords: [],
      responseMode: 'general'
    }
  }
  
  /**
   * 檢測特定實體查詢
   */
  private detectSpecificEntityQuery(message: string): { isSpecific: boolean, entity: string, category: string, type: string } {
    // 品牌關鍵字庫（可擴展）
    const brandKeywords = {
      '藥局品牌': {
        '丁丁連鎖藥局': ['丁丁', '丁丁藥局', '丁丁連鎖'],
        '屈臣氏': ['屈臣氏', 'watsons'],
        '康是美': ['康是美', 'cosmed'],
        '大樹藥局': ['大樹', '大樹藥局'],
        '杏一藥局': ['杏一', '杏一藥局']
      },
      '餐廳品牌': {
        '麥當勞': ['麥當勞', 'mcdonalds', 'mcd'],
        '肯德基': ['肯德基', 'kfc'],
        '星巴克': ['星巴克', 'starbucks'],
        'STORY Restaurant': ['story', 'story restaurant']
      },
      '教育品牌': {
        '肯塔基美語': ['肯塔基', '肯塔基美語', 'kentucky'],
        '何嘉仁': ['何嘉仁', 'hesperian'],
        '長頸鹿美語': ['長頸鹿', '長頸鹿美語']
      },
      '停車場': {
        '鳳山車站停車場': ['鳳山車站', '鳳山車站停車場'],
        '大東文化藝術中心停車場': ['大東', '大東文化藝術中心'],
        '衛武營停車場': ['衛武營', '衛武營停車場']
      }
    }
    
    for (const [category, brands] of Object.entries(brandKeywords)) {
      for (const [brand, keywords] of Object.entries(brands)) {
        for (const keyword of keywords) {
          if (message.includes(keyword.toLowerCase())) {
            return {
              isSpecific: true,
              entity: brand,
              category: this.mapCategoryToIntent(category),
              type: this.getEntityType(category)
            }
          }
        }
      }
    }
    
    return { isSpecific: false, entity: '', category: '', type: '' }
  }
  
  /**
   * 檢測類別查詢
   */
  private detectCategoryQuery(message: string): { isCategory: boolean, keywords: string[], category: string } {
    const categoryKeywords = {
      'FOOD': ['美食', '餐廳', '吃飯', '料理', '餐點', '推薦', '好吃', '用餐'],
      'PARKING': ['停車', '停車場', '車位', '停車費', '停車資訊'],
      'MEDICAL': ['藥局', '藥房', '買藥', '診所', '看醫生', '牙醫', '看牙齒'],
      'SHOPPING': ['買衣服', '服飾店', '買鞋子', '鞋店', '買化妝品', '美妝店', '便利商店'],
      'BEAUTY': ['美髮店', '剪頭髮', '美容院', '做臉', '美甲店', '做指甲'],
      'EDUCATION': ['英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓']
    }
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => message.includes(keyword))
      if (matches.length > 0) {
        return {
          isCategory: true,
          keywords: matches,
          category: category
        }
      }
    }
    
    return { isCategory: false, keywords: [], category: '' }
  }
  
  /**
   * 檢測模糊查詢
   */
  private detectVagueQuery(message: string, conversationHistory?: any[]): { isVague: boolean, keywords: string[], emotion?: string } {
    // 問候語
    const greetingKeywords = ['你好', '嗨', '哈囉', 'hello', 'hi', 'hey', '早安', '晚安']
    const isGreeting = greetingKeywords.some(keyword => message.includes(keyword))
    
    // 模糊需求
    const vagueKeywords = ['有什麼建議', '幫幫我', '不知道', '隨便', '無聊', '沒事']
    const hasVagueKeywords = vagueKeywords.some(keyword => message.includes(keyword))
    
    // 短訊息且無特定意圖
    const isTooShort = message.length <= 3 && !this.hasSpecificIntent(message)
    
    // 情感表達
    const emotion = this.detectEmotion(message)
    
    if (isGreeting || hasVagueKeywords || isTooShort || emotion) {
      return {
        isVague: true,
        keywords: greetingKeywords.filter(k => message.includes(k)),
        emotion: emotion
      }
    }
    
    return { isVague: false, keywords: [], emotion: undefined }
  }
  
  /**
   * 檢測範圍外查詢
   */
  private detectOutOfScopeQuery(message: string): { isOutOfScope: boolean, keywords: string[] } {
    const outOfScopeKeywords = [
      '台北', '台中', '台南', '新北', '桃園', '新竹', '基隆', '嘉義', '彰化', '南投', '雲林', '屏東', '台東', '花蓮', '宜蘭', '澎湖', '金門', '馬祖',
      '投資', '股票', '基金', '保險', '貸款', '信用卡', '理財',
      '醫療診斷', '看病', '開藥', '手術', '治療', '生病', '看醫生', '診斷',
      '法律', '訴訟', '合約', '糾紛', '律師',
      '政治', '選舉', '投票', '政黨',
      '宗教', '信仰', '拜拜', '廟宇', '算命', '占卜', '風水', '命理',
      '音樂會', '演唱會', '表演', '電影', 'KTV', '遊戲',
      '天氣', '時間', '日期', '新聞'
    ]
    
    const matches = outOfScopeKeywords.filter(keyword => message.includes(keyword))
    
    return {
      isOutOfScope: matches.length > 0,
      keywords: matches
    }
  }
  
  /**
   * 檢測情感
   */
  private detectEmotion(message: string): string | undefined {
    const emotionKeywords = {
      'negative': ['心情不好', '難過', '傷心', '沮喪', '失望', '生氣', '煩躁', '焦慮', '壓力', '累', '疲憊'],
      'positive': ['開心', '高興', '興奮', '期待', '滿足', '快樂', '愉悅', '驚喜'],
      'neutral': ['無聊', '沒事', '還好', '普通', '一般', '沒什麼'],
      'curious': ['好奇', '想知道', '疑問', '困惑', '不懂', '不了解']
    }
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return emotion
      }
    }
    
    return undefined
  }
  
  /**
   * 檢查是否有特定意圖
   */
  private hasSpecificIntent(message: string): boolean {
    const specificKeywords = ['推薦', '哪裡', '什麼', '有', '找', '查', '問', '幫', '需要', '想要']
    return specificKeywords.some(keyword => message.includes(keyword))
  }
  
  /**
   * 映射類別到意圖
   */
  private mapCategoryToIntent(category: string): string {
    const mapping = {
      '藥局品牌': 'MEDICAL',
      '餐廳品牌': 'FOOD',
      '教育品牌': 'EDUCATION',
      '停車場': 'PARKING'
    }
    return mapping[category] || 'GENERAL'
  }
  
  /**
   * 獲取實體類型
   */
  private getEntityType(category: string): string {
    const mapping = {
      '藥局品牌': 'pharmacy',
      '餐廳品牌': 'restaurant',
      '教育品牌': 'education',
      '停車場': 'parking'
    }
    return mapping[category] || 'general'
  }
}

// ===== 全面性回應生成器 =====
class UniversalResponseGenerator {
  
  /**
   * 生成全面性回應
   */
  generateResponse(intentResult: IntentResult, stores: any[], message: string, needsFallback: boolean = false, fallbackMessage?: string): string {
    console.log('[全面性回應生成器] 生成回應:', intentResult.intent)
    
    // 根據意圖類型選擇回應策略
    switch (intentResult.intent) {
      case 'SPECIFIC_ENTITY':
        return this.generateSpecificEntityResponse(intentResult, stores, message)
      
      case 'CATEGORY_QUERY':
        return this.generateCategoryResponse(intentResult, stores, message, needsFallback, fallbackMessage)
      
      case 'VAGUE_QUERY':
        return this.generateVagueResponse(intentResult, message)
      
      case 'OUT_OF_SCOPE':
        return this.generateOutOfScopeResponse(intentResult, message)
      
      default:
        return this.generateGeneralResponse(stores, message)
    }
  }
  
  /**
   * 生成特定實體回應
   */
  private generateSpecificEntityResponse(intentResult: IntentResult, stores: any[], message: string): string {
    const entity = intentResult.entity!
    const category = intentResult.subcategory!
    
    // 查找特定實體
    const specificStores = stores.filter(store => 
      store.store_name && store.store_name.toLowerCase().includes(entity.toLowerCase())
    )
    
    // 查找同類別替代方案
    const alternativeStores = stores.filter(store => 
      store.category === category && 
      store.store_name && 
      !store.store_name.toLowerCase().includes(entity.toLowerCase())
    ).slice(0, 3)
    
    let content: string
    let opening: string
    let closing: string
    
    if (specificStores.length > 0) {
      // 找到特定實體
      opening = `有的！我為您找到${entity}的資訊：`
      content = this.formatStoreList(specificStores)
      closing = '希望對您有幫助！有什麼問題隨時找我喔～'
    } else {
      // 沒找到特定實體，提供替代方案
      opening = `抱歉，文山特區目前沒有找到${entity}的資料。不過我為您推薦幾家其他優質${this.getCategoryName(category)}：`
      content = alternativeStores.length > 0 ? this.formatStoreList(alternativeStores) : '目前沒有相關資料，建議您使用Google Maps查詢。'
      closing = `如果您知道有${entity}的資訊，歡迎推薦給我們新增喔～`
    }
    
    const version = `---\n*WEN 1.5.0*`
    return `${opening}\n\n${content}\n\n${closing}\n\n${version}`
  }
  
  /**
   * 生成類別查詢回應
   */
  private generateCategoryResponse(intentResult: IntentResult, stores: any[], message: string, needsFallback: boolean, fallbackMessage?: string): string {
    if (needsFallback && fallbackMessage) {
      return fallbackMessage
    }
    
    const category = intentResult.subcategory!
    const categoryName = this.getCategoryName(category)
    
    const opening = this.generateCategoryOpening(category, message)
    const content = stores.length > 0 ? this.formatStoreList(stores) : '目前沒有相關資料。'
    const closing = this.generateCategoryClosing(category)
    
    const version = `---\n*WEN 1.5.0*`
    return `${opening}\n\n${content}\n\n${closing}\n\n${version}`
  }
  
  /**
   * 生成模糊查詢回應
   */
  private generateVagueResponse(intentResult: IntentResult, message: string): string {
    const responses = {
      'greeting': '哈囉～我是高文文！很高興認識你！✨ 我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊',
      'vague_need': '我不太確定您的具體需求，不過我可以幫您推薦文山特區的美食、停車場或英語學習等服務喔～有什麼想了解的嗎？🤗',
      'bored': '無聊的話，要不要來文山特區逛逛？我可以推薦一些不錯的餐廳、咖啡廳或有趣的店家給你～有什麼想探索的嗎？🎉',
      'emotional': '聽起來你有些想法呢～文山特區有很多有趣的地方可以讓你放鬆心情，要不要我推薦一些不錯的咖啡廳或餐廳給你？☕️'
    }
    
    // 根據關鍵字選擇回應
    if (message.includes('你好') || message.includes('嗨') || message.includes('哈囉')) {
      return responses.greeting
    } else if (message.includes('無聊') || message.includes('沒事')) {
      return responses.bored
    } else if (intentResult.emotion) {
      return responses.emotional
    } else {
      return responses.vague_need
    }
  }
  
  /**
   * 生成範圍外查詢回應
   */
  private generateOutOfScopeResponse(intentResult: IntentResult, message: string): string {
    const responses = {
      'geographic': '抱歉，我是文山特區的專屬助手，對其他地區的資訊不太熟悉。不過我可以為你推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？😊',
      'service_scope': '抱歉，這超出了我的服務範圍。不過我可以推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？✨'
    }
    
    // 檢查是否為地理範圍外
    const geographicKeywords = ['台北', '台中', '台南', '新北', '桃園', '新竹', '基隆', '嘉義', '彰化', '南投', '雲林', '屏東', '台東', '花蓮', '宜蘭', '澎湖', '金門', '馬祖']
    const isGeographic = geographicKeywords.some(keyword => message.includes(keyword))
    
    return isGeographic ? responses.geographic : responses.service_scope
  }
  
  /**
   * 生成一般回應
   */
  private generateGeneralResponse(stores: any[], message: string): string {
    if (stores.length === 0) {
      return '嘿！我是高文文，很高興為你服務！有什麼想知道的嗎？我對文山特區超熟的！'
    }
    
    const opening = '嘿！文山特區有很多不錯的選擇呢～我為你推薦：'
    const content = this.formatStoreList(stores)
    const closing = '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～'
    const version = `---\n*WEN 1.5.0*`
    
    return `${opening}\n\n${content}\n\n${closing}\n\n${version}`
  }
  
  /**
   * 格式化商家列表
   */
  private formatStoreList(stores: any[]): string {
    return stores.map((store, index) => {
      const address = store.address || '地址未提供'
      const category = store.category || '未分類'
      const rating = store.rating || 'N/A'
      
      return `${index + 1}. **${store.store_name}**
   📍 ${address}
   🏷️ ${category}
   ⭐ 評分：${rating}`
    }).join('\n\n')
  }
  
  /**
   * 生成類別開頭語
   */
  private generateCategoryOpening(category: string, message: string): string {
    const openingTemplates = {
      'FOOD': '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：',
      'PARKING': '文山特區的停車很方便喔！讓我為你介紹幾個優質停車場：',
      'MEDICAL': '文山特區的醫療資源很豐富！我為你推薦幾家優質的：',
      'SHOPPING': '文山特區有很多購物好去處！讓我為你介紹幾家不錯的：',
      'BEAUTY': '文山特區的美容美髮選擇很多！我為你推薦幾家優質的：',
      'EDUCATION': '文山特區的教育資源很豐富！我為你推薦幾家優質的：'
    }
    
    return openingTemplates[category] || '我為你找到了一些不錯的選擇：'
  }
  
  /**
   * 生成類別結束語
   */
  private generateCategoryClosing(category: string): string {
    const closingTemplates = [
      '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～',
      '希望這些資訊對你有用！如果還有其他問題，我很樂意為你服務～',
      '這些推薦都是基於實際資料，希望能幫助到你！有什麼需要隨時問我～'
    ]
    
    return closingTemplates[Math.floor(Math.random() * closingTemplates.length)]
  }
  
  /**
   * 獲取類別名稱
   */
  private getCategoryName(category: string): string {
    const categoryNames = {
      'FOOD': '餐廳',
      'PARKING': '停車場',
      'MEDICAL': '藥局',
      'SHOPPING': '商店',
      'BEAUTY': '美容美髮店',
      'EDUCATION': '教育機構'
    }
    
    return categoryNames[category] || '商家'
  }
}

// ===== 主服務類 =====
class ClaudeChatV3UniversalService {
  private supabase: any
  private intentClassifier: UniversalIntentClassifier
  private responseGenerator: UniversalResponseGenerator
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.intentClassifier = new UniversalIntentClassifier()
    this.responseGenerator = new UniversalResponseGenerator()
  }
  
  /**
   * 處理用戶消息 - 全面性原則性回應
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
      // Step 1: 全面性意圖分類
      const intentResult = this.intentClassifier.classifyIntent(message)
      console.log('[ClaudeChatV3] 意圖分析結果:', intentResult)
      
      // Step 2: 根據意圖獲取相關資料
      const stores = await this.getRelevantStores(intentResult)
      console.log('[ClaudeChatV3] 獲取資料:', stores.length, '個')
      
      // Step 3: 生成全面性回應
      const response = this.responseGenerator.generateResponse(intentResult, stores, message)
      
      const processingTime = Date.now() - startTime
      
      console.log('[ClaudeChatV3] 處理完成:', {
        intent: intentResult.intent,
        responseLength: response.length,
        processingTime
      })
      
      return {
        response,
        session_id: sessionId,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        recommended_stores: stores.map(store => ({
          id: store.id,
          name: store.store_name,
          category: store.category,
          address: store.address,
          rating: store.rating
        })),
        recommendation_logic: {
          type: intentResult.intent,
          entity: intentResult.entity,
          category: intentResult.subcategory,
          confidence: intentResult.confidence
        },
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
   * 獲取相關商家資料
   */
  private async getRelevantStores(intentResult: IntentResult): Promise<any[]> {
    try {
      let query = this.supabase
        .from('stores')
        .select('id, store_name, category, address, rating, approval, is_partner_store, sponsorship_tier')
        .eq('approval', 'approved')
        .limit(CONFIG.system.maxQueryLimit)
      
      // 根據意圖添加篩選條件
      if (intentResult.subcategory) {
        query = query.eq('category', intentResult.subcategory)
      }
      
      // 如果是特定實體查詢，添加名稱篩選
      if (intentResult.intent === 'SPECIFIC_ENTITY' && intentResult.entity) {
        query = query.ilike('store_name', `%${intentResult.entity}%`)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('[ClaudeChatV3] 查詢失敗:', error)
        return []
      }
      
      return data || []
      
    } catch (error) {
      console.error('[ClaudeChatV3] 查詢異常:', error)
      return []
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

    // 硬編碼環境變數
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

    const service = new ClaudeChatV3UniversalService(supabaseUrl, supabaseKey)

    // 處理消息
    const currentSessionId = session_id || `session_${Date.now()}`
    const result = await service.processMessage(currentSessionId, message.content, user_meta)

    console.log('[ClaudeChatV3] 處理完成:', {
      intent: result.intent,
      entity: result.recommendation_logic?.entity,
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


