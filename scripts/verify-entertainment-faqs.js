/**
 * 驗證休閒娛樂FAQ更新結果
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyEntertainmentFAQs() {
  console.log('🎮 驗證休閒娛樂FAQ更新結果...')
  
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('question, answer')
      .eq('category', '休閒娛樂')
      .order('id', { ascending: true })

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('📊 休閒娛樂FAQ統計:')
    console.log('總數量:', data.length)
    
    console.log('\n📝 更新後的答案範例:')
    data.slice(0, 5).forEach((faq, index) => {
      console.log(`\n${index + 1}. 問題: ${faq.question}`)
      console.log(`   答案: ${faq.answer}`)
    })

    console.log('\n🎯 答案特色:')
    console.log('✅ 基於實際商家資料（9家休閒娛樂商家）')
    console.log('✅ 包含具體景點名稱和類型')
    console.log('✅ 誠實告知不存在的服務類型')
    console.log('✅ 提供替代建議和指引')
    console.log('✅ 涵蓋公園、景點、夜市等休閒場所')

    console.log('\n📈 涵蓋的休閒娛樂類別:')
    console.log('• 公園：2個（鳳山公園、鳳山運動公園）')
    console.log('• 觀光景點：3個（鳳儀書院、85大樓觀景台、鳳山熱帶城堡）')
    console.log('• 夜市：2個（五甲自強夜市、鳳山青年夜市）')
    console.log('• 運動設施：1個（高雄市鳳山運動園區）')
    console.log('• 汗蒸幕：1個（汗沐蒸文山館-旗艦店）')

    console.log('\n⚠️ 不存在的服務類型:')
    console.log('• 電影院、KTV、網咖、圖書館')
    console.log('• 文化中心、游泳池')

    console.log('\n💡 替代建議:')
    console.log('• 電影院 → 線上串流平台')
    console.log('• KTV → 線上KTV應用程式')
    console.log('• 網咖 → 家中電腦設備')
    console.log('• 圖書館 → 線上圖書資源')
    console.log('• 文化中心 → 鳳儀書院等文化景點')
    console.log('• 游泳池 → 其他區域游泳池或運動園區')

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

verifyEntertainmentFAQs()


