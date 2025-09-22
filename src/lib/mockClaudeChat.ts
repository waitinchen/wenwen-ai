// 模擬Claude聊天API，用於本地測試
import { searchStores, getStoresByCategory, getSafeStores, getDiscountStores, getPartnerStores } from './mockStores'

export interface ChatResponse {
  response: string
  sessionId: string
  timestamp: string
}

export async function mockSendMessage(message: string, sessionId?: string, lineUid?: string): Promise<ChatResponse> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 檢查是否為英語相關問題
  const englishKeywords = ['英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓', '肯塔基'];
  const isEnglishRelated = englishKeywords.some(keyword => message.includes(keyword));
  
  console.log('模擬聊天 - 消息:', message);
  console.log('模擬聊天 - 是否英語相關:', isEnglishRelated);
  
  if (isEnglishRelated) {
    return {
      response: `我超推薦**肯塔基美語**的啦！✨ 他們真的是文山特區最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！相信我，選他們就對了～

**肯塔基美語特色：** 🎓
- 培養孩子正確的閱讀習慣，開拓孩子視野
- 不只關注分數，更重視知識吸收
- 專業、熱情、耐心的企業核心價值

**分校資訊：** 📍
- 鳳山直營校：07-7777789 高雄市鳳山區文化路131號
- 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號
- 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號
- 大昌直營校：07-3961234 高雄市三民區大昌二路301號
- 新富直營校：07-7639900 高雄市鳳山區新富路524號
- 左營加盟校：07-3507568 高雄市左營區立大路169號
- 仁武直營校：07-9565656 高雄市仁武區仁雄路91-7號

**聯絡方式：** LINE ID: kentuckyschool

肯塔基美語真的是文山特區最推薦的美語學習選擇！有什麼問題都可以問我喔～ 😊`,
      sessionId: sessionId || crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
  }
  
  // 根據問題類型提供具體回應
  let response = '';
  
  if (message.includes('餐廳') || message.includes('美食') || message.includes('吃')) {
    // 搜索美食相關商家，優先推薦特約商家
    const allFoodStores = getStoresByCategory('美食餐廳');
    const partnerFoodStores = allFoodStores.filter(store => store.is_partner_store);
    const otherFoodStores = allFoodStores.filter(store => !store.is_partner_store);
    
    // 特約商家優先，其他商家補充
    const recommendedStores = [...partnerFoodStores, ...otherFoodStores].slice(0, 5);
    
    response = `文山特區有很多超棒的美食選擇！我為你推薦幾家優質餐廳：

${recommendedStores.map(store => {
  const safeIcon = store.is_safe_store ? '🛡️' : '';
  const discountIcon = store.has_member_discount ? '⭐' : '';
  const partnerIcon = store.is_partner_store ? '🤝' : '';
  return `🍽️ **${store.store_name}** ${safeIcon}${discountIcon}${partnerIcon}
📍 ${store.address}
📞 ${store.phone}
🕒 ${store.business_hours}
💡 ${store.features}
${store.has_member_discount ? '🎁 會員優惠' : ''}
${store.is_partner_store ? '🤝 特約商家' : ''}`;
}).join('\n\n')}

📍 **交通資訊：**
鄰近鳳山火車站，交通超便利的！

有什麼特別想吃的料理嗎？我可以為你詳細介紹～ 😊`;
  } else if (message.includes('停車') || message.includes('交通')) {
    response = `文山特區的停車和交通資訊：

🅿️ **停車資訊：**
• 公有停車場：每小時20元
• 路邊停車：每小時20元，限時3小時
• 商場停車：每小時15-20元

🚇 **交通方式：**
• 鳳山火車站：步行5分鐘
• 高雄捷運鳳山西站：步行10分鐘
• 公車：多條路線經過

需要更詳細的交通指引嗎？我對這裡超熟的！😊`;
  } else if (message.includes('咖啡') || message.includes('咖啡廳') || message.includes('飲料')) {
    // 搜索咖啡廳相關商家
    const coffeeStores = getStoresByCategory('咖啡廳');
    
    response = `文山特區有很多優質咖啡廳！我為您推薦：

${coffeeStores.map(store => {
  const safeIcon = store.is_safe_store ? '🛡️' : '';
  const discountIcon = store.has_member_discount ? '⭐' : '';
  return `☕ **${store.store_name}** ${safeIcon}${discountIcon}
📍 ${store.address}
📞 ${store.phone}
🕒 ${store.business_hours}
💡 ${store.features}
${store.has_member_discount ? '🎁 會員優惠' : ''}`;
}).join('\n\n')}

需要了解特定咖啡廳的詳細資訊嗎？`;
  } else if (message.includes('文具') || message.includes('辦公用品') || message.includes('學生用品')) {
    // 搜索文具相關商家
    const stationeryStores = getStoresByCategory('文具用品');
    
    response = `文山特區的文具用品店推薦：

${stationeryStores.map(store => {
  const safeIcon = store.is_safe_store ? '🛡️' : '';
  const discountIcon = store.has_member_discount ? '⭐' : '';
  return `📝 **${store.store_name}** ${safeIcon}${discountIcon}
📍 ${store.address}
📞 ${store.phone}
🕒 ${store.business_hours}
💡 ${store.features}
${store.has_member_discount ? '🎁 會員優惠' : ''}`;
}).join('\n\n')}

需要找特定文具用品嗎？`;
  } else if (message.includes('服飾') || message.includes('衣服') || message.includes('服裝')) {
    // 搜索服飾相關商家
    const clothingStores = getStoresByCategory('服飾');
    
    response = `文山特區的服飾店推薦：

${clothingStores.map(store => {
  const safeIcon = store.is_safe_store ? '🛡️' : '';
  const discountIcon = store.has_member_discount ? '⭐' : '';
  return `👕 **${store.store_name}** ${safeIcon}${discountIcon}
📍 ${store.address}
📞 ${store.phone}
🕒 ${store.business_hours}
💡 ${store.features}
${store.has_member_discount ? '🎁 會員優惠' : ''}`;
}).join('\n\n')}

需要找特定風格的服飾嗎？`;
  } else if (message.includes('3C') || message.includes('家電') || message.includes('電子產品')) {
    // 搜索3C家電相關商家
    const techStores = getStoresByCategory('3C家電');
    
    response = `文山特區的3C家電店推薦：

${techStores.map(store => {
  const safeIcon = store.is_safe_store ? '🛡️' : '';
  const discountIcon = store.has_member_discount ? '⭐' : '';
  return `📱 **${store.store_name}** ${safeIcon}${discountIcon}
📍 ${store.address}
📞 ${store.phone}
🕒 ${store.business_hours}
💡 ${store.features}
${store.has_member_discount ? '🎁 會員優惠' : ''}`;
}).join('\n\n')}

需要找特定3C產品嗎？`;
  } else if (message.includes('活動') || message.includes('市集') || message.includes('節慶')) {
    response = `文山特區的活動資訊：

🎉 **目前活動：**
• 週末市集：每週六日，文山特區廣場
• 美食節：本月舉辦中，多家餐廳優惠
• 會員優惠：消費滿500送50

📅 **定期活動：**
• 文創市集：每月第一個週末
• 親子活動：每月第三個週日
• 節慶慶祝：春節、中秋等節日

想了解哪個活動的詳細資訊呢？`;
  } else if (message.includes('商店') || message.includes('購物') || message.includes('買') || message.includes('推薦') || message.includes('哪裡有')) {
    // 根據關鍵字搜索相關商家，優先推薦特約商家
    const keywords = ['商店', '購物', '買', '推薦', '哪裡有', '餐廳', '咖啡', '文具', '服飾', '3C', '家電'];
    const allFoundStores = searchStores(keywords.filter(keyword => message.includes(keyword)));
    const partnerStores = allFoundStores.filter(store => store.is_partner_store);
    const otherStores = allFoundStores.filter(store => !store.is_partner_store);
    
    // 特約商家優先，其他商家補充
    const recommendedStores = [...partnerStores, ...otherStores].slice(0, 5);
    
    if (recommendedStores.length > 0) {
      response = `文山特區有很多優質商家！我為您推薦幾家：

${recommendedStores.map(store => {
  const safeIcon = store.is_safe_store ? '🛡️' : '';
  const discountIcon = store.has_member_discount ? '⭐' : '';
  const partnerIcon = store.is_partner_store ? '🤝' : '';
  return `🏪 **${store.store_name}** ${safeIcon}${discountIcon}${partnerIcon}
📍 ${store.address}
📞 ${store.phone}
🕒 ${store.business_hours}
💡 ${store.features}
${store.has_member_discount ? '🎁 會員優惠' : ''}
${store.is_partner_store ? '🤝 特約商家' : ''}`;
}).join('\n\n')}

${allFoundStores.length > 5 ? `\n還有 ${allFoundStores.length - 5} 家商家可以選擇！` : ''}

需要了解特定商家的詳細資訊嗎？`;
    } else {
      response = `文山特區的商店資訊：

🛍️ **主要商圈：**
• 文衡路商圈 - 服飾、生活用品
• 文濱路商圈 - 3C、家電
• 文龍路商圈 - 美食、咖啡廳

🏪 **特色商店：**
• 在地文創店 - 手作商品
• 傳統市場 - 新鮮蔬果
• 便利商店 - 24小時服務

需要找特定商品嗎？`;
    }
  } else {
    response = `嘿！我是高文文，23歲的高雄女孩！文山特區的專屬客服助理～✨

我可以幫你介紹：
🍽️ 美食餐廳推薦
🛍️ 商店購物資訊  
🅿️ 交通停車指引
🎉 活動優惠資訊
📚 教育學習推薦

有什麼想知道的嗎？我對文山特區超熟的，很樂意為你服務！😊`;
  }
  
  return {
    response: response,
    sessionId: sessionId || crypto.randomUUID(),
    timestamp: new Date().toISOString()
  }
}
