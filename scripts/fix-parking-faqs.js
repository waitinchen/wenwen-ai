/**
 * 修復停車資訊FAQ的不準確答案
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 修復停車資訊FAQ答案
const parkingFAQFixes = [
  {
    question: '停車費多少？',
    answer: '停車費因停車場而異，建議您直接詢問各停車場的收費標準。一般來說，公有停車場的收費較為合理，私人停車場的收費可能有所不同。'
  },
  {
    question: '停車場營業時間',
    answer: '各停車場營業時間不同，一般為早上6點到晚上10點，24小時停車場則全天開放。建議您直接詢問各停車場的具體營業時間。'
  },
  {
    question: '停車場預約',
    answer: '部分停車場提供預約服務，建議您直接聯絡停車場確認預約方式和時間。一般來說，機械停車場和特殊停車場可能需要預約。'
  },
  {
    question: '停車場安全',
    answer: '文山特區的停車場都有基本的安全設施，包括監視器、照明等，但建議您注意個人財物安全，選擇有管理員的停車場較為安全。'
  },
  {
    question: '停車場導航',
    answer: '建議您使用Google Maps或其他地圖應用程式導航到停車場，各停車場都有明確的地址標示。文山特區有38個停車場可供選擇，希望這些停車場資訊對你有幫助！'
  },
  {
    question: '免費停車位',
    answer: '文山特區有部分免費停車位，包括鳳山區路邊停車格（中山路段、光遠路段）等，但數量有限，建議您提早到達或選擇付費停車場。'
  },
  {
    question: '停車場優惠',
    answer: '部分停車場有提供優惠活動，如月票、時段優惠等。建議您詢問各停車場的優惠方案，或查看停車場的官方公告。'
  }
]

async function fixParkingFAQs() {
  console.log('🅿️ 開始修復停車資訊FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqFix of parkingFAQFixes) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqFix.answer })
          .eq('question', faqFix.question)
          .eq('category', '停車資訊')
          .select()
        
        if (error) {
          console.error(`❌ 更新失敗: ${faqFix.question}`, error.message)
          errorCount++
        } else if (data && data.length > 0) {
          console.log(`✅ 更新成功: ${faqFix.question}`)
          successCount++
        } else {
          console.log(`⚠️ 未找到: ${faqFix.question}`)
          errorCount++
        }
      } catch (err) {
        console.error(`❌ 更新異常: ${faqFix.question}`, err.message)
        errorCount++
      }
      
      // 避免過快請求
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('\n📊 修復結果統計:')
    console.log(`✅ 成功修復: ${successCount} 題`)
    console.log(`❌ 修復失敗: ${errorCount} 題`)
    console.log(`📈 成功率: ${((successCount / parkingFAQFixes.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 停車資訊FAQ答案修復完成！')
    }
    
  } catch (error) {
    console.error('💥 修復過程發生錯誤:', error)
  }
}

// 執行修復
fixParkingFAQs()
  .then(() => {
    console.log('\n✨ 修復任務完成！')
  })
  .catch((error) => {
    console.error('💥 修復失敗:', error.message)
    process.exit(1)
  })


