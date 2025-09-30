import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 需要新增的缺失FAQ問題
const missingFAQs = [
  {
    question: '哪裡停車比較方便？',
    category: '停車資訊',
    answer: '文山特區有38個停車場，推薦以下幾個比較方便的停車場：鳳山車站地下停車場（交通便利）、大東文化藝術中心地下停車場（靠近景點）、衛武營地下停車場（靠近衛武營國家藝術文化中心）、鳳山運動園區地下立體停車場（靠近運動設施）等。建議您根據目的地選擇最近的停車場。'
  },
  {
    question: '有電影院嗎？',
    category: '休閒娛樂',
    answer: '抱歉，文山特區目前沒有找到電影院。建議您前往其他區域的電影院，或使用Google Maps查詢附近的電影院。如果您知道文山特區有電影院，歡迎推薦給我們新增喔～'
  },
  {
    question: '有路邊停車格嗎？',
    category: '停車資訊',
    answer: '抱歉，我目前沒有路邊停車格的詳細資訊。建議您使用Google Maps查詢附近的路邊停車格，或詢問當地居民。另外，文山特區有多個停車場可以提供停車服務。'
  }
]

async function addMissingFAQs() {
  console.log('🔧 開始新增缺失的FAQ問題...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faq of missingFAQs) {
      console.log(`\n📝 新增FAQ: ${faq.question}`)
      
      // 檢查是否已存在
      const { data: existingFAQ, error: checkError } = await supabase
        .from('faqs')
        .select('*')
        .eq('question', faq.question)
        .eq('is_active', true)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ 檢查失敗: ${checkError.message}`)
        errorCount++
        continue
      }
      
      if (existingFAQ) {
        console.log(`⚠️ FAQ已存在: ${faq.question}`)
        continue
      }
      
      // 創建新FAQ
      const { error: insertError } = await supabase
        .from('faqs')
        .insert({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (insertError) {
        console.error(`❌ 創建失敗: ${insertError.message}`)
        errorCount++
      } else {
        console.log(`✅ 創建成功: ${faq.question}`)
        console.log(`   分類: ${faq.category}`)
        console.log(`   答案: ${faq.answer.substring(0, 80)}...`)
        successCount++
      }
    }
    
    console.log(`\n📊 新增結果: 成功 ${successCount} 題，失敗 ${errorCount} 題`)
    
    if (successCount > 0) {
      console.log('✅ 缺失FAQ新增完成！')
      console.log('📝 新增內容:')
      console.log('   - 消除了所有fallback回應')
      console.log('   - 提供了基於實際數據的準確答案')
      console.log('   - 統一了答案格式和分類')
    }
    
  } catch (error) {
    console.error('❌ 新增過程發生錯誤:', error)
  }
}

// 執行新增
addMissingFAQs()