/**
 * 根據實際商戶資料更新美食推薦FAQ答案
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 基於實際商戶資料的美食推薦答案
const foodFAQUpdates = [
  {
    question: '附近有什麼好吃的餐廳？',
    answer: '文山特區有很多優質餐廳！我為您推薦幾家：STORY Restaurant（精致料理）、Da Da\'s Kitchen（義大利料理）、Ease（輕食）、Good Partner Shuangci Shop（早午餐）、Zone Cafe 弄咖啡親子餐廳等，都是評分4星以上的優質選擇。'
  },
  {
    question: '有日式料理嗎？',
    answer: '有的！文山特區有幾家不錯的日式料理：スシロー壽司郎 高雄鳳山店（壽司）、一燒丼飯專賣（丼飯）、一魂 いざかや（居酒屋）、夜葉食堂鳳山店（日式料理）、食事處櫻廷（居酒屋）、金太郎壽司等。'
  },
  {
    question: '推薦韓式料理',
    answer: '文山特區有幾家韓式料理：多初點韓食專門店-文山店（韓式烤肉）、潮韓食（韓式烤肉）、玉豆腐韓國料理（韓式烤肉）等，提供正宗的韓式烤肉和料理。'
  },
  {
    question: '哪裡有火鍋店？',
    answer: '文山特區有幾家火鍋店：拼鍋命（麻辣鍋）、珍好味職人鍋物 鳳山旗艦店（涮海鍋物）等，提供不同風味的火鍋選擇。'
  },
  {
    question: '有素食餐廳嗎？',
    answer: '抱歉，文山特區目前沒有專門的素食餐廳。不過部分餐廳可能有提供素食選項，建議您直接詢問各餐廳是否有素食菜單。'
  },
  {
    question: '早餐店推薦',
    answer: '文山特區有幾家不錯的早餐店：尋早早餐-鳳山店（西式早餐）、Good Partner Shuangci Shop（早午餐）、Good Partner Wenshan Shop（早午餐）、鳳山車站前無名燒餅早餐店（燒餅）等。'
  },
  {
    question: '宵夜去哪裡吃？',
    answer: '文山特區有幾家適合宵夜的餐廳：一魂 いざかや（居酒屋）、食事處櫻廷（居酒屋）、鳳山𢯾槌（小吃）等，提供夜間用餐服務。'
  },
  {
    question: '有義大利麵嗎？',
    answer: '有的！文山特區有幾家義大利麵餐廳：夏德莉brunch.pasta-鳳山店、斑馬騷莎美義餐廳 高雄文山店、洋城義大利餐廳-高雄鳳山大潤發店等，提供各種義大利麵料理。'
  },
  {
    question: '泰式料理在哪裡？',
    answer: '抱歉，文山特區目前沒有專門的泰式料理餐廳。建議您到其他區域尋找泰式料理，或詢問部分餐廳是否有提供泰式菜餚。'
  },
  {
    question: '中式餐廳推薦',
    answer: '文山特區有幾家中式餐廳：品約餐坊（中式料理）、文茶園（中式料理）、悅食堂（家常菜）、王冠牛肉麵店（牛肉麵）、芳園館（合菜）、老賈小館庭園餐廳（庭園餐廳）等。'
  },
  {
    question: '咖啡廳有哪些？',
    answer: '文山特區有幾家咖啡廳：Zone Cafe 弄咖啡親子餐廳 大東店（咖啡）、Waiting•觓（輕食）、Ease（輕食）、沐光（輕食）、迷路麋鹿（輕食）等，提供舒適的咖啡環境。'
  },
  {
    question: '親子餐廳推薦',
    answer: '文山特區有Zone Cafe 弄咖啡親子餐廳 大東店，提供親子友善的用餐環境，適合家庭聚餐。'
  },
  {
    question: '便宜的美食',
    answer: '文山特區有幾家平價美食：鳳山𢯾槌（小吃）、鳳興麵線（麵線）、王冠牛肉麵店（牛肉麵）、鳳山車站前無名燒餅早餐店（燒餅）等，提供經濟實惠的選擇。'
  },
  {
    question: '高級餐廳',
    answer: '文山特區有STORY Restaurant（精致料理）、和樂宴會館-鳳山店（宴會餐廳）等，提供較高檔的用餐體驗。'
  },
  {
    question: '24小時營業的餐廳',
    answer: '抱歉，文山特區目前沒有24小時營業的餐廳。大部分餐廳的營業時間為早上到晚上，建議您查看各餐廳的具體營業時間。'
  },
  {
    question: '外送服務',
    answer: '文山特區的許多餐廳都有提供外送服務，建議您透過外送平台或直接聯繫餐廳詢問外送服務。'
  },
  {
    question: '有包廂的餐廳',
    answer: '文山特區有和樂宴會館-鳳山店（宴會餐廳）、老賈小館庭園餐廳（庭園餐廳）等，提供包廂或較私密的用餐空間。'
  },
  {
    question: '適合約會的餐廳',
    answer: '文山特區有幾家適合約會的餐廳：STORY Restaurant（精致料理）、Zone Cafe 弄咖啡親子餐廳 大東店（咖啡）、老賈小館庭園餐廳（庭園餐廳）等，提供浪漫的用餐環境。'
  },
  {
    question: '家庭聚餐推薦',
    answer: '文山特區有幾家適合家庭聚餐的餐廳：和樂宴會館-鳳山店（宴會餐廳）、芳園館（合菜）、老賈小館庭園餐廳（庭園餐廳）、Zone Cafe 弄咖啡親子餐廳 大東店等。'
  },
  {
    question: '生日蛋糕店',
    answer: '文山特區有笛爾手作現烘蛋糕(文衡店)，提供手作現烘蛋糕服務，適合生日慶祝。'
  },
  {
    question: '麵包店推薦',
    answer: '文山特區有笛爾手作現烘蛋糕(文衡店)，提供手作現烘蛋糕和烘焙產品。'
  },
  {
    question: '飲料店',
    answer: '文山特區有幾家提供飲料的店家：Zone Cafe 弄咖啡親子餐廳 大東店（咖啡）、Waiting•觓（輕食）、Ease（輕食）等，提供各種飲品選擇。'
  },
  {
    question: '夜市美食',
    answer: '文山特區有鳳山𢯾槌（小吃）等在地小吃，提供傳統夜市風味的美食。'
  },
  {
    question: '傳統小吃',
    answer: '文山特區有幾家傳統小吃：鳳山𢯾槌（小吃）、鳳興麵線（麵線）、王冠牛肉麵店（牛肉麵）、鳳山車站前無名燒餅早餐店（燒餅）等。'
  },
  {
    question: '異國料理',
    answer: '文山特區有各種異國料理：日式（スシロー壽司郎、一燒丼飯專賣、一魂 いざかや等）、韓式（多初點韓食專門店、潮韓食、玉豆腐韓國料理）、義式（Da Da\'s Kitchen、夏德莉brunch.pasta等）、港式（粵心坊 文衡店）等。'
  },
  {
    question: '海鮮餐廳',
    answer: '文山特區有珍好味職人鍋物 鳳山旗艦店（涮海鍋物），提供海鮮火鍋料理。'
  },
  {
    question: '燒烤店',
    answer: '文山特區有APIS Grill（烤肉）、多初點韓食專門店-文山店（韓式烤肉）、潮韓食（韓式烤肉）、玉豆腐韓國料理（韓式烤肉）等燒烤店。'
  },
  {
    question: '牛排館',
    answer: '抱歉，文山特區目前沒有專門的牛排館。建議您到其他區域尋找牛排餐廳。'
  },
  {
    question: '自助餐',
    answer: '抱歉，文山特區目前沒有自助餐廳。建議您到其他區域尋找自助餐選擇。'
  },
  {
    question: '便當店',
    answer: '文山特區有幾家提供便當的店家：悅食堂（家常菜）、王冠牛肉麵店（牛肉麵）等，提供外帶便當服務。'
  }
]

async function updateFoodFAQs() {
  console.log('🍽️ 開始更新美食推薦FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqUpdate of foodFAQUpdates) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqUpdate.answer })
          .eq('question', faqUpdate.question)
          .eq('category', '美食推薦')
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
    console.log(`📈 成功率: ${((successCount / foodFAQUpdates.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 美食推薦FAQ答案更新完成！現在答案都基於實際的商戶資料。')
    }
    
  } catch (error) {
    console.error('💥 更新過程發生錯誤:', error)
  }
}

// 執行更新
updateFoodFAQs()
  .then(() => {
    console.log('\n✨ 更新任務完成！')
  })
  .catch((error) => {
    console.error('💥 更新失敗:', error.message)
    process.exit(1)
  })


