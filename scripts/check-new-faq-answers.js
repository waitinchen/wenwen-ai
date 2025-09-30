import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkNewFAQAnswers() {
  console.log('🔍 檢查新增42題FAQ答案的合理性...')
  
  try {
    // 獲取新增的FAQ（答案包含"請稍後更新答案"的）
    const { data: newFAQs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .like('answer', '%請稍後更新答案%')
      .order('category', { ascending: true })
    
    if (error) {
      console.error('❌ 查詢失敗:', error)
      return
    }
    
    console.log(`📊 找到 ${newFAQs.length} 題需要更新答案的FAQ`)
    
    // 按分類檢查
    const categoryGroups = {}
    newFAQs.forEach(faq => {
      if (!categoryGroups[faq.category]) {
        categoryGroups[faq.category] = []
      }
      categoryGroups[faq.category].push(faq)
    })
    
    console.log('\n📝 各分類需要更新的FAQ:')
    Object.entries(categoryGroups).forEach(([category, faqs]) => {
      console.log(`\n🏷️ ${category} (${faqs.length}題):`)
      faqs.forEach((faq, index) => {
        console.log(`   ${index + 1}. ${faq.question}`)
        console.log(`      答案: ${faq.answer}`)
      })
    })
    
    // 檢查是否有重複問題
    console.log('\n🔍 檢查重複問題:')
    const questionMap = {}
    const duplicates = []
    
    newFAQs.forEach(faq => {
      if (questionMap[faq.question]) {
        duplicates.push({
          question: faq.question,
          category1: questionMap[faq.question].category,
          category2: faq.category
        })
      } else {
        questionMap[faq.question] = faq
      }
    })
    
    if (duplicates.length > 0) {
      console.log('❌ 發現重複問題:')
      duplicates.forEach(dup => {
        console.log(`   - "${dup.question}" 出現在 ${dup.category1} 和 ${dup.category2}`)
      })
    } else {
      console.log('✅ 沒有發現重複問題')
    }
    
    // 檢查答案質量
    console.log('\n📊 答案質量分析:')
    const placeholderAnswers = newFAQs.filter(faq => faq.answer.includes('請稍後更新答案'))
    const emptyAnswers = newFAQs.filter(faq => !faq.answer || faq.answer.trim() === '')
    
    console.log(`   - 佔位符答案: ${placeholderAnswers.length}題`)
    console.log(`   - 空白答案: ${emptyAnswers.length}題`)
    console.log(`   - 需要更新答案: ${placeholderAnswers.length + emptyAnswers.length}題`)
    
    console.log('\n⚠️ 建議:')
    console.log('   1. 為所有新增FAQ提供基於實際商家數據的準確答案')
    console.log('   2. 避免使用佔位符答案，確保答案的實用性')
    console.log('   3. 定期檢查答案的準確性和時效性')
    
  } catch (error) {
    console.error('❌ 檢查過程發生錯誤:', error)
  }
}

// 執行檢查
checkNewFAQAnswers()


