import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyFAQs() {
  console.log('🔍 驗證42題FAQ匯入結果...')
  
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
    
    // 按分類統計
    const categoryStats = {}
    faqs.forEach(faq => {
      if (!categoryStats[faq.category]) {
        categoryStats[faq.category] = 0
      }
      categoryStats[faq.category]++
    })
    
    console.log('\n📝 分類統計:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count}題`)
    })
    
    // 顯示最近匯入的FAQ
    console.log('\n🆕 最近匯入的FAQ (前10題):')
    const recentFAQs = faqs
      .filter(faq => faq.answer.includes('請稍後更新答案'))
      .slice(0, 10)
    
    recentFAQs.forEach((faq, index) => {
      console.log(`   ${index + 1}. [${faq.category}] ${faq.question}`)
    })
    
    console.log('\n✅ 驗證完成！')
    
  } catch (error) {
    console.error('❌ 驗證過程發生錯誤:', error)
  }
}

// 執行驗證
verifyFAQs()


