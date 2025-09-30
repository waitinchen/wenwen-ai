import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUniversalStrategy() {
  console.log('🧪 測試全面性原則性回應策略...')
  console.log('=' * 60)
  
  const testCases = [
    {
      query: '給丁丁連鎖藥局 地址',
      expectedIntent: 'SPECIFIC_ENTITY',
      description: '特定實體查詢 - 品牌名稱'
    },
    {
      query: '有藥局嗎？',
      expectedIntent: 'CATEGORY_QUERY',
      description: '類別查詢 - 功能類別'
    },
    {
      query: '推薦餐廳',
      expectedIntent: 'CATEGORY_QUERY',
      description: '類別查詢 - 服務類別'
    },
    {
      query: '你好',
      expectedIntent: 'VAGUE_QUERY',
      description: '模糊查詢 - 問候語'
    },
    {
      query: '今天天氣如何？',
      expectedIntent: 'OUT_OF_SCOPE',
      description: '範圍外查詢 - 服務範圍外'
    }
  ]
  
  let totalTests = 0
  let passedTests = 0
  
  for (const testCase of testCases) {
    totalTests++
    console.log(`\n📋 測試案例 ${totalTests}: ${testCase.description}`)
    console.log(`查詢: "${testCase.query}"`)
    console.log(`預期意圖: ${testCase.expectedIntent}`)
    
    try {
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          session_id: `universal-test-${totalTests}`,
          message: { role: 'user', content: testCase.query },
          user_meta: { external_id: 'universal-test' }
        }
      })
      
      if (error) {
        console.log(`❌ 調用失敗: ${error.message}`)
        continue
      }
      
      if (!data || !data.data) {
        console.log(`❌ 無回應數據`)
        continue
      }
      
      const response = data.data
      console.log(`✅ 回應成功`)
      console.log(`實際意圖: ${response.intent}`)
      console.log(`信心度: ${response.confidence}`)
      console.log(`版本: ${response.version}`)
      
      // 檢查意圖是否正確
      const intentCorrect = response.intent === testCase.expectedIntent || 
                           (testCase.expectedIntent === 'SPECIFIC_ENTITY' && response.intent === 'FAQ') ||
                           (testCase.expectedIntent === 'CATEGORY_QUERY' && response.intent === 'FAQ')
      
      if (intentCorrect) {
        console.log(`✅ 意圖判斷正確`)
        passedTests++
      } else {
        console.log(`❌ 意圖判斷錯誤 (預期: ${testCase.expectedIntent}, 實際: ${response.intent})`)
      }
      
      // 檢查回應質量
      const hasStructuredFormat = response.response.includes('---') && response.response.includes('*WEN')
      const hasPersonalizedContent = response.response.includes('高文文') || response.response.includes('文山特區')
      
      console.log(`結構化格式: ${hasStructuredFormat ? '✅' : '❌'}`)
      console.log(`個性化內容: ${hasPersonalizedContent ? '✅' : '❌'}`)
      
      // 顯示回應預覽
      console.log(`回應預覽: ${response.response.substring(0, 200)}...`)
      
    } catch (err) {
      console.log(`❌ 測試異常: ${err.message}`)
    }
  }
  
  // 測試結果統計
  console.log('\n' + '=' * 60)
  console.log('📊 全面性原則性回應策略測試結果')
  console.log('=' * 60)
  console.log(`總測試案例: ${totalTests}`)
  console.log(`通過: ${passedTests}`)
  console.log(`失敗: ${totalTests - passedTests}`)
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests >= totalTests * 0.8) {
    console.log('\n🎉 全面性原則性回應策略測試通過！')
    console.log('✅ 系統已準備好處理各種類型的查詢')
  } else {
    console.log('\n⚠️ 部分測試失敗，需要進一步優化')
  }
}

// 執行測試
testUniversalStrategy()


