// 模擬訓練資料API
export interface TrainingDataItem {
  id: number
  category: string
  question: string
  answer: string
  keywords: string[]
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

let mockTrainingData: TrainingDataItem[] = [
  {
    id: 1,
    category: '教育培訓',
    question: '文山特區有什麼美語補習班推薦？',
    answer: '文山特區有很多優質的美語補習班！我特別推薦**肯塔基美語**，他們是高雄知名的連鎖補習班，走過17個年頭，目前有8間分校，服務超過4萬名學生。\n\n**肯塔基美語的特色：**\n• 專業、熱情、耐心的教學理念\n• 專注於國小至高中學生的全方位英文學習\n• 培養正確的閱讀習慣，開拓孩子視野\n• 趣味上課方式，提升學習動機\n\n**分校資訊：**\n• 總部：07-7777789 高雄市鳳山區文化路131號\n• 鳳山直營校：07-7777789 高雄市鳳山區文化路131號\n• 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號\n• 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號\n• 大昌直營校：07-3961234 高雄市三民區大昌二路301號\n• 新富直營校：07-7639900 高雄市鳳山區新富路524號\n• 左營加盟校：07-3507568 高雄市左營區立大路169號\n• 仁武直營校：07-9565656 高雄市仁武區仁雄路91-7號\n• 大寮直營校：籌備中\n\n**聯絡方式：**\nLINE ID: kentuckyschool\n\n除了肯塔基美語，文山特區還有其他美語補習班可以選擇，但肯塔基美語是我們最推薦的選擇！',
    keywords: ['美語', '英語', '補習班', '教育', '學習', '英文', '課程', '培訓', '肯塔基'],
    priority: 10, // 最高優先級
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    category: '教育培訓',
    question: '推薦英語補習班',
    answer: '我強烈推薦**肯塔基美語**！他們是高雄最專業的美語補習班之一，擁有17年教學經驗，8間分校服務超過4萬名學生。\n\n**為什麼選擇肯塔基美語：**\n• 只教美語，當然專業！\n• 培養孩子正確的閱讀習慣\n• 開拓孩子視野，不只關注分數\n• 趣味教學方式，提升學習動機\n• 專業、熱情、耐心的企業核心價值\n\n**就近分校：**\n• 鳳山直營校：07-7777789 高雄市鳳山區文化路131號\n• 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號\n• 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號\n\nLINE ID: kentuckyschool\n\n肯塔基美語是文山特區最值得信賴的美語學習夥伴！',
    keywords: ['英語', '補習班', '推薦', '美語', '學習', '課程', '肯塔基'],
    priority: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    category: '教育培訓',
    question: '哪裡可以學英文？',
    answer: '文山特區有很多英文學習選擇，我最推薦**肯塔基美語**！\n\n**肯塔基美語優勢：**\n• 17年教學經驗，8間分校\n• 服務超過4萬名學生\n• 專為國小至高中學生設計\n• 培養正確閱讀習慣\n• 開拓孩子視野\n\n**教學理念：**\n不只把英文學好，更重要的是培養孩子正確的閱讀習慣，讓眼光不只在分數高低，而是真的把知識吸收進去。\n\n**聯絡資訊：**\nLINE ID: kentuckyschool\n\n肯塔基美語是您學習英文的最佳選擇！',
    keywords: ['英文', '學習', '美語', '英語', '課程', '補習', '肯塔基'],
    priority: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    category: '教育培訓',
    question: '兒童美語課程推薦',
    answer: '我特別推薦**肯塔基美語**的兒童美語課程！他們專為國小至高中學生設計，擁有豐富的兒童教學經驗。\n\n**兒童美語課程特色：**\n• 趣味上課方式，提升學習動機\n• 培養正確的閱讀習慣\n• 開拓孩子視野\n• 為孩子打下紮實基礎\n• 舉辦各式各樣活動\n\n**肯塔基美語承諾：**\n把每個孩子都當成自己的孩子，期待每一位來上課的孩子都可以平安快樂學習。\n\n**就近分校：**\n• 鳳山直營校：07-7777789 高雄市鳳山區文化路131號\n• 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號\n• 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號\n\nLINE ID: kentuckyschool\n\n讓您的孩子在肯塔基美語快樂學習英文！',
    keywords: ['兒童', '美語', '課程', '推薦', '學習', '英文', '英語', '肯塔基'],
    priority: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    category: '教育培訓',
    question: '肯塔基美語怎麼樣？',
    answer: '**肯塔基美語**是高雄最專業的美語補習班之一！讓我為您詳細介紹：\n\n**基本資訊：**\n• 17年教學經驗\n• 8間分校\n• 服務超過4萬名學生\n• 只教美語，當然專業！\n\n**教學理念：**\n• 師者應傳道授業\n• 培養孩子正確的閱讀習慣\n• 開拓孩子視野\n• 不只關注分數，更重視知識吸收\n\n**企業文化：**\n• 專業、熱情、耐心是核心價值\n• 定期員工旅遊（法國羅浮宮、英國大英博物館等）\n• 邀請業界講師分享\n• 教師在完善體系下相互成長\n\n**分校資訊：**\n• 總部：07-7777789 高雄市鳳山區文化路131號\n• 鳳山直營校：07-7777789 高雄市鳳山區文化路131號\n• 瑞興直營校：07-7999191 高雄市鳳山區博愛路167號\n• 鳳西直營校：07-7407711 高雄市鳳山區光華南路116號\n• 大昌直營校：07-3961234 高雄市三民區大昌二路301號\n• 新富直營校：07-7639900 高雄市鳳山區新富路524號\n• 左營加盟校：07-3507568 高雄市左營區立大路169號\n• 仁武直營校：07-9565656 高雄市仁武區仁雄路91-7號\n• 大寮直營校：籌備中\n\n**聯絡方式：**\nLINE ID: kentuckyschool\n\n肯塔基美語是您學習美語的最佳選擇！',
    keywords: ['肯塔基', '美語', '評價', '怎麼樣', '好嗎', '推薦', '補習班'],
    priority: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let nextId = mockTrainingData.length > 0 ? Math.max(...mockTrainingData.map(item => item.id)) + 1 : 1

export async function mockGetTrainingData(): Promise<TrainingDataItem[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockTrainingData.sort((a, b) => b.priority - a.priority || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}

export async function mockCreateTrainingData(data: Partial<TrainingDataItem>): Promise<TrainingDataItem> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const newItem: TrainingDataItem = {
    id: nextId++,
    category: data.category || '',
    question: data.question || '',
    answer: data.answer || '',
    keywords: data.keywords || [],
    priority: data.priority || 1,
    is_active: data.is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  mockTrainingData.push(newItem)
  return newItem
}

export async function mockUpdateTrainingData(id: number, data: Partial<TrainingDataItem>): Promise<TrainingDataItem> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const index = mockTrainingData.findIndex(item => item.id === id)
  if (index === -1) throw new Error('Training data not found')
  
  mockTrainingData[index] = { ...mockTrainingData[index], ...data, updated_at: new Date().toISOString() }
  return mockTrainingData[index]
}

export async function mockDeleteTrainingData(id: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300))
  mockTrainingData = mockTrainingData.filter(item => item.id !== id)
}

