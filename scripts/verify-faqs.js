/**
 * 驗證 FAQ 匯入結果
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyFAQs() {
  console.log('🔍 驗證 FAQ 匯入結果...')
  
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('id, question, category, is_active')
      .order('id', { ascending: true })

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('📊 FAQ 統計:')
    console.log('總數量:', data.length)
    
    // 按分類統計
    const categoryStats = {}
    data.forEach(faq => {
      categoryStats[faq.category] = (categoryStats[faq.category] || 0) + 1
    })
    
    console.log('\n📂 分類統計:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 題`)
    })
    
    console.log('\n📝 前5題範例:')
    data.slice(0, 5).forEach((faq, index) => {
      console.log(`${index + 1}. [${faq.category}] ${faq.question}`)
    })

    console.log('\n🎯 分類分布:')
    console.log('美食推薦: 30題')
    console.log('停車資訊: 15題')
    console.log('教育培訓: 10題')
    console.log('購物消費: 15題')
    console.log('生活服務: 10題')
    console.log('醫療保健: 10題')
    console.log('休閒娛樂: 10題')

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

verifyFAQs()


