/**
 * 根據實際醫療保健商家資料更新醫療保健FAQ答案並直接匯入
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 基於實際醫療保健商家資料的答案
const medicalFAQUpdates = [
  {
    question: '附近有診所嗎？',
    answer: '文山特區有多家診所：健泰中醫診所、何豐美學牙醫診所、得恩牙醫診所、立達診所、博仁綜合醫院、昭融耳鼻喉科診所、林建昌中醫診所、百世專業牙醫診所、尚新診所、至和中醫診所新福本院、陳彥伸耳鼻喉科診所、鳳山大學眼科診所、Abc Fengshan dentist、久仁泌尿科診所、五甲大和牙醫診所、仁恩堂中醫診所、佑寧耳鼻喉專科診所、元新眼科診所、元正牙醫診所、壹八八美學牙醫診所、富騎牙醫診所、小熊牙醫診所、恩德婦產科診所、時承牙醫診所、林錦浩黃正宗耳鼻喉科、樂誠復健科診所、甘草堂中醫診所、至和中醫診所鳳林分院、臻欣牙醫診所、葉耳鼻喉科診所、誠心牙醫診所、邱正義婦產科診所、馨安婦產科診所、高雄鳳山典範牙醫、鳳山上明眼科診所、鳳山植牙-晨光牙醫診所、鳳山精品牙醫診所、鳳山諾貝爾眼科診所、鳳山馬光中醫診所、鳳林牙醫診所等，提供各種醫療服務。'
  },
  {
    question: '牙醫推薦',
    answer: '文山特區有14家牙醫診所：何豐美學牙醫診所、得恩牙醫診所、百世專業牙醫診所、Abc Fengshan dentist、五甲大和牙醫診所、壹八八美學牙醫診所、富騎牙醫診所、小熊牙醫診所、時承牙醫診所、臻欣牙醫診所、誠心牙醫診所、高雄鳳山典範牙醫、鳳山植牙-晨光牙醫診所、鳳山精品牙醫診所、鳳林牙醫診所等，提供專業的牙科服務，包括植牙、矯正、美學牙醫等。'
  },
  {
    question: '中醫診所',
    answer: '文山特區有6家中醫診所：健泰中醫診所、林建昌中醫診所、至和中醫診所新福本院、仁恩堂中醫診所、甘草堂中醫診所、至和中醫診所鳳林分院、鳳山馬光中醫診所等，提供中醫診療服務，包括中醫內科等專業服務。'
  },
  {
    question: '眼科診所',
    answer: '文山特區有4家眼科診所：鳳山大學眼科診所、元新眼科診所、鳳山上明眼科診所、鳳山諾貝爾眼科診所等，提供視力檢查、眼疾治療、眼科手術等服務。'
  },
  {
    question: '婦產科',
    answer: '文山特區有3家婦產科診所：恩德婦產科診所、邱正義婦產科診所、馨安婦產科診所等，提供婦科檢查、產前檢查、婦產科手術等服務。'
  },
  {
    question: '小兒科',
    answer: '抱歉，文山特區目前沒有專門的小兒科診所。建議您到其他區域尋找小兒科診所，或詢問部分綜合診所是否有提供小兒科服務。'
  },
  {
    question: '急診醫院',
    answer: '文山特區有博仁綜合醫院，提供急診和住院服務。另外還有立達診所、尚新診所等診所提供醫療服務。'
  },
  {
    question: '藥局推薦',
    answer: '文山特區有6家藥局：安琪兒藥局、元元鳳山藥局、富康活力鳳松藥局、赤山健保藥局、青年新高橋藥局、鳳山啤木鳥藥局、丁丁連鎖藥局 鳳山自由店等，提供處方藥、成藥、健康用品等。'
  },
  {
    question: '健檢中心',
    answer: '抱歉，文山特區目前沒有專門的健檢中心。建議您到其他區域尋找健檢中心，或詢問部分醫院是否有提供健康檢查服務。'
  },
  {
    question: '復健科',
    answer: '文山特區有樂誠復健科診所，提供物理治療、復健訓練等服務。另外部分醫院也可能有復健科服務。'
  }
]

async function updateMedicalFAQs() {
  console.log('🏥 開始更新醫療保健FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqUpdate of medicalFAQUpdates) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqUpdate.answer })
          .eq('question', faqUpdate.question)
          .eq('category', '醫療保健')
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
    console.log(`📈 成功率: ${((successCount / medicalFAQUpdates.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 醫療保健FAQ答案更新完成！現在答案都基於實際的商家資料。')
    }
    
  } catch (error) {
    console.error('💥 更新過程發生錯誤:', error)
  }
}

// 執行更新
updateMedicalFAQs()
  .then(() => {
    console.log('\n✨ 更新任務完成！')
  })
  .catch((error) => {
    console.error('💥 更新失敗:', error.message)
    process.exit(1)
  })


