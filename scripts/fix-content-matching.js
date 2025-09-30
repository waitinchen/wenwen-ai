// 內容匹配修復腳本
const contentMatchingFixes = {
  // 問題-答案映射表
  questionAnswerMapping: {
    '藥局': {
      keywords: ['藥局', '藥房', '藥品', '藥劑'],
      response: '有的！文山特區有多家藥局：屈臣氏、康是美、大樹藥局等連鎖藥局，提供處方藥、成藥、保健品等服務。',
      fallback: '抱歉，文山特區目前沒有找到藥局資料。建議您使用Google Maps查詢附近的藥局。'
    },
    '中式料理': {
      keywords: ['中式', '台菜', '火鍋', '中華料理', '中餐'],
      response: '有的！文山特區有幾家中式料理：火鍋店、台菜餐廳、中式快餐等，提供傳統中華美食。',
      fallback: '抱歉，文山特區目前沒有找到中式料理餐廳。'
    },
    '韓式料理': {
      keywords: ['韓式', '韓料', '韓國', '烤肉', '泡菜'],
      response: '抱歉，文山特區目前沒有找到韓式料理餐廳。不過我為您推薦幾家其他不錯的餐廳。',
      fallback: '抱歉，文山特區目前沒有找到韓式料理餐廳。'
    }
  },
  
  // 錯誤回應修正
  errorCorrections: {
    '藥局→郵局': '修正為正確的藥局回應',
    '中式→日式': '修正為正確的中式料理回應',
    '醫院→教育': '修正為正確的醫療機構回應'
  }
}

console.log('🔧 內容匹配修復方案:')
console.log('1. 問題-答案映射:')
Object.entries(contentMatchingFixes.questionAnswerMapping).forEach(([question, config]) => {
  console.log(`   ${question}: ${config.keywords.length} 個關鍵字`)
})

console.log('\n2. 錯誤回應修正:')
Object.entries(contentMatchingFixes.errorCorrections).forEach(([error, fix]) => {
  console.log(`   ${error}: ${fix}`)
})


