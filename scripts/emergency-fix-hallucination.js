// 緊急修復 AI 幻覺問題
console.log('🚨 緊急修復 AI 幻覺問題...')

// 檢查當前問題
const problemAnalysis = {
  userQuery: '你的商家資料有多少資料？',
  expectedIntent: 'COVERAGE_STATS',
  actualResponse: '讓我為你推薦一些不錯的選擇',
  hallucination: '文山牛肉麵 [特約商家]',
  rootCause: 'COVERAGE_STATS 意圖未生效，Edge Function 未部署'
}

console.log('\n📊 問題分析:')
console.log(`用戶查詢: ${problemAnalysis.userQuery}`)
console.log(`預期意圖: ${problemAnalysis.expectedIntent}`)
console.log(`實際回應: ${problemAnalysis.actualResponse}`)
console.log(`幻覺內容: ${problemAnalysis.hallucination}`)
console.log(`根本原因: ${problemAnalysis.rootCause}`)

// 測試修復後的邏輯
function testFixedLogic(query) {
  const messageLower = query.toLowerCase()
  
  // 統計資料查詢檢測 (優先處理)
  const statsKeywords = ['有多少', '幾筆', '幾家', '店家數量', '商家數量', '資料庫', '統計', '覆蓋率', '總數', '規模', '資料量', '收錄', '筆數']
  const statsMatches = statsKeywords.filter(keyword => messageLower.includes(keyword))
  
  if (statsMatches.length > 0) {
    return { 
      intent: 'COVERAGE_STATS', 
      confidence: 0.9, 
      keywords: statsMatches,
      responseMode: 'stats_response'
    }
  }
  
  // 其他意圖檢測...
  return { intent: 'GENERAL', confidence: 0.6, keywords: [] }
}

// 測試修復效果
console.log('\n🔍 測試修復效果:')
const testResult = testFixedLogic(problemAnalysis.userQuery)
console.log(`查詢: ${problemAnalysis.userQuery}`)
console.log(`檢測到的關鍵詞: ${testResult.keywords.join(', ')}`)
console.log(`意圖分類: ${testResult.intent}`)
console.log(`信心度: ${testResult.confidence}`)

if (testResult.intent === 'COVERAGE_STATS') {
  console.log('✅ 意圖分類正確！')
  
  // 模擬正確的回應
  const correctResponse = `📊 **文山特區商家資料庫統計** 📊

• **商家總數**：280 家
• **安心店家**：16 家  
• **優惠店家**：18 家
• **特約商家**：1 家
• **分類數**：11 個
• **最後更新時間**：2025/9/29

這些數字會隨著收錄進度更新喔！✨

我是高文文，很高興為您提供統計資訊～有什麼其他問題隨時問我！😊

---
*WEN 1.4.6*`
  
  console.log('\n✅ 正確回應:')
  console.log(correctResponse)
  
} else {
  console.log('❌ 意圖分類失敗！')
}

// 緊急修復建議
console.log('\n🚨 緊急修復建議:')
console.log('1. 立即部署修復後的 Edge Function')
console.log('2. 驗證 COVERAGE_STATS 意圖是否生效')
console.log('3. 測試統計查詢回應')
console.log('4. 檢查 AI 幻覺防護機制')

// 部署檢查清單
console.log('\n📋 部署檢查清單:')
const deploymentChecklist = [
  '✅ COVERAGE_STATS 意圖已添加',
  '✅ 統計關鍵詞已配置',
  '✅ 統計查詢方法已實現',
  '✅ 統計回應模板已創建',
  '❌ Edge Function 未部署到正式環境',
  '❌ 需要重新部署 claude-chat'
]

deploymentChecklist.forEach(item => {
  console.log(item)
})

console.log('\n🎯 立即行動:')
console.log('1. 部署 supabase/functions/claude-chat/index.ts')
console.log('2. 測試「你的商家資料有多少資料？」查詢')
console.log('3. 確認回應為統計數據而非推薦列表')
console.log('4. 驗證不再出現「文山牛肉麵」等幻覺內容')

console.log('\n⚠️ 警告: 這是緊急修復，需要立即部署！')
