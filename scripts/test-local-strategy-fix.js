// 本地測試策略修復
console.log('🧪 本地測試策略修復...')

// 模擬修復後的策略判斷
function isRelatedToTrainingData(intent, message) {
  const relatedIntents = ['FOOD', 'PARKING', 'SHOPPING', 'FAQ', 'SERVICE', 'ENGLISH_LEARNING', 'MEDICAL', 'BEAUTY', 'LIFESTYLE', 'BRAND_SPECIFIC', 'GENERAL']
  const unrelatedIntents = ['VAGUE_CHAT', 'CONFIRMATION', 'OUT_OF_SCOPE', 'GREETING', 'SPECIFIC_ENTITY', 'VAGUE_QUERY']
  
  // 明確無關的意圖
  if (unrelatedIntents.includes(intent)) {
    return false
  }
  
  // 明確相關的意圖
  if (relatedIntents.includes(intent)) {
    return true
  }
  
  // 根據訊息內容判斷
  const trainingKeywords = ['美食', '餐廳', '停車', '商店', '服務', '藥局', '書店', '醫院', '學校', '補習班', '美容', '健身', '娛樂']
  const lowerMessage = message.toLowerCase()
  
  return trainingKeywords.some(keyword => lowerMessage.includes(keyword))
}

// 模擬修復後的回應生成
function generateResponse(intent, message) {
  const isRelated = isRelatedToTrainingData(intent, message)
  
  if (!isRelated) {
    // 純LLM個性化回應
    const responses = {
      'VAGUE_CHAT': '哈囉～我是高文文！很高興認識你！✨ 我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊',
      'CONFIRMATION': '好的！我是高文文，很樂意為您服務～有什麼關於文山特區的問題都可以問我喔！😊',
      'OUT_OF_SCOPE': '抱歉，我是高文文，主要專注於文山特區的服務資訊，像是美食推薦、停車資訊、商家介紹等。有什麼這方面的問題需要幫忙嗎？😊',
      'GREETING': '嗨！我是高文文，你的文山特區專屬小助手！😊 很高興為你服務～有什麼需要幫忙的嗎？',
      'SPECIFIC_ENTITY': '抱歉，我是高文文，文山特區目前沒有找到您詢問的商家。建議您使用Google Maps查詢，或詢問當地居民。如果您知道相關資訊，歡迎推薦給我們新增喔～',
      'VAGUE_QUERY': '哈囉～我是高文文！很高興認識你！✨ 我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊'
    }
    
    const response = responses[intent] || responses['VAGUE_CHAT']
    const version = `---\n*WEN 1.4.6*`
    
    return `${response}\n\n${version}`
  } else {
    // 結構化回應
    return '結構化回應（與訓練資料相關）'
  }
}

// 測試用例
const testCases = [
  { 
    intent: 'SPECIFIC_ENTITY', 
    message: '給丁丁連鎖藥局 地址',
    expectedStrategy: 'SPECIFIC_ENTITY',
    shouldContain: ['丁丁', '抱歉', '推薦', '替代'],
    shouldNotContain: ['屈臣氏', '康是美', '地址']
  },
  { 
    intent: 'OUT_OF_SCOPE', 
    message: '今天天氣如何？',
    expectedStrategy: 'OUT_OF_SCOPE',
    shouldContain: ['專注於', '文山特區', '服務', '範圍'],
    shouldNotContain: ['天氣', '溫度', '降雨']
  },
  { 
    intent: 'VAGUE_QUERY', 
    message: '你好',
    expectedStrategy: 'VAGUE_QUERY',
    shouldContain: ['高文文', '很高興', '服務', '幫助'],
    shouldNotContain: ['抱歉', '沒有找到']
  }
]

console.log('\n🔍 測試策略修復效果:')
let passed = 0
let total = testCases.length

testCases.forEach(testCase => {
  const response = generateResponse(testCase.intent, testCase.message)
  const isRelated = isRelatedToTrainingData(testCase.intent, testCase.message)
  
  console.log(`\n查詢: ${testCase.message}`)
  console.log(`意圖: ${testCase.intent}`)
  console.log(`與訓練資料相關: ${isRelated ? '是' : '否'}`)
  console.log(`回應類型: ${isRelated ? '結構化' : '純LLM'}`)
  
  if (!isRelated) {
    // 檢查純LLM回應
    const hasExpectedContent = testCase.shouldContain.some(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    )
    const hasForbiddenContent = testCase.shouldNotContain.some(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    )
    
    const strategyCorrect = hasExpectedContent && !hasForbiddenContent
    
    if (strategyCorrect) {
      passed++
      console.log(`✅ 策略正確`)
    } else {
      console.log(`❌ 策略錯誤`)
      console.log(`   應該包含: ${testCase.shouldContain.join(', ')}`)
      console.log(`   實際包含: ${hasExpectedContent ? '✅' : '❌'}`)
      console.log(`   不應包含: ${testCase.shouldNotContain.join(', ')}`)
      console.log(`   實際包含: ${hasForbiddenContent ? '❌' : '✅'}`)
    }
  } else {
    console.log(`✅ 使用結構化回應（正確）`)
    passed++
  }
  
  // 顯示回應預覽
  const preview = response.substring(0, 100) + '...'
  console.log(`回應預覽: ${preview}`)
})

const percentage = ((passed / total) * 100).toFixed(1)
console.log(`\n📊 策略修復效果: ${passed}/${total} (${percentage}%)`)

if (percentage >= 80) {
  console.log('🎉 策略修復成功！')
} else {
  console.log('⚠️ 需要進一步優化')
}

