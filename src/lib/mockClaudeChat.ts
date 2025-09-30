// 模擬Claude聊天API，用於本地測試
import { searchStores, getStoresByCategory, getSafeStores, getDiscountStores, getPartnerStores } from './mockStores'

export interface ChatResponse {
  response: string
  session_id: string
  intent: string
  confidence: number
  recommended_stores: Array<{
    id: number
    name: string
    category: string
    is_partner: boolean
  }>
  debug: {
    isFollowUp: boolean
    matchedKeywords: string[]
    storeCount: number
    engine: string
  }
  version: string
  // 向後相容性
  sessionId?: string
  timestamp?: string
}

export async function mockSendMessage(message: string, sessionId?: string, lineUid?: string): Promise<ChatResponse> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 意圖分類
  const englishKeywords = ['英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓', '肯塔基'];
  const foodKeywords = ['美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝'];
  const parkingKeywords = ['停車', '停車場', '車位'];
  
  const isEnglishRelated = englishKeywords.some(keyword => message.includes(keyword));
  const isFoodRelated = foodKeywords.some(keyword => message.includes(keyword));
  const isParkingRelated = parkingKeywords.some(keyword => message.includes(keyword));
  
  let intent = 'GENERAL';
  let confidence = 0.5;
  let matchedKeywords: string[] = [];
  let recommendedStores: any[] = [];
  let response = '';
  
  console.log('模擬聊天 - 消息:', message);
  
  if (isEnglishRelated) {
    intent = 'ENGLISH_LEARNING';
    confidence = 0.9;
    matchedKeywords = englishKeywords.filter(keyword => message.includes(keyword));
    
    response = `我超推薦**肯塔基美語**的啦！✨ 他們真的是文山特區最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！相信我，選他們就對了～

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

肯塔基美語真的是文山特區最推薦的美語學習選擇！有什麼問題都可以問我喔～ 😊`;

    recommendedStores = [{
      id: 1,
      name: '肯塔基美語',
      category: '教育培訓',
      is_partner: true
    }];
    
  } else if (isFoodRelated) {
    intent = 'FOOD';
    confidence = 0.8;
    matchedKeywords = foodKeywords.filter(keyword => message.includes(keyword));
    
    const foodStores = getStoresByCategory('美食餐廳');
    recommendedStores = foodStores.slice(0, 3).map(store => ({
      id: store.id,
      name: store.store_name,
      category: store.category,
      is_partner: store.is_partner_store || false
    }));
    
    response = `嘿～文山特區有很多不錯的美食選擇呢！🍱 我推薦以下幾家：

${recommendedStores.map((store, i) => 
  `${i + 1}. **${store.name}** ${store.is_partner ? '[特約商家]' : ''}\n   ${store.category}`
).join('\n')}

這些都是我蠻推薦的店家，有空不妨去試試看！如果有其他想了解的，也可以問我喔～ 😊`;
    
  } else if (isParkingRelated) {
    intent = 'PARKING';
    confidence = 0.8;
    matchedKeywords = parkingKeywords.filter(keyword => message.includes(keyword));
    
    const parkingStores = getStoresByCategory('停車場');
    recommendedStores = parkingStores.slice(0, 3).map(store => ({
      id: store.id,
      name: store.store_name,
      category: store.category,
      is_partner: store.is_partner_store || false
    }));
    
    response = `停車的話，文山特區有幾個不錯的選擇：🅿️

${recommendedStores.map((store, i) => 
  `${i + 1}. **${store.name}**\n   地址請洽詢管理單位`
).join('\n')}

記得確認營業時間和收費標準喔！如果有其他問題也可以問我～ 😊`;
    
  } else {
    intent = 'GENERAL';
    confidence = 0.6;
    matchedKeywords = ['推薦', '介紹'];
    
    const generalStores = getPartnerStores().slice(0, 2);
    recommendedStores = generalStores.map(store => ({
      id: store.id,
      name: store.store_name,
      category: store.category,
      is_partner: true
    }));
    
    response = `讓我為你推薦一些不錯的選擇：✨

${recommendedStores.map((store, i) => 
  `${i + 1}. **${store.name}** [特約商家]\n   ${store.category}`
).join('\n')}

希望對你有幫助！如果有其他需求，也可以再問我沒關係！😊`;
  }
  
  const currentSessionId = sessionId || crypto.randomUUID();
  
  return {
    response,
    session_id: currentSessionId,
    intent,
    confidence,
    recommended_stores: recommendedStores,
    debug: {
      isFollowUp: false,
      matchedKeywords,
      storeCount: recommendedStores.length,
      engine: 'mock-v1.0'
    },
    version: 'WEN 1.3.0-MOCK',
    // 向後相容性
    sessionId: currentSessionId,
    timestamp: new Date().toISOString()
  };
}