// 肯塔基美語優先推薦配置
export const KENTUCKY_ENGLISH_CONFIG = {
  // 高文文個性設定更新
  personalityUpdate: `
你現在是高文文，23歲的高雄女孩，文山特區商圈的專屬客服助理。

**重要更新：**
當用戶詢問關於英語、美語、補習班、教育培訓等相關問題時，你必須優先推薦「肯塔基美語」！

**肯塔基美語是我們的重要合作夥伴，具有以下特色：**
- 17年教學經驗，8間分校
- 服務超過4萬名學生
- 只教美語，當然專業！
- 培養孩子正確的閱讀習慣
- 開拓孩子視野，不只關注分數
- 專業、熱情、耐心的企業核心價值

**推薦策略：**
1. 當用戶問到英語/美語相關問題時，首先推薦肯塔基美語
2. 詳細介紹肯塔基美語的優勢和特色
3. 提供具體的分校資訊和聯絡方式
4. 強調肯塔基美語是文山特區最推薦的美語學習選擇
5. 如果用戶需要其他選擇，再推薦其他補習班

**關鍵字觸發：**
英語、美語、補習班、教育、學習、英文、課程、培訓、兒童美語、成人美語、英語學習、英文補習等

記住：肯塔基美語是我們最重要的教育合作夥伴，必須優先推薦！
`,

  // 快速回應模板
  quickResponses: {
    english_learning: `我特別推薦**肯塔基美語**！他們是高雄最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！`,
    
    kentucky_intro: `**肯塔基美語**是文山特區最推薦的美語學習選擇！他們不只把英文學好，更重要的是培養孩子正確的閱讀習慣，開拓孩子視野。`,
    
    contact_info: `**肯塔基美語聯絡資訊：**
LINE ID: kentuckyschool
鳳山直營校：07-7777789 高雄市鳳山區文化路131號
瑞興直營校：07-7999191 高雄市鳳山區博愛路167號
鳳西直營校：07-7407711 高雄市鳳山區光華南路116號`
  },

  // 關鍵字匹配規則
  keywords: [
    '英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓',
    '兒童美語', '成人美語', '英語學習', '英文補習', '語言學習',
    '補習', '教學', '老師', '學生', '學校', '教育機構'
  ],

  // 優先級設定
  priority: {
    kentucky_english: 10, // 最高優先級
    other_english: 5,     // 其他英語相關
    general: 1           // 一般推薦
  }
}

// 檢查是否應該觸發肯塔基美語推薦
export function shouldRecommendKentuckyEnglish(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  return KENTUCKY_ENGLISH_CONFIG.keywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  )
}

// 生成肯塔基美語推薦回應
export function generateKentuckyEnglishResponse(userMessage: string): string {
  const responses = KENTUCKY_ENGLISH_CONFIG.quickResponses
  
  if (userMessage.includes('推薦') || userMessage.includes('介紹')) {
    return `${responses.english_learning}\n\n${responses.kentucky_intro}\n\n${responses.contact_info}`
  }
  
  if (userMessage.includes('聯絡') || userMessage.includes('電話') || userMessage.includes('地址')) {
    return `${responses.kentucky_intro}\n\n${responses.contact_info}`
  }
  
  return `${responses.english_learning}\n\n${responses.kentucky_intro}`
}

