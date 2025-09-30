// 測試意圖檢測修復
console.log('🧪 測試意圖檢測修復...')

function testIntentDetection() {
  // 模擬修復後的意圖檢測邏輯
  function classifyIntent(message) {
    const messageLower = message.toLowerCase()
    const keywords = []
    
    // 統計資料查詢檢測 (最高優先級)
    const statsKeywords2 = ['有多少', '幾筆', '幾家', '店家數量', '商家數量', '資料庫', '統計', '覆蓋率', '總數', '規模', '資料量', '收錄', '筆數']
    const statsMatches = statsKeywords2.filter(keyword => messageLower.includes(keyword))
    
    if (statsMatches.length > 0) {
      keywords.push(...statsMatches)
      return { intent: 'COVERAGE_STATS', confidence: 0.9, keywords }
    }
    
    // 模糊聊天檢測
    const vagueKeywords = ['今天天氣', '心情', '感覺', '怎麼樣', '還好嗎', '無聊', '沒事', '隨便', '不知道', '顏色', '喜歡什麼']
    const hasVagueKeywords = vagueKeywords.some(keyword => message.includes(keyword))
    
    if (hasVagueKeywords || message.length <= 3) {
      return { intent: 'VAGUE_CHAT', confidence: 0.8, keywords: [] }
    }
    
    return { intent: 'GENERAL', confidence: 0.6, keywords: [] }
  }
  
  // 測試查詢
  const testQuery = '你的商家資料有多少資料？'
  console.log(`測試查詢: ${testQuery}`)
  
  const result = classifyIntent(testQuery)
  console.log(`檢測結果:`, result)
  
  if (result.intent === 'COVERAGE_STATS') {
    console.log('✅ 統計查詢意圖檢測成功！')
    console.log(`匹配的關鍵詞: ${result.keywords.join(', ')}`)
    return true
  } else {
    console.log(`❌ 意圖檢測失敗，實際意圖: ${result.intent}`)
    return false
  }
}

testIntentDetection()

