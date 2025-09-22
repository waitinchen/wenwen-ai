// 模擬商家數據庫
export interface Store {
  id: number
  store_name: string
  owner: string
  role: string
  category: string
  address: string
  phone: string
  business_hours: string
  services: string
  features: string
  is_safe_store: boolean
  has_member_discount: boolean
  is_partner_store: boolean
  facebook_url: string
  website_url: string
  created_at: string
  updated_at: string
}

// 從 localStorage 載入或初始化模擬數據
const loadMockStores = (): Store[] => {
  try {
    const saved = localStorage.getItem('mockStores')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load mock stores from localStorage:', error)
  }
  return []
}

// 保存模擬數據到 localStorage
const saveMockStores = (stores: Store[]) => {
  try {
    localStorage.setItem('mockStores', JSON.stringify(stores))
  } catch (error) {
    console.warn('Failed to save mock stores to localStorage:', error)
  }
}

// 初始化模擬數據
const initializeMockStores = (): Store[] => {
  const loaded = loadMockStores()
  if (loaded.length > 0) {
    return loaded
  }
  
  // 如果沒有保存的數據，使用預設數據
  const defaultStores: Store[] = [
  // 教育培訓類 - 肯塔基美語
  {
    id: 1,
    store_name: "肯塔基美語",
    owner: "肯塔基美語教育機構",
    role: "教育機構",
    category: "教育培訓",
    address: "高雄市文山區美語街123號",
    phone: "07-777-7789",
    business_hours: "周一至周日 09:00-21:00",
    services: "美語教學、兒童美語、成人美語、檢定輔導",
    features: "專業外師、小班制教學、多元化課程、免費試聽",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: true,
    facebook_url: "https://www.facebook.com/kentuckyenglish",
    website_url: "https://kentuckyenglish.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // 美食餐廳類
  {
    id: 2,
    store_name: "文山牛肉麵",
    owner: "王老闆",
    role: "店長",
    category: "美食餐廳",
    address: "高雄市鳳山區文衡路123號",
    phone: "07-7771234",
    business_hours: "11:00-21:00",
    services: "牛肉麵、小菜、飲料",
    features: "招牌紅燒牛肉麵、湯頭濃郁",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: true,
    facebook_url: "https://facebook.com/wenshanbeef",
    website_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    store_name: "老街豆花",
    owner: "李老闆娘",
    role: "店長",
    category: "美食餐廳",
    address: "高雄市鳳山區文濱路456號",
    phone: "07-7775678",
    business_hours: "10:00-22:00",
    services: "傳統豆花、甜品、飲料",
    features: "手工製作、口感滑嫩",
    is_safe_store: true,
    has_member_discount: false,
    is_partner_store: false,
    facebook_url: "",
    website_url: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    store_name: "1928燒肉總鋪-鳳山店",
    owner: "陳經理",
    role: "店長",
    category: "美食餐廳",
    address: "高雄市鳳山區青年路二段456號",
    phone: "07-7779999",
    business_hours: "17:00-24:00",
    services: "日式燒肉、火鍋、飲料",
    features: "優質肉品、專業服務",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: true,
    facebook_url: "https://facebook.com/1928yakiniku",
    website_url: "https://1928yakiniku.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // 便利商店類
  {
    id: 5,
    store_name: "7-ELEVEN",
    owner: "統一超商",
    role: "連鎖店",
    category: "便利商店",
    address: "高雄市鳳山區草公路137號1樓",
    phone: "07-7770000",
    business_hours: "24小時",
    services: "便利商品、代收服務、ATM",
    features: "24小時營業、多項服務",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: true,
    facebook_url: "",
    website_url: "https://7-11.com.tw",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // 文具用品類
  {
    id: 6,
    store_name: "101文具天堂(鳳山青年店)",
    owner: "張店長",
    role: "店長",
    category: "文具用品",
    address: "高雄市鳳山區青年路二段385號",
    phone: "0911777162",
    business_hours: "09:00-21:00",
    services: "文具用品、辦公用品、學生用品",
    features: "種類齊全、價格實惠",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: false,
    facebook_url: "https://facebook.com/101stationery",
    website_url: "https://101stationery.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // 咖啡廳類
  {
    id: 7,
    store_name: "星巴克-鳳山店",
    owner: "星巴克",
    role: "連鎖店",
    category: "咖啡廳",
    address: "高雄市鳳山區文衡路789號",
    phone: "07-7778888",
    business_hours: "06:30-22:00",
    services: "咖啡、輕食、甜點",
    features: "專業咖啡、舒適環境",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: false,
    facebook_url: "https://facebook.com/starbuckstw",
    website_url: "https://starbucks.com.tw",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // 服飾類
  {
    id: 8,
    store_name: "UNIQLO-鳳山店",
    owner: "UNIQLO",
    role: "連鎖店",
    category: "服飾",
    address: "高雄市鳳山區文龍路321號",
    phone: "07-7777777",
    business_hours: "10:00-22:00",
    services: "男女裝、童裝、配件",
    features: "日系風格、品質保證",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: false,
    facebook_url: "https://facebook.com/uniqlo.tw",
    website_url: "https://uniqlo.com.tw",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // 3C家電類
  {
    id: 9,
    store_name: "燦坤3C-鳳山店",
    owner: "燦坤",
    role: "連鎖店",
    category: "3C家電",
    address: "高雄市鳳山區文濱路654號",
    phone: "07-7776666",
    business_hours: "10:00-22:00",
    services: "3C產品、家電、維修服務",
    features: "專業服務、保固維修",
    is_safe_store: true,
    has_member_discount: true,
    is_partner_store: false,
    facebook_url: "https://facebook.com/tsannkuen",
    website_url: "https://tsannkuen.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  ]
  
  // 保存預設數據到 localStorage
  saveMockStores(defaultStores)
  return defaultStores
}

// 模擬189家商戶數據
let mockStores: Store[] = initializeMockStores()

// 根據關鍵字搜索商家
export function searchStores(keywords: string[]): Store[] {
  return mockStores.filter(store => 
    keywords.some(keyword => 
      store.store_name.toLowerCase().includes(keyword.toLowerCase()) ||
      store.category.toLowerCase().includes(keyword.toLowerCase()) ||
      store.services.toLowerCase().includes(keyword.toLowerCase()) ||
      store.features.toLowerCase().includes(keyword.toLowerCase())
    )
  )
}

// 根據分類搜索商家
export function getStoresByCategory(category: string): Store[] {
  return mockStores.filter(store => 
    store.category.toLowerCase().includes(category.toLowerCase())
  )
}

// 獲取安心店家
export function getSafeStores(): Store[] {
  return mockStores.filter(store => store.is_safe_store)
}

// 獲取優惠店家
export function getDiscountStores(): Store[] {
  return mockStores.filter(store => store.has_member_discount)
}

// 獲取特約商家
export function getPartnerStores(): Store[] {
  return mockStores.filter(store => store.is_partner_store)
}

// 獲取所有模擬商家數據
export function getAllMockStores(): Store[] {
  return mockStores
}

// 更新模擬商家數據
export function updateMockStore(id: number, storeData: Partial<Store>): Store | null {
  const storeIndex = mockStores.findIndex(s => s.id === id)
  if (storeIndex !== -1) {
    // 確保布林值正確處理
    const sanitizedData = {
      ...storeData,
      is_partner_store: Boolean(storeData.is_partner_store),
      is_safe_store: Boolean(storeData.is_safe_store),
      has_member_discount: Boolean(storeData.has_member_discount),
      updated_at: new Date().toISOString()
    }
    
    console.log('updateMockStore - Original data:', storeData)
    console.log('updateMockStore - Sanitized data:', sanitizedData)
    console.log('updateMockStore - is_partner_store:', sanitizedData.is_partner_store, typeof sanitizedData.is_partner_store)
    
    mockStores[storeIndex] = { ...mockStores[storeIndex], ...sanitizedData }
    saveMockStores(mockStores) // 保存到 localStorage
    return mockStores[storeIndex]
  }
  return null
}

// 創建新的模擬商家
export function createMockStore(storeData: Partial<Store>): Store {
  // 確保布林值正確處理
  const sanitizedData = {
    ...storeData,
    is_partner_store: Boolean(storeData.is_partner_store),
    is_safe_store: Boolean(storeData.is_safe_store),
    has_member_discount: Boolean(storeData.has_member_discount)
  }
  
  console.log('createMockStore - Original data:', storeData)
  console.log('createMockStore - Sanitized data:', sanitizedData)
  console.log('createMockStore - is_partner_store:', sanitizedData.is_partner_store, typeof sanitizedData.is_partner_store)
  
  const newStore: Store = {
    id: Math.max(...mockStores.map(s => s.id)) + 1,
    store_name: sanitizedData.store_name || '',
    owner: sanitizedData.owner || '',
    role: sanitizedData.role || '',
    category: sanitizedData.category || '',
    address: sanitizedData.address || '',
    phone: sanitizedData.phone || '',
    business_hours: sanitizedData.business_hours || '',
    services: sanitizedData.services || '',
    features: sanitizedData.features || '',
    is_safe_store: sanitizedData.is_safe_store,
    has_member_discount: sanitizedData.has_member_discount,
    is_partner_store: sanitizedData.is_partner_store,
    facebook_url: sanitizedData.facebook_url || '',
    website_url: sanitizedData.website_url || '',
    created_at: sanitizedData.created_at || new Date().toISOString(),
    updated_at: sanitizedData.updated_at || new Date().toISOString()
  }
  
  mockStores.push(newStore)
  saveMockStores(mockStores) // 保存到 localStorage
  return newStore
}

// 刪除模擬商家
export function deleteMockStore(id: number): boolean {
  const storeIndex = mockStores.findIndex(s => s.id === id)
  if (storeIndex !== -1) {
    mockStores.splice(storeIndex, 1)
    saveMockStores(mockStores) // 保存到 localStorage
    return true
  }
  return false
}
