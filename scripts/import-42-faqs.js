import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 42題優化後的FAQ問題
const faqQuestions = [
  // 美食推薦 (12題)
  { question: '附近有什麼好吃的餐廳？', category: '美食推薦' },
  { question: '有推薦的早餐店嗎？', category: '美食推薦' },
  { question: '有日式料理嗎？', category: '美食推薦' },
  { question: '有韓式料理嗎？', category: '美食推薦' },
  { question: '有泰式料理嗎？', category: '美食推薦' },
  { question: '有中式餐廳嗎？', category: '美食推薦' },
  { question: '有素食餐廳嗎？', category: '美食推薦' },
  { question: '推薦幾家咖啡廳', category: '美食推薦' },
  { question: '推薦幾家義大利麵店', category: '美食推薦' },
  { question: '有燒肉店嗎？', category: '美食推薦' },
  { question: '有居酒屋嗎？', category: '美食推薦' },
  { question: '哪裡有宵夜可以吃？', category: '美食推薦' },

  // 停車資訊 (8題)
  { question: '附近有停車場嗎？', category: '停車資訊' },
  { question: '停車費怎麼算？', category: '停車資訊' },
  { question: '有免費停車場嗎？', category: '停車資訊' },
  { question: '有地下停車場嗎？', category: '停車資訊' },
  { question: '停車場營業時間？', category: '停車資訊' },
  { question: '有機車停車位嗎？', category: '停車資訊' },
  { question: '停車場有充電樁嗎？', category: '停車資訊' },
  { question: '有代客泊車服務嗎？', category: '停車資訊' },

  // 購物消費 (8題)
  { question: '附近有便利商店嗎？', category: '購物消費' },
  { question: '有藥局嗎？', category: '購物消費' },
  { question: '有書店嗎？', category: '購物消費' },
  { question: '哪裡可以買衣服？', category: '購物消費' },
  { question: '有超市嗎？', category: '購物消費' },
  { question: '有美妝店嗎？', category: '購物消費' },
  { question: '哪裡可以買鞋子？', category: '購物消費' },
  { question: '有3C用品店嗎？', category: '購物消費' },

  // 生活服務 (8題)
  { question: '有銀行嗎？', category: '生活服務' },
  { question: '哪裡可以洗衣服？', category: '生活服務' },
  { question: '有郵局嗎？', category: '生活服務' },
  { question: '有加油站嗎？', category: '生活服務' },
  { question: '哪裡可以修手機？', category: '生活服務' },
  { question: '有影印店嗎？', category: '生活服務' },
  { question: '有快遞服務嗎？', category: '生活服務' },
  { question: '哪裡可以配鑰匙？', category: '生活服務' },

  // 醫療保健 (4題)
  { question: '有診所嗎？', category: '醫療保健' },
  { question: '有牙醫嗎？', category: '醫療保健' },
  { question: '有眼科嗎？', category: '醫療保健' },
  { question: '有中醫診所嗎？', category: '醫療保健' },

  // 休閒娛樂 (2題)
  { question: '有公園嗎？', category: '休閒娛樂' },
  { question: '有圖書館嗎？', category: '休閒娛樂' }
]

async function importFAQs() {
  console.log('🚀 開始匯入42題優化後的FAQ問題...')
  
  try {
    // 檢查現有FAQ數量
    const { count: existingCount } = await supabase
      .from('faqs')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 現有FAQ數量: ${existingCount}`)
    
    // 匯入新FAQ
    const { data, error } = await supabase
      .from('faqs')
      .insert(faqQuestions.map(faq => ({
        question: faq.question,
        answer: `這是關於${faq.category}的問題，請稍後更新答案。`,
        category: faq.category,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
    
    if (error) {
      console.error('❌ 匯入失敗:', error)
      return
    }
    
    console.log('✅ 成功匯入42題FAQ問題！')
    console.log(`📝 匯入詳情:`)
    console.log(`   - 美食推薦: 12題`)
    console.log(`   - 停車資訊: 8題`)
    console.log(`   - 購物消費: 8題`)
    console.log(`   - 生活服務: 8題`)
    console.log(`   - 醫療保健: 4題`)
    console.log(`   - 休閒娛樂: 2題`)
    
    // 驗證匯入結果
    const { count: newCount } = await supabase
      .from('faqs')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 匯入後總FAQ數量: ${newCount}`)
    console.log(`📈 新增FAQ數量: ${newCount - existingCount}`)
    
  } catch (error) {
    console.error('❌ 匯入過程發生錯誤:', error)
  }
}

// 執行匯入
importFAQs()
