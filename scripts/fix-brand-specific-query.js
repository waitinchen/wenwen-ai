// 品牌特異性查詢修復腳本
const brandSpecificFixes = {
  // 品牌關鍵字識別
  brandKeywords: {
    '丁丁連鎖藥局': ['丁丁', '丁丁藥局', '丁丁連鎖'],
    '屈臣氏': ['屈臣氏', 'watsons'],
    '康是美': ['康是美', 'cosmed'],
    '大樹藥局': ['大樹', '大樹藥局'],
    '杏一藥局': ['杏一', '杏一藥局']
  },
  
  // 特定品牌回應模板
  brandResponseTemplates: {
    found: '有的！我為您找到{brand}的資訊：\n{storeList}',
    notFound: '抱歉，文山特區目前沒有找到{brand}的資料。不過我為您推薦幾家其他優質藥局：\n{alternatives}',
    partialMatch: '我沒有找到完整的{brand}資料，但找到相關的：\n{partialMatches}\n\n另外也推薦其他藥局：\n{alternatives}'
  },
  
  // 修復邏輯
  fixLogic: {
    step1: '識別用戶請求的特定品牌',
    step2: '優先查找該品牌資料',
    step3: '找到則提供，找不到則說明並提供替代',
    step4: '確保回應中明確提及用戶請求的品牌'
  }
}

console.log('🔧 品牌特異性查詢修復方案:')
console.log('1. 支援品牌關鍵字:')
Object.entries(brandSpecificFixes.brandKeywords).forEach(([brand, keywords]) => {
  console.log(`   ${brand}: ${keywords.join(', ')}`)
})

console.log('\n2. 回應模板:')
Object.entries(brandSpecificFixes.brandResponseTemplates).forEach(([type, template]) => {
  console.log(`   ${type}: ${template.substring(0, 50)}...`)
})

console.log('\n3. 修復邏輯:')
brandSpecificFixes.fixLogic.step1 && console.log(`   ${brandSpecificFixes.fixLogic.step1}`)
brandSpecificFixes.fixLogic.step2 && console.log(`   ${brandSpecificFixes.fixLogic.step2}`)
brandSpecificFixes.fixLogic.step3 && console.log(`   ${brandSpecificFixes.fixLogic.step3}`)
brandSpecificFixes.fixLogic.step4 && console.log(`   ${brandSpecificFixes.fixLogic.step4}`)


