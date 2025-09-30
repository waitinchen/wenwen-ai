/**
 * 訓練資料知識庫服務
 * 功能：智慧匹配、模板渲染、使用統計、品質管理
 */

// ===== 類型定義 =====

export interface KnowledgeEntry {
  id: number
  intent_pattern: string
  intent_keywords: string[]
  intent_category: string
  intent_subcategory?: string
  response_template: string
  response_examples?: any
  template_variables?: any
  usage_conditions?: any
  priority_score: number
  quality_score: number
  usage_count: number
  success_rate: number
  status: 'active' | 'inactive' | 'deprecated' | 'testing'
  version: string
  created_at: string
  updated_at: string
}

export interface MatchResult {
  knowledge: KnowledgeEntry
  confidence: number
  matchedKeywords: string[]
  matchReason: string
}

export interface GeneratedResponse {
  template: string
  renderedResponse: string
  variables: Record<string, any>
  knowledgeId: number
  confidence: number
  responseTime: number
}

export interface UsageAnalytics {
  knowledgeId: number
  sessionId: string
  userQuestion: string
  matchedIntent: string
  confidence: number
  responseTime: number
  userFeedback?: 'positive' | 'negative' | 'neutral'
  userRating?: number
  contextRelevance: number
}

// ===== 核心知識庫服務 =====

export class KnowledgeBaseService {
  private supabaseUrl: string
  private supabaseKey: string
  private cache: Map<string, KnowledgeEntry[]> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30分鐘

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl
    this.supabaseKey = supabaseKey
  }

  /**
   * 搜尋和匹配知識庫條目
   */
  async findBestMatch(userQuestion: string, context?: any): Promise<MatchResult | null> {
    try {
      console.log('[知識庫] 搜尋最佳匹配:', userQuestion.substring(0, 50))

      // 1. 預處理用戶問題
      const processedQuery = this.preprocessQuery(userQuestion)
      const extractedKeywords = this.extractKeywords(processedQuery)
      const detectedIntent = this.detectIntent(processedQuery, extractedKeywords)

      // 2. 從知識庫中搜尋候選條目
      const candidates = await this.searchKnowledgeBase(processedQuery, detectedIntent)

      if (candidates.length === 0) {
        console.log('[知識庫] 未找到匹配條目')
        return null
      }

      // 3. 計算匹配分數並排序
      const scoredCandidates = this.scoreMatches(processedQuery, extractedKeywords, candidates, context)

      // 4. 選擇最佳匹配（信心度閾值 0.6）
      const bestMatch = scoredCandidates[0]
      if (bestMatch.confidence < 0.6) {
        console.log('[知識庫] 最佳匹配信心度過低:', bestMatch.confidence)
        return null
      }

      console.log(`[知識庫] 找到最佳匹配 ID: ${bestMatch.knowledge.id}, 信心度: ${bestMatch.confidence}`)
      return bestMatch

    } catch (error) {
      console.error('[知識庫] 搜尋匹配失敗:', error)
      return null
    }
  }

  /**
   * 生成個性化回應
   */
  async generateResponse(match: MatchResult, context?: any): Promise<GeneratedResponse> {
    const startTime = Date.now()

    try {
      console.log(`[知識庫] 生成回應，知識庫 ID: ${match.knowledge.id}`)

      // 1. 獲取動態資料（商家資訊等）
      const dynamicData = await this.fetchDynamicData(match.knowledge, context)

      // 2. 渲染模板
      const renderedResponse = this.renderTemplate(
        match.knowledge.response_template,
        {
          ...dynamicData,
          ...match.knowledge.template_variables,
          user_context: context
        }
      )

      // 3. 後處理（語氣調整、格式化等）
      const finalResponse = this.postProcessResponse(renderedResponse, context)

      const responseTime = Date.now() - startTime

      console.log(`[知識庫] 回應生成完成，耗時: ${responseTime}ms`)

      return {
        template: match.knowledge.response_template,
        renderedResponse: finalResponse,
        variables: dynamicData,
        knowledgeId: match.knowledge.id,
        confidence: match.confidence,
        responseTime
      }

    } catch (error) {
      console.error('[知識庫] 生成回應失敗:', error)

      // 回退機制
      return {
        template: '抱歉，我現在無法為您提供準確的資訊。請稍後再試或聯繫客服人員。',
        renderedResponse: '抱歉，我現在無法為您提供準確的資訊。請稍後再試或聯繫客服人員。',
        variables: {},
        knowledgeId: match.knowledge.id,
        confidence: 0.3,
        responseTime: Date.now() - startTime
      }
    }
  }

  /**
   * 記錄使用統計
   */
  async recordUsage(analytics: Partial<UsageAnalytics>): Promise<void> {
    try {
      const response = await fetch('/api/response-script-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_usage',
          data: {
            knowledge_id: analytics.knowledgeId,
            usage_data: analytics
          }
        })
      })

      if (!response.ok) {
        throw new Error(`記錄使用統計失敗: ${response.status}`)
      }

      console.log('[知識庫] 使用統計已記錄')
    } catch (error) {
      console.error('[知識庫] 記錄使用統計失敗:', error)
    }
  }

  // ===== 私有方法 =====

  /**
   * 預處理用戶查詢
   */
  private preprocessQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/[？！。，、]/g, '') // 移除標點符號
      .replace(/\s+/g, ' ') // 標準化空格
  }

  /**
   * 提取關鍵字
   */
  private extractKeywords(query: string): string[] {
    // 停用詞列表
    const stopWords = ['的', '是', '有', '在', '我', '你', '他', '她', '它', '們', '嗎', '呢', '啊', '了', '過', '要', '想', '可以', '能夠']

    // 簡單分詞（實際應用中可使用更複雜的中文分詞工具）
    const words = query.split('').filter(char =>
      char.length > 0 &&
      !stopWords.includes(char) &&
      /[\u4e00-\u9fff]/.test(char) // 中文字符
    )

    // 提取關鍵詞組
    const keywords: string[] = []
    for (let i = 0; i < words.length - 1; i++) {
      keywords.push(words[i] + words[i + 1])
    }

    return [...new Set([...words, ...keywords])].slice(0, 10)
  }

  /**
   * 檢測意圖
   */
  private detectIntent(query: string, keywords: string[]): string {
    const intentPatterns = {
      'FOOD': ['美食', '餐廳', '吃', '料理', '菜', '飯', '食物', '小吃'],
      'PARKING': ['停車', '車位', '停車場', '泊車'],
      'SHOPPING': ['買', '購物', '商店', '店家', '購買'],
      'ENGLISH_LEARNING': ['英語', '美語', '英文', '補習', '學習', '教育'],
      'BEAUTY': ['美髮', '美容', '剪髮', '做臉', '美甲'],
      'MEDICAL': ['診所', '醫院', '看病', '醫生', '藥局'],
      'GENERAL': ['推薦', '介紹', '有什麼', '哪裡', '如何', '怎麼']
    }

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => query.includes(pattern) || keywords.some(kw => kw.includes(pattern)))) {
        return intent
      }
    }

    return 'GENERAL'
  }

  /**
   * 從知識庫搜尋候選條目
   */
  private async searchKnowledgeBase(query: string, intent: string): Promise<KnowledgeEntry[]> {
    const cacheKey = `${intent}_${query.substring(0, 20)}`

    // 檢查快取
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > Date.now()) {
      return this.cache.get(cacheKey)!
    }

    try {
      const response = await fetch('/api/response-script-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_knowledge',
          data: {
            query: query,
            category: intent,
            limit: 20
          }
        })
      })

      if (!response.ok) {
        throw new Error(`搜尋失敗: ${response.status}`)
      }

      const result = await response.json()
      const candidates = result.data || []

      // 更新快取
      this.cache.set(cacheKey, candidates)
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL)

      return candidates
    } catch (error) {
      console.error('[知識庫] 搜尋候選條目失敗:', error)
      return []
    }
  }

  /**
   * 計算匹配分數
   */
  private scoreMatches(query: string, keywords: string[], candidates: KnowledgeEntry[], context?: any): MatchResult[] {
    const results: MatchResult[] = []

    for (const candidate of candidates) {
      const score = this.calculateMatchScore(query, keywords, candidate, context)

      if (score.confidence > 0) {
        results.push(score)
      }
    }

    // 按信心度和品質分數排序
    return results.sort((a, b) => {
      const scoreA = a.confidence * 0.7 + (a.knowledge.quality_score / 100) * 0.3
      const scoreB = b.confidence * 0.7 + (b.knowledge.quality_score / 100) * 0.3
      return scoreB - scoreA
    })
  }

  /**
   * 計算單個條目的匹配分數
   */
  private calculateMatchScore(query: string, keywords: string[], candidate: KnowledgeEntry, context?: any): MatchResult {
    let confidence = 0
    const matchedKeywords: string[] = []
    const reasons: string[] = []

    // 1. 關鍵字匹配 (40%)
    const keywordScore = this.calculateKeywordScore(keywords, candidate.intent_keywords, matchedKeywords)
    confidence += keywordScore * 0.4
    if (keywordScore > 0) reasons.push(`關鍵字匹配: ${keywordScore.toFixed(2)}`)

    // 2. 意圖模式匹配 (30%)
    const patternScore = this.calculatePatternScore(query, candidate.intent_pattern)
    confidence += patternScore * 0.3
    if (patternScore > 0) reasons.push(`模式匹配: ${patternScore.toFixed(2)}`)

    // 3. 語義相似度 (20%)
    const semanticScore = this.calculateSemanticScore(query, candidate.response_template)
    confidence += semanticScore * 0.2
    if (semanticScore > 0) reasons.push(`語義相似: ${semanticScore.toFixed(2)}`)

    // 4. 品質權重 (10%)
    const qualityBonus = (candidate.quality_score / 100) * 0.1
    confidence += qualityBonus

    // 5. 使用條件匹配
    if (candidate.usage_conditions) {
      const conditionScore = this.checkUsageConditions(candidate.usage_conditions, context)
      confidence *= conditionScore
      if (conditionScore < 1) reasons.push(`條件限制: ${conditionScore.toFixed(2)}`)
    }

    return {
      knowledge: candidate,
      confidence: Math.min(confidence, 1.0),
      matchedKeywords,
      matchReason: reasons.join(', ')
    }
  }

  /**
   * 計算關鍵字匹配分數
   */
  private calculateKeywordScore(userKeywords: string[], candidateKeywords: string[], matchedKeywords: string[]): number {
    if (!candidateKeywords || candidateKeywords.length === 0) return 0

    let matches = 0
    for (const userKw of userKeywords) {
      for (const candKw of candidateKeywords) {
        if (userKw.includes(candKw) || candKw.includes(userKw)) {
          matches++
          matchedKeywords.push(candKw)
          break
        }
      }
    }

    return Math.min(matches / Math.max(userKeywords.length, candidateKeywords.length), 1.0)
  }

  /**
   * 計算模式匹配分數
   */
  private calculatePatternScore(query: string, pattern: string): number {
    if (!pattern) return 0

    // 簡單的模糊匹配
    const patternWords = pattern.toLowerCase().split(' ')
    let matchCount = 0

    for (const word of patternWords) {
      if (query.includes(word)) {
        matchCount++
      }
    }

    return matchCount / patternWords.length
  }

  /**
   * 計算語義相似度分數
   */
  private calculateSemanticScore(query: string, template: string): number {
    // 簡化的語義相似度計算
    // 實際應用中可使用更複雜的NLP技術
    const queryLength = query.length
    const templateLength = template.length

    if (queryLength === 0 || templateLength === 0) return 0

    // 計算重疊字符比例
    let overlap = 0
    for (const char of query) {
      if (template.includes(char)) {
        overlap++
      }
    }

    return overlap / Math.max(queryLength, templateLength)
  }

  /**
   * 檢查使用條件
   */
  private checkUsageConditions(conditions: any, context?: any): number {
    if (!conditions || !context) return 1.0

    let score = 1.0

    // 時間限制
    if (conditions.time_of_day) {
      const currentHour = new Date().getHours()
      const allowedHours = conditions.time_of_day
      if (Array.isArray(allowedHours) && !allowedHours.includes(currentHour)) {
        score *= 0.5
      }
    }

    // 用戶類型限制
    if (conditions.user_type && context.user_type) {
      if (conditions.user_type !== context.user_type) {
        score *= 0.7
      }
    }

    return score
  }

  /**
   * 獲取動態資料
   */
  private async fetchDynamicData(knowledge: KnowledgeEntry, context?: any): Promise<Record<string, any>> {
    const dynamicData: Record<string, any> = {}

    try {
      // 根據意圖類型獲取相關商家資料
      if (knowledge.intent_category === 'FOOD') {
        dynamicData.restaurants = await this.fetchRestaurants(context)
      } else if (knowledge.intent_category === 'PARKING') {
        dynamicData.parking_lots = await this.fetchParkingLots(context)
      } else if (knowledge.intent_category === 'ENGLISH_LEARNING') {
        dynamicData.kentucky_info = await this.fetchKentuckyInfo()
      }

      // 添加通用資料
      dynamicData.current_time = new Date().toLocaleString('zh-TW')
      dynamicData.service_area = '文山特區'

    } catch (error) {
      console.error('[知識庫] 獲取動態資料失敗:', error)
    }

    return dynamicData
  }

  /**
   * 獲取餐廳資料
   */
  private async fetchRestaurants(context?: any): Promise<any[]> {
    // 這裡應該調用現有的商家查詢API
    // 暫時返回模擬資料
    return [
      {
        name: '文山小館',
        address: '文山區美食街1號',
        rating: 4.5,
        category: '台式料理'
      }
    ]
  }

  /**
   * 獲取停車場資料
   */
  private async fetchParkingLots(context?: any): Promise<any[]> {
    return [
      {
        name: '文山停車場',
        address: '文山區停車路123號',
        hourly_rate: 30,
        available_spaces: 15
      }
    ]
  }

  /**
   * 獲取肯塔基美語資料
   */
  private async fetchKentuckyInfo(): Promise<any> {
    return {
      name: '肯塔基美語',
      schools: [
        { name: '鳳山直營校', phone: '07-7777789', address: '高雄市鳳山區文化路131號' },
        { name: '瑞興直營校', phone: '07-7999191', address: '高雄市鳳山區博愛路167號' }
      ],
      line_id: 'kentuckyschool'
    }
  }

  /**
   * 渲染模板
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template

    // 替換模板變數
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g')

      if (Array.isArray(value)) {
        // 處理陣列資料（如商家列表）
        const listItems = value.map((item, index) =>
          `${index + 1}. **${item.name || item.store_name}**\n   📍 ${item.address}\n   ${item.rating ? `⭐ 評分：${item.rating}/5` : ''}`
        ).join('\n\n')

        rendered = rendered.replace(placeholder, listItems)
      } else if (typeof value === 'object' && value !== null) {
        // 處理物件資料
        rendered = rendered.replace(placeholder, JSON.stringify(value, null, 2))
      } else {
        // 處理簡單值
        rendered = rendered.replace(placeholder, String(value))
      }
    }

    // 清理未替換的模板變數
    rendered = rendered.replace(/\{[^}]+\}/g, '')

    return rendered
  }

  /**
   * 後處理回應
   */
  private postProcessResponse(response: string, context?: any): string {
    let processed = response

    // 移除多餘空行
    processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n')

    // 確保適當的語氣
    if (context?.tone === 'formal') {
      processed = processed.replace(/～/g, '。')
      processed = processed.replace(/呢/g, '')
    }

    return processed.trim()
  }

  /**
   * 清理快取
   */
  public clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
    console.log('[知識庫] 快取已清理')
  }

  /**
   * 獲取快取統計
   */
  public getCacheStats(): { size: number, hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // 模擬數據，實際應該統計命中率
    }
  }
}

// ===== 輔助函數 =====

/**
 * 創建知識庫服務實例
 */
export function createKnowledgeBaseService(supabaseUrl: string, supabaseKey: string): KnowledgeBaseService {
  return new KnowledgeBaseService(supabaseUrl, supabaseKey)
}

/**
 * 知識庫匹配信心度分級
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' | 'very_low' {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  if (confidence >= 0.4) return 'low'
  return 'very_low'
}

/**
 * 格式化匹配結果用於日誌
 */
export function formatMatchResult(result: MatchResult): string {
  return `知識庫 ID: ${result.knowledge.id}, 信心度: ${result.confidence.toFixed(3)}, 原因: ${result.matchReason}`
}