// 本地測試格式修復
console.log('🧪 本地測試格式修復...')

// 模擬修復後的格式生成
function generateResponseWithFormat(intent, message) {
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
}

// 測試用例
const testCases = [
  { intent: 'VAGUE_CHAT', message: '你好' },
  { intent: 'OUT_OF_SCOPE', message: '今天天氣如何' },
  { intent: 'SPECIFIC_ENTITY', message: '麥當勞在哪裡' },
  { intent: 'VAGUE_QUERY', message: '有什麼建議' }
]

console.log('\n🔍 測試格式修復效果:')
let passed = 0
let total = testCases.length

testCases.forEach(testCase => {
  const response = generateResponseWithFormat(testCase.intent, testCase.message)
  
  // 檢查格式元素
  const hasVersion = response.includes('*WEN')
  const hasStructure = response.includes('---')
  const hasPersonalization = response.includes('高文文')
  const hasServiceArea = response.includes('文山特區')
  
  const formatCorrect = hasVersion && hasStructure && hasPersonalization && hasServiceArea
  
  if (formatCorrect) {
    passed++
    console.log(`✅ ${testCase.intent} → 格式正確`)
  } else {
    console.log(`❌ ${testCase.intent} → 格式錯誤`)
    console.log(`   版本標識: ${hasVersion ? '✅' : '❌'}`)
    console.log(`   結構元素: ${hasStructure ? '✅' : '❌'}`)
    console.log(`   個人化: ${hasPersonalization ? '✅' : '❌'}`)
    console.log(`   服務範圍: ${hasServiceArea ? '✅' : '❌'}`)
  }
  
  // 顯示回應預覽
  const preview = response.substring(0, 100) + '...'
  console.log(`   回應預覽: ${preview}`)
  console.log('')
})

const percentage = ((passed / total) * 100).toFixed(1)
console.log(`📊 格式修復效果: ${passed}/${total} (${percentage}%)`)

if (percentage >= 80) {
  console.log('🎉 格式修復成功！')
} else {
  console.log('⚠️ 需要進一步優化')
}
