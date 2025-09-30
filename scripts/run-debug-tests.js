/**
 * 多標籤系統除錯測試腳本
 * 全面檢查系統各個環節的問題
 */

// 測試查詢列表 - 重點關注統計查詢問題
const debugTestQueries = [
  {
    query: "你的商家資料有多少資料?",
    expectedIntent: "COVERAGE_STATS",
    description: "統計查詢 - 應該返回資料庫統計信息",
    priority: "HIGH"
  },
  {
    query: "文山特區有多少家商家？",
    expectedIntent: "COVERAGE_STATS", 
    description: "商家數量查詢 - 應該返回統計數據",
    priority: "HIGH"
  },
  {
    query: "資料庫統計",
    expectedIntent: "COVERAGE_STATS",
    description: "直接統計查詢 - 應該返回統計數據",
    priority: "HIGH"
  },
  {
    query: "附近有幾家日式拉麵？",
    expectedIntent: "FOOD",
    description: "日式拉麵查詢 - 測試標籤匹配",
    priority: "MEDIUM"
  },
  {
    query: "你好",
    expectedIntent: "VAGUE_CHAT",
    description: "問候語 - 測試基本意圖識別",
    priority: "LOW"
  }
]

async function testEdgeFunction(query, expectedIntent, description, priority) {
  console.log(`\n${priority === 'HIGH' ? '🔥' : priority === 'MEDIUM' ? '⚠️' : '📝'} 測試查詢: "${query}"`)
  console.log(`📝 描述: ${description}`)
  console.log(`🎯 預期意圖: ${expectedIntent}`)
  console.log(`⚡ 優先級: ${priority}`)
  
  try {
    // 使用 fetch API 直接調用 Edge Function
    const response = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
      },
      body: JSON.stringify({
        message: {
          content: query
        },
        session_id: `debug-test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        user_meta: {
          external_id: 'debug-user',
          display_name: '除錯測試用戶'
        }
      })
    })

    if (!response.ok) {
      console.log(`❌ HTTP 錯誤: ${response.status} ${response.statusText}`)
      return { success: false, error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    
    if (data.error) {
      console.log(`❌ 錯誤: ${data.error.message}`)
      return { success: false, error: data.error.message }
    }

    const result = data.data
    if (!result) {
      console.log(`❌ 沒有返回數據`)
      return { success: false, error: 'No data returned' }
    }

    console.log(`✅ 回應成功`)
    console.log(`🎯 識別意圖: ${result.intent}`)
    console.log(`📊 信心度: ${result.confidence}`)
    console.log(`🏪 推薦商家數: ${result.recommended_stores?.length || 0}`)
    console.log(`⏱️  處理時間: ${result.processing_time}ms`)
    
    // 檢查意圖是否正確
    const intentMatch = result.intent === expectedIntent
    console.log(`${intentMatch ? '✅' : '❌'} 意圖匹配: ${intentMatch ? '正確' : '錯誤'}`)
    
    // 特殊檢查：統計查詢
    if (expectedIntent === 'COVERAGE_STATS') {
      const hasStatsData = result.response?.includes('商家總數') || 
                          result.response?.includes('統計') ||
                          result.response?.includes('資料庫')
      console.log(`${hasStatsData ? '✅' : '❌'} 統計數據: ${hasStatsData ? '包含統計信息' : '缺少統計信息'}`)
      
      // 檢查是否為通用問候語回應
      const isGenericResponse = result.response?.includes('哈囉') && 
                               result.response?.includes('很高興認識你')
      console.log(`${isGenericResponse ? '❌' : '✅'} 回應類型: ${isGenericResponse ? '通用問候語' : '具體統計回應'}`)
    }
    
    // 顯示推薦的商家（如果有）
    if (result.recommended_stores && result.recommended_stores.length > 0) {
      console.log(`🏪 推薦商家:`)
      result.recommended_stores.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (${store.category})`)
        if (store.is_partner) {
          console.log(`      [特約商家]`)
        }
      })
    }
    
    // 顯示回應內容
    console.log(`💬 完整回應:`)
    console.log(`   ${result.response}`)
    
    return { 
      success: true, 
      intentMatch, 
      intent: result.intent,
      response: result.response,
      hasStatsData: expectedIntent === 'COVERAGE_STATS' ? 
        (result.response?.includes('商家總數') || result.response?.includes('統計')) : null
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runDebugTests() {
  console.log('🔍 多標籤系統除錯測試開始')
  console.log('=' .repeat(80))
  
  let passedTests = 0
  let totalTests = debugTestQueries.length
  let criticalIssues = []
  
  for (const test of debugTestQueries) {
    const result = await testEdgeFunction(
      test.query, 
      test.expectedIntent, 
      test.description,
      test.priority
    )
    
    if (result.success && result.intentMatch) {
      passedTests++
    } else if (test.priority === 'HIGH' && !result.intentMatch) {
      criticalIssues.push({
        query: test.query,
        expected: test.expectedIntent,
        actual: result.intent,
        issue: 'HIGH_PRIORITY_INTENT_MISMATCH'
      })
    }
    
    // 等待一秒避免過於頻繁的請求
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n' + '=' .repeat(80))
  console.log('📊 除錯測試結果總結')
  console.log('=' .repeat(80))
  console.log(`✅ 通過測試: ${passedTests}/${totalTests}`)
  console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  // 分析關鍵問題
  if (criticalIssues.length > 0) {
    console.log('\n🚨 關鍵問題發現:')
    criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. 查詢: "${issue.query}"`)
      console.log(`   預期意圖: ${issue.expected}`)
      console.log(`   實際意圖: ${issue.actual}`)
      console.log(`   問題類型: ${issue.issue}`)
    })
  }
  
  // 診斷建議
  console.log('\n💡 診斷建議:')
  if (criticalIssues.some(issue => issue.issue === 'HIGH_PRIORITY_INTENT_MISMATCH')) {
    console.log('🔧 意圖識別問題:')
    console.log('   - 檢查 IntentLanguageLayer.classifyIntent 中的 COVERAGE_STATS 檢測邏輯')
    console.log('   - 確認統計查詢關鍵字匹配優先級')
    console.log('   - 驗證意圖識別順序是否正確')
  }
  
  if (passedTests < totalTests) {
    console.log('🔧 系統配置問題:')
    console.log('   - 檢查 Edge Function 是否正確部署')
    console.log('   - 驗證資料庫連接狀態')
    console.log('   - 確認標籤數據完整性')
  }
  
  console.log('\n🎯 下一步行動:')
  console.log('1. 根據診斷結果修復關鍵問題')
  console.log('2. 重新部署 Edge Function')
  console.log('3. 再次運行除錯測試驗證修復效果')
  console.log('4. 進行完整的功能測試')
}

// 執行除錯測試
runDebugTests().catch(console.error)
