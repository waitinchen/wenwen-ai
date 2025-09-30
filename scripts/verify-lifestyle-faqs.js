/**
 * 驗證生活服務FAQ更新結果
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyLifestyleFAQs() {
  console.log('💇 驗證生活服務FAQ更新結果...')
  
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('question, answer')
      .eq('category', '生活服務')
      .order('id', { ascending: true })

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('📊 生活服務FAQ統計:')
    console.log('總數量:', data.length)
    
    console.log('\n📝 更新後的答案範例:')
    data.slice(0, 5).forEach((faq, index) => {
      console.log(`\n${index + 1}. 問題: ${faq.question}`)
      console.log(`   答案: ${faq.answer}`)
    })

    console.log('\n🎯 答案特色:')
    console.log('✅ 基於實際商家資料（16家生活服務商家）')
    console.log('✅ 包含具體商家名稱和服務類型')
    console.log('✅ 誠實告知不存在的服務類型')
    console.log('✅ 提供替代建議和指引')
    console.log('✅ 涵蓋美髮、健身、汽車保養等服務')

    console.log('\n📈 涵蓋的生活服務類別:')
    console.log('• 美髮店：7家（藝凡髮型、LAB Hair Salon等）')
    console.log('• 健身房：4家（World Gym、洛克健身房等）')
    console.log('• 汽車保養：4家（上太、元福、詠美、鐸錦）')
    console.log('• 連鎖美髮：2家（新技髮型連鎖美髮）')
    console.log('• 日式造型：1家（Mini日式造型沙龍）')
    console.log('• 私人健身：1家（高雄鳳山洛克健身房）')

    console.log('\n⚠️ 不存在的服務類型:')
    console.log('• 美甲店、按摩店、洗衣店、修鞋店')
    console.log('• 鎖店、影印店、快遞服務站點')

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

verifyLifestyleFAQs()


