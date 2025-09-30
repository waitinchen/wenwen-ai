import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 修復回應策略矩陣
class ResponseStrategyFixer {
  
  constructor() {
    this.strategyTests = [
      {
        query: '給丁丁連鎖藥局 地址',
        expectedStrategy: 'SPECIFIC_ENTITY',
        shouldContain: ['丁丁', '抱歉', '推薦', '替代'],
        shouldNotContain: ['屈臣氏', '康是美', '地址']
      },
      {
        query: '有藥局嗎？',
        expectedStrategy: 'CATEGORY_QUERY',
        shouldContain: ['藥局', '推薦', '📍'],
        shouldNotContain: ['抱歉，沒有找到']
      },
      {
        query: '你好',
        expectedStrategy: 'VAGUE_QUERY',
        shouldContain: ['高文文', '很高興', '服務', '幫助'],
        shouldNotContain: ['抱歉', '沒有找到']
      },
      {
        query: '今天天氣如何？',
        expectedStrategy: 'OUT_OF_SCOPE',
        shouldContain: ['專注於', '文山特區', '服務', '範圍'],
        shouldNotContain: ['天氣', '溫度', '降雨']
      }
    ]
  }
  
  /**
   * 執行回應策略修復
   */
  async fixResponseStrategy() {
    console.log('🔧 開始修復回應策略矩陣...')
    
    // 1. 測試當前策略問題
    await this.testCurrentStrategy()
    
    // 2. 分析策略缺失
    await this.analyzeStrategyIssues()
    
    // 3. 提供策略優化建議
    await this.provideStrategySuggestions()
  }
  
  /**
   * 測試當前策略
   */
  async testCurrentStrategy() {
    console.log('\n🎯 測試當前回應策略...')
    
    for (const test of this.strategyTests) {
      try {
        const result = await this.testQuery(test.query)
        const response = result.response
        
        console.log(`\n🔍 查詢: ${test.query}`)
        console.log(`預期策略: ${test.expectedStrategy}`)
        
        // 檢查應該包含的內容
        const hasExpectedContent = test.shouldContain.some(keyword => 
          response.toLowerCase().includes(keyword.toLowerCase())
        )
        
        // 檢查不應該包含的內容
        const hasForbiddenContent = test.shouldNotContain.some(keyword => 
          response.toLowerCase().includes(keyword.toLowerCase())
        )
        
        const strategyCorrect = hasExpectedContent && !hasForbiddenContent
        
        console.log(`應該包含: ${test.shouldContain.join(', ')}`)
        console.log(`實際包含: ${hasExpectedContent ? '✅' : '❌'}`)
        console.log(`不應包含: ${test.shouldNotContain.join(', ')}`)
        console.log(`實際包含: ${hasForbiddenContent ? '❌' : '✅'}`)
        console.log(`策略正確: ${strategyCorrect ? '✅' : '❌'}`)
        
        // 顯示回應預覽
        const preview = response.substring(0, 150) + '...'
        console.log(`回應預覽: ${preview}`)
        
      } catch (error) {
        console.log(`❌ ${test.query} → 測試失敗: ${error.message}`)
      }
    }
  }
  
  /**
   * 分析策略問題
   */
  async analyzeStrategyIssues() {
    console.log('\n🔍 分析策略問題...')
    
    const issues = {
      specificEntity: { total: 0, correct: 0 },
      categoryQuery: { total: 0, correct: 0 },
      vagueQuery: { total: 0, correct: 0 },
      outOfScope: { total: 0, correct: 0 }
    }
    
    for (const test of this.strategyTests) {
      try {
        const result = await this.testQuery(test.query)
        const response = result.response
        
        const hasExpectedContent = test.shouldContain.some(keyword => 
          response.toLowerCase().includes(keyword.toLowerCase())
        )
        const hasForbiddenContent = test.shouldNotContain.some(keyword => 
          response.toLowerCase().includes(keyword.toLowerCase())
        )
        
        const strategyCorrect = hasExpectedContent && !hasForbiddenContent
        
        // 根據預期策略分類
        if (test.expectedStrategy === 'SPECIFIC_ENTITY') {
          issues.specificEntity.total++
          if (strategyCorrect) issues.specificEntity.correct++
        } else if (test.expectedStrategy === 'CATEGORY_QUERY') {
          issues.categoryQuery.total++
          if (strategyCorrect) issues.categoryQuery.correct++
        } else if (test.expectedStrategy === 'VAGUE_QUERY') {
          issues.vagueQuery.total++
          if (strategyCorrect) issues.vagueQuery.correct++
        } else if (test.expectedStrategy === 'OUT_OF_SCOPE') {
          issues.outOfScope.total++
          if (strategyCorrect) issues.outOfScope.correct++
        }
        
      } catch (error) {
        console.log(`❌ ${test.query} → 分析失敗: ${error.message}`)
      }
    }
    
    console.log('\n📊 策略問題分析:')
    Object.keys(issues).forEach(strategy => {
      const issue = issues[strategy]
      const percentage = issue.total > 0 ? ((issue.correct / issue.total) * 100).toFixed(1) : 0
      console.log(`${strategy}: ${issue.correct}/${issue.total} (${percentage}%)`)
    })
  }
  
  /**
   * 提供策略優化建議
   */
  async provideStrategySuggestions() {
    console.log('\n💡 策略優化建議:')
    
    console.log('\n1. 特定實體查詢策略:')
    console.log('   - 找不到時: 明確說明 "抱歉，沒有找到 [實體名稱]"')
    console.log('   - 提供替代: 推薦相關的替代選項')
    console.log('   - 避免幻覺: 不要提供不存在的地址或電話')
    
    console.log('\n2. 類別查詢策略:')
    console.log('   - 直接回答: 提供相關類別的所有選項')
    console.log('   - 使用結構: 用 📍 標記地點，🏷️ 標記標籤')
    console.log('   - 避免拒絕: 不要說 "沒有找到"')
    
    console.log('\n3. 模糊查詢策略:')
    console.log('   - 親切回應: 使用 "高文文" 個人化')
    console.log('   - 引導明確: 幫助用戶明確需求')
    console.log('   - 提供選項: 列出可能的服務類別')
    
    console.log('\n4. 範圍外查詢策略:')
    console.log('   - 禮貌拒絕: 說明服務範圍限制')
    console.log('   - 引導回歸: 引導到文山特區相關服務')
    console.log('   - 避免回答: 不要提供範圍外的資訊')
    
    console.log('\n5. 實施修復步驟:')
    console.log('   - 更新 ToneRenderingLayer 類別')
    console.log('   - 修改 generateResponse 方法')
    console.log('   - 添加策略驗證函數')
    console.log('   - 測試所有策略類型')
  }
  
  /**
   * 測試單個查詢
   */
  async testQuery(query) {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `strategy-fix-test-${Date.now()}`,
        message: { role: 'user', content: query },
        user_meta: { external_id: 'strategy-fix-test' }
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
}

// 執行修復
async function runStrategyFix() {
  const fixer = new ResponseStrategyFixer()
  await fixer.fixResponseStrategy()
}

runStrategyFix()

