/**
 * 根據實際商家資料更新前10題購物消費FAQ答案並直接匯入
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 前10題最重要的購物消費問題及其基於實際商家資料的答案
const top10ShoppingFAQUpdates = [
  {
    question: '哪裡可以買衣服？',
    answer: '文山特區有8家服飾店：MOMA鳳山門市（時尚服飾）、NET 鳳山三店（連鎖服飾）、Pearl珍珠服飾文山店（時尚服飾）、ZZZ__TW穿搭服飾店（時尚服飾）、圓周率服飾PIMODA-鳳山店（時尚服飾）、山芙服飾店（時尚服飾）、柱仔腳（時尚服飾）、鎮衣店（時尚服飾）等，提供各種風格的服裝選擇。'
  },
  {
    question: '超市推薦',
    answer: '文山特區有9家超市：家樂福鳳山店（大型超市）、家樂福五甲店（大型超市）、大潤發鳳山店（大型超市）、全聯福利中心-鳳山頂豐（連鎖超市）、全聯福利中心-鳳山保南（連鎖超市）、全聯福利中心-鳳山國泰（連鎖超市）、全聯福利中心-鳳山武營（連鎖超市）、大三普生鮮超市（生鮮超市）、愛國超市（地方超市）等，提供日常生活用品和生鮮食品。'
  },
  {
    question: '便利商店位置',
    answer: '文山特區有6家便利商店：7-ELEVEN、全家便利商店-鳳山平等店、全家便利商店-鳳山新福店、全家便利商店-鳳山東德店、全家便利商店-鳳山聖王店、全家便利商店 鳳山文山店等，提供24小時服務，方便隨時購物。'
  },
  {
    question: '書店在哪裡？',
    answer: '文山特區有5家書店：書瞧味 Books & Cafe（獨立書店）、甲群升學專業書局（學習書局）、統一書社（學習書局）、雄大書局（學習書局）、誠品生活衛武營限定店（連鎖書店）等，提供書籍、文具等商品，是閱讀和學習的好去處。'
  },
  {
    question: '電器行推薦',
    answer: '文山特區有6家電器行：Panasonic（家電產品）、大順國電器行（家電維修）、新傑電器（家電維修）、裕成電器行（家電維修）、裕星電器（家電維修）、連祥生活科技有限公司（家電維修）等，提供家電、3C產品等電子產品。'
  },
  {
    question: '百貨公司',
    answer: '文山特區有鳳山三井 LaLaport（購物中心），提供各種商品和服務，是購物的好選擇。另外還有大億百貨行（地方百貨）、大億行倉儲百貨（倉儲百貨）等，提供多樣化的商品選擇。'
  },
  {
    question: '藥局位置',
    answer: '文山特區有7家藥局：安琪兒藥局、元元鳳山藥局、富康活力鳳松藥局、赤山健保藥局、青年新高橋藥局、鳳山啤木鳥藥局、丁丁連鎖藥局 鳳山自由店等，提供藥品和健康用品，方便購買日常藥品。'
  },
  {
    question: '文具店',
    answer: '文山特區有9x9 文具專家（文具用品），提供文具用品、辦公用品等，適合學生和上班族。另外書店如甲群升學專業書局、統一書社、雄大書局等也有文具商品，提供多樣化的文具選擇。'
  },
  {
    question: '3C產品店',
    answer: '文山特區有6家3C產品店：Panasonic（家電產品）、大順國電器行（家電維修）、新傑電器（家電維修）、裕成電器行（家電維修）、裕星電器（家電維修）、連祥生活科技有限公司（家電維修）等，提供手機、電腦、相機等電子產品和維修服務。'
  },
  {
    question: '家具店',
    answer: '文山特區有Hi家居/888創意生活館，提供各種家具和居家用品，是選購家具的好去處。提供多樣化的家具選擇，滿足不同居家需求。'
  }
]

async function updateTop10ShoppingFAQs() {
  console.log('🛒 開始更新前10題購物消費FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqUpdate of top10ShoppingFAQUpdates) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqUpdate.answer })
          .eq('question', faqUpdate.question)
          .eq('category', '購物消費')
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
    console.log(`📈 成功率: ${((successCount / top10ShoppingFAQUpdates.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 前10題購物消費FAQ答案更新完成！現在答案都基於實際的商家資料。')
    }
    
  } catch (error) {
    console.error('💥 更新過程發生錯誤:', error)
  }
}

// 執行更新
updateTop10ShoppingFAQs()
  .then(() => {
    console.log('\n✨ 更新任務完成！')
  })
  .catch((error) => {
    console.error('💥 更新失敗:', error.message)
    process.exit(1)
  })


