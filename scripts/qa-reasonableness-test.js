import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 問答合理性測試案例
const testCases = [
  // === 服務範圍測試 ===
  {
    category: '服務範圍',
    questions: [
      '告訴我妳的服務範圍',
      '你能幫我什麼？',
      '你的功能有哪些？'
    ],
    expectedCriteria: {
      shouldContain: ['美食', '停車', '服務'],
      shouldNotContain: ['天氣', '新聞', '政治'],
      responseType: 'structured',
      maxLength: 1000
    }
  },

  // === 美食推薦測試 ===
  {
    category: '美食推薦',
    questions: [
      '請推薦鳳山區美食情報',
      '有什麼好吃的餐廳？',
      '有日式料理嗎？',
      '有韓式料理嗎？',
      '有中式料理嗎？',
      '有素食餐廳嗎？'
    ],
    expectedCriteria: {
      shouldContain: ['推薦', '餐廳', '美食'],
      shouldNotContain: ['抱歉，沒有找到'],
      responseType: 'structured',
      maxLength: 800
    }
  },

  // === 停車資訊測試 ===
  {
    category: '停車資訊',
    questions: [
      '查詢鳳山區停車資訊',
      '哪裡可以停車？',
      '有停車場嗎？',
      '停車費多少？'
    ],
    expectedCriteria: {
      shouldContain: ['停車', '停車場', '停車資訊'],
      shouldNotContain: ['抱歉，沒有找到'],
      responseType: 'structured',
      maxLength: 600
    }
  },

  // === 商家查詢測試 ===
  {
    category: '商家查詢',
    questions: [
      '有藥局嗎？',
      '有書店嗎？',
      '有醫院嗎？',
      '有診所嗎？',
      '有便利商店嗎？',
      '有美髮店嗎？'
    ],
    expectedCriteria: {
      shouldContain: ['藥局', '書店', '醫院', '診所', '便利商店', '美髮店'],
      shouldNotContain: ['抱歉，沒有找到'],
      responseType: 'structured',
      maxLength: 500
    }
  },

  // === 問候語測試 ===
  {
    category: '問候語',
    questions: [
      '嗨！你好',
      'Hello',
      '早安',
      '晚安'
    ],
    expectedCriteria: {
      shouldContain: ['高文文', '你好', '很高興'],
      shouldNotContain: ['抱歉', '沒有找到'],
      responseType: 'llm_only',
      maxLength: 200
    }
  },

  // === 範圍外問題測試 ===
  {
    category: '範圍外問題',
    questions: [
      '今天天氣如何？',
      '台灣總統是誰？',
      '現在幾點？',
      '股票行情如何？'
    ],
    expectedCriteria: {
      shouldContain: ['專注於', '文山特區', '服務'],
      shouldNotContain: ['天氣', '總統', '時間', '股票'],
      responseType: 'llm_only',
      maxLength: 150
    }
  },

  // === 模糊問題測試 ===
  {
    category: '模糊問題',
    questions: [
      '我不太確定要問什麼',
      '有什麼建議嗎？',
      '幫幫我'
    ],
    expectedCriteria: {
      shouldContain: ['推薦', '美食', '停車', '服務'],
      shouldNotContain: ['抱歉', '無法幫助'],
      responseType: 'llm_only',
      maxLength: 200
    }
  }
]

// 合理性評估標準
const reasonablenessCriteria = {
  // 回應長度合理性
  length: {
    excellent: (length, category) => {
      if (category.includes('服務範圍')) return length >= 200 && length <= 1000
      if (category.includes('美食')) return length >= 300 && length <= 800
      if (category.includes('停車')) return length >= 200 && length <= 600
      if (category.includes('商家')) return length >= 100 && length <= 500
      if (category.includes('問候')) return length >= 50 && length <= 200
      return length >= 50 && length <= 300
    },
    good: (length, category) => {
      if (category.includes('服務範圍')) return length >= 100 && length <= 1200
      if (category.includes('美食')) return length >= 200 && length <= 1000
      if (category.includes('停車')) return length >= 150 && length <= 800
      if (category.includes('商家')) return length >= 80 && length <= 600
      if (category.includes('問候')) return length >= 30 && length <= 250
      return length >= 30 && length <= 400
    }
  },

  // 內容相關性
  relevance: {
    excellent: (response, expected) => {
      const hasRequired = expected.shouldContain.some(keyword => 
        response.toLowerCase().includes(keyword.toLowerCase())
      )
      const hasForbidden = expected.shouldNotContain.some(keyword => 
        response.toLowerCase().includes(keyword.toLowerCase())
      )
      return hasRequired && !hasForbidden
    },
    good: (response, expected) => {
      const hasRequired = expected.shouldContain.some(keyword => 
        response.toLowerCase().includes(keyword.toLowerCase())
      )
      return hasRequired
    }
  },

  // 回應類型正確性
  responseType: {
    excellent: (response, expected) => {
      if (expected.responseType === 'structured') {
        return response.includes('---') && response.includes('*WEN')
      }
      if (expected.responseType === 'llm_only') {
        return !response.includes('---') || !response.includes('*WEN')
      }
      return true
    },
    good: (response, expected) => {
      // 更寬鬆的標準
      return true
    }
  }
}

async function runQAReasonablenessTest() {
  console.log('🧪 開始問答合理性模擬驗收測試...')
  console.log('=' * 80)
  
  let totalTests = 0
  let passedTests = 0
  let excellentTests = 0
  let goodTests = 0
  let failedTests = 0
  
  const results = {
    byCategory: {},
    overall: {
      total: 0,
      excellent: 0,
      good: 0,
      failed: 0
    }
  }
  
  for (const testCase of testCases) {
    console.log(`\n📋 測試分類: ${testCase.category}`)
    console.log('-' * 50)
    
    results.byCategory[testCase.category] = {
      total: 0,
      excellent: 0,
      good: 0,
      failed: 0,
      details: []
    }
    
    for (const question of testCase.questions) {
      totalTests++
      results.byCategory[testCase.category].total++
      results.overall.total++
      
      console.log(`\n🔍 問題: "${question}"`)
      
      try {
        // 調用claude-chat Edge Function
        const { data, error } = await supabase.functions.invoke('claude-chat', {
          body: {
            session_id: `qa-test-${totalTests}`,
            message: { role: 'user', content: question },
            user_meta: { external_id: 'qa-test-user' }
          }
        })
        
        if (error) {
          console.log(`❌ 調用失敗: ${error.message}`)
          failedTests++
          results.byCategory[testCase.category].failed++
          results.overall.failed++
          continue
        }
        
        if (!data || !data.data) {
          console.log(`❌ 無回應數據`)
          failedTests++
          results.byCategory[testCase.category].failed++
          results.overall.failed++
          continue
        }
        
        const response = data.data.response
        const responseLength = response.length
        
        console.log(`✅ 回應成功 (${responseLength} 字元)`)
        
        // 評估合理性
        const assessment = assessReasonableness(response, testCase.expectedCriteria, testCase.category)
        console.log(`📊 評估結果: ${assessment.grade}`)
        console.log(`   長度評估: ${assessment.lengthScore}`)
        console.log(`   相關性評估: ${assessment.relevanceScore}`)
        console.log(`   類型評估: ${assessment.typeScore}`)
        
        // 統計結果
        if (assessment.grade === 'excellent') {
          excellentTests++
          results.byCategory[testCase.category].excellent++
          results.overall.excellent++
        } else if (assessment.grade === 'good') {
          goodTests++
          results.byCategory[testCase.category].good++
          results.overall.good++
        } else {
          failedTests++
          results.byCategory[testCase.category].failed++
          results.overall.failed++
        }
        
        // 記錄詳細結果
        results.byCategory[testCase.category].details.push({
          question,
          response: response.substring(0, 100) + '...',
          assessment,
          length: responseLength
        })
        
        // 顯示回應預覽
        console.log(`回應預覽: ${response.substring(0, 150)}...`)
        
      } catch (err) {
        console.log(`❌ 測試異常: ${err.message}`)
        failedTests++
        results.byCategory[testCase.category].failed++
        results.overall.failed++
      }
    }
  }
  
  // 生成詳細報告
  generateDetailedReport(results)
  
  // 測試結果統計
  console.log('\n' + '=' * 80)
  console.log('📊 問答合理性測試結果')
  console.log('=' * 80)
  console.log(`總測試案例: ${totalTests}`)
  console.log(`優秀 (Excellent): ${excellentTests} (${((excellentTests/totalTests)*100).toFixed(1)}%)`)
  console.log(`良好 (Good): ${goodTests} (${((goodTests/totalTests)*100).toFixed(1)}%)`)
  console.log(`失敗 (Failed): ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`)
  console.log(`整體成功率: ${(((excellentTests + goodTests)/totalTests)*100).toFixed(1)}%`)
  
  // 合理性結論
  if (excellentTests >= totalTests * 0.7) {
    console.log('\n🎉 問答合理性評估: 優秀')
    console.log('✅ 系統回應質量高，可以正式上線')
  } else if (excellentTests + goodTests >= totalTests * 0.8) {
    console.log('\n👍 問答合理性評估: 良好')
    console.log('✅ 系統回應質量可接受，建議小幅優化後上線')
  } else {
    console.log('\n⚠️ 問答合理性評估: 需要改進')
    console.log('❌ 系統回應質量不足，需要進一步優化')
  }
}

function assessReasonableness(response, expected, category) {
  const responseLength = response.length
  
  // 評估長度合理性
  const lengthScore = reasonablenessCriteria.length.excellent(responseLength, category) ? 'excellent' :
                     reasonablenessCriteria.length.good(responseLength, category) ? 'good' : 'poor'
  
  // 評估內容相關性
  const relevanceScore = reasonablenessCriteria.relevance.excellent(response, expected) ? 'excellent' :
                        reasonablenessCriteria.relevance.good(response, expected) ? 'good' : 'poor'
  
  // 評估回應類型
  const typeScore = reasonablenessCriteria.responseType.excellent(response, expected) ? 'excellent' :
                   reasonablenessCriteria.responseType.good(response, expected) ? 'good' : 'poor'
  
  // 綜合評估
  let grade = 'poor'
  if (lengthScore === 'excellent' && relevanceScore === 'excellent' && typeScore === 'excellent') {
    grade = 'excellent'
  } else if (lengthScore !== 'poor' && relevanceScore !== 'poor') {
    grade = 'good'
  }
  
  return {
    grade,
    lengthScore,
    relevanceScore,
    typeScore,
    length: responseLength
  }
}

function generateDetailedReport(results) {
  console.log('\n' + '=' * 80)
  console.log('📋 詳細評估報告')
  console.log('=' * 80)
  
  for (const [category, data] of Object.entries(results.byCategory)) {
    console.log(`\n📂 ${category}`)
    console.log(`   總測試: ${data.total}`)
    console.log(`   優秀: ${data.excellent} (${((data.excellent/data.total)*100).toFixed(1)}%)`)
    console.log(`   良好: ${data.good} (${((data.good/data.total)*100).toFixed(1)}%)`)
    console.log(`   失敗: ${data.failed} (${((data.failed/data.total)*100).toFixed(1)}%)`)
    
    // 顯示問題示例
    if (data.details.length > 0) {
      console.log(`   示例問題: "${data.details[0].question}"`)
      console.log(`   評估: ${data.details[0].assessment.grade}`)
    }
  }
}

// 執行測試
runQAReasonablenessTest()


