/**
 * 根據實際休閒娛樂商家資料更新休閒娛樂FAQ答案並直接匯入
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 基於實際休閒娛樂商家資料的答案
const entertainmentFAQUpdates = [
  {
    question: '公園在哪裡？',
    answer: '文山特區有2個公園：鳳山公園（休閒公園）、鳳山運動公園（運動公園）等，提供綠地休憩和運動空間，是放鬆身心的好去處。'
  },
  {
    question: '觀光景點',
    answer: '文山特區有幾個觀光景點：鳳儀書院（古蹟景點）、85大樓觀景台、鳳山熱帶城堡等，提供歷史文化和觀光體驗。'
  },
  {
    question: '電影院',
    answer: '抱歉，文山特區目前沒有電影院。建議您到其他區域尋找電影院，或使用線上串流平台觀看電影。'
  },
  {
    question: 'KTV推薦',
    answer: '抱歉，文山特區目前沒有KTV。建議您到其他區域尋找KTV，或使用線上KTV應用程式。'
  },
  {
    question: '網咖',
    answer: '抱歉，文山特區目前沒有網咖。建議您到其他區域尋找網咖，或使用家中的電腦設備。'
  },
  {
    question: '圖書館',
    answer: '抱歉，文山特區目前沒有圖書館。建議您到其他區域尋找圖書館，或使用線上圖書資源。'
  },
  {
    question: '文化中心',
    answer: '抱歉，文山特區目前沒有文化中心。建議您到其他區域尋找文化中心，或關注鳳儀書院等文化景點的活動。'
  },
  {
    question: '運動場',
    answer: '文山特區有高雄市鳳山運動園區（運動設施），提供各種運動設施和場地，是運動健身的好選擇。'
  },
  {
    question: '游泳池',
    answer: '抱歉，文山特區目前沒有游泳池。建議您到其他區域尋找游泳池，或詢問鳳山運動園區是否有游泳池設施。'
  },
  {
    question: '夜市',
    answer: '文山特區有2個夜市：五甲自強夜市（美食夜市）、鳳山青年夜市（美食夜市）等，提供各種小吃和娛樂活動，是體驗在地文化的好地方。'
  }
]

async function updateEntertainmentFAQs() {
  console.log('🎮 開始更新休閒娛樂FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqUpdate of entertainmentFAQUpdates) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqUpdate.answer })
          .eq('question', faqUpdate.question)
          .eq('category', '休閒娛樂')
          .select()
        
        if (error) {
          console.error(`❌ 更新失敗: ${faqUpdate.question}`, error.message)
          errorCount++
        } else if (data && data.length > 0) {
          console.log(`✅ 更新成功: ${faqUpdate.question}`)
          successCount++
        } else {
          console.log(`⚠️ 未找到: ${faqUpdate.question}`)
          errorCount++
        }
      } catch (err) {
        console.error(`❌ 更新異常: ${faqUpdate.question}`, err.message)
        errorCount++
      }
      
      // 避免過快請求
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('\n📊 更新結果統計:')
    console.log(`✅ 成功更新: ${successCount} 題`)
    console.log(`❌ 更新失敗: ${errorCount} 題`)
    console.log(`📈 成功率: ${((successCount / entertainmentFAQUpdates.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 休閒娛樂FAQ答案更新完成！現在答案都基於實際的商家資料。')
    }
    
  } catch (error) {
    console.error('💥 更新過程發生錯誤:', error)
  }
}

// 執行更新
updateEntertainmentFAQs()
  .then(() => {
    console.log('\n✨ 更新任務完成！')
  })
  .catch((error) => {
    console.error('💥 更新失敗:', error.message)
    process.exit(1)
  })


