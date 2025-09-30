/**
 * 修復驗證腳本
 * 測試 COVERAGE_STATS 意圖修復效果
 */

async function testCoverageStatsFix() {
  console.log('🔧 測試 COVERAGE_STATS 意圖修復效果')
  console.log('=' .repeat(60))
  
  const testQuery = "你的商家資料有多少資料?"
  
  try {
    const response = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
      },
      body: JSON.stringify({
        message: {
          content: testQuery
        },
        session_id: `verify-fix-${Date.now()}`,
        user_meta: {
          external_id: 'verify-user',
          display_name: '驗證用戶'
        }
      })
    })

    if (!response.ok) {
      console.log(`❌ HTTP 錯誤: ${response.status}`)
      return
    }

    const data = await response.json()
    const result = data.data
    
    console.log(`🎯 識別意圖: ${result.intent}`)
    console.log(`📊 信心度: ${result.confidence}`)
    console.log(`⏱️  處理時間: ${result.processing_time}ms`)
    
    const intentCorrect = result.intent === 'COVERAGE_STATS'
    console.log(`${intentCorrect ? '✅' : '❌'} 意圖識別: ${intentCorrect ? '正確' : '錯誤'}`)
    
    const hasStatsData = result.response?.includes('商家總數') || 
                        result.response?.includes('統計') ||
                        result.response?.includes('資料庫')
    console.log(`${hasStatsData ? '✅' : '❌'} 統計數據: ${hasStatsData ? '包含統計信息' : '缺少統計信息'}`)
    
    const isGenericResponse = result.response?.includes('哈囉') && 
                             result.response?.includes('很高興認識你')
    console.log(`${isGenericResponse ? '❌' : '✅'} 回應類型: ${isGenericResponse ? '通用問候語' : '具體統計回應'}`)
    
    console.log(`\n💬 完整回應:`)
    console.log(result.response)
    
    if (intentCorrect && hasStatsData && !isGenericResponse) {
      console.log(`\n🎉 修復成功！COVERAGE_STATS 意圖正常工作！`)
    } else {
      console.log(`\n⚠️  修復不完全，需要進一步檢查`)
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`)
  }
}

testCoverageStatsFix()
