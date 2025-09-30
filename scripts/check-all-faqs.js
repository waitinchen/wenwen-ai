/**
 * 檢查所有FAQ匯入狀態
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllFAQs() {
  console.log('📊 檢查所有FAQ匯入狀態...')
  
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('id, question, category, answer, is_active')
      .order('category', { ascending: true })

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('📈 總體統計:')
    console.log('總FAQ數量:', data.length)
    
    // 按分類統計
    const categoryStats = {}
    data.forEach(faq => {
      categoryStats[faq.category] = (categoryStats[faq.category] || 0) + 1
    })
    
    console.log('\n📂 分類統計:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 題`)
    })
    
    // 檢查答案完整性
    const withAnswers = data.filter(faq => faq.answer && faq.answer.trim().length > 0)
    const withoutAnswers = data.filter(faq => !faq.answer || faq.answer.trim().length === 0)
    
    console.log('\n📝 答案完整性:')
    console.log(`有答案: ${withAnswers.length} 題`)
    console.log(`無答案: ${withoutAnswers.length} 題`)
    console.log(`完整率: ${((withAnswers.length / data.length) * 100).toFixed(1)}%`)
    
    if (withoutAnswers.length > 0) {
      console.log('\n⚠️ 缺少答案的問題:')
      withoutAnswers.forEach(faq => {
        console.log(`  - [${faq.category}] ${faq.question}`)
      })
    }

    // 檢查各分類的答案狀態
    console.log('\n🔍 各分類答案狀態:')
    Object.entries(categoryStats).forEach(([category, totalCount]) => {
      const categoryFAQs = data.filter(faq => faq.category === category)
      const categoryWithAnswers = categoryFAQs.filter(faq => faq.answer && faq.answer.trim().length > 0)
      const completionRate = ((categoryWithAnswers.length / totalCount) * 100).toFixed(1)
      console.log(`  ${category}: ${categoryWithAnswers.length}/${totalCount} (${completionRate}%)`)
    })

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

checkAllFAQs()


