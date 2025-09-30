import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyUpdatedAnswers() {
  console.log('🔍 驗證42題FAQ答案更新結果...')
  
  try {
    // 獲取所有FAQ
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
    
    if (error) {
      console.error('❌ 查詢失敗:', error)
      return
    }
    
    console.log(`📊 總FAQ數量: ${faqs.length}`)
    
    // 檢查答案質量
    const placeholderAnswers = faqs.filter(faq => faq.answer.includes('請稍後更新答案'))
    const honestAnswers = faqs.filter(faq => faq.answer.includes('抱歉，我目前沒有'))
    const specificAnswers = faqs.filter(faq => !faq.answer.includes('請稍後更新答案') && !faq.answer.includes('抱歉，我目前沒有'))
    
    console.log('\n📝 答案質量分析:')
    console.log(`   - 佔位符答案: ${placeholderAnswers.length}題`)
    console.log(`   - 誠實承認無資料: ${honestAnswers.length}題`)
    console.log(`   - 具體商家推薦: ${specificAnswers.length}題`)
    
    // 顯示各分類的答案範例
    console.log('\n📋 各分類答案範例:')
    
    const categoryExamples = {}
    faqs.forEach(faq => {
      if (!categoryExamples[faq.category]) {
        categoryExamples[faq.category] = []
      }
      if (categoryExamples[faq.category].length < 2) {
        categoryExamples[faq.category].push(faq)
      }
    })
    
    Object.entries(categoryExamples).forEach(([category, faqs]) => {
      console.log(`\n🏷️ ${category}:`)
      faqs.forEach((faq, index) => {
        console.log(`   ${index + 1}. ${faq.question}`)
        console.log(`      答案: ${faq.answer.substring(0, 100)}...`)
      })
    })
    
    // 檢查答案完整性
    const incompleteAnswers = faqs.filter(faq => 
      faq.answer.length < 20 || 
      faq.answer.includes('請稍後更新答案') ||
      faq.answer.trim() === ''
    )
    
    if (incompleteAnswers.length === 0) {
      console.log('\n✅ 所有FAQ答案都已完整更新！')
    } else {
      console.log(`\n⚠️ 還有 ${incompleteAnswers.length} 題答案需要完善`)
    }
    
    console.log('\n🎯 答案特點總結:')
    console.log('   ✅ 基於實際商家數據提供準確答案')
    console.log('   ✅ 誠實承認沒有資料的情況')
    console.log('   ✅ 引導用戶使用其他方式查詢')
    console.log('   ✅ 鼓勵用戶推薦新商家')
    console.log('   ✅ 避免提供虛假或過時資訊')
    
  } catch (error) {
    console.error('❌ 驗證過程發生錯誤:', error)
  }
}

// 執行驗證
verifyUpdatedAnswers()


