/**
 * 增強版多標籤系統測試腳本 (修正版)
 * 測試新的 Required/Optional 標籤匹配邏輯
 */

// 測試查詢列表
const testQueries = [
  {
    query: "附近有幾家日式拉麵？",
    expectedIntent: "FOOD",
    expectedTags: ["日式料理", "拉麵"],
    description: "日式拉麵查詢 - 應該匹配日式料理和拉麵標籤"
  },
  {
    query: "親子友善的餐廳",
    expectedIntent: "FOOD", 
    expectedTags: ["親子友善"],
    description: "親子友善餐廳查詢 - 應該匹配親子友善標籤"
  },
  {
    query: "宵夜可以去哪裡吃壽司？",
    expectedIntent: "FOOD",
    expectedTags: ["宵夜", "壽司", "日式料理"],
    description: "宵夜壽司查詢 - 應該匹配宵夜和壽司標籤"
  },
  {
    query: "推薦有WiFi的咖啡廳",
    expectedIntent: "FOOD",
    expectedTags: ["咖啡", "WiFi"],
    description: "WiFi咖啡廳查詢 - 應該匹配咖啡和WiFi標籤"
  },
  {
    query: "平價的韓式料理",
    expectedIntent: "FOOD",
    expectedTags: ["韓式料理", "平價"],
    description: "平價韓式料理查詢 - 應該匹配韓式料理和平價標籤"
  },
  {
    query: "手作甜點店",
    expectedIntent: "FOOD",
    expectedTags: ["甜點", "手作"],
    description: "手作甜點查詢 - 應該匹配甜點和手作標籤"
  }
]

async function testEdgeFunction(query, expectedIntent, expectedTags, description) {
  console.log(`\n🧪 測試查詢: "${query}"`)
  console.log(`📝 描述: ${description}`)
  console.log(`🎯 預期意圖: ${expectedIntent}`)
  console.log(`🏷️  預期標籤: ${expectedTags.join(', ')}`)
  
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
        session_id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        user_meta: {
          external_id: 'test-user',
          display_name: '測試用戶'
        }
      })
    })

    if (!response.ok) {
      console.log(`❌ HTTP 錯誤: ${response.status} ${response.statusText}`)
      return false
    }

    const data = await response.json()
    
    if (data.error) {
      console.log(`❌ 錯誤: ${data.error.message}`)
      return false
    }

    const result = data.data
    if (!result) {
      console.log(`❌ 沒有返回數據`)
      return false
    }

    console.log(`✅ 回應成功`)
    console.log(`🎯 識別意圖: ${result.intent}`)
    console.log(`📊 信心度: ${result.confidence}`)
    console.log(`🏪 推薦商家數: ${result.recommended_stores?.length || 0}`)
    console.log(`⏱️  處理時間: ${result.processing_time}ms`)
    
    // 檢查意圖是否正確
    const intentMatch = result.intent === expectedIntent
    console.log(`${intentMatch ? '✅' : '❌'} 意圖匹配: ${intentMatch ? '正確' : '錯誤'}`)
    
    // 顯示推薦的商家
    if (result.recommended_stores && result.recommended_stores.length > 0) {
      console.log(`🏪 推薦商家:`)
      result.recommended_stores.forEach((store, index) => {
        console.log(`   ${index + 1}. ${store.name} (${store.category})`)
        if (store.is_partner) {
          console.log(`      [特約商家]`)
        }
      })
    }
    
    // 顯示回應內容的前100個字符
    const responsePreview = result.response?.substring(0, 100) + '...'
    console.log(`💬 回應預覽: ${responsePreview}`)
    
    return intentMatch
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🚀 增強版多標籤系統測試開始')
  console.log('=' .repeat(60))
  
  let passedTests = 0
  let totalTests = testQueries.length
  
  for (const test of testQueries) {
    const passed = await testEdgeFunction(
      test.query, 
      test.expectedIntent, 
      test.expectedTags, 
      test.description
    )
    
    if (passed) {
      passedTests++
    }
    
    // 等待一秒避免過於頻繁的請求
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 測試結果總結')
  console.log('=' .repeat(60))
  console.log(`✅ 通過測試: ${passedTests}/${totalTests}`)
  console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有測試都通過了！多標籤系統運作正常！')
  } else if (passedTests > totalTests / 2) {
    console.log('⚠️  大部分測試通過，但還有改進空間')
  } else {
    console.log('❌ 多個測試失敗，需要檢查系統配置')
  }
  
  console.log('\n💡 建議下一步：')
  console.log('1. 檢查商家資料是否有正確的標籤')
  console.log('2. 驗證標籤匹配邏輯是否按預期工作')
  console.log('3. 測試更多樣化的查詢')
}

// 執行測試
runTests().catch(console.error)
