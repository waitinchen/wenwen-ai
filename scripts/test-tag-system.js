// 測試多標籤系統的匹配效果
console.log('🧪 測試多標籤系統的匹配效果...')

async function testTagSystem() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 測試查詢列表
    const testQueries = [
      {
        query: '推薦有WiFi的咖啡廳',
        expectedTags: ['WiFi', '咖啡'],
        intent: 'FOOD'
      },
      {
        query: '有停車場的餐廳',
        expectedTags: ['停車', '餐飲'],
        intent: 'FOOD'
      },
      {
        query: '平價的日式料理',
        expectedTags: ['平價', '日式料理'],
        intent: 'FOOD'
      },
      {
        query: '手作甜點店',
        expectedTags: ['手作', '甜點'],
        intent: 'FOOD'
      },
      {
        query: '24小時的藥局',
        expectedTags: ['24小時', '藥局'],
        intent: 'MEDICAL'
      },
      {
        query: '可以預約的美髮店',
        expectedTags: ['預約', '美髮'],
        intent: 'BEAUTY'
      }
    ]
    
    console.log(`📊 開始測試 ${testQueries.length} 個查詢...`)
    
    let successCount = 0
    let totalTests = testQueries.length
    
    for (let i = 0; i < testQueries.length; i++) {
      const testCase = testQueries[i]
      console.log(`\n🔍 測試 ${i + 1}: "${testCase.query}"`)
      
      try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
          body: {
            session_id: `test-tag-${Date.now()}-${i}`,
            message: { role: 'user', content: testCase.query },
            user_meta: { external_id: 'test-user' }
          }
        })
        
        if (error) {
          console.error(`❌ 查詢失敗: ${error.message}`)
          continue
        }
        
        if (data && data.data) {
          const result = data.data
          console.log(`✅ 意圖: ${result.intent}`)
          console.log(`✅ 推薦商家數: ${result.recommended_stores?.length || 0}`)
          
          // 檢查推薦的商家
          if (result.recommended_stores && result.recommended_stores.length > 0) {
            console.log(`📝 推薦商家:`)
            result.recommended_stores.slice(0, 3).forEach((store, index) => {
              console.log(`   ${index + 1}. ${store.name}`)
              
              // 檢查商家是否有匹配的標籤
              if (store.matchedTags && store.matchedTags.length > 0) {
                console.log(`      匹配標籤: ${store.matchedTags.join(', ')}`)
              }
            })
            
            // 檢查是否有預期的標籤匹配
            let hasExpectedTags = false
            for (const store of result.recommended_stores) {
              if (store.matchedTags) {
                for (const expectedTag of testCase.expectedTags) {
                  if (store.matchedTags.some(tag => 
                    tag.toLowerCase().includes(expectedTag.toLowerCase()) ||
                    expectedTag.toLowerCase().includes(tag.toLowerCase())
                  )) {
                    hasExpectedTags = true
                    break
                  }
                }
              }
              if (hasExpectedTags) break
            }
            
            if (hasExpectedTags) {
              console.log(`✅ 標籤匹配成功！`)
              successCount++
            } else {
              console.log(`⚠️ 未找到預期標籤匹配`)
            }
          } else {
            console.log(`⚠️ 無推薦商家`)
          }
          
          console.log(`📄 回應預覽: ${result.response?.substring(0, 100)}...`)
          
        } else {
          console.log(`❌ 無回應數據`)
        }
        
      } catch (error) {
        console.error(`❌ 測試異常: ${error.message}`)
      }
      
      // 避免請求過於頻繁
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    const successRate = ((successCount / totalTests) * 100).toFixed(1)
    console.log(`\n🎉 多標籤系統測試完成！`)
    console.log(`📊 測試結果:`)
    console.log(`   總測試數: ${totalTests}`)
    console.log(`   成功數: ${successCount}`)
    console.log(`   成功率: ${successRate}%`)
    
    if (successRate >= 80) {
      console.log(`✅ 多標籤系統運行良好！`)
    } else if (successRate >= 60) {
      console.log(`⚠️ 多標籤系統需要優化`)
    } else {
      console.log(`❌ 多標籤系統需要重大修復`)
    }
    
  } catch (error) {
    console.error('❌ 測試異常:', error)
  }
}

testTagSystem()

