import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 修復回應格式一致性
class ResponseConsistencyFixer {
  
  constructor() {
    this.requiredElements = {
      version: '*WEN',
      structure: ['---', '📍', '🏷️', '💡'],
      personalization: ['高文文', '文山特區'],
      greeting: ['很高興', '服務', '幫助']
    }
  }
  
  /**
   * 執行回應格式修復
   */
  async fixResponseConsistency() {
    console.log('🔧 開始修復回應格式一致性...')
    
    // 1. 測試當前格式問題
    await this.testCurrentFormat()
    
    // 2. 分析格式缺失
    await this.analyzeFormatIssues()
    
    // 3. 提供修復建議
    await this.provideFixSuggestions()
  }
  
  /**
   * 測試當前格式
   */
  async testCurrentFormat() {
    console.log('\n📝 測試當前回應格式...')
    
    const testQueries = [
      '有藥局嗎？',
      '你好',
      '停車資訊',
      '推薦餐廳'
    ]
    
    for (const query of testQueries) {
      try {
        const result = await this.testQuery(query)
        const response = result.response
        
        console.log(`\n🔍 查詢: ${query}`)
        console.log(`回應長度: ${response.length} 字`)
        
        // 檢查必要元素
        const hasVersion = response.includes('*WEN')
        const hasStructure = this.requiredElements.structure.some(element => 
          response.includes(element)
        )
        const hasPersonalization = this.requiredElements.personalization.some(element => 
          response.includes(element)
        )
        
        console.log(`版本標識: ${hasVersion ? '✅' : '❌'}`)
        console.log(`結構元素: ${hasStructure ? '✅' : '❌'}`)
        console.log(`個人化: ${hasPersonalization ? '✅' : '❌'}`)
        
        // 顯示回應預覽
        const preview = response.substring(0, 100) + '...'
        console.log(`回應預覽: ${preview}`)
        
      } catch (error) {
        console.log(`❌ ${query} → 測試失敗: ${error.message}`)
      }
    }
  }
  
  /**
   * 分析格式問題
   */
  async analyzeFormatIssues() {
    console.log('\n🔍 分析格式問題...')
    
    const issues = {
      missingVersion: 0,
      missingStructure: 0,
      missingPersonalization: 0,
      inconsistentLength: 0
    }
    
    const testQueries = [
      '有藥局嗎？',
      '你好',
      '停車資訊',
      '推薦餐廳',
      '有書店嗎？',
      '有銀行嗎？'
    ]
    
    let totalTests = 0
    
    for (const query of testQueries) {
      try {
        const result = await this.testQuery(query)
        const response = result.response
        
        totalTests++
        
        if (!response.includes('*WEN')) issues.missingVersion++
        if (!this.requiredElements.structure.some(element => response.includes(element))) {
          issues.missingStructure++
        }
        if (!this.requiredElements.personalization.some(element => response.includes(element))) {
          issues.missingPersonalization++
        }
        if (response.length < 50 || response.length > 500) {
          issues.inconsistentLength++
        }
        
      } catch (error) {
        console.log(`❌ ${query} → 分析失敗: ${error.message}`)
      }
    }
    
    console.log('\n📊 格式問題分析:')
    console.log(`缺少版本標識: ${issues.missingVersion}/${totalTests} (${((issues.missingVersion/totalTests)*100).toFixed(1)}%)`)
    console.log(`缺少結構元素: ${issues.missingStructure}/${totalTests} (${((issues.missingStructure/totalTests)*100).toFixed(1)}%)`)
    console.log(`缺少個人化: ${issues.missingPersonalization}/${totalTests} (${((issues.missingPersonalization/totalTests)*100).toFixed(1)}%)`)
    console.log(`長度不一致: ${issues.inconsistentLength}/${totalTests} (${((issues.inconsistentLength/totalTests)*100).toFixed(1)}%)`)
  }
  
  /**
   * 提供修復建議
   */
  async provideFixSuggestions() {
    console.log('\n💡 修復建議:')
    
    console.log('\n1. 確保所有回應都包含版本標識:')
    console.log('   - 在回應開頭添加 "*WEN v1.0"')
    console.log('   - 使用統一的版本格式')
    
    console.log('\n2. 標準化回應結構:')
    console.log('   - 使用 "---" 分隔不同段落')
    console.log('   - 使用 "📍" 標記地點資訊')
    console.log('   - 使用 "🏷️" 標記標籤資訊')
    console.log('   - 使用 "💡" 標記建議資訊')
    
    console.log('\n3. 加強個人化元素:')
    console.log('   - 每個回應都提到 "高文文"')
    console.log('   - 強調 "文山特區" 服務範圍')
    console.log('   - 使用親切的語氣')
    
    console.log('\n4. 控制回應長度:')
    console.log('   - 最短: 50 字 (基本回應)')
    console.log('   - 最長: 500 字 (詳細回應)')
    console.log('   - 平均: 150-300 字')
    
    console.log('\n5. 實施修復步驟:')
    console.log('   - 更新 ToneRenderingLayer 類別')
    console.log('   - 修改 generateResponse 方法')
    console.log('   - 添加格式驗證函數')
    console.log('   - 測試所有回應類型')
  }
  
  /**
   * 測試單個查詢
   */
  async testQuery(query) {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `consistency-fix-test-${Date.now()}`,
        message: { role: 'user', content: query },
        user_meta: { external_id: 'consistency-fix-test' }
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
async function runConsistencyFix() {
  const fixer = new ResponseConsistencyFixer()
  await fixer.fixResponseConsistency()
}

runConsistencyFix()

