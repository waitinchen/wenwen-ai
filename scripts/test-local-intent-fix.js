// 本地測試意圖分類修復
console.log('🧪 本地測試意圖分類修復...')

// 模擬意圖分類邏輯
function classifyIntent(message) {
  const messageLower = message.toLowerCase()
  const keywords = []
  
  // 特定實體查詢檢測
  const specificEntityKeywords = ['丁丁', '麥當勞', '肯塔基', '屈臣氏', '康是美', '地址', '電話', '在哪裡', '位置', '營業時間']
  const specificEntityMatches = specificEntityKeywords.filter(keyword => messageLower.includes(keyword))
  
  if (specificEntityMatches.length > 0) {
    keywords.push(...specificEntityMatches)
    return { intent: 'SPECIFIC_ENTITY', confidence: 0.8, keywords }
  }

  // 範圍外查詢檢測 (優先處理)
  const outOfScopeKeywords = ['天氣', '總統', '政治', '股票', '新聞', '台北', '台中', '台南', '高雄市區', '其他縣市', '今天天氣', '天氣如何', '溫度', '降雨', '氣象']
  const outOfScopeMatches = outOfScopeKeywords.filter(keyword => messageLower.includes(keyword))
  
  if (outOfScopeMatches.length > 0) {
    keywords.push(...outOfScopeMatches)
    return { intent: 'OUT_OF_SCOPE', confidence: 0.2, keywords }
  }

  // 模糊查詢檢測
  const vagueQueryKeywords = ['有什麼建議', '幫幫我', '怎麼辦', '如何', '建議', '推薦什麼', '有什麼', '可以', '能']
  const vagueQueryMatches = vagueQueryKeywords.filter(keyword => messageLower.includes(keyword))
  
  if (vagueQueryMatches.length > 0) {
    keywords.push(...vagueQueryMatches)
    return { intent: 'VAGUE_QUERY', confidence: 0.7, keywords }
  }

  // 一般推薦意圖
  return { intent: 'GENERAL', confidence: 0.6, keywords }
}

// 測試用例
const testCases = [
  { query: '麥當勞在哪裡', expected: 'SPECIFIC_ENTITY' },
  { query: '肯塔基美語電話', expected: 'SPECIFIC_ENTITY' },
  { query: '有什麼建議', expected: 'VAGUE_QUERY' },
  { query: '幫幫我', expected: 'VAGUE_QUERY' },
  { query: '台灣總統是誰', expected: 'OUT_OF_SCOPE' },
  { query: '今天天氣如何', expected: 'OUT_OF_SCOPE' }
]

console.log('\n🔍 測試修復效果:')
let passed = 0
let total = testCases.length

testCases.forEach(testCase => {
  const result = classifyIntent(testCase.query)
  const isCorrect = result.intent === testCase.expected
  
  if (isCorrect) {
    passed++
    console.log(`✅ ${testCase.query} → ${result.intent} (正確)`)
  } else {
    console.log(`❌ ${testCase.query} → ${result.intent} (預期: ${testCase.expected})`)
  }
})

const percentage = ((passed / total) * 100).toFixed(1)
console.log(`\n📊 修復效果: ${passed}/${total} (${percentage}%)`)

if (percentage >= 80) {
  console.log('🎉 意圖分類修復成功！')
} else {
  console.log('⚠️ 需要進一步優化')
}
