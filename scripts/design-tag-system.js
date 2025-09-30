// 設計多標籤系統架構
console.log('🎯 設計多標籤系統架構...')

// 標籤分類系統設計
const tagSystemDesign = {
  // 標籤分類架構
  tagCategories: {
    // 料理類型標籤
    cuisine: {
      name: '料理類型',
      tags: [
        '日式料理', '韓式料理', '泰式料理', '義式料理', '中式料理',
        '素食', '火鍋', '燒烤', '炸物', '甜點', '咖啡', '茶飲',
        '早餐', '午餐', '晚餐', '宵夜', '快餐', '輕食'
      ]
    },
    
    // 服務類型標籤
    service: {
      name: '服務類型',
      tags: [
        '外送', '外帶', '內用', '預約', '現場候位', '包廂',
        '停車', 'WiFi', '冷氣', '兒童友善', '寵物友善',
        '無障礙', '24小時', '外語服務', '信用卡', '行動支付'
      ]
    },
    
    // 價格區間標籤
    price: {
      name: '價格區間',
      tags: [
        '平價', '中等價位', '高檔', '學生友善', '家庭聚餐',
        '商務宴請', '約會餐廳', '聚餐', '獨食', '外帶便當'
      ]
    },
    
    // 特色標籤
    feature: {
      name: '特色亮點',
      tags: [
        '新鮮現做', '手作', '有機', '天然', '健康', '傳統',
        '創新', '網美', '打卡', '特色裝潢', '音樂表演',
        '戶外座位', '景觀', '歷史建築', '文青', '復古'
      ]
    },
    
    // 目標客群標籤
    target: {
      name: '目標客群',
      tags: [
        '親子', '情侶', '朋友', '家庭', '學生', '上班族',
        '長者', '年輕人', '觀光客', '在地人', '商務客'
      ]
    },
    
    // 營業時間標籤
    schedule: {
      name: '營業時間',
      tags: [
        '早午餐', '午餐', '下午茶', '晚餐', '宵夜',
        '週末限定', '平日限定', '節日營業', '24小時'
      ]
    }
  },
  
  // 標籤匹配規則
  matchingRules: {
    // 意圖關鍵字到標籤的映射
    intentToTags: {
      'FOOD': ['cuisine', 'service', 'price', 'feature'],
      'PARKING': ['service'],
      'SHOPPING': ['service', 'price'],
      'BEAUTY': ['service', 'feature'],
      'MEDICAL': ['service'],
      'ENGLISH_LEARNING': ['service', 'target']
    },
    
    // 關鍵字到標籤的映射
    keywordToTags: {
      // 料理類型關鍵字
      '日式': ['日式料理'],
      '韓式': ['韓式料理'],
      '泰式': ['泰式料理'],
      '義式': ['義式料理'],
      '中式': ['中式料理'],
      '素食': ['素食'],
      '火鍋': ['火鍋'],
      '燒烤': ['燒烤'],
      '咖啡': ['咖啡'],
      '甜點': ['甜點'],
      
      // 服務關鍵字
      '外送': ['外送'],
      '外帶': ['外帶'],
      '停車': ['停車'],
      'WiFi': ['WiFi'],
      '24小時': ['24小時'],
      
      // 價格關鍵字
      '平價': ['平價'],
      '高檔': ['高檔'],
      '學生': ['學生友善'],
      '家庭': ['家庭聚餐'],
      
      // 特色關鍵字
      '新鮮': ['新鮮現做'],
      '手作': ['手作'],
      '健康': ['健康'],
      '網美': ['網美'],
      '打卡': ['打卡']
    }
  },
  
  // 標籤權重系統
  tagWeights: {
    // 主要分類標籤權重最高
    primary: 1.0,
    // 次要標籤權重中等
    secondary: 0.7,
    // 輔助標籤權重較低
    auxiliary: 0.5
  }
}

console.log('📋 標籤系統設計:')
console.log('=' * 50)

// 顯示標籤分類
Object.entries(tagSystemDesign.tagCategories).forEach(([category, data]) => {
  console.log(`\n🏷️ ${data.name} (${category}):`)
  data.tags.forEach(tag => {
    console.log(`   • ${tag}`)
  })
})

console.log('\n🔗 意圖匹配規則:')
Object.entries(tagSystemDesign.matchingRules.intentToTags).forEach(([intent, categories]) => {
  console.log(`   ${intent}: ${categories.join(', ')}`)
})

console.log('\n💡 實現建議:')
console.log('1. 在 features 欄位中新增 tags 陣列')
console.log('2. 更新 admin/stores 介面支持多標籤選擇')
console.log('3. 增強 Edge Function 的標籤匹配邏輯')
console.log('4. 實現標籤權重計算系統')

// 範例標籤配置
const exampleTagConfigurations = {
  '金太郎壽司': {
    category: '餐飲美食',
    tags: [
      '日式料理', '壽司', '生魚片', '內用', '外帶', '中等價位',
      '新鮮現做', '家庭聚餐', '朋友', '午餐', '晚餐'
    ]
  },
  'Hi家居/888創意生活館': {
    category: '購物消費',
    tags: [
      '家居用品', '創意商品', '內用', '停車', 'WiFi', '平價',
      '家庭', '在地人', '平日', '週末'
    ]
  },
  '笛爾手作現烘蛋糕': {
    category: '餐飲美食',
    tags: [
      '甜點', '蛋糕', '烘焙', '內用', '外帶', '中等價位',
      '手作', '新鮮現做', '下午茶', '生日蛋糕', '網美', '打卡'
    ]
  }
}

console.log('\n📝 範例標籤配置:')
Object.entries(exampleTagConfigurations).forEach(([storeName, config]) => {
  console.log(`\n🏪 ${storeName}:`)
  console.log(`   分類: ${config.category}`)
  console.log(`   標籤: ${config.tags.join(', ')}`)
})

console.log('\n🎯 下一步行動:')
console.log('1. 更新資料庫結構 (features.tags)')
console.log('2. 為現有商家添加標籤')
console.log('3. 更新 admin/stores 介面')
console.log('4. 增強意圖匹配邏輯')

