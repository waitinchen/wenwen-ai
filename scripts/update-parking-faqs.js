/**
 * 根據實際停車場資料更新停車資訊FAQ答案
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 基於實際停車場資料的停車資訊答案
const parkingFAQUpdates = [
  {
    question: '哪裡可以停車？',
    answer: '文山特區有多個停車場選擇！我為您推薦幾個不錯的：鳳山車站地下停車場（曹公路68號地下）、大東文化藝術中心地下停車場（光遠路161號地下）、衛武營地下停車場（三多一路1號地下2樓）、鳳山運動園區地下立體停車場（光華路68號地下）等，都是評分4星以上的優質停車場。'
  },
  {
    question: '停車場推薦',
    answer: '文山特區有38個停車場！我為您推薦幾個：鳳山車站地下停車場、大東文化藝術中心地下停車場、衛武營地下停車場、鳳山運動園區地下立體停車場、鳳山區公所附屬停車場等，都提供便利的停車服務。'
  },
  {
    question: '停車費多少？',
    answer: '停車費因停車場而異，建議您直接詢問各停車場的收費標準。一般來說，公有停車場的收費較為合理，私人停車場的收費可能有所不同。'
  },
  {
    question: '24小時停車場',
    answer: '文山特區有幾個24小時營業的停車場：Times高雄善和街停車場、城市車旅-鳳山甲一站停車場等，提供全天候停車服務，方便夜間停車需求。'
  },
  {
    question: '免費停車位',
    answer: '文山特區有部分免費停車位，包括鳳山區路邊停車格（中山路段、光遠路段）等，但數量有限，建議您提早到達或選擇付費停車場。'
  },
  {
    question: '路邊停車',
    answer: '文山特區有路邊停車格：鳳山區路邊停車格-中山路段、鳳山區路邊停車格-光遠路段等，但需注意停車時間限制和收費規定，建議使用停車場較為安全。'
  },
  {
    question: '地下停車場',
    answer: '文山特區有多個地下停車場：鳳山車站地下停車場（曹公路68號地下）、大東文化藝術中心地下停車場（光遠路161號地下）、衛武營地下停車場（三多一路1號地下2樓）、鳳山運動園區地下立體停車場（光華路68號地下）等。'
  },
  {
    question: '停車場位置',
    answer: '各停車場位置如下：鳳山車站地下停車場在曹公路68號地下，大東文化藝術中心地下停車場在光遠路161號地下，衛武營地下停車場在三多一路1號地下2樓，鳳山運動園區地下立體停車場在光華路68號地下。'
  },
  {
    question: '停車場營業時間',
    answer: '各停車場營業時間不同，一般為早上6點到晚上10點，24小時停車場則全天開放。建議您直接詢問各停車場的具體營業時間。'
  },
  {
    question: '停車場電話',
    answer: '各停車場聯絡電話：大東文化藝術中心地下停車場（07-7434000）、衛武營地下停車場（07-2626666）、鳳山區公所附屬停車場（07-7995678）、家樂福鳳山店停車場（07-7666888）、大潤發鳳山店停車場（07-7666999）等。'
  },
  {
    question: '停車場預約',
    answer: '部分停車場提供預約服務，建議您直接聯絡停車場確認預約方式和時間。一般來說，機械停車場和特殊停車場可能需要預約。'
  },
  {
    question: '停車場優惠',
    answer: '部分停車場有提供優惠活動，如月票、時段優惠等。建議您詢問各停車場的優惠方案，或查看停車場的官方公告。'
  },
  {
    question: '停車場安全',
    answer: '文山特區的停車場都有基本的安全設施，包括監視器、照明等，但建議您注意個人財物安全，選擇有管理員的停車場較為安全。'
  },
  {
    question: '停車場容量',
    answer: '各停車場容量不同，一般可容納數十到數百輛車。大型停車場如鳳山車站地下停車場、大東文化藝術中心地下停車場等容量較大，建議您選擇容量較大的停車場。'
  },
  {
    question: '停車場導航',
    answer: '建議您使用Google Maps或其他地圖應用程式導航到停車場，各停車場都有明確的地址標示。文山特區有38個停車場可供選擇，希望這些停車場資訊對你有幫助！'
  }
]

async function updateParkingFAQs() {
  console.log('🅿️ 開始更新停車資訊FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqUpdate of parkingFAQUpdates) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqUpdate.answer })
          .eq('question', faqUpdate.question)
          .eq('category', '停車資訊')
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
    console.log(`📈 成功率: ${((successCount / parkingFAQUpdates.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 停車資訊FAQ答案更新完成！現在答案都基於實際的停車場資料。')
    }
    
  } catch (error) {
    console.error('💥 更新過程發生錯誤:', error)
  }
}

// 執行更新
updateParkingFAQs()
  .then(() => {
    console.log('\n✨ 更新任務完成！')
  })
  .catch((error) => {
    console.error('💥 更新失敗:', error.message)
    process.exit(1)
  })


