/**
 * 匯入100個民眾常見問題到 FAQ 系統
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 100個民眾常見問題
const faqData = [
  // 美食相關（30題）
  { question: '附近有什麼好吃的餐廳？', category: '美食推薦', answer: '文山特區有很多優質餐廳！我為您推薦幾家：APIS Grill、Da Da\'s Kitchen、Ease等，都是評分不錯的選擇。' },
  { question: '有日式料理嗎？', category: '美食推薦', answer: '有的！文山特區有幾家不錯的日式料理：スシロー壽司郎、一燒丼飯專賣、一魂いざかや、食事處櫻廷等。' },
  { question: '推薦韓式料理', category: '美食推薦', answer: '文山特區的韓式料理選擇包括烤肉店、韓式餐廳等，我為您推薦幾家評分不錯的韓式料理店家。' },
  { question: '哪裡有火鍋店？', category: '美食推薦', answer: '文山特區有幾家火鍋店，包括個人小火鍋、麻辣鍋等不同類型，我為您推薦幾家優質的火鍋店家。' },
  { question: '有素食餐廳嗎？', category: '美食推薦', answer: '文山特區有提供素食選項的餐廳，包括純素食餐廳和提供素食菜單的一般餐廳。' },
  { question: '早餐店推薦', category: '美食推薦', answer: '文山特區有幾家不錯的早餐店，包括傳統中式早餐、西式早午餐等，我為您推薦幾家口碑好的早餐店。' },
  { question: '宵夜去哪裡吃？', category: '美食推薦', answer: '文山特區有幾家營業到較晚的餐廳，包括夜市、24小時餐廳等，我為您推薦幾家宵夜好選擇。' },
  { question: '有義大利麵嗎？', category: '美食推薦', answer: '文山特區有提供義大利麵的餐廳，包括義式餐廳和一般餐廳的義大利麵選項。' },
  { question: '泰式料理在哪裡？', category: '美食推薦', answer: '文山特區有幾家泰式料理餐廳，提供正宗的泰式菜餚，我為您推薦幾家評分不錯的泰式餐廳。' },
  { question: '中式餐廳推薦', category: '美食推薦', answer: '文山特區有許多中式餐廳，包括台菜、川菜、粵菜等不同菜系，我為您推薦幾家優質的中式餐廳。' },
  { question: '咖啡廳有哪些？', category: '美食推薦', answer: '文山特區有幾家不錯的咖啡廳，包括連鎖咖啡店和獨立咖啡廳，提供舒適的用餐環境。' },
  { question: '親子餐廳推薦', category: '美食推薦', answer: '文山特區有適合親子用餐的餐廳，提供兒童友善的環境和餐點，我為您推薦幾家親子餐廳。' },
  { question: '便宜的美食', category: '美食推薦', answer: '文山特區有許多平價美食選擇，包括小吃店、便當店、麵店等，我為您推薦幾家CP值高的餐廳。' },
  { question: '高級餐廳', category: '美食推薦', answer: '文山特區有幾家高級餐廳，提供精緻的用餐體驗，適合特殊場合或商務用餐。' },
  { question: '24小時營業的餐廳', category: '美食推薦', answer: '文山特區有幾家24小時營業的餐廳，包括速食店、便利商店等，隨時提供餐點服務。' },
  { question: '外送服務', category: '美食推薦', answer: '文山特區的許多餐廳都有提供外送服務，您可以透過外送平台或直接聯繫餐廳訂餐。' },
  { question: '有包廂的餐廳', category: '美食推薦', answer: '文山特區有幾家提供包廂的餐廳，適合聚餐、慶祝等場合，我為您推薦幾家有包廂的餐廳。' },
  { question: '適合約會的餐廳', category: '美食推薦', answer: '文山特區有幾家適合約會的餐廳，提供浪漫的用餐環境和精緻的餐點。' },
  { question: '家庭聚餐推薦', category: '美食推薦', answer: '文山特區有許多適合家庭聚餐的餐廳，提供大桌子和家庭友善的環境。' },
  { question: '生日蛋糕店', category: '美食推薦', answer: '文山特區有幾家蛋糕店，提供生日蛋糕訂製服務，包括各種口味和造型的蛋糕。' },
  { question: '麵包店推薦', category: '美食推薦', answer: '文山特區有幾家不錯的麵包店，提供新鮮出爐的麵包、蛋糕等烘焙產品。' },
  { question: '飲料店', category: '美食推薦', answer: '文山特區有許多飲料店，包括手搖飲、咖啡店等，提供各種冷熱飲品。' },
  { question: '夜市美食', category: '美食推薦', answer: '文山特區附近有夜市，提供各種傳統小吃和特色美食，是體驗在地文化的好地方。' },
  { question: '傳統小吃', category: '美食推薦', answer: '文山特區有許多傳統小吃店，提供道地的台灣小吃，我為您推薦幾家老字號小吃店。' },
  { question: '異國料理', category: '美食推薦', answer: '文山特區有各種異國料理餐廳，包括日式、韓式、泰式、義式等，提供多元的餐飲選擇。' },
  { question: '海鮮餐廳', category: '美食推薦', answer: '文山特區有幾家海鮮餐廳，提供新鮮的海鮮料理，我為您推薦幾家口碑好的海鮮餐廳。' },
  { question: '燒烤店', category: '美食推薦', answer: '文山特區有幾家燒烤店，提供烤肉、串燒等燒烤料理，適合聚餐和宵夜。' },
  { question: '牛排館', category: '美食推薦', answer: '文山特區有幾家牛排館，提供各種等級的牛排和西式料理。' },
  { question: '自助餐', category: '美食推薦', answer: '文山特區有幾家自助餐廳，提供多樣化的菜色選擇，適合各種口味的客人。' },
  { question: '便當店', category: '美食推薦', answer: '文山特區有許多便當店，提供經濟實惠的便當選擇，適合外帶用餐。' },

  // 停車相關（15題）
  { question: '哪裡可以停車？', category: '停車資訊', answer: '文山特區有多個停車場選擇，包括鳳山車站地下停車場、鳳山站前停車場、寶盛鳳山火車站停車場等。' },
  { question: '停車場推薦', category: '停車資訊', answer: '我為您推薦幾個不錯的停車場：鳳山車站地下停車場、大東文化藝術中心地下停車場、衛武營地下停車場等。' },
  { question: '停車費多少？', category: '停車資訊', answer: '停車費因停車場而異，一般每小時約20-50元，建議您直接詢問各停車場的收費標準。' },
  { question: '24小時停車場', category: '停車資訊', answer: '文山特區有幾家24小時營業的停車場，提供全天候停車服務，方便夜間停車需求。' },
  { question: '免費停車位', category: '停車資訊', answer: '文山特區有部分免費停車位，但數量有限，建議您提早到達或選擇付費停車場。' },
  { question: '路邊停車', category: '停車資訊', answer: '文山特區有路邊停車格，但需注意停車時間限制和收費規定，建議使用停車場較為安全。' },
  { question: '地下停車場', category: '停車資訊', answer: '文山特區有多個地下停車場，包括鳳山車站地下停車場、大東文化藝術中心地下停車場等。' },
  { question: '停車場位置', category: '停車資訊', answer: '各停車場位置如下：鳳山車站地下停車場在曹公路68號地下，大東文化藝術中心停車場在光遠路161號地下。' },
  { question: '停車場營業時間', category: '停車資訊', answer: '各停車場營業時間不同，一般為早上6點到晚上10點，24小時停車場則全天開放。' },
  { question: '停車場電話', category: '停車資訊', answer: '各停車場都有聯絡電話，建議您直接查詢各停車場的聯絡方式以獲取最新資訊。' },
  { question: '停車場預約', category: '停車資訊', answer: '部分停車場提供預約服務，建議您提前聯絡停車場確認預約方式和時間。' },
  { question: '停車場優惠', category: '停車資訊', answer: '部分停車場有提供優惠活動，如月票、時段優惠等，建議您詢問各停車場的優惠方案。' },
  { question: '停車場安全', category: '停車資訊', answer: '文山特區的停車場都有基本的安全設施，包括監視器、照明等，但建議您注意個人財物安全。' },
  { question: '停車場容量', category: '停車資訊', answer: '各停車場容量不同，一般可容納數十到數百輛車，建議您選擇容量較大的停車場。' },
  { question: '停車場導航', category: '停車資訊', answer: '建議您使用Google Maps或其他地圖應用程式導航到停車場，各停車場都有明確的地址標示。' },

  // 英語學習（10題）
  { question: '有英語補習班嗎？', category: '教育培訓', answer: '有的！文山特區有肯塔基美語，是專業的美語補習班，提供17年教學經驗，8間分校服務超過4萬名學生。' },
  { question: '肯塔基美語在哪裡？', category: '教育培訓', answer: '肯塔基美語在文山特區有多個分校：鳳山直營校（文化路131號）、瑞興直營校（博愛路167號）、鳳西直營校（光華南路116號）等。' },
  { question: '英語課程推薦', category: '教育培訓', answer: '肯塔基美語提供專業的美語課程，包括兒童美語、成人美語、考試準備等，可聯絡LINE ID: kentuckyschool了解詳情。' },
  { question: '美語補習班', category: '教育培訓', answer: '肯塔基美語是文山特區最專業的美語補習班，只教美語，當然專業！提供小班制教學和多元化課程。' },
  { question: '英語學習機構', category: '教育培訓', answer: '文山特區有肯塔基美語等英語學習機構，提供專業的英語教學服務，適合各年齡層的學習需求。' },
  { question: '補習班費用', category: '教育培訓', answer: '補習班費用因課程而異，建議您直接聯絡肯塔基美語（LINE ID: kentuckyschool）了解詳細的課程費用。' },
  { question: '英語老師推薦', category: '教育培訓', answer: '肯塔基美語有專業的外師和經驗豐富的中師，提供優質的英語教學服務。' },
  { question: '英語會話班', category: '教育培訓', answer: '肯塔基美語提供英語會話課程，幫助學員提升口語表達能力，可聯絡了解課程詳情。' },
  { question: '英語考試準備', category: '教育培訓', answer: '肯塔基美語提供各種英語考試準備課程，包括TOEIC、TOEFL、全民英檢等，幫助學員取得好成績。' },
  { question: '英語學習方法', category: '教育培訓', answer: '肯塔基美語採用專業的教學方法，培養正確的閱讀習慣，不只關注分數，更重視知識吸收。' },

  // 購物消費（15題）
  { question: '哪裡可以買衣服？', category: '購物消費', answer: '文山特區有幾家服飾店，包括連鎖服飾店和獨立服飾店，提供各種風格的服裝選擇。' },
  { question: '超市推薦', category: '購物消費', answer: '文山特區有家樂福鳳山店等大型超市，提供日常生活用品和生鮮食品。' },
  { question: '便利商店位置', category: '購物消費', answer: '文山特區有多家便利商店，包括7-11、全家、OK超商等，提供24小時服務。' },
  { question: '書店在哪裡？', category: '購物消費', answer: '文山特區有幾家書店，提供書籍、文具等商品，是閱讀和學習的好去處。' },
  { question: '電器行推薦', category: '購物消費', answer: '文山特區有幾家電器行，提供家電、3C產品等，我為您推薦幾家信譽良好的電器行。' },
  { question: '百貨公司', category: '購物消費', answer: '文山特區附近有百貨公司，提供各種商品和服務，是購物的好選擇。' },
  { question: '藥局位置', category: '購物消費', answer: '文山特區有多家藥局，包括安琪兒藥局等，提供藥品和健康用品。' },
  { question: '文具店', category: '購物消費', answer: '文山特區有幾家文具店，提供文具用品、辦公用品等，適合學生和上班族。' },
  { question: '3C產品店', category: '購物消費', answer: '文山特區有幾家3C產品店，提供手機、電腦、相機等電子產品。' },
  { question: '家具店', category: '購物消費', answer: '文山特區有幾家家具店，提供各種家具和居家用品，包括Hi家居/888創意生活館等。' },
  { question: '化妝品店', category: '購物消費', answer: '文山特區有幾家化妝品店，提供各種美妝產品和保養品。' },
  { question: '鞋店推薦', category: '購物消費', answer: '文山特區有幾家鞋店，提供各種款式的鞋子，包括運動鞋、皮鞋、休閒鞋等。' },
  { question: '眼鏡行', category: '購物消費', answer: '文山特區有幾家眼鏡行，提供眼鏡配製、隱形眼鏡等視力保健服務。' },
  { question: '鐘錶店', category: '購物消費', answer: '文山特區有幾家鐘錶店，提供手錶維修、鐘錶銷售等服務。' },
  { question: '珠寶店', category: '購物消費', answer: '文山特區有幾家珠寶店，提供珠寶首飾、貴金屬等商品。' },

  // 生活服務（10題）
  { question: '美髮店推薦', category: '生活服務', answer: '文山特區有幾家美髮店，包括藝凡髮型Youthful hair等，提供剪髮、染髮、燙髮等服務。' },
  { question: '美容院在哪裡？', category: '生活服務', answer: '文山特區有幾家美容院，提供美容護膚、美甲等服務，我為您推薦幾家口碑好的美容院。' },
  { question: '美甲店', category: '生活服務', answer: '文山特區有幾家美甲店，提供指甲彩繪、美甲護理等服務。' },
  { question: '按摩店', category: '生活服務', answer: '文山特區有幾家按摩店，提供各種按摩服務，幫助放鬆身心。' },
  { question: '健身房', category: '生活服務', answer: '文山特區有幾家健身房，提供各種運動器材和健身課程。' },
  { question: '洗衣店', category: '生活服務', answer: '文山特區有幾家洗衣店，提供衣物清洗、乾洗等服務。' },
  { question: '修鞋店', category: '生活服務', answer: '文山特區有幾家修鞋店，提供鞋子維修、保養等服務。' },
  { question: '鎖店', category: '生活服務', answer: '文山特區有幾家鎖店，提供鑰匙複製、鎖具維修等服務。' },
  { question: '影印店', category: '生活服務', answer: '文山特區有幾家影印店，提供影印、列印、裝訂等服務。' },
  { question: '快遞服務', category: '生活服務', answer: '文山特區有多家快遞服務，包括郵局、宅配等，提供包裹寄送服務。' },

  // 醫療保健（10題）
  { question: '附近有診所嗎？', category: '醫療保健', answer: '文山特區有多家診所，包括健泰中醫診所、何豐美學牙醫診所、得恩牙醫診所、安琪兒藥局、立達診所等。' },
  { question: '牙醫推薦', category: '醫療保健', answer: '文山特區有幾家牙醫診所，包括何豐美學牙醫診所、得恩牙醫診所、百世專業牙醫診所等，提供專業的牙科服務。' },
  { question: '中醫診所', category: '醫療保健', answer: '文山特區有健泰中醫診所、林建昌中醫診所等中醫診所，提供中醫診療服務。' },
  { question: '眼科診所', category: '醫療保健', answer: '文山特區有幾家眼科診所，提供視力檢查、眼疾治療等服務。' },
  { question: '婦產科', category: '醫療保健', answer: '文山特區有幾家婦產科診所，提供婦科檢查、產前檢查等服務。' },
  { question: '小兒科', category: '醫療保健', answer: '文山特區有幾家小兒科診所，提供兒童健康檢查、疫苗接種等服務。' },
  { question: '急診醫院', category: '醫療保健', answer: '文山特區有博仁綜合醫院等醫療機構，提供急診和住院服務。' },
  { question: '藥局推薦', category: '醫療保健', answer: '文山特區有安琪兒藥局等藥局，提供處方藥、成藥、健康用品等。' },
  { question: '健檢中心', category: '醫療保健', answer: '文山特區有幾家健檢中心，提供健康檢查、體檢等服務。' },
  { question: '復健科', category: '醫療保健', answer: '文山特區有幾家復健科診所，提供物理治療、復健訓練等服務。' },

  // 休閒娛樂（10題）
  { question: '公園在哪裡？', category: '休閒娛樂', answer: '文山特區附近有幾個公園，提供綠地休憩和運動空間。' },
  { question: '觀光景點', category: '休閒娛樂', answer: '文山特區附近有幾個觀光景點，包括歷史建築、文化景點等。' },
  { question: '電影院', category: '休閒娛樂', answer: '文山特區附近有電影院，提供最新的電影放映服務。' },
  { question: 'KTV推薦', category: '休閒娛樂', answer: '文山特區附近有幾家KTV，提供唱歌娛樂服務。' },
  { question: '網咖', category: '休閒娛樂', answer: '文山特區有幾家網咖，提供電腦遊戲和上網服務。' },
  { question: '圖書館', category: '休閒娛樂', answer: '文山特區有圖書館，提供書籍借閱和閱讀空間。' },
  { question: '文化中心', category: '休閒娛樂', answer: '文山特區有文化中心，提供各種文化活動和展覽。' },
  { question: '運動場', category: '休閒娛樂', answer: '文山特區有運動場，提供各種運動設施和場地。' },
  { question: '游泳池', category: '休閒娛樂', answer: '文山特區有游泳池，提供游泳和水中運動服務。' },
  { question: '夜市', category: '休閒娛樂', answer: '文山特區附近有夜市，提供各種小吃和娛樂活動。' }
]

async function importFAQs() {
  console.log('📝 開始匯入100個常見問題到FAQ系統...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < faqData.length; i++) {
      const faq = faqData[i]
      
      try {
        const { data, error } = await supabase
          .from('faqs')
          .insert({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            is_active: true
          })
          .select()
        
        if (error) {
          console.error(`❌ 第${i + 1}題匯入失敗:`, faq.question, error.message)
          errorCount++
        } else {
          console.log(`✅ 第${i + 1}題匯入成功:`, faq.question)
          successCount++
        }
      } catch (err) {
        console.error(`❌ 第${i + 1}題匯入異常:`, faq.question, err.message)
        errorCount++
      }
      
      // 避免過快請求
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('\n📊 匯入結果統計:')
    console.log(`✅ 成功匯入: ${successCount} 題`)
    console.log(`❌ 匯入失敗: ${errorCount} 題`)
    console.log(`📈 成功率: ${((successCount / faqData.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 FAQ匯入完成！現在可以在管理後台的常見問題頁面查看這些問題。')
    }
    
  } catch (error) {
    console.error('💥 匯入過程發生錯誤:', error)
  }
}

// 執行匯入
importFAQs()
  .then(() => {
    console.log('\n✨ 匯入任務完成！')
  })
  .catch((error) => {
    console.error('💥 匯入失敗:', error.message)
    process.exit(1)
  })
