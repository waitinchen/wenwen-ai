/**
 * 根據實際生活服務商家資料更新生活服務FAQ答案並直接匯入
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 基於實際生活服務商家資料的答案
const lifestyleFAQUpdates = [
  {
    question: '美髮店推薦',
    answer: '文山特區有7家美髮店：藝凡髮型Youthful hair（造型設計）、LAB Hair Salon 文山館（造型設計）、Mini日式造型沙龍-鳳山店（日式造型）、御約髮妝造型（造型設計）、新技髮型連鎖美髮（連鎖美髮）、新技髮型連鎖美髮鳳山海洋店（連鎖美髮）、鮮孃 Hair Studio（造型設計）、鹿淨Pure Hair Salon（造型設計）等，提供各種美髮服務。'
  },
  {
    question: '美容院在哪裡？',
    answer: '文山特區有幾家美容院：藝凡髮型Youthful hair（造型設計）、LAB Hair Salon 文山館（造型設計）、Mini日式造型沙龍-鳳山店（日式造型）、御約髮妝造型（造型設計）、鮮孃 Hair Studio（造型設計）、鹿淨Pure Hair Salon（造型設計）等，提供美容護膚、美甲等服務。'
  },
  {
    question: '美甲店',
    answer: '抱歉，文山特區目前沒有專門的美甲店。建議您到其他區域尋找美甲店，或詢問部分美容院是否有提供美甲服務。'
  },
  {
    question: '按摩店',
    answer: '抱歉，文山特區目前沒有專門的按摩店。建議您到其他區域尋找按摩店，或詢問部分美容院是否有提供按摩服務。'
  },
  {
    question: '健身房',
    answer: '文山特區有4家健身房：World Gym Express（連鎖健身）、World Gym世界健身俱樂部 高雄鳳山中山店（連鎖健身）、高雄鳳山洛克健身房Rock's Gym（私人健身）、World Gym世界健身俱樂部 高雄鳳山五甲店（連鎖健身）等，提供各種運動器材和健身課程。'
  },
  {
    question: '洗衣店',
    answer: '抱歉，文山特區目前沒有專門的洗衣店。建議您到其他區域尋找洗衣店，或詢問部分便利商店是否有提供洗衣服務。'
  },
  {
    question: '修鞋店',
    answer: '抱歉，文山特區目前沒有專門的修鞋店。建議您到其他區域尋找修鞋店，或詢問部分百貨公司是否有修鞋服務。'
  },
  {
    question: '鎖店',
    answer: '抱歉，文山特區目前沒有專門的鎖店。建議您到其他區域尋找鎖店，或詢問部分五金行是否有提供鑰匙複製服務。'
  },
  {
    question: '影印店',
    answer: '抱歉，文山特區目前沒有專門的影印店。建議您到其他區域尋找影印店，或詢問部分便利商店是否有提供影印服務。'
  },
  {
    question: '快遞服務',
    answer: '抱歉，文山特區目前沒有專門的快遞服務站點。建議您到其他區域尋找快遞服務，或使用郵局、宅配等服務。'
  }
]

async function updateLifestyleFAQs() {
  console.log('💇 開始更新生活服務FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqUpdate of lifestyleFAQUpdates) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqUpdate.answer })
          .eq('question', faqUpdate.question)
          .eq('category', '生活服務')
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
    console.log(`📈 成功率: ${((successCount / lifestyleFAQUpdates.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 生活服務FAQ答案更新完成！現在答案都基於實際的商家資料。')
    }
    
  } catch (error) {
    console.error('💥 更新過程發生錯誤:', error)
  }
}

// 執行更新
updateLifestyleFAQs()
  .then(() => {
    console.log('\n✨ 更新任務完成！')
  })
  .catch((error) => {
    console.error('💥 更新失敗:', error.message)
    process.exit(1)
  })


