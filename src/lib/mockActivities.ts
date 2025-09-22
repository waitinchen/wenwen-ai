// 模擬的活動數據
let mockActivities: any[] = [
  {
    id: 1,
    title: '文山特區美食節',
    description: '匯聚文山特區最受歡迎的美食店家，提供限時優惠和特色料理',
    content: '文山特區美食節即將開跑！\n\n🎉 活動時間：2024年1月15日 - 1月31日\n📍 活動地點：文山特區商圈\n\n🍽️ 參與店家：\n• 文山牛肉麵 - 招牌紅燒牛肉麵8折\n• 老街豆花 - 買二送一\n• 夜市小吃 - 滿200送50\n• 星巴克 - 第二杯半價\n\n🎁 特別優惠：\n• 消費滿500元送精美小禮物\n• 打卡分享送飲料券\n• 會員專享額外9折優惠\n\n歡迎大家踴躍參與，一起品嚐文山特區的美味！',
    start_date: '2024-01-15T00:00:00Z',
    end_date: '2024-01-31T23:59:59Z',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: '週末市集活動',
    description: '每週六日舉辦的市集，提供新鮮農產品和手工藝品',
    content: '文山特區週末市集\n\n🕐 活動時間：每週六日 09:00-18:00\n📍 活動地點：文山特區廣場\n\n🥬 農產品區：\n• 新鮮有機蔬菜\n• 當季水果\n• 在地農特產\n\n🎨 手工藝品區：\n• 手作飾品\n• 文創商品\n• 藝術作品\n\n🎪 現場活動：\n• 親子DIY體驗\n• 音樂表演\n• 美食試吃\n\n歡迎全家大小一起來逛市集！',
    start_date: '2024-01-06T09:00:00Z',
    end_date: '2024-12-31T18:00:00Z',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: '會員專屬優惠月',
    description: '專為會員設計的特別優惠活動',
    content: '會員專屬優惠月\n\n👑 活動時間：2024年2月1日 - 2月29日\n🎯 活動對象：文山特區會員\n\n💎 會員專享優惠：\n• 全店商品9折優惠\n• 生日當月額外8折\n• 免費停車3小時\n• 專屬客服熱線\n\n🎁 新會員福利：\n• 註冊即送100元購物金\n• 首次消費滿300送50\n• 免費會員卡製作\n\n📱 如何成為會員：\n1. 下載文山特區APP\n2. 填寫基本資料\n3. 完成註冊即可享受優惠\n\n立即註冊，享受專屬優惠！',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-02-29T23:59:59Z',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    title: '春節特別活動',
    description: '慶祝農曆新年的特別慶祝活動',
    content: '文山特區春節特別活動\n\n🧧 活動時間：2024年2月10日 - 2月17日\n🎊 活動主題：龍年大吉，文山特區賀新春\n\n🎆 精彩活動：\n• 舞龍舞獅表演\n• 傳統年貨市集\n• 春聯書法體驗\n• 猜燈謎遊戲\n\n🎁 特別優惠：\n• 全店商品85折\n• 滿額送紅包袋\n• 消費抽獎活動\n• 免費停車5小時\n\n🍽️ 年菜預訂：\n• 多間餐廳提供年菜外帶\n• 提前預訂享9折優惠\n• 免費配送到府\n\n祝大家新年快樂，龍年行大運！',
    start_date: '2024-02-10T00:00:00Z',
    end_date: '2024-02-17T23:59:59Z',
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function mockGetActivities(): Promise<any[]> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 按創建時間降序排序
  return [...mockActivities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function mockCreateActivity(activityData: Partial<any>): Promise<any> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newActivity = {
    id: Math.max(...mockActivities.map(a => a.id)) + 1,
    title: activityData.title || '',
    description: activityData.description || '',
    content: activityData.content || '',
    start_date: activityData.start_date || new Date().toISOString(),
    end_date: activityData.end_date || new Date().toISOString(),
    is_active: activityData.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  mockActivities.push(newActivity)
  return newActivity
}

export async function mockUpdateActivity(id: number, activityData: Partial<any>): Promise<any> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const index = mockActivities.findIndex(a => a.id === id)
  if (index === -1) {
    throw new Error('活動不存在')
  }
  
  const updatedActivity = {
    ...mockActivities[index],
    ...activityData,
    id, // 確保 ID 不變
    updated_at: new Date().toISOString()
  }
  
  mockActivities[index] = updatedActivity
  return updatedActivity
}

export async function mockDeleteActivity(id: number): Promise<void> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const index = mockActivities.findIndex(a => a.id === id)
  if (index === -1) {
    throw new Error('活動不存在')
  }
  
  mockActivities.splice(index, 1)
}

