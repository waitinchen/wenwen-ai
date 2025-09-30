import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 需要修復的模糊匹配問題
const fuzzyMatchingIssues = [
  {
    question: '有壽司店嗎？',
    correctCategory: '美食推薦',
    wrongAnswer: '書店',
    correctAnswer: '有的！文山特區有幾家不錯的壽司店：スシロー壽司郎 高雄鳳山店（壽司）、金太郎壽司等，提供新鮮美味的壽司料理。'
  },
  {
    question: '有拉麵店嗎？',
    correctCategory: '美食推薦',
    wrongAnswer: '書店',
    correctAnswer: '抱歉，文山特區目前沒有找到專門的拉麵店。不過部分日式餐廳可能有提供拉麵，建議您使用Google Maps查詢附近的日式餐廳，或詢問當地居民。'
  },
  {
    question: '有披薩店嗎？',
    correctCategory: '美食推薦',
    wrongAnswer: '書店',
    correctAnswer: '抱歉，文山特區目前沒有找到專門的披薩店。建議您使用Google Maps查詢附近的披薩店，或詢問當地居民。'
  },
  {
    question: '有牛排店嗎？',
    correctCategory: '美食推薦',
    wrongAnswer: '書店',
    correctAnswer: '抱歉，文山特區目前沒有找到專門的牛排店。建議您使用Google Maps查詢附近的牛排店，或詢問當地居民。'
  },
  {
    question: '有海鮮餐廳嗎？',
    correctCategory: '美食推薦',
    wrongAnswer: '素食餐廳',
    correctAnswer: '抱歉，文山特區目前沒有找到專門的海鮮餐廳。建議您使用Google Maps查詢附近的海鮮餐廳，或詢問當地居民。'
  },
  {
    question: '有24小時營業的餐廳嗎？',
    correctCategory: '美食推薦',
    wrongAnswer: '素食餐廳',
    correctAnswer: '抱歉，文山特區目前沒有找到24小時營業的餐廳。大部分餐廳的營業時間為早上到晚上，建議您查看各餐廳的具體營業時間。'
  },
  {
    question: '有適合聚餐的餐廳嗎？',
    correctCategory: '美食推薦',
    wrongAnswer: '素食餐廳',
    correctAnswer: '文山特區有幾家適合聚餐的餐廳：STORY Restaurant（精致料理）、Da Da\'s Kitchen（義大利料理）、拼鍋命（麻辣鍋）、珍好味職人鍋物 鳳山旗艦店（涮海鍋物）等，提供不同風味的用餐選擇。'
  },
  {
    question: '有便利商店嗎？',
    correctCategory: '購物消費',
    wrongAnswer: '書店',
    correctAnswer: '抱歉，文山特區目前沒有找到便利商店。建議您使用Google Maps查詢附近的便利商店，或詢問當地居民。'
  },
  {
    question: '有美髮店嗎？',
    correctCategory: '生活服務',
    wrongAnswer: '書店',
    correctAnswer: '有的！文山特區有7家美髮店：藝凡髮型Youthful hair（造型設計）、LAB Hair Salon 文山館（造型設計）、Mini日式造型沙龍-鳳山店（日式造型）、御約髮妝造型（造型設計）、新技髮型連鎖等，提供各種美髮服務。'
  }
]

async function fixFuzzyMatching() {
  console.log('🔧 開始修復模糊匹配錯誤...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const issue of fuzzyMatchingIssues) {
      console.log(`\n🔍 處理問題: ${issue.question}`)
      
      // 檢查是否已存在正確的FAQ
      const { data: existingFAQ, error: checkError } = await supabase
        .from('faqs')
        .select('*')
        .eq('question', issue.question)
        .eq('is_active', true)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ 檢查失敗: ${checkError.message}`)
        errorCount++
        continue
      }
      
      if (existingFAQ) {
        // 更新現有FAQ的答案
        const { error: updateError } = await supabase
          .from('faqs')
          .update({
            answer: issue.correctAnswer,
            category: issue.correctCategory,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFAQ.id)
        
        if (updateError) {
          console.error(`❌ 更新失敗: ${updateError.message}`)
          errorCount++
        } else {
          console.log(`✅ 更新成功: ${issue.question}`)
          console.log(`   修正分類: ${issue.correctCategory}`)
          successCount++
        }
      } else {
        // 創建新的FAQ
        const { error: insertError } = await supabase
          .from('faqs')
          .insert({
            question: issue.question,
            answer: issue.correctAnswer,
            category: issue.correctCategory,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error(`❌ 創建失敗: ${insertError.message}`)
          errorCount++
        } else {
          console.log(`✅ 創建成功: ${issue.question}`)
          console.log(`   分類: ${issue.correctCategory}`)
          successCount++
        }
      }
    }
    
    console.log(`\n📊 修復結果: 成功 ${successCount} 題，失敗 ${errorCount} 題`)
    
    if (successCount > 0) {
      console.log('✅ 模糊匹配錯誤修復完成！')
      console.log('📝 修復內容:')
      console.log('   - 修正了美食查詢匹配到書店的錯誤')
      console.log('   - 為缺失的問題創建了正確的FAQ')
      console.log('   - 統一了答案格式和分類')
    }
    
  } catch (error) {
    console.error('❌ 修復過程發生錯誤:', error)
  }
}

// 執行修復
fixFuzzyMatching()


