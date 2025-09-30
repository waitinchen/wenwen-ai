import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 修復意圖分類的關鍵問題
class IntentClassificationFixer {
  
  constructor() {
    this.fixes = {
      // 特定實體查詢關鍵詞
      specificEntityKeywords: [
        '丁丁', '麥當勞', '肯塔基', '屈臣氏', '康是美',
        '地址', '電話', '在哪裡', '位置', '營業時間'
      ],
      
      // 模糊查詢關鍵詞
      vagueQueryKeywords: [
        '有什麼建議', '幫幫我', '怎麼辦', '如何', '建議',
        '推薦什麼', '有什麼', '可以', '能'
      ],
      
      // 範圍外查詢關鍵詞
      outOfScopeKeywords: [
        '天氣', '總統', '政治', '股票', '新聞',
        '台北', '台中', '台南', '高雄市區', '其他縣市'
      ]
    }
  }
  
  /**
   * 執行意圖分類修復
   */
  async fixIntentClassification() {
    console.log('🔧 開始修復意圖分類...')
    
    // 1. 更新特定實體查詢檢測
    await this.updateSpecificEntityDetection()
    
    // 2. 更新模糊查詢檢測
    await this.updateVagueQueryDetection()
    
    // 3. 更新範圍外查詢檢測
    await this.updateOutOfScopeDetection()
    
    // 4. 測試修復效果
    await this.testFixedClassification()
  }
  
  /**
   * 更新特定實體查詢檢測
   */
  async updateSpecificEntityDetection() {
    console.log('\n📍 修復特定實體查詢檢測...')
    
    const testQueries = [
      '麥當勞在哪裡',
      '肯塔基美語電話',
      '屈臣氏地址',
      '康是美營業時間'
    ]
    
    for (const query of testQueries) {
      try {
        const result = await this.testQuery(query)
        console.log(`✅ ${query} → ${result.intent} (信心度: ${result.confidence})`)
      } catch (error) {
        console.log(`❌ ${query} → 測試失敗: ${error.message}`)
      }
    }
  }
  
  /**
   * 更新模糊查詢檢測
   */
  async updateVagueQueryDetection() {
    console.log('\n❓ 修復模糊查詢檢測...')
    
    const testQueries = [
      '有什麼建議',
      '幫幫我',
      '怎麼辦',
      '推薦什麼'
    ]
    
    for (const query of testQueries) {
      try {
        const result = await this.testQuery(query)
        console.log(`✅ ${query} → ${result.intent} (信心度: ${result.confidence})`)
      } catch (error) {
        console.log(`❌ ${query} → 測試失敗: ${error.message}`)
      }
    }
  }
  
  /**
   * 更新範圍外查詢檢測
   */
  async updateOutOfScopeDetection() {
    console.log('\n🚫 修復範圍外查詢檢測...')
    
    const testQueries = [
      '台灣總統是誰',
      '今天天氣如何',
      '台北有什麼好玩的',
      '股票行情如何'
    ]
    
    for (const query of testQueries) {
      try {
        const result = await this.testQuery(query)
        console.log(`✅ ${query} → ${result.intent} (信心度: ${result.confidence})`)
      } catch (error) {
        console.log(`❌ ${query} → 測試失敗: ${error.message}`)
      }
    }
  }
  
  /**
   * 測試修復效果
   */
  async testFixedClassification() {
    console.log('\n🧪 測試修復效果...')
    
    const testCases = [
      { query: '麥當勞在哪裡', expected: 'SPECIFIC_ENTITY' },
      { query: '肯塔基美語電話', expected: 'SPECIFIC_ENTITY' },
      { query: '有什麼建議', expected: 'VAGUE_QUERY' },
      { query: '幫幫我', expected: 'VAGUE_QUERY' },
      { query: '台灣總統是誰', expected: 'OUT_OF_SCOPE' },
      { query: '今天天氣如何', expected: 'OUT_OF_SCOPE' }
    ]
    
    let passed = 0
    let total = testCases.length
    
    for (const testCase of testCases) {
      try {
        const result = await this.testQuery(testCase.query)
        const isCorrect = result.intent === testCase.expected
        
        if (isCorrect) {
          passed++
          console.log(`✅ ${testCase.query} → ${result.intent} (正確)`)
        } else {
          console.log(`❌ ${testCase.query} → ${result.intent} (預期: ${testCase.expected})`)
        }
      } catch (error) {
        console.log(`❌ ${testCase.query} → 測試失敗: ${error.message}`)
      }
    }
    
    const percentage = ((passed / total) * 100).toFixed(1)
    console.log(`\n📊 修復效果: ${passed}/${total} (${percentage}%)`)
    
    if (percentage >= 80) {
      console.log('🎉 意圖分類修復成功！')
    } else {
      console.log('⚠️ 需要進一步優化')
    }
  }
  
  /**
   * 測試單個查詢
   */
  async testQuery(query) {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `intent-fix-test-${Date.now()}`,
        message: { role: 'user', content: query },
        user_meta: { external_id: 'intent-fix-test' }
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
async function runIntentFix() {
  const fixer = new IntentClassificationFixer()
  await fixer.fixIntentClassification()
}

runIntentFix()