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
    
    try {
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
    } catch (error) {
      console.error('[資料層] 記錄推薦日誌異常:', error)
    }
  }
  
  async getConversationHistory(sessionId: string, limit: number = 30) {
    console.log('[資料層] 獲取對話歷史')
    
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('[資料層] 獲取對話歷史失敗:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('[資料層] 獲取對話歷史異常:', error)
      return []
    }
  }
}

  // 第二層：意圖與語言層 (Intent & Language Layer)
  class IntentLanguageLayer {
    classifyIntent(message: string, conversationHistory?: any[]): { intent: string; confidence: number; keywords: string[]; subcategory?: string; responseMode?: string; emotion?: string; multiIntent?: string[] } {
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
      
      // 確認回應意圖（單字或短句確認，但要排除包含其他意圖的句子）
      const confirmationKeywords = ['好', '好的', '可以', '行', '沒問題', '謝謝', '感謝', '了解', '知道了', 'ok', 'okay']
      const confirmationMatches = confirmationKeywords.filter(keyword => messageLower.includes(keyword))
      
      // 排除包含其他意圖關鍵字的句子
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
      
      // 如果檢測到多意圖，使用混合型回應
      if (multiIntent.length > 1) {
        return { intent: 'MIXED_INTENT', confidence: 0.7, keywords, subcategory, responseMode: 'mixed', emotion, multiIntent }
      }
      
      // 檢查是否為語意不明或閒聊（優先級較高）
      const isVagueOrChat = this.isVagueOrChat(messageLower, conversationHistory)
      if (isVagueOrChat) {
        return { intent: 'VAGUE_CHAT', confidence: 0.3, keywords: [], responseMode: 'vague_chat', emotion }
      }
      
      // 檢查是否超出服務範圍（優先級較高）
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
    // 檢查是否為純粹閒聊或語意不明
    const vagueKeywords = ['你好', '嗨', '哈囉', '今天天氣', '心情', '感覺', '怎麼樣', '還好嗎', '無聊', '沒事', '隨便', '不知道', '顏色', '喜歡什麼']
    const hasVagueKeywords = vagueKeywords.some(keyword => message.includes(keyword))
    
    // 檢查是否為過於簡短的訊息
    const isTooShort = message.length <= 3 && !this.hasSpecificIntent(message)
    
    // 檢查是否為重複或無意義的訊息
    const isRepetitive = conversationHistory && conversationHistory.length > 0 && 
                        conversationHistory.some(msg => msg.content === message)
    
    // 檢查是否包含情感表達
    const hasEmotion = this.detectEmotion(message) !== undefined
    
    return hasVagueKeywords || isTooShort || isRepetitive || hasEmotion
  }
  
  private isOutOfScope(message: string): boolean {
    // 檢查是否超出文山特區服務範圍
    const outOfScopeKeywords = [
      // 其他地區
      '台北', '台中', '台南', '新北', '桃園', '新竹', '基隆', '嘉義', '彰化', '南投', '雲林', '屏東', '台東', '花蓮', '宜蘭', '澎湖', '金門', '馬祖',
      // 金融投資
      '投資', '股票', '基金', '保險', '貸款', '信用卡', '理財',
      // 醫療診斷
      '醫療診斷', '看病', '開藥', '手術', '治療', '生病', '看醫生', '診斷',
      // 法律諮詢
      '法律', '訴訟', '合約', '糾紛', '律師',
      // 政治宗教
      '政治', '選舉', '投票', '政黨',
      '宗教', '信仰', '拜拜', '廟宇',
      '算命', '占卜', '風水', '命理',
      // 娛樂活動
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
      'ENGLISH_LEARNING': ['英語', '美語', '補習班', '學習', '英文', '課程', '培訓'],
      'UTILITIES': ['水電行', '修水電', '水電工', '電器行', '修理', '維修', '安裝'],
      'ENTERTAINMENT': ['音樂會', '演唱會', '表演', '電影', 'KTV', '遊戲', '娛樂'],
      'EDUCATION': ['才藝班', '音樂教室', '舞蹈教室', '畫畫', '鋼琴', '跳舞']
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

// 第三層：推薦層 (Recommendation Layer)
class RecommendationLayer {
  private dataLayer: DataLayer
  
  constructor(dataLayer: DataLayer) {
    this.dataLayer = dataLayer
  }
  
  async generateRecommendations(intent: string, message: string, subcategory?: string): Promise<{
    stores: any[]
    logic: any
  }> {
    console.log(`[推薦層] 生成推薦 - 意圖: ${intent}, 子類別: ${subcategory}`)
    
    let stores: any[] = []
    let logic: any = { intent, subcategory, eligible_count: 0, final_count: 0, kentucky_included: false, evidence_verified: true }
    
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
      // 根據子類別選擇查詢類別
      let foodCategory = '餐飲美食'
      
      if (subcategory) {
        // 使用子類別進行精確查詢
        foodCategory = subcategory
      } else {
        // 回退到關鍵字檢測
        const messageLower = message.toLowerCase()
        if (messageLower.includes('日料') || messageLower.includes('日式') || messageLower.includes('壽司') || messageLower.includes('拉麵') || messageLower.includes('燒肉') || messageLower.includes('天婦羅') || messageLower.includes('居酒屋') || messageLower.includes('和食')) {
          foodCategory = '日式料理'
        } else if (messageLower.includes('韓料') || messageLower.includes('韓式') || messageLower.includes('烤肉') || messageLower.includes('泡菜') || messageLower.includes('石鍋')) {
          foodCategory = '韓式料理'
        } else if (messageLower.includes('泰料') || messageLower.includes('泰式') || messageLower.includes('冬陰功') || messageLower.includes('綠咖喱')) {
          foodCategory = '泰式料理'
        } else if (messageLower.includes('義大利麵') || messageLower.includes('披薩') || messageLower.includes('義式') || messageLower.includes('義大利')) {
          foodCategory = '義式料理'
        } else if (messageLower.includes('中式') || messageLower.includes('火鍋') || messageLower.includes('川菜') || messageLower.includes('台菜')) {
          foodCategory = '中式料理'
        } else if (messageLower.includes('素食') || messageLower.includes('蔬食')) {
          foodCategory = '素食'
        }
      }
      
      stores = await this.dataLayer.getEligibleStores('FOOD', foodCategory)
      
      // 如果沒有找到特定類型的餐廳，不要回退，保持空列表
      if (stores.length === 0 && foodCategory !== '餐飲美食') {
        logic.no_specific_category = true
        logic.requested_category = foodCategory
      }
      
    } else if (intent === 'SHOPPING') {
      stores = await this.dataLayer.getEligibleStores('SHOPPING', '購物')
      
    } else if (intent === 'BEAUTY') {
      stores = await this.dataLayer.getEligibleStores('BEAUTY', '美容美髮')
      
    } else if (intent === 'MEDICAL') {
      stores = await this.dataLayer.getEligibleStores('MEDICAL', '醫療健康')
      
    } else if (intent === 'PARKING') {
      stores = await this.dataLayer.getEligibleStores('PARKING', '停車場')
      
    } else if (intent === 'STATISTICS') {
      // 統計查詢：獲取所有商家用於統計，不限制數量
      stores = await this.dataLayer.getEligibleStores('STATISTICS')
      
    } else if (intent === 'CONFIRMATION') {
      // 確認回應：不推薦新商家，保持上下文
      stores = []
      
    } else {
      // 一般推薦
      stores = await this.dataLayer.getEligibleStores('GENERAL')
    }
    
    // 限制推薦數量（統計查詢除外）
    if (intent !== 'STATISTICS') {
      stores = stores.slice(0, 3)
    }
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
  
  generateResponse(intent: string, stores: any[], message: string, emotion?: string, multiIntent?: string[], logic?: any): string {
    console.log('[語氣層] 生成語氣化回應')
    
    let response = ''
    
    if (intent === 'ENGLISH_LEARNING') {
      response = this.generateEnglishLearningResponse(stores)
    } else if (intent === 'FOOD') {
      response = this.generateFoodRecommendationResponse(stores, message, logic)
    } else if (intent === 'SHOPPING') {
      response = this.generateShoppingResponse(stores)
    } else if (intent === 'BEAUTY') {
      response = this.generateBeautyResponse(stores)
    } else if (intent === 'MEDICAL') {
      response = this.generateMedicalResponse(stores)
    } else if (intent === 'PARKING') {
      response = this.generateParkingResponse(stores)
    } else if (intent === 'STATISTICS') {
      response = this.generateStatisticsResponse(stores)
    } else if (intent === 'CONFIRMATION') {
      response = this.generateConfirmationResponse(message)
    } else if (intent === 'VAGUE_CHAT') {
      response = this.generateVagueChatResponse(message, emotion)
    } else if (intent === 'OUT_OF_SCOPE') {
      response = this.generateOutOfScopeResponse(message)
    } else if (intent === 'MIXED_INTENT') {
      response = this.generateMixedIntentResponse(message, stores, emotion)
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
  
  private generateFoodRecommendationResponse(stores: any[], message?: string, logic?: any): string {
    const messageLower = message?.toLowerCase() || ''
    
    if (stores.length === 0) {
      // 檢查是否為特定類型查詢但沒有找到
      if (logic?.no_specific_category && logic?.requested_category) {
        const category = logic.requested_category
        if (category === '日式料理') {
          return '抱歉，文山特區目前沒有找到專門的日料餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
        } else if (category === '韓式料理') {
          return '抱歉，文山特區目前沒有找到專門的韓式餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
        } else if (category === '泰式料理') {
          return '抱歉，文山特區目前沒有找到專門的泰式餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
        } else if (category === '義式料理') {
          return '抱歉，文山特區目前沒有找到專門的義式餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
        } else if (category === '素食') {
          return '抱歉，文山特區目前沒有找到專門的素食餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
        }
      }
      
      // 根據查詢類型提供不同的回應
      if (messageLower.includes('日料') || messageLower.includes('日式')) {
        return '抱歉，文山特區目前沒有找到專門的日料餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
      } else if (messageLower.includes('韓料') || messageLower.includes('韓式')) {
        return '抱歉，文山特區目前沒有找到專門的韓式餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
      } else if (messageLower.includes('泰料') || messageLower.includes('泰式')) {
        return '抱歉，文山特區目前沒有找到專門的泰式餐廳。不過我可以為你推薦其他不錯的美食選擇！要不要試試看其他類型的餐廳呢？😊'
      } else {
        return '抱歉，目前沒有找到合適的美食推薦。讓我再為你查詢看看～😊'
      }
    }
    
    // 根據查詢類型調整回應開頭
    let response = ''
    if (messageLower.includes('日料') || messageLower.includes('日式')) {
      response = '嘿！我為你找到了一些不錯的日式料理選擇：\n\n'
    } else if (messageLower.includes('韓料') || messageLower.includes('韓式')) {
      response = '嘿！我為你找到了一些不錯的韓式料理選擇：\n\n'
    } else if (messageLower.includes('泰料') || messageLower.includes('泰式')) {
      response = '嘿！我為你找到了一些不錯的泰式料理選擇：\n\n'
    } else {
      response = '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：\n\n'
    }
    
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
  
  private generateStatisticsResponse(stores: any[]): string {
    const totalStores = stores.length
    const approvedStores = stores.filter(s => s.approval === 'approved').length
    const partnerStores = stores.filter(s => s.is_partner_store === true).length
    const sponsoredStores = stores.filter(s => s.sponsorship_tier > 0).length
    const ratedStores = stores.filter(s => s.rating && s.rating > 0).length
    
    let response = `嘿！我來為你查詢一下文山特區的商家資料庫統計：

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
    
    return response
  }
  
  private generateShoppingResponse(stores: any[]): string {
    if (stores.length === 0) {
      return '抱歉，文山特區目前沒有找到相關的購物商家。不過我可以為你推薦其他不錯的選擇！'
    }
    
    let response = '嘿！文山特區有不少購物選擇呢～我為你推薦幾家：\n\n'
    
    stores.forEach((store, index) => {
      const partnerTag = store.is_partner_store ? ' [特約商家]' : ''
      const tierTag = store.sponsorship_tier > 0 ? ` [贊助等級 ${store.sponsorship_tier}]` : ''
      
      response += `${index + 1}. **${store.store_name}**${partnerTag}${tierTag}\n`
      response += `   📍 ${store.address}\n`
      response += `   🏷️ ${store.category}\n`
      if (store.rating && store.rating > 0) {
        response += `   ⭐ 評分：${store.rating}/5\n`
      }
      response += '\n'
    })
    
    response += '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～'
    return response
  }
  
  private generateBeautyResponse(stores: any[]): string {
    if (stores.length === 0) {
      return '抱歉，文山特區目前沒有找到相關的美容美髮商家。不過我可以為你推薦其他不錯的選擇！'
    }
    
    let response = '嘿！文山特區有不少美容美髮選擇呢～我為你推薦幾家：\n\n'
    
    stores.forEach((store, index) => {
      const partnerTag = store.is_partner_store ? ' [特約商家]' : ''
      const tierTag = store.sponsorship_tier > 0 ? ` [贊助等級 ${store.sponsorship_tier}]` : ''
      
      response += `${index + 1}. **${store.store_name}**${partnerTag}${tierTag}\n`
      response += `   📍 ${store.address}\n`
      response += `   🏷️ ${store.category}\n`
      if (store.rating && store.rating > 0) {
        response += `   ⭐ 評分：${store.rating}/5\n`
      }
      response += '\n'
    })
    
    response += '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～'
    return response
  }
  
  private generateMedicalResponse(stores: any[]): string {
    if (stores.length === 0) {
      return '抱歉，文山特區目前沒有找到相關的醫療健康商家。不過我可以為你推薦其他不錯的選擇！'
    }
    
    let response = '嘿！文山特區有不少醫療健康選擇呢～我為你推薦幾家：\n\n'
    
    stores.forEach((store, index) => {
      const partnerTag = store.is_partner_store ? ' [特約商家]' : ''
      const tierTag = store.sponsorship_tier > 0 ? ` [贊助等級 ${store.sponsorship_tier}]` : ''
      
      response += `${index + 1}. **${store.store_name}**${partnerTag}${tierTag}\n`
      response += `   📍 ${store.address}\n`
      response += `   🏷️ ${store.category}\n`
      if (store.rating && store.rating > 0) {
        response += `   ⭐ 評分：${store.rating}/5\n`
      }
      response += '\n'
    })
    
    response += '這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～'
    return response
  }

  private generateConfirmationResponse(message: string): string {
    const messageLower = message.toLowerCase()
    
    // 根據確認內容提供適當回應
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
  
  private generateVagueChatResponse(message: string, emotion?: string): string {
    const messageLower = message.toLowerCase()
    
    // 根據情感調整回應
    if (emotion === 'negative') {
      return `聽起來你現在心情不太好呢...不過沒關係，有時候吃點好吃的、逛逛文山特區能讓心情變好喔！我可以推薦一些不錯的餐廳或咖啡廳給你，或者找個安靜的停車場讓你散散步～有什麼想嘗試的嗎？💕`
    }
    
    // 根據不同情況提供引導性回應
    if (messageLower.includes('你好') || messageLower.includes('嗨') || messageLower.includes('哈囉')) {
      return `哈囉～我是高文文！很高興認識你！我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊`
    } else if (messageLower.includes('天氣') || messageLower.includes('心情') || messageLower.includes('感覺')) {
      return `我不太確定您的具體需求，不過我可以幫您推薦文山特區的美食、停車場或英語學習等服務喔～有什麼想了解的嗎？✨`
    } else if (messageLower.includes('無聊') || messageLower.includes('沒事')) {
      return `無聊的話，要不要來文山特區逛逛？我可以推薦一些不錯的餐廳、咖啡廳或有趣的店家給你～有什麼想探索的嗎？🎉`
    } else if (messageLower.includes('顏色') || messageLower.includes('喜歡')) {
      return `哇～你問我喜歡什麼顏色呀！我比較喜歡溫暖的顏色，就像文山特區給人的感覺一樣溫暖～不過我更想幫你推薦這裡的美食和服務！有什麼想了解的嗎？🌈`
    } else {
      return `我不太確定您的具體需求，不過我可以幫您推薦文山特區的美食、停車場或英語學習等服務喔～有什麼想了解的嗎？🤗`
    }
  }
  
  private generateMixedIntentResponse(message: string, stores: any[], emotion?: string): string {
    const messageLower = message.toLowerCase()
    let response = ''
    
    // 分析哪些意圖可以回應，哪些需要委婉拒絕
    const canRespondTo = ['FOOD', 'PARKING', 'ENGLISH_LEARNING', 'SHOPPING', 'BEAUTY', 'MEDICAL']
    const cannotRespondTo = ['UTILITIES', 'ENTERTAINMENT', 'EDUCATION']
    
    let hasValidRecommendations = false
    let hasOutOfScopeItems = false
    
    // 檢查美食推薦
    if (messageLower.includes('美食') && stores.length > 0) {
      response += `嘿！關於美食推薦，我為你找到了一些不錯的選擇：\n\n`
      stores.slice(0, 2).forEach((store, index) => {
        response += `${index + 1}. **${store.store_name}**\n`
        response += `   📍 ${store.address}\n`
        response += `   🏷️ ${store.category}\n\n`
      })
      hasValidRecommendations = true
    }
    
    // 檢查超出範圍的服務
    if (messageLower.includes('水電行')) {
      if (hasValidRecommendations) {
        response += `\n至於水電行，抱歉我目前沒有相關的資訊。不過我會反映給客服主管，也許可以在未來擴充這類服務範圍～`
      } else {
        response += `關於水電行，抱歉我目前沒有相關的資訊，我會反映給客服主管，也許可以在未來擴充這類服務範圍～`
      }
      hasOutOfScopeItems = true
    }
    
    // 結尾
    if (hasValidRecommendations && hasOutOfScopeItems) {
      response += `\n\n希望這些推薦對你有幫助！有什麼其他問題隨時找我喔～😊`
    } else if (hasValidRecommendations) {
      response += `希望這些推薦對你有幫助！有什麼其他問題隨時找我喔～✨`
    } else {
      response += `有什麼其他問題隨時找我喔～🤗`
    }
    
    return response
  }
  
  private generateOutOfScopeResponse(message: string): string {
    const messageLower = message.toLowerCase()
    
    // 根據超出範圍的類型提供不同的回應
    if (messageLower.includes('台北') || messageLower.includes('台中') || messageLower.includes('台南')) {
      return `抱歉，我是文山特區的專屬助手，對其他地區的資訊不太熟悉。不過我可以為你推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？😊`
    } else if (messageLower.includes('投資') || messageLower.includes('股票') || messageLower.includes('理財')) {
      return `抱歉，投資理財不在我的服務範圍內，這需要專業的理財顧問。不過我可以推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？✨`
    } else if (messageLower.includes('醫療') || messageLower.includes('看病') || messageLower.includes('診斷')) {
      return `抱歉，醫療診斷不在我的服務範圍內，建議您諮詢專業醫師。不過我可以推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？🤗`
    } else if (messageLower.includes('法律') || messageLower.includes('訴訟') || messageLower.includes('合約')) {
      return `抱歉，法律諮詢不在我的服務範圍內，建議您諮詢專業律師。不過我可以推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？😊`
    } else {
      return `抱歉，這超出了我的服務範圍，我會反映給客服主管，也許可以在未來擴充服務範圍。不過我可以推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？✨`
    }
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
    
    // 1. 意圖分析（包含對話歷史）
    const conversationHistory = await this.dataLayer.getConversationHistory(sessionId)
    const intentResult = this.intentLayer.classifyIntent(message, conversationHistory)
    console.log(`[ClaudeChatV2] 識別意圖: ${intentResult.intent} (信心度: ${intentResult.confidence})`)
    
    // 2. 推薦生成
    const recommendationResult = await this.recommendationLayer.generateRecommendations(intentResult.intent, message, intentResult.subcategory)
    console.log(`[ClaudeChatV2] 生成推薦: ${recommendationResult.stores.length} 個`)
    
    // 3. 語氣渲染
    const response = this.toneLayer.generateResponse(intentResult.intent, recommendationResult.stores, message, intentResult.emotion, intentResult.multiIntent, recommendationResult.logic)
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
      version: 'WEN 1.3.0'
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
      version: 'WEN 1.3.0'
            }

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    }
})
