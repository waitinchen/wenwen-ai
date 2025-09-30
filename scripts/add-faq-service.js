/**
 * 為claude-chat Edge Function添加FAQ查詢功能
 */

import { readFileSync, writeFileSync } from 'fs'

// 讀取現有的claude-chat Edge Function
const filePath = 'supabase/functions/claude-chat/index.ts'
let content = readFileSync(filePath, 'utf8')

// 在ValidationService類之後添加FAQService類
const faqServiceCode = `
/**
 * FAQ查詢服務 - 提供常見問題回答
 */
class FAQService {
  constructor(dataLayer) {
    this.dataLayer = dataLayer
  }

  /**
   * 查詢FAQ答案
   * @param {string} question 用戶問題
   * @returns {Promise<{answer: string, category: string} | null>}
   */
  async getFAQAnswer(question) {
    try {
      console.log(\`[FAQ服務] 查詢問題: \${question}\`)
      
      // 精確匹配
      let faq = await this.dataLayer.getFAQByQuestion(question)
      if (faq) {
        console.log(\`[FAQ服務] 精確匹配: \${faq.question}\`)
        return { answer: faq.answer, category: faq.category }
      }

      // 模糊匹配
      const faqs = await this.dataLayer.getAllFAQs()
      const fuzzyMatch = faqs.find(f => 
        f.question.includes(question) || 
        question.includes(f.question) ||
        this.calculateSimilarity(f.question, question) > 0.7
      )

      if (fuzzyMatch) {
        console.log(\`[FAQ服務] 模糊匹配: \${fuzzyMatch.question}\`)
        return { answer: fuzzyMatch.answer, category: fuzzyMatch.category }
      }

      console.log(\`[FAQ服務] 未找到匹配的FAQ\`)
      return null
    } catch (error) {
      console.error('[FAQ服務] 查詢錯誤:', error)
      return null
    }
  }

  /**
   * 計算字符串相似度
   * @param {string} str1 
   * @param {string} str2 
   * @returns {number}
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * 計算編輯距離
   * @param {string} str1 
   * @param {string} str2 
   * @returns {number}
   */
  levenshteinDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
}

`

// 在ValidationService類之後插入FAQService
const validationServiceEnd = content.indexOf('class SortingService {')
if (validationServiceEnd === -1) {
  console.error('找不到ValidationService類的結束位置')
  process.exit(1)
}

content = content.slice(0, validationServiceEnd) + faqServiceCode + content.slice(validationServiceEnd)

// 在DataLayer類中添加FAQ查詢方法
const dataLayerMethods = `
  /**
   * 根據問題查詢FAQ
   * @param {string} question 問題
   * @returns {Promise<any>}
   */
  async getFAQByQuestion(question) {
    try {
      const { data, error } = await this.supabase
        .from('faqs')
        .select('*')
        .eq('question', question)
        .eq('is_active', true)
        .single()
      
      if (error) {
        console.log(\`[數據層] FAQ查詢無結果: \${question}\`)
        return null
      }
      
      return data
    } catch (error) {
      console.error('[數據層] FAQ查詢錯誤:', error)
      return null
    }
  }

  /**
   * 獲取所有FAQ
   * @returns {Promise<any[]>}
   */
  async getAllFAQs() {
    try {
      const { data, error } = await this.supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
      
      if (error) {
        console.error('[數據層] 獲取所有FAQ錯誤:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('[數據層] 獲取所有FAQ異常:', error)
      return []
    }
  }

`

// 在DataLayer類的末尾添加FAQ方法
const dataLayerEnd = content.lastIndexOf('  }')
if (dataLayerEnd === -1) {
  console.error('找不到DataLayer類的結束位置')
  process.exit(1)
}

content = content.slice(0, dataLayerEnd) + dataLayerMethods + content.slice(dataLayerEnd)

// 在ClaudeChatV2RefactoredService類中添加FAQ服務
const serviceConstructor = content.indexOf('constructor(supabaseUrl: string, supabaseKey: string) {')
const serviceConstructorEnd = content.indexOf('}', serviceConstructor) + 1

const faqServiceInit = `
  private faqService: FAQService

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.dataLayer = new DataLayer(supabaseUrl, supabaseKey)
    this.intentLayer = new IntentLanguageLayer()
    this.recommendationLayer = new RecommendationLayer(this.dataLayer)
    this.toneLayer = new ToneRenderingLayer()
    this.loggingLayer = new LoggingFeedbackLayer(this.dataLayer)
    this.faqService = new FAQService(this.dataLayer)
  }
`

content = content.slice(0, serviceConstructor) + faqServiceInit + content.slice(serviceConstructorEnd)

// 在processMessage方法中添加FAQ查詢邏輯
const processMessageStart = content.indexOf('async processMessage(sessionId: string, message: string, userMeta?: any)')
const processMessageBody = content.indexOf('try {', processMessageStart)
const intentAnalysis = content.indexOf('// Step 1: 意圖分析', processMessageBody)

const faqQueryLogic = `
      // Step 0: FAQ查詢（優先級最高）
      const faqResult = await this.faqService.getFAQAnswer(message)
      if (faqResult) {
        console.log(\`[重構版] 找到FAQ答案: \${faqResult.category}\`)
        const processingTime = Date.now() - startTime
        
        return {
          response: faqResult.answer,
          session_id: sessionId,
          intent: 'FAQ',
          confidence: 1.0,
          recommended_stores: [],
          recommendation_logic: { type: 'faq', category: faqResult.category },
          version: CONFIG.system.version,
          processing_time: processingTime
        }
      }

`

content = content.slice(0, intentAnalysis) + faqQueryLogic + content.slice(intentAnalysis)

// 寫入修改後的文件
writeFileSync(filePath, content, 'utf8')

console.log('✅ FAQ服務已成功添加到claude-chat Edge Function')
console.log('📝 添加的功能:')
console.log('  - FAQService類：提供FAQ查詢和模糊匹配')
console.log('  - DataLayer方法：getFAQByQuestion和getAllFAQs')
console.log('  - 主服務整合：在processMessage中添加FAQ查詢邏輯')
console.log('  - 優先級：FAQ查詢優先於意圖分析')
console.log('\n🚀 請重新部署claude-chat Edge Function以生效')


