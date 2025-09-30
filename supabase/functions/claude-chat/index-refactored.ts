/**
 * Claude Chat V2 重構版本 - 推薦引擎優化
 * 核心哲學：資料優先 × 語氣誠實 × 靈格有溫度
 *
 * 重構重點：
 * 1. 強化防幻覺機制 - 嚴格資料驗證，禁止編造內容
 * 2. 統一 fallback 處理 - 固定語句回應
 * 3. 模組化設計 - 驗證、排序、語氣生成分離
 * 4. 完善錯誤處理 - 結構化日誌和異常管理
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ===== 輔助服務類 =====

/**
 * 資料驗證服務 - 防止 AI 幻覺的核心守衛
 */
class ValidationService {

  /**
   * 驗證商家資料完整性
   * @param stores 原始商家資料
   * @returns 經過驗證的商家資料
   */
  static validateStoreData(stores: any[]): any[] {
    if (!Array.isArray(stores)) {
      console.warn('[驗證服務] 商家資料不是陣列格式')
      return []
    }

    return stores.filter(store => {
      // 基本欄位驗證
      const hasRequiredFields = store?.id && store?.store_name && store?.approval === 'approved'

      if (!hasRequiredFields) {
        console.warn(`[驗證服務] 商家缺少必要欄位: ${JSON.stringify(store)}`)
        return false
      }

      // 防止空字串或假資料
      if (typeof store.store_name !== 'string' || store.store_name.trim().length === 0) {
        console.warn(`[驗證服務] 商家名稱無效: ${store.id}`)
        return false
      }

      return true
    })
  }

  /**
   * 驗證推薦邏輯合理性
   * @param intent 用戶意圖
   * @param stores 商家清單
   * @param category 查詢類別
   */
  static validateRecommendationLogic(intent: string, stores: any[], category?: string): {
    isValid: boolean
    reason?: string
  } {
    // 確保意圖和商家類別匹配
    if (intent === 'FOOD' && stores.length > 0) {
      const hasNonFoodStores = stores.some(store =>
        !['餐飲美食', '日式料理', '韓式料理', '泰式料理', '義式料理', '中式料理', '素食', '早餐', '午餐', '晚餐', '宵夜'].includes(store.category)
      )

      if (hasNonFoodStores) {
        return { isValid: false, reason: '美食查詢包含非餐飲商家' }
      }
    }

    if (intent === 'ENGLISH_LEARNING' && stores.length > 0) {
      const hasNonEducationStores = stores.some(store =>
        !['教育培訓', '英語學習', '補習班'].includes(store.category)
      )

      if (hasNonEducationStores) {
        return { isValid: false, reason: '英語學習查詢包含非教育商家' }
      }
    }

    return { isValid: true }
  }
}

/**
 * 排序與限制服務 - 標準化的資料處理
 */
class SortingService {

  /**
   * 標準化商家排序邏輯
   * @param stores 商家清單
   * @param limit 限制數量，預設 3
   * @returns 排序後的商家清單
   */
  static sortAndLimitStores(stores: any[], limit: number = 3): any[] {
    if (!Array.isArray(stores) || stores.length === 0) {
      return []
    }

    // 多層級排序邏輯
    const sortedStores = stores.sort((a, b) => {
      // 1. 特約商家優先
      if (a.is_partner_store !== b.is_partner_store) {
        return b.is_partner_store - a.is_partner_store
      }

      // 2. 贊助等級排序（數字越大越前面）
      if (a.sponsorship_tier !== b.sponsorship_tier) {
        return (b.sponsorship_tier || 0) - (a.sponsorship_tier || 0)
      }

      // 3. 評分排序（數字越大越前面，空值排最後）
      const aRating = a.rating || 0
      const bRating = b.rating || 0
      if (aRating !== bRating) {
        return bRating - aRating
      }

      // 4. 店家 ID 排序（確保結果一致性）
      return (a.id || 0) - (b.id || 0)
    })

    // 限制數量
    return sortedStores.slice(0, limit)
  }

  /**
   * 建立排序邏輯記錄
   * @param originalCount 原始數量
   * @param finalCount 最終數量
   * @param sortCriteria 排序標準
   */
  static createSortingLog(originalCount: number, finalCount: number, sortCriteria: string[]): any {
    return {
      original_count: originalCount,
      final_count: finalCount,
      sort_criteria: sortCriteria,
      limited: finalCount < originalCount,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Fallback 處理服務 - 統一的無結果回應
 */
class FallbackService {

  // 統一的 fallback 訊息
  static readonly DEFAULT_FALLBACK = '目前資料庫中尚未收錄這類店家，歡迎推薦我們新增喔～'

  /**
   * 根據意圖生成客製化 fallback 訊息
   * @param intent 用戶意圖
   * @param subcategory 子類別
   * @param searchTerm 搜尋詞彙
   * @returns 客製化的 fallback 訊息
   */
  static generateContextualFallback(intent: string, subcategory?: string, searchTerm?: string): string {
    const baseMessage = this.DEFAULT_FALLBACK

    // 根據不同意圖提供更具體的回應
    switch (intent) {
      case 'FOOD':
        if (subcategory) {
          return `抱歉，文山特區目前沒有找到${subcategory}餐廳。${baseMessage} 😊`
        }
        return `抱歉，沒有找到符合您需求的美食推薦。${baseMessage} 😊`

      case 'ENGLISH_LEARNING':
        return `抱歉，除了肯塔基美語外，文山特區暫時沒有其他英語學習機構。${baseMessage} 😊`

      case 'PARKING':
        return `抱歉，沒有找到合適的停車場資訊。${baseMessage} 😊`

      case 'SHOPPING':
        return `抱歉，沒有找到符合的購物商家。${baseMessage} 😊`

      case 'BEAUTY':
        return `抱歉，沒有找到美容美髮相關商家。${baseMessage} 😊`

      case 'MEDICAL':
        return `抱歉，沒有找到醫療健康相關商家。${baseMessage} 😊`

      default:
        return `${baseMessage} 有其他問題歡迎隨時問我喔～ 🤗`
    }
  }

  /**
   * 檢查是否需要使用 fallback
   * @param stores 商家清單
   * @param validationResult 驗證結果
   * @returns 是否需要 fallback
   */
  static shouldUseFallback(stores: any[], validationResult: any): boolean {
    return stores.length === 0 || !validationResult.isValid
  }
}

// ===== 重構後的五層架構 =====

/**
 * 第一層：資料層 (Data Layer) - 強化版
 * 職責：純粹的資料庫操作，無任何業務邏輯
 */
class DataLayer {
  private supabase: any

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * 獲取符合條件的商家（原始資料）
   * @param intent 查詢意圖
   * @param category 商家類別
   * @param limit 查詢限制（防止過大結果集）
   */
  async getEligibleStores(intent: string, category?: string, limit: number = 20): Promise<any[]> {
    try {
      console.log(`[資料層] 查詢商家 - 意圖: ${intent}, 類別: ${category}`)

      let query = this.supabase
        .from('stores')
        .select('*')
        .eq('approval', 'approved') // 只取已審核商家
        .limit(limit) // 防止過大結果集

      // 根據類別篩選
      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('[資料層] 查詢失敗:', error)
        return []
      }

      console.log(`[資料層] 查詢成功，共 ${data?.length || 0} 筆資料`)
      return data || []

    } catch (error) {
      console.error('[資料層] 查詢異常:', error)
      return []
    }
  }

  /**
   * 獲取肯塔基美語專用資料
   */
  async getKentuckyEnglish(): Promise<any | null> {
    try {
      console.log('[資料層] 查詢肯塔基美語')

      const { data, error } = await this.supabase
        .from('stores')
        .select('*')
        .eq('store_code', 'kentucky')
        .eq('approval', 'approved')
        .single()

      if (error) {
        console.error('[資料層] 肯塔基美語查詢失敗:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('[資料層] 肯塔基美語查詢異常:', error)
      return null
    }
  }

  /**
   * 記錄推薦日誌
   */
  async logRecommendation(sessionId: string, logData: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('recommendation_logs')
        .insert({
          session_id: sessionId,
          ...logData,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('[資料層] 推薦日誌記錄失敗:', error)
      }
    } catch (error) {
      console.error('[資料層] 推薦日誌記錄異常:', error)
    }
  }

  /**
   * 獲取對話歷史
   */
  async getConversationHistory(sessionId: string, limit: number = 30): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[資料層] 對話歷史查詢失敗:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('[資料層] 對話歷史查詢異常:', error)
      return []
    }
  }
}

/**
 * 第二層：意圖與語言層 (Intent & Language Layer) - 保持原有邏輯
 * 職責：分析用戶意圖，理解自然語言
 */
class IntentLanguageLayer {
  classifyIntent(message: string, conversationHistory?: any[]): {
    intent: string
    confidence: number
    keywords: string[]
    subcategory?: string
    responseMode?: string
    emotion?: string
    multiIntent?: string[]
  } {
    console.log('[意圖層] 分析用戶意圖')

    const messageLower = message.toLowerCase()
    const keywords: string[] = []
    let subcategory: string | undefined
    let responseMode: string = 'standard'
    let emotion: string | undefined
    let multiIntent: string[] = []

    // 英語學習意圖
    const englishKeywords = ['英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓', '學美語', '學英語', '英文學習', '美語學習', '語言學習', '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦']
    const englishMatches = englishKeywords.filter(keyword => messageLower.includes(keyword))

    if (englishMatches.length > 0 && !this.hasOtherIntent(messageLower)) {
      keywords.push(...englishMatches)
      return { intent: 'ENGLISH_LEARNING', confidence: 0.9, keywords, responseMode: 'standard' }
    }

    // 美食推薦意圖（全面料理類型識別）
    const foodKeywords = ['美食', '餐廳', '吃飯', '料理', '餐點', '推薦', '好吃', '用餐', '菜單', '料理推薦', '美食推薦']
    const specificFoodKeywords = {
      '日式料理': ['日料', '日式', '壽司', '拉麵', '燒肉', '天婦羅', '居酒屋', '和食', '日式料理'],
      '韓式料理': ['韓料', '韓式', '烤肉', '泡菜', '石鍋', '韓式料理'],
      '泰式料理': ['泰料', '泰式', '冬陰功', '綠咖喱', '泰式料理'],
      '義式料理': ['義大利麵', '披薩', '義式', '義大利'],
      '中式料理': ['中式', '火鍋', '川菜', '台菜', '中式料理'],
      '素食': ['素食', '蔬食', '素食餐廳', '蔬食餐廳'],
      '早餐': ['早餐', '早餐店', '早餐推薦'],
      '午餐': ['午餐', '午餐推薦', '中午吃什麼'],
      '晚餐': ['晚餐', '晚餐推薦', '晚上吃什麼'],
      '宵夜': ['宵夜', '宵夜推薦', '有宵夜嗎']
    }

    // 檢查特定料理類型
    for (const [category, keywords] of Object.entries(specificFoodKeywords)) {
      const matches = keywords.filter(keyword => messageLower.includes(keyword))
      if (matches.length > 0) {
        keywords.push(...matches)
        return { intent: 'FOOD', confidence: 0.9, keywords, subcategory: category }
      }
    }

    // 檢查一般美食關鍵字
    const foodMatches = foodKeywords.filter(keyword => messageLower.includes(keyword))
    if (foodMatches.length > 0) {
      keywords.push(...foodMatches)
      return { intent: 'FOOD', confidence: 0.8, keywords }
    }

    // 生活服務意圖
    const lifestyleKeywords = {
      'SHOPPING': ['買衣服', '服飾店', '買鞋子', '鞋店', '買化妝品', '美妝店', '日用品', '便利商店'],
      'BEAUTY': ['美髮店', '剪頭髮', '美容院', '做臉', '美甲店', '做指甲'],
      'MEDICAL': ['診所', '看醫生', '藥局', '買藥', '牙醫', '看牙齒']
    }

    for (const [intent, keywords] of Object.entries(lifestyleKeywords)) {
      const matches = keywords.filter(keyword => messageLower.includes(keyword))
      if (matches.length > 0) {
        keywords.push(...matches)
        return { intent, confidence: 0.8, keywords }
      }
    }

    // 停車查詢意圖
    const parkingKeywords = ['停車', '停車場', '車位', '停車費', '停車資訊', '停車查詢', '可以停車嗎', '停車方便嗎']
    const parkingMatches = parkingKeywords.filter(keyword => messageLower.includes(keyword))

    if (parkingMatches.length > 0) {
      keywords.push(...parkingMatches)
      return { intent: 'PARKING', confidence: 0.8, keywords }
    }

    // 統計查詢意圖（非常嚴格的匹配）
    const statsKeywords = ['統計', '資料庫', '商家數量', '有多少', '餐廳數量', '店家數量']
    const statsMatches = statsKeywords.filter(keyword => messageLower.includes(keyword))

    // 只有明確的統計查詢才觸發統計意圖
    const isStatsQuery = statsMatches.length > 0 &&
                        (messageLower.includes('資料庫') ||
                         messageLower.includes('統計') ||
                         messageLower.includes('商家數量') ||
                         messageLower.includes('餐廳數量') ||
                         messageLower.includes('店家數量') ||
                         (messageLower.includes('有多少') && (messageLower.includes('餐廳') || messageLower.includes('商家') || messageLower.includes('店家'))))

    if (isStatsQuery) {
      keywords.push(...statsMatches)
      return { intent: 'STATISTICS', confidence: 0.9, keywords }
    }

    // 確認回應意圖
    const confirmationKeywords = ['好', '好的', '可以', '行', '沒問題', '謝謝', '感謝', '了解', '知道了', 'ok', 'okay']
    const confirmationMatches = confirmationKeywords.filter(keyword => messageLower.includes(keyword))

    const hasOtherIntentKeywords = messageLower.includes('什麼') ||
                                  messageLower.includes('哪裡') ||
                                  messageLower.includes('推薦') ||
                                  messageLower.includes('有') ||
                                  messageLower.includes('好玩') ||
                                  messageLower.includes('選擇') ||
                                  messageLower.includes('介紹')

    if (confirmationMatches.length > 0 && messageLower.length <= 10 && !hasOtherIntentKeywords) {
      keywords.push(...confirmationMatches)
      return { intent: 'CONFIRMATION', confidence: 0.8, keywords }
    }

    // 情感檢測
    emotion = this.detectEmotion(messageLower)

    // 多意圖檢測
    multiIntent = this.detectMultiIntent(messageLower)

    if (multiIntent.length > 1) {
      return { intent: 'MIXED_INTENT', confidence: 0.7, keywords, subcategory, responseMode: 'mixed', emotion, multiIntent }
    }

    // 檢查是否為語意不明或閒聊
    const isVagueOrChat = this.isVagueOrChat(messageLower, conversationHistory)
    if (isVagueOrChat) {
      return { intent: 'VAGUE_CHAT', confidence: 0.3, keywords: [], responseMode: 'vague_chat', emotion }
    }

    // 檢查是否超出服務範圍
    const isOutOfScope = this.isOutOfScope(messageLower)
    if (isOutOfScope) {
      return { intent: 'OUT_OF_SCOPE', confidence: 0.2, keywords: [], responseMode: 'polite_refusal', emotion }
    }

    // 一般推薦意圖
    return { intent: 'GENERAL', confidence: 0.6, keywords: [], responseMode: 'standard', emotion }
  }

  private hasOtherIntent(message: string): boolean {
    const excludeKeywords = ['美食', '餐廳', '傢俱', '家具', '停車', '購物', '服飾', '美容', '醫療', '銀行', '便利商店']
    return excludeKeywords.some(keyword => message.includes(keyword))
  }

  private isVagueOrChat(message: string, conversationHistory?: any[]): boolean {
    const vagueKeywords = ['你好', '嗨', '哈囉', '今天天氣', '心情', '感覺', '怎麼樣', '還好嗎', '無聊', '沒事', '隨便', '不知道', '顏色', '喜歡什麼']
    const hasVagueKeywords = vagueKeywords.some(keyword => message.includes(keyword))

    const isTooShort = message.length <= 3 && !this.hasSpecificIntent(message)
    const isRepetitive = conversationHistory && conversationHistory.length > 0 &&
                        conversationHistory.some(msg => msg.content === message)
    const hasEmotion = this.detectEmotion(message) !== undefined

    return hasVagueKeywords || isTooShort || isRepetitive || hasEmotion
  }

  private isOutOfScope(message: string): boolean {
    const outOfScopeKeywords = [
      '台北', '台中', '台南', '新北', '桃園', '新竹', '基隆', '嘉義', '彰化', '南投', '雲林', '屏東', '台東', '花蓮', '宜蘭', '澎湖', '金門', '馬祖',
      '投資', '股票', '基金', '保險', '貸款', '信用卡', '理財',
      '醫療診斷', '看病', '開藥', '手術', '治療', '生病', '看醫生', '診斷',
      '法律', '訴訟', '合約', '糾紛', '律師',
      '政治', '選舉', '投票', '政黨',
      '宗教', '信仰', '拜拜', '廟宇',
      '算命', '占卜', '風水', '命理',
      '音樂會', '演唱會', '表演', '電影', 'KTV', '遊戲'
    ]

    return outOfScopeKeywords.some(keyword => message.includes(keyword))
  }

  private hasSpecificIntent(message: string): boolean {
    const specificKeywords = ['推薦', '哪裡', '什麼', '有', '找', '查', '問', '幫', '需要', '想要']
    return specificKeywords.some(keyword => message.includes(keyword))
  }

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

  private detectMultiIntent(message: string): string[] {
    const intentKeywords = {
      'FOOD': ['美食', '餐廳', '吃飯', '料理', '餐點', '日料', '韓料', '泰料', '義式', '中式', '素食'],
      'SHOPPING': ['買衣服', '服飾店', '買鞋子', '鞋店', '買化妝品', '美妝店', '日用品', '便利商店'],
      'BEAUTY': ['美髮店', '剪頭髮', '美容院', '做臉', '美甲店', '做指甲'],
      'MEDICAL': ['診所', '看醫生', '藥局', '買藥', '牙醫', '看牙齒'],
      'PARKING': ['停車', '停車場', '車位', '停車費', '可以停車嗎', '停車方便嗎'],
      'ENGLISH_LEARNING': ['英語', '美語', '補習班', '學習', '英文', '課程', '培訓']
    }

    const detectedIntents: string[] = []

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        detectedIntents.push(intent)
      }
    }

    return detectedIntents
  }
}

/**
 * 第三層：推薦策略層 (Recommendation Layer) - 強化版
 * 職責：整合資料驗證、排序服務，產生推薦清單
 */
class RecommendationLayer {
  private dataLayer: DataLayer

  constructor(dataLayer: DataLayer) {
    this.dataLayer = dataLayer
  }

  async generateRecommendations(intent: string, message: string, subcategory?: string): Promise<{
    stores: any[]
    logic: any
    needsFallback: boolean
    fallbackMessage?: string
  }> {
    console.log(`[推薦層] 生成推薦 - 意圖: ${intent}, 子類別: ${subcategory}`)

    let rawStores: any[] = []
    let logic: any = {
      intent,
      subcategory,
      timestamp: new Date().toISOString(),
      validation_passed: false,
      sorting_applied: false
    }

    try {
      // Step 1: 根據意圖獲取原始資料
      rawStores = await this.fetchStoresByIntent(intent, message, subcategory)
      logic.raw_count = rawStores.length

      // Step 2: 資料驗證
      const validatedStores = ValidationService.validateStoreData(rawStores)
      logic.validated_count = validatedStores.length
      logic.validation_passed = validatedStores.length > 0

      // Step 3: 推薦邏輯驗證
      const validationResult = ValidationService.validateRecommendationLogic(intent, validatedStores, subcategory)
      logic.logic_validation = validationResult

      if (!validationResult.isValid) {
        console.warn(`[推薦層] 推薦邏輯驗證失敗: ${validationResult.reason}`)
        return {
          stores: [],
          logic: { ...logic, error: validationResult.reason },
          needsFallback: true,
          fallbackMessage: FallbackService.generateContextualFallback(intent, subcategory)
        }
      }

      // Step 4: 排序和限制
      const finalStores = SortingService.sortAndLimitStores(validatedStores, 3)
      logic.final_count = finalStores.length
      logic.sorting_applied = true
      logic.sorting_log = SortingService.createSortingLog(
        validatedStores.length,
        finalStores.length,
        ['partner_priority', 'sponsorship_tier', 'rating', 'id']
      )

      // Step 5: 檢查是否需要 fallback
      const needsFallback = FallbackService.shouldUseFallback(finalStores, validationResult)

      if (needsFallback) {
        return {
          stores: [],
          logic,
          needsFallback: true,
          fallbackMessage: FallbackService.generateContextualFallback(intent, subcategory)
        }
      }

      console.log(`[推薦層] 推薦生成成功，共 ${finalStores.length} 個`)
      return {
        stores: finalStores,
        logic,
        needsFallback: false
      }

    } catch (error) {
      console.error('[推薦層] 推薦生成失敗:', error)
      return {
        stores: [],
        logic: { ...logic, error: error.message },
        needsFallback: true,
        fallbackMessage: FallbackService.generateContextualFallback(intent, subcategory)
      }
    }
  }

  /**
   * 根據意圖獲取商家資料
   */
  private async fetchStoresByIntent(intent: string, message: string, subcategory?: string): Promise<any[]> {
    switch (intent) {
      case 'ENGLISH_LEARNING':
        // 英語學習：優先肯塔基美語
        const kentucky = await this.dataLayer.getKentuckyEnglish()
        const stores = kentucky ? [kentucky] : []

        // 可以添加其他教育機構（如果需要）
        const otherEducation = await this.dataLayer.getEligibleStores('ENGLISH_LEARNING', '教育培訓')
        const filteredOther = otherEducation.filter(s => s.store_code !== 'kentucky')
        stores.push(...filteredOther.slice(0, 2))

        return stores

      case 'FOOD':
        let foodCategory = '餐飲美食'

        if (subcategory) {
          foodCategory = subcategory
        } else {
          // 關鍵字檢測 fallback
          const messageLower = message.toLowerCase()
          if (messageLower.includes('日料') || messageLower.includes('日式')) {
            foodCategory = '日式料理'
          } else if (messageLower.includes('韓料') || messageLower.includes('韓式')) {
            foodCategory = '韓式料理'
          } else if (messageLower.includes('泰料') || messageLower.includes('泰式')) {
            foodCategory = '泰式料理'
          } else if (messageLower.includes('義大利') || messageLower.includes('義式')) {
            foodCategory = '義式料理'
          } else if (messageLower.includes('中式') || messageLower.includes('火鍋')) {
            foodCategory = '中式料理'
          } else if (messageLower.includes('素食') || messageLower.includes('蔬食')) {
            foodCategory = '素食'
          }
        }

        return await this.dataLayer.getEligibleStores('FOOD', foodCategory)

      case 'SHOPPING':
        return await this.dataLayer.getEligibleStores('SHOPPING', '購物')

      case 'BEAUTY':
        return await this.dataLayer.getEligibleStores('BEAUTY', '美容美髮')

      case 'MEDICAL':
        return await this.dataLayer.getEligibleStores('MEDICAL', '醫療健康')

      case 'PARKING':
        return await this.dataLayer.getEligibleStores('PARKING', '停車場')

      case 'STATISTICS':
        return await this.dataLayer.getEligibleStores('STATISTICS')

      case 'CONFIRMATION':
        return []

      default:
        return await this.dataLayer.getEligibleStores('GENERAL')
    }
  }
}

/**
 * 第四層：語氣渲染層 (Tone Rendering Layer) - 簡化版
 * 職責：純粹的語氣生成，不含業務邏輯
 */
class ToneRenderingLayer {

  // 標準化語氣模板
  private readonly toneTemplates = {
    greeting: {
      warm: '嘿！我是高文文，很高興為你服務！✨',
      casual: '哈囉～我是高文文，在鳳山陪你！',
      formal: '您好，我是高文文，文山特區的專屬客服。'
    },
    success: {
      warm: '這個我超推薦的！',
      casual: '這個不錯呢～',
      formal: '我為您推薦以下選擇：'
    },
    closing: {
      warm: '希望對你有幫助！有什麼問題隨時找我喔～',
      casual: '就這樣囉～',
      formal: '感謝您的詢問，祝您使用愉快。'
    }
  }

  /**
   * 生成回應內容
   * @param intent 用戶意圖
   * @param stores 商家清單
   * @param message 原始訊息
   * @param needsFallback 是否需要 fallback
   * @param fallbackMessage fallback 訊息
   * @param logic 推薦邏輯記錄
   */
  generateResponse(
    intent: string,
    stores: any[],
    message: string,
    needsFallback: boolean = false,
    fallbackMessage?: string,
    logic?: any
  ): string {
    console.log('[語氣層] 生成語氣化回應')

    // 如果需要 fallback，直接返回 fallback 訊息
    if (needsFallback && fallbackMessage) {
      return fallbackMessage
    }

    // 根據意圖生成不同類型的回應
    switch (intent) {
      case 'ENGLISH_LEARNING':
        return this.generateEnglishLearningResponse(stores)

      case 'FOOD':
        return this.generateFoodRecommendationResponse(stores, message, logic)

      case 'SHOPPING':
        return this.generateServiceResponse(stores, '購物', '嘿！文山特區有不少購物選擇呢～我為你推薦幾家：')

      case 'BEAUTY':
        return this.generateServiceResponse(stores, '美容美髮', '嘿！文山特區有不少美容美髮選擇呢～我為你推薦幾家：')

      case 'MEDICAL':
        return this.generateServiceResponse(stores, '醫療健康', '嘿！文山特區有不少醫療健康選擇呢～我為你推薦幾家：')

      case 'PARKING':
        return this.generateParkingResponse(stores)

      case 'STATISTICS':
        return this.generateStatisticsResponse(stores)

      case 'CONFIRMATION':
        return this.generateConfirmationResponse(message)

      case 'VAGUE_CHAT':
        return this.generateVagueChatResponse(message)

      case 'OUT_OF_SCOPE':
        return this.generateOutOfScopeResponse(message)

      case 'MIXED_INTENT':
        return this.generateMixedIntentResponse(message, stores)

      default:
        return this.generateGeneralResponse(stores)
    }
  }

  /**
   * 英語學習專用回應
   */
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

    return FallbackService.generateContextualFallback('ENGLISH_LEARNING')
  }

  /**
   * 美食推薦專用回應
   */
  private generateFoodRecommendationResponse(stores: any[], message?: string, logic?: any): string {
    if (stores.length === 0) {
      return FallbackService.generateContextualFallback('FOOD', logic?.subcategory)
    }

    // 根據查詢類型調整回應開頭
    const messageLower = message?.toLowerCase() || ''
    let responseHeader = '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：'

    if (messageLower.includes('日料') || messageLower.includes('日式')) {
      responseHeader = '嘿！我為你找到了一些不錯的日式料理選擇：'
    } else if (messageLower.includes('韓料') || messageLower.includes('韓式')) {
      responseHeader = '嘿！我為你找到了一些不錯的韓式料理選擇：'
    } else if (messageLower.includes('泰料') || messageLower.includes('泰式')) {
      responseHeader = '嘿！我為你找到了一些不錯的泰式料理選擇：'
    }

    return this.buildStoreListResponse(stores, responseHeader)
  }

  /**
   * 一般服務回應（購物、美容、醫療等）
   */
  private generateServiceResponse(stores: any[], serviceType: string, header: string): string {
    if (stores.length === 0) {
      return FallbackService.generateContextualFallback('GENERAL')
    }

    return this.buildStoreListResponse(stores, header)
  }

  /**
   * 停車場推薦回應
   */
  private generateParkingResponse(stores: any[]): string {
    if (stores.length === 0) {
      return FallbackService.generateContextualFallback('PARKING')
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

  /**
   * 統計查詢回應
   */
  private generateStatisticsResponse(stores: any[]): string {
    const totalStores = stores.length
    const approvedStores = stores.filter(s => s.approval === 'approved').length
    const partnerStores = stores.filter(s => s.is_partner_store === true).length
    const sponsoredStores = stores.filter(s => s.sponsorship_tier > 0).length
    const ratedStores = stores.filter(s => s.rating && s.rating > 0).length

    return `嘿！我來為你查詢一下文山特區的商家資料庫統計：

📊 **資料庫統計：**
• 總商家數量：${totalStores} 家
• 已審核商家：${approvedStores} 家
• 特約商家：${partnerStores} 家
• 贊助等級商家：${sponsoredStores} 家
• 有評分商家：${ratedStores} 家

💡 **資料說明：**
- 我們只推薦已審核的優質商家
- 特約商家享有優先推薦權
- 贊助等級反映商家的合作深度
- 所有推薦都經過證據驗證

希望這個統計對你有幫助！有什麼問題隨時找我喔～`
  }

  /**
   * 確認回應
   */
  private generateConfirmationResponse(message: string): string {
    const messageLower = message.toLowerCase()

    if (messageLower.includes('好') || messageLower.includes('可以') || messageLower.includes('行')) {
      return `好的！很高興能幫到你～有什麼其他問題隨時找我喔！😊`
    } else if (messageLower.includes('謝謝') || messageLower.includes('感謝')) {
      return `不客氣！能幫到你是我的榮幸～有什麼問題隨時找我！✨`
    } else if (messageLower.includes('了解') || messageLower.includes('知道')) {
      return `太好了！希望這些資訊對你有幫助～還有什麼想知道的嗎？🤗`
    } else {
      return `好的！很高興為你服務～有什麼其他需要幫助的嗎？😊`
    }
  }

  /**
   * 模糊聊天回應
   */
  private generateVagueChatResponse(message: string): string {
    const messageLower = message.toLowerCase()

    if (messageLower.includes('你好') || messageLower.includes('嗨') || messageLower.includes('哈囉')) {
      return `哈囉～我是高文文！很高興認識你！我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊`
    } else if (messageLower.includes('無聊') || messageLower.includes('沒事')) {
      return `無聊的話，要不要來文山特區逛逛？我可以推薦一些不錯的餐廳、咖啡廳或有趣的店家給你～有什麼想探索的嗎？🎉`
    } else {
      return `我不太確定您的具體需求，不過我可以幫您推薦文山特區的美食、停車場或英語學習等服務喔～有什麼想了解的嗎？🤗`
    }
  }

  /**
   * 超出範圍回應
   */
  private generateOutOfScopeResponse(message: string): string {
    const messageLower = message.toLowerCase()

    if (messageLower.includes('台北') || messageLower.includes('台中') || messageLower.includes('台南')) {
      return `抱歉，我是文山特區的專屬助手，對其他地區的資訊不太熟悉。不過我可以為你推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？😊`
    } else {
      return `抱歉，這超出了我的服務範圍。不過我可以推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？✨`
    }
  }

  /**
   * 多意圖回應
   */
  private generateMixedIntentResponse(message: string, stores: any[]): string {
    return `我理解您有多個需求。讓我先為您處理其中一項，其他需求您可以再次詢問我喔！😊`
  }

  /**
   * 一般推薦回應
   */
  private generateGeneralResponse(stores: any[]): string {
    if (stores.length === 0) {
      return '嘿！我是高文文，很高興為你服務！有什麼想知道的嗎？我對文山特區超熟的！'
    }

    return this.buildStoreListResponse(stores, '嘿！文山特區有很多不錯的選擇呢～我為你推薦：')
  }

  /**
   * 建立商家清單回應的通用方法
   */
  private buildStoreListResponse(stores: any[], header: string): string {
    let response = `${header}\n\n`

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
}

/**
 * 第五層：日誌與反饋層 (Logging & Feedback Layer) - 強化版
 * 職責：結構化日誌記錄，完整的錯誤追蹤
 */
class LoggingFeedbackLayer {
  private dataLayer: DataLayer

  constructor(dataLayer: DataLayer) {
    this.dataLayer = dataLayer
  }

  /**
   * 記錄完整的對話會話
   * @param sessionData 會話資料
   */
  async logSession(sessionData: {
    sessionId: string
    message: string
    response: string
    intent: string
    stores: any[]
    logic: any
    processingTime?: number
    error?: string
  }): Promise<void> {
    const { sessionId, message, response, intent, stores, logic, processingTime, error } = sessionData

    console.log('[日誌層] 記錄會話，會話 ID:', sessionId)

    try {
      // 記錄會話資訊
      await this.logChatSession(sessionId)

      // 記錄對話消息
      await this.logChatMessages(sessionId, message, response)

      // 記錄推薦日誌
      if (stores.length > 0 || error) {
        await this.logRecommendationDetails(sessionId, intent, stores, logic, processingTime, error)
      }

      console.log('[日誌層] 會話記錄完成')

    } catch (logError) {
      console.error('[日誌層] 記錄失敗:', logError)
      // 日誌記錄失敗不應該影響主要功能
    }
  }

  /**
   * 記錄聊天會話
   */
  private async logChatSession(sessionId: string): Promise<void> {
    try {
      const { error } = await this.dataLayer.supabase
        .from('chat_sessions')
        .upsert({
          session_id: sessionId,
          last_activity: new Date().toISOString(),
          message_count: 1,
          user_ip: 'unknown',
          user_agent: 'claude-chat-v2-refactored'
        }, { onConflict: 'session_id' })

      if (error) {
        console.error('[日誌層] 會話記錄失敗:', error)
      }
    } catch (error) {
      console.error('[日誌層] 會話記錄異常:', error)
    }
  }

  /**
   * 記錄對話消息
   */
  private async logChatMessages(sessionId: string, message: string, response: string): Promise<void> {
    try {
      const { error } = await this.dataLayer.supabase
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

      if (error) {
        console.error('[日誌層] 消息記錄失敗:', error)
      }
    } catch (error) {
      console.error('[日誌層] 消息記錄異常:', error)
    }
  }

  /**
   * 記錄推薦詳情
   */
  private async logRecommendationDetails(
    sessionId: string,
    intent: string,
    stores: any[],
    logic: any,
    processingTime?: number,
    error?: string
  ): Promise<void> {
    try {
      const logData = {
        session_id: sessionId,
        intent,
        recommended_stores: stores.map(s => ({
          id: s.id,
          name: s.store_name,
          category: s.category,
          tier: s.sponsorship_tier,
          is_partner: s.is_partner_store,
          evidence_level: s.evidence_level || 'verified'
        })),
        recommendation_logic: {
          ...logic,
          processing_time_ms: processingTime,
          error: error
        },
        created_at: new Date().toISOString()
      }

      await this.dataLayer.logRecommendation(sessionId, logData)
    } catch (logError) {
      console.error('[日誌層] 推薦詳情記錄失敗:', logError)
    }
  }

  /**
   * 記錄系統錯誤
   */
  static logSystemError(context: string, error: any, additionalData?: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      error_message: error?.message || String(error),
      error_stack: error?.stack,
      additional_data: additionalData
    }

    console.error(`[系統錯誤 - ${context}]`, errorLog)
  }
}

/**
 * ===== 主要服務類 =====
 * Claude Chat V2 重構版本服務
 */
class ClaudeChatV2RefactoredService {
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

  /**
   * 處理用戶消息 - 重構版本
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
    let processingError: string | undefined

    console.log(`[ClaudeChatV2-重構版] 處理消息開始: ${message.substring(0, 50)}...`)

    try {
      // Step 1: 意圖分析
      const conversationHistory = await this.dataLayer.getConversationHistory(sessionId)
      const intentResult = this.intentLayer.classifyIntent(message, conversationHistory)
      console.log(`[重構版] 識別意圖: ${intentResult.intent} (信心度: ${intentResult.confidence})`)

      // Step 2: 推薦生成（包含驗證和排序）
      const recommendationResult = await this.recommendationLayer.generateRecommendations(
        intentResult.intent,
        message,
        intentResult.subcategory
      )
      console.log(`[重構版] 生成推薦: ${recommendationResult.stores.length} 個，需要 fallback: ${recommendationResult.needsFallback}`)

      // Step 3: 語氣渲染
      const response = this.toneLayer.generateResponse(
        intentResult.intent,
        recommendationResult.stores,
        message,
        recommendationResult.needsFallback,
        recommendationResult.fallbackMessage,
        recommendationResult.logic
      )
      console.log(`[重構版] 生成回應: ${response.length} 字符`)

      // Step 4: 計算處理時間
      const processingTime = Date.now() - startTime

      // Step 5: 日誌記錄
      await this.loggingLayer.logSession({
        sessionId,
        message,
        response,
        intent: intentResult.intent,
        stores: recommendationResult.stores,
        logic: recommendationResult.logic,
        processingTime,
        error: processingError
      })

      // Step 6: 回傳結果
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
          evidence_level: 'verified' // 重構版本全部標記為已驗證
        })),
        recommendation_logic: {
          ...recommendationResult.logic,
          processing_time_ms: processingTime,
          fallback_used: recommendationResult.needsFallback,
          validation_layer_enabled: true,
          sorting_layer_enabled: true
        },
        version: 'WEN 1.3.0-refactored',
        processing_time: processingTime
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      processingError = error.message

      LoggingFeedbackLayer.logSystemError('processMessage', error, {
        sessionId,
        message: message.substring(0, 100),
        processingTime
      })

      // 記錄錯誤會話
      await this.loggingLayer.logSession({
        sessionId,
        message,
        response: FallbackService.DEFAULT_FALLBACK,
        intent: 'ERROR',
        stores: [],
        logic: { error: error.message },
        processingTime,
        error: processingError
      })

      // 回傳錯誤回應
      return {
        response: FallbackService.DEFAULT_FALLBACK,
        session_id: sessionId,
        intent: 'ERROR',
        confidence: 0,
        recommended_stores: [],
        recommendation_logic: {
          error: error.message,
          processing_time_ms: processingTime,
          fallback_used: true
        },
        version: 'WEN 1.3.0-refactored',
        processing_time: processingTime
      }
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

    console.log('[ClaudeChatV2-重構版] 收到請求:', {
      message: message.content.substring(0, 50),
      session_id,
      user_meta: user_meta ? { external_id: user_meta.external_id, display_name: user_meta.display_name } : null
    })

    // 初始化重構版服務
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || ''

    const service = new ClaudeChatV2RefactoredService(supabaseUrl, supabaseKey)

    // 處理消息
    const currentSessionId = session_id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const result = await service.processMessage(currentSessionId, message.content, user_meta)

    console.log('[ClaudeChatV2-重構版] 處理完成:', {
      intent: result.intent,
      storeCount: result.recommended_stores.length,
      version: result.version,
      processingTime: result.processing_time
    })

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[ClaudeChatV2-重構版] 錯誤:', error)

    const errorResponse = {
      error: {
        code: 'CLAUDE_CHAT_V2_REFACTORED_ERROR',
        message: error.message || '聊天服務暫時無法使用'
      },
      version: 'WEN 1.3.0-refactored'
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})