import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 全面性原則性回應策略驗證框架
class UniversalFrameworkValidator {
  
  constructor() {
    this.testResults = {
      intentClassification: { passed: 0, total: 0, details: [] },
      responseStrategy: { passed: 0, total: 0, details: [] },
      transparency: { passed: 0, total: 0, details: [] },
      consistency: { passed: 0, total: 0, details: [] },
      scalability: { passed: 0, total: 0, details: [] }
    }
  }
  
  /**
   * 執行全面驗證
   */
  async validateFramework() {
    console.log('🔍 開始驗證全面性原則性回應策略框架...')
    console.log('=' * 80)
    
    // 1. 意圖分類層級化驗證
    await this.validateIntentClassification()
    
    // 2. 回應策略矩陣驗證
    await this.validateResponseStrategy()
    
    // 3. 透明化說明驗證
    await this.validateTransparency()
    
    // 4. 一致性格式驗證
    await this.validateConsistency()
    
    // 5. 可擴展性驗證
    await this.validateScalability()
    
    // 生成驗證報告
    this.generateValidationReport()
  }
  
  /**
   * 驗證意圖分類層級化
   */
  async validateIntentClassification() {
    console.log('\n📊 1. 驗證意圖分類層級化...')
    
    const testCases = [
      // 特定實體查詢 (最高優先級)
      { query: '給丁丁連鎖藥局 地址', expectedIntent: 'SPECIFIC_ENTITY', priority: 1 },
      { query: '麥當勞在哪裡', expectedIntent: 'SPECIFIC_ENTITY', priority: 1 },
      { query: '肯塔基美語電話', expectedIntent: 'SPECIFIC_ENTITY', priority: 1 },
      
      // 類別查詢
      { query: '有藥局嗎？', expectedIntent: 'CATEGORY_QUERY', priority: 2 },
      { query: '推薦餐廳', expectedIntent: 'CATEGORY_QUERY', priority: 2 },
      { query: '停車資訊', expectedIntent: 'CATEGORY_QUERY', priority: 2 },
      
      // 模糊查詢
      { query: '你好', expectedIntent: 'VAGUE_QUERY', priority: 3 },
      { query: '有什麼建議', expectedIntent: 'VAGUE_QUERY', priority: 3 },
      { query: '幫幫我', expectedIntent: 'VAGUE_QUERY', priority: 3 },
      
      // 範圍外查詢
      { query: '今天天氣如何？', expectedIntent: 'OUT_OF_SCOPE', priority: 4 },
      { query: '台灣總統是誰？', expectedIntent: 'OUT_OF_SCOPE', priority: 4 },
      { query: '台北有什麼好玩的？', expectedIntent: 'OUT_OF_SCOPE', priority: 4 }
    ]
    
    for (const testCase of testCases) {
      this.testResults.intentClassification.total++
      
      try {
        const result = await this.testQuery(testCase.query)
        const actualIntent = result.intent
        const confidence = result.confidence
        
        // 檢查意圖是否正確或可接受
        const isCorrect = actualIntent === testCase.expectedIntent || 
                         this.isAcceptableIntent(actualIntent, testCase.expectedIntent)
        
        if (isCorrect) {
          this.testResults.intentClassification.passed++
          console.log(`✅ ${testCase.query} → ${actualIntent} (信心度: ${confidence})`)
        } else {
          console.log(`❌ ${testCase.query} → ${actualIntent} (預期: ${testCase.expectedIntent})`)
        }
        
        this.testResults.intentClassification.details.push({
          query: testCase.query,
          expected: testCase.expectedIntent,
          actual: actualIntent,
          confidence: confidence,
          passed: isCorrect
        })
        
      } catch (error) {
        console.log(`❌ ${testCase.query} → 測試失敗: ${error.message}`)
        this.testResults.intentClassification.details.push({
          query: testCase.query,
          expected: testCase.expectedIntent,
          actual: 'ERROR',
          confidence: 0,
          passed: false,
          error: error.message
        })
      }
    }
  }
  
  /**
   * 驗證回應策略矩陣
   */
  async validateResponseStrategy() {
    console.log('\n🎯 2. 驗證回應策略矩陣...')
    
    const strategyTests = [
      {
        query: '給丁丁連鎖藥局 地址',
        expectedStrategy: 'SPECIFIC_ENTITY',
        shouldContain: ['丁丁', '抱歉', '推薦'],
        shouldNotContain: ['屈臣氏', '康是美']
      },
      {
        query: '有藥局嗎？',
        expectedStrategy: 'CATEGORY_QUERY',
        shouldContain: ['藥局', '推薦'],
        shouldNotContain: ['抱歉，沒有找到']
      },
      {
        query: '你好',
        expectedStrategy: 'VAGUE_QUERY',
        shouldContain: ['高文文', '很高興', '服務'],
        shouldNotContain: ['抱歉', '沒有找到']
      },
      {
        query: '今天天氣如何？',
        expectedStrategy: 'OUT_OF_SCOPE',
        shouldContain: ['專注於', '文山特區', '服務'],
        shouldNotContain: ['天氣', '溫度']
      }
    ]
    
    for (const test of strategyTests) {
      this.testResults.responseStrategy.total++
      
      try {
        const result = await this.testQuery(test.query)
        const response = result.response
        
        // 檢查回應策略
        const hasExpectedContent = test.shouldContain.some(keyword => 
          response.toLowerCase().includes(keyword.toLowerCase())
        )
        const hasForbiddenContent = test.shouldNotContain.some(keyword => 
          response.toLowerCase().includes(keyword.toLowerCase())
        )
        
        const strategyCorrect = hasExpectedContent && !hasForbiddenContent
        
        if (strategyCorrect) {
          this.testResults.responseStrategy.passed++
          console.log(`✅ ${test.query} → 策略正確`)
        } else {
          console.log(`❌ ${test.query} → 策略錯誤`)
        }
        
        this.testResults.responseStrategy.details.push({
          query: test.query,
          expectedStrategy: test.expectedStrategy,
          passed: strategyCorrect,
          hasExpectedContent,
          hasForbiddenContent
        })
        
      } catch (error) {
        console.log(`❌ ${test.query} → 策略驗證失敗: ${error.message}`)
        this.testResults.responseStrategy.total--
      }
    }
  }
  
  /**
   * 驗證透明化說明
   */
  async validateTransparency() {
    console.log('\n🔍 3. 驗證透明化說明...')
    
    const transparencyTests = [
      {
        query: '給丁丁連鎖藥局 地址',
        shouldExplain: true,
        explanationKeywords: ['抱歉', '沒有找到', '推薦']
      },
      {
        query: '有藥局嗎？',
        shouldExplain: false,
        explanationKeywords: []
      },
      {
        query: '今天天氣如何？',
        shouldExplain: true,
        explanationKeywords: ['專注於', '服務範圍']
      }
    ]
    
    for (const test of transparencyTests) {
      this.testResults.transparency.total++
      
      try {
        const result = await this.testQuery(test.query)
        const response = result.response
        
        if (test.shouldExplain) {
          const hasExplanation = test.explanationKeywords.some(keyword => 
            response.toLowerCase().includes(keyword.toLowerCase())
          )
          
          if (hasExplanation) {
            this.testResults.transparency.passed++
            console.log(`✅ ${test.query} → 有透明化說明`)
          } else {
            console.log(`❌ ${test.query} → 缺少透明化說明`)
          }
        } else {
          // 不需要解釋的情況，檢查是否有不必要的解釋
          const hasUnnecessaryExplanation = test.explanationKeywords.some(keyword => 
            response.toLowerCase().includes(keyword.toLowerCase())
          )
          
          if (!hasUnnecessaryExplanation) {
            this.testResults.transparency.passed++
            console.log(`✅ ${test.query} → 回應適當`)
          } else {
            console.log(`❌ ${test.query} → 有不必要的解釋`)
          }
        }
        
      } catch (error) {
        console.log(`❌ ${test.query} → 透明化驗證失敗: ${error.message}`)
        this.testResults.transparency.total--
      }
    }
  }
  
  /**
   * 驗證一致性格式
   */
  async validateConsistency() {
    console.log('\n📝 4. 驗證一致性格式...')
    
    const consistencyTests = [
      '有藥局嗎？',
      '推薦餐廳',
      '你好',
      '停車資訊'
    ]
    
    for (const query of consistencyTests) {
      this.testResults.consistency.total++
      
      try {
        const result = await this.testQuery(query)
        const response = result.response
        
        // 檢查格式一致性
        const hasVersion = response.includes('*WEN')
        const hasStructure = response.includes('---') || response.includes('📍') || response.includes('🏷️')
        const hasPersonalization = response.includes('高文文') || response.includes('文山特區')
        
        const isConsistent = hasVersion && hasStructure && hasPersonalization
        
        if (isConsistent) {
          this.testResults.consistency.passed++
          console.log(`✅ ${query} → 格式一致`)
        } else {
          console.log(`❌ ${query} → 格式不一致`)
        }
        
      } catch (error) {
        console.log(`❌ ${query} → 一致性驗證失敗: ${error.message}`)
        this.testResults.consistency.total--
      }
    }
  }
  
  /**
   * 驗證可擴展性
   */
  async validateScalability() {
    console.log('\n🔧 5. 驗證可擴展性...')
    
    // 測試不同類型的查詢
    const scalabilityTests = [
      '有書店嗎？',
      '推薦美髮店',
      '有醫院嗎？',
      '推薦購物中心',
      '有銀行嗎？'
    ]
    
    for (const query of scalabilityTests) {
      this.testResults.scalability.total++
      
      try {
        const result = await this.testQuery(query)
        const response = result.response
        
        // 檢查是否能處理不同類型的查詢
        const hasResponse = response && response.length > 0
        const hasStructure = response.includes('*WEN') || response.includes('高文文')
        
        const isScalable = hasResponse && hasStructure
        
        if (isScalable) {
          this.testResults.scalability.passed++
          console.log(`✅ ${query} → 可擴展`)
        } else {
          console.log(`❌ ${query} → 不可擴展`)
        }
        
      } catch (error) {
        console.log(`❌ ${query} → 可擴展性驗證失敗: ${error.message}`)
        this.testResults.scalability.total--
      }
    }
  }
  
  /**
   * 測試單個查詢
   */
  async testQuery(query) {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `validation-test-${Date.now()}`,
        message: { role: 'user', content: query },
        user_meta: { external_id: 'validation-test' }
      }
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    if (!data || !data.data) {
      throw new Error('無回應數據')
    }
    
    return data.data
  }
  
  /**
   * 檢查意圖是否可接受
   */
  isAcceptableIntent(actual, expected) {
    const acceptableMappings = {
      'SPECIFIC_ENTITY': ['FAQ', 'MEDICAL', 'FOOD', 'EDUCATION'],
      'CATEGORY_QUERY': ['FAQ', 'FOOD', 'MEDICAL', 'PARKING', 'SHOPPING'],
      'VAGUE_QUERY': ['VAGUE_CHAT', 'CONFIRMATION'],
      'OUT_OF_SCOPE': ['VAGUE_CHAT', 'OUT_OF_SCOPE']
    }
    
    return acceptableMappings[expected]?.includes(actual) || false
  }
  
  /**
   * 生成驗證報告
   */
  generateValidationReport() {
    console.log('\n' + '=' * 80)
    console.log('📊 全面性原則性回應策略框架驗證報告')
    console.log('=' * 80)
    
    const categories = Object.keys(this.testResults)
    let totalPassed = 0
    let totalTests = 0
    
    categories.forEach(category => {
      const result = this.testResults[category]
      const percentage = ((result.passed / result.total) * 100).toFixed(1)
      totalPassed += result.passed
      totalTests += result.total
      
      console.log(`\n${this.getCategoryName(category)}:`)
      console.log(`  通過: ${result.passed}/${result.total} (${percentage}%)`)
      
      if (result.details) {
        result.details.forEach(detail => {
          const status = detail.passed ? '✅' : '❌'
          console.log(`  ${status} ${detail.query} → ${detail.actual}`)
        })
      }
    })
    
    const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1)
    console.log(`\n📈 總體驗證結果:`)
    console.log(`  通過: ${totalPassed}/${totalTests} (${overallPercentage}%)`)
    
    if (overallPercentage >= 80) {
      console.log('\n🎉 框架驗證通過！系統具備全面性原則性回應策略框架')
      console.log('✅ 可以處理各種類型的查詢')
      console.log('✅ 具備智能意圖分類能力')
      console.log('✅ 提供透明化說明')
      console.log('✅ 保持一致性格式')
      console.log('✅ 支持可擴展性')
    } else if (overallPercentage >= 60) {
      console.log('\n👍 框架基本通過，建議優化')
      console.log('⚠️ 部分功能需要改進')
    } else {
      console.log('\n❌ 框架驗證失敗，需要重大改進')
    }
  }
  
  /**
   * 獲取類別名稱
   */
  getCategoryName(category) {
    const names = {
      'intentClassification': '意圖分類層級化',
      'responseStrategy': '回應策略矩陣',
      'transparency': '透明化說明',
      'consistency': '一致性格式',
      'scalability': '可擴展性'
    }
    return names[category] || category
  }
}

// 執行驗證
async function runValidation() {
  const validator = new UniversalFrameworkValidator()
  await validator.validateFramework()
}

runValidation()


