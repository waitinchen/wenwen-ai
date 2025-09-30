import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 誠實可靠的答案模板
const honestAnswers = {
  '美食推薦': '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps或詢問當地居民來找到合適的餐廳。',
  '停車資訊': '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps查詢附近的停車場，或詢問當地居民。',
  '購物消費': '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps查詢附近的商店，或詢問當地居民。',
  '生活服務': '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps查詢相關服務，或詢問當地居民。',
  '醫療保健': '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps查詢附近的醫療機構，或詢問當地居民。',
  '休閒娛樂': '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps查詢附近的休閒場所，或詢問當地居民。'
}

async function fixFAQAnswers() {
  console.log('🔧 修復FAQ答案，提供誠實可靠的回應...')
  
  try {
    // 獲取需要修復的FAQ
    const { data: faqsToFix, error: fetchError } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .like('answer', '%請稍後更新答案%')
    
    if (fetchError) {
      console.error('❌ 查詢失敗:', fetchError)
      return
    }
    
    console.log(`📊 找到 ${faqsToFix.length} 題需要修復的FAQ`)
    
    // 逐個更新答案
    let successCount = 0
    let errorCount = 0
    
    for (const faq of faqsToFix) {
      const { error: updateError } = await supabase
        .from('faqs')
        .update({
          answer: honestAnswers[faq.category] || '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps查詢，或詢問當地居民。',
          updated_at: new Date().toISOString()
        })
        .eq('id', faq.id)
      
      if (updateError) {
        console.error(`❌ 更新失敗 (ID: ${faq.id}):`, updateError.message)
        errorCount++
      } else {
        successCount++
      }
    }
    
    console.log(`📊 更新結果: 成功 ${successCount} 題，失敗 ${errorCount} 題`)
    
    if (successCount > 0) {
      console.log('✅ 成功修復FAQ答案！')
    }
    console.log('📝 修復詳情:')
    console.log('   - 移除了所有佔位符答案')
    console.log('   - 提供了誠實可靠的回應')
    console.log('   - 引導用戶使用其他方式查詢')
    
    // 驗證修復結果
    const { data: fixedFAQs, error: verifyError } = await supabase
      .from('faqs')
      .select('question, answer, category')
      .eq('is_active', true)
      .like('answer', '%請稍後更新答案%')
    
    if (verifyError) {
      console.error('❌ 驗證失敗:', verifyError)
      return
    }
    
    if (fixedFAQs.length === 0) {
      console.log('✅ 驗證通過：所有佔位符答案已成功修復！')
    } else {
      console.log(`⚠️ 還有 ${fixedFAQs.length} 題需要修復`)
    }
    
  } catch (error) {
    console.error('❌ 修復過程發生錯誤:', error)
  }
}

// 執行修復
fixFAQAnswers()
