// 測試部署後的修復效果
console.log('🧪 測試部署後的修復效果...')

// 模擬測試統計查詢
async function testStatsQuery() {
  console.log('\n🔍 測試統計查詢修復效果:')
  
  const testQuery = '你的商家資料有多少資料？'
  console.log(`測試查詢: ${testQuery}`)
  
  try {
    // 模擬 Edge Function 調用
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📡 調用 Edge Function...')
    
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `test-${Date.now()}`,
        message: { role: 'user', content: testQuery },
        user_meta: { external_id: 'test-user' }
      }
    })
    
    if (error) {
      console.error('❌ Edge Function 調用失敗:', error)
      return false
    }
    
    if (!data || !data.data) {
      console.error('❌ 無回應數據')
      return false
    }
    
    const response = data.data.response
    const intent = data.data.intent
    
    console.log(`\n📊 回應分析:`)
    console.log(`意圖分類: ${intent}`)
    console.log(`回應長度: ${response.length} 字`)
    
    // 檢查是否為統計回應
    const isStatsResponse = response.includes('商家資料庫統計') || 
                           response.includes('商家總數') ||
                           response.includes('安心店家') ||
                           response.includes('特約商家')
    
    // 檢查是否還有幻覺
    const hasHallucination = response.includes('文山牛肉麵') ||
                            response.includes('推薦一些不錯的選擇')
    
    if (isStatsResponse && !hasHallucination) {
      console.log('✅ 修復成功！')
      console.log('✅ 正確識別為統計查詢')
      console.log('✅ 回應統計數據')
      console.log('✅ 沒有 AI 幻覺')
      
      console.log('\n📝 回應預覽:')
      console.log(response.substring(0, 200) + '...')
      
      return true
    } else {
      console.log('❌ 修復失敗！')
      if (!isStatsResponse) {
        console.log('❌ 沒有正確回應統計數據')
      }
      if (hasHallucination) {
        console.log('❌ 仍有 AI 幻覺')
      }
      
      console.log('\n📝 問題回應:')
      console.log(response.substring(0, 200) + '...')
      
      return false
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error)
    return false
  }
}

// 測試多個查詢
async function testMultipleQueries() {
  console.log('\n🔍 測試多個統計查詢:')
  
  const testQueries = [
    '你的商家資料有多少資料？',
    '資料庫有幾筆資料？',
    '店家數量有多少？',
    '統計一下商家規模'
  ]
  
  let successCount = 0
  let totalCount = testQueries.length
  
  for (const query of testQueries) {
    console.log(`\n測試: ${query}`)
    
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          session_id: `test-${Date.now()}`,
          message: { role: 'user', content: query },
          user_meta: { external_id: 'test-user' }
        }
      })
      
      if (error || !data?.data) {
        console.log(`❌ 查詢失敗: ${error?.message || '無回應數據'}`)
        continue
      }
      
      const response = data.data.response
      const intent = data.data.intent
      
      const isStatsResponse = response.includes('商家資料庫統計') || 
                             response.includes('商家總數')
      
      const hasHallucination = response.includes('文山牛肉麵') ||
                              response.includes('推薦一些不錯的選擇')
      
      if (isStatsResponse && !hasHallucination && intent === 'COVERAGE_STATS') {
        console.log(`✅ 成功 (意圖: ${intent})`)
        successCount++
      } else {
        console.log(`❌ 失敗 (意圖: ${intent})`)
        if (hasHallucination) {
          console.log(`   ⚠️ 仍有幻覺: ${response.includes('文山牛肉麵') ? '文山牛肉麵' : '推薦回應'}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ 測試異常: ${error.message}`)
    }
    
    // 避免請求過於頻繁
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const successRate = ((successCount / totalCount) * 100).toFixed(1)
  console.log(`\n📊 測試結果: ${successCount}/${totalCount} (${successRate}%)`)
  
  return successRate >= 80
}

// 執行測試
async function runTests() {
  console.log('🚀 開始測試部署修復效果...')
  
  // 測試單個查詢
  const singleTestResult = await testStatsQuery()
  
  if (singleTestResult) {
    console.log('\n🎉 單個查詢測試通過！')
    
    // 測試多個查詢
    const multipleTestResult = await testMultipleQueries()
    
    if (multipleTestResult) {
      console.log('\n🎉 所有測試通過！修復成功！')
      console.log('\n✅ 修復確認:')
      console.log('• COVERAGE_STATS 意圖正常工作')
      console.log('• 統計查詢正確回應')
      console.log('• AI 幻覺問題已解決')
      console.log('• 不再出現「文山牛肉麵」等幻覺內容')
    } else {
      console.log('\n⚠️ 部分測試失敗，需要進一步檢查')
    }
  } else {
    console.log('\n❌ 修復失敗，需要重新檢查部署')
  }
}

runTests()

