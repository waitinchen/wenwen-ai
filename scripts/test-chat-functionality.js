import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testChatFunctionality() {
  console.log('🔍 測試聊天功能...')
  
  const testQuestions = [
    '告訴我妳的服務範圍',
    '請推薦鳳山區美食情報', 
    '查詢鳳山區停車資訊',
    '有藥局嗎？',
    '有書店嗎？',
    '嗨！你好'
  ]
  
  let successCount = 0
  let failCount = 0
  
  for (const question of testQuestions) {
    console.log(`\n📋 測試: "${question}"`)
    
    try {
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          session_id: `test-${Date.now()}`,
          message: { role: 'user', content: question },
          user_meta: { 
            external_id: 'test-user',
            display_name: '測試用戶'
          }
        }
      })
      
      if (error) {
        console.log(`   ❌ 錯誤: ${error.message}`)
        failCount++
      } else if (data && data.data && data.data.response) {
        const response = data.data
        console.log(`   ✅ 回應: ${response.response.substring(0, 100)}...`)
        console.log(`   📊 意圖: ${response.intent || 'N/A'}`)
        console.log(`   🏪 推薦商家: ${response.recommended_stores?.length || 0} 家`)
        console.log(`   🔧 版本: ${response.version || 'N/A'}`)
        successCount++
      } else {
        console.log(`   ❌ 無回應數據`)
        console.log(`   原始數據:`, data)
        failCount++
      }
    } catch (err) {
      console.log(`   ❌ 異常: ${err.message}`)
      failCount++
    }
  }
  
  console.log(`\n📊 聊天功能測試結果:`)
  console.log(`   成功: ${successCount}/${testQuestions.length}`)
  console.log(`   失敗: ${failCount}/${testQuestions.length}`)
  console.log(`   成功率: ${((successCount / testQuestions.length) * 100).toFixed(1)}%`)
  
  if (successCount === testQuestions.length) {
    console.log('\n🎉 聊天功能完全正常！')
  } else {
    console.log('\n⚠️ 部分聊天功能有問題')
  }
}

testChatFunctionality()
