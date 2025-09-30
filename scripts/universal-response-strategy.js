// 全面性原則性回應策略設計
const universalResponseStrategy = {
  // 意圖分類層級
  intentHierarchy: {
    'SPECIFIC_ENTITY': {
      description: '特定實體查詢 (如: 丁丁連鎖藥局、麥當勞、星巴克)',
      detection: '包含具體品牌/店家名稱',
      responseStrategy: '優先查找特定實體，找不到時說明並提供替代'
    },
    'CATEGORY_QUERY': {
      description: '類別查詢 (如: 有藥局嗎、推薦餐廳)',
      detection: '包含類別關鍵字但無特定實體',
      responseStrategy: '提供該類別的所有選項'
    },
    'VAGUE_QUERY': {
      description: '模糊查詢 (如: 有什麼建議、幫幫我)',
      detection: '無明確實體或類別',
      responseStrategy: '引導用戶明確需求'
    },
    'OUT_OF_SCOPE': {
      description: '範圍外查詢 (如: 天氣、政治)',
      detection: '與服務範圍無關',
      responseStrategy: '禮貌拒絕並引導到服務範圍'
    }
  },

  // 回應生成原則
  responsePrinciples: {
    principle1: {
      name: '精確匹配優先',
      description: '優先提供用戶明確請求的內容',
      implementation: '先查找特定實體，再考慮類別替代'
    },
    principle2: {
      name: '透明化說明',
      description: '找不到時明確說明原因',
      implementation: '「抱歉，沒有找到X，但我為您推薦Y」'
    },
    principle3: {
      name: '漸進式引導',
      description: '從具體到一般，從明確到模糊',
      implementation: '特定實體 → 類別替代 → 服務範圍介紹'
    },
    principle4: {
      name: '一致性格式',
      description: '統一的回應結構和語氣',
      implementation: '開頭語 + 核心內容 + 結束語 + 版本標識'
    }
  },

  // 實作邏輯框架
  implementationFramework: {
    step1: '解析用戶查詢，識別意圖層級',
    step2: '根據意圖層級選擇回應策略',
    step3: '執行資料庫查詢和內容生成',
    step4: '應用回應原則進行內容優化',
    step5: '格式化輸出並添加元數據'
  }
}

console.log('🎯 全面性原則性回應策略:')
console.log('=' * 60)

console.log('\n📊 意圖分類層級:')
Object.entries(universalResponseStrategy.intentHierarchy).forEach(([intent, config]) => {
  console.log(`\n${intent}:`)
  console.log(`  描述: ${config.description}`)
  console.log(`  檢測: ${config.detection}`)
  console.log(`  策略: ${config.responseStrategy}`)
})

console.log('\n🔧 回應生成原則:')
Object.entries(universalResponseStrategy.responsePrinciples).forEach(([key, principle]) => {
  console.log(`\n${principle.name}:`)
  console.log(`  描述: ${principle.description}`)
  console.log(`  實作: ${principle.implementation}`)
})

console.log('\n⚙️ 實作邏輯框架:')
Object.entries(universalResponseStrategy.implementationFramework).forEach(([step, description]) => {
  console.log(`  ${step}: ${description}`)
})

console.log('\n🎉 這個策略適用於所有查詢類型，不依賴特定品牌或關鍵字！')


