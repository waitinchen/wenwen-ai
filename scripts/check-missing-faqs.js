/**
 * 檢查未匹配的FAQ問題
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMissingFAQs() {
  console.log('🔍 檢查未匹配的FAQ問題...')
  
  try {
    // 獲取FAQ數據
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')
      .order('category', { ascending: true })

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

    const missingQuestions = ['有藥局嗎？', '有書店嗎？']
    
    console.log('\n🔍 檢查未匹配的問題:')
    
    missingQuestions.forEach(question => {
      console.log(`\n❓ 問題: "${question}"`)
      
      // 查找相關的FAQ
      const relatedFAQs = faqs.filter(faq => 
        faq.question.includes('藥局') || faq.question.includes('書店') ||
        faq.question.includes('藥') || faq.question.includes('書')
      )
      
      if (relatedFAQs.length > 0) {
        console.log(`   🔍 找到 ${relatedFAQs.length} 個相關FAQ:`)
        relatedFAQs.forEach(faq => {
          console.log(`      - "${faq.question}" (${faq.category})`)
          console.log(`        答案: ${faq.answer.substring(0, 80)}...`)
        })
      } else {
        console.log(`   ❌ 未找到相關FAQ`)
      }
    })

    // 檢查所有藥局相關FAQ
    console.log('\n💊 藥局相關FAQ:')
    const pharmacyFAQs = faqs.filter(faq => 
      faq.question.includes('藥局') || faq.question.includes('藥')
    )
    
    if (pharmacyFAQs.length > 0) {
      pharmacyFAQs.forEach(faq => {
        console.log(`- "${faq.question}" (${faq.category})`)
      })
    } else {
      console.log('未找到藥局相關FAQ')
    }

    // 檢查所有書店相關FAQ
    console.log('\n📚 書店相關FAQ:')
    const bookstoreFAQs = faqs.filter(faq => 
      faq.question.includes('書店') || faq.question.includes('書')
    )
    
    if (bookstoreFAQs.length > 0) {
      bookstoreFAQs.forEach(faq => {
        console.log(`- "${faq.question}" (${faq.category})`)
      })
    } else {
      console.log('未找到書店相關FAQ')
    }

    // 建議新增的FAQ
    console.log('\n💡 建議新增的FAQ:')
    console.log('1. "有藥局嗎？" - 基於現有的藥局位置FAQ')
    console.log('2. "有書店嗎？" - 基於現有的書店在哪裡FAQ')

  } catch (error) {
    console.error('檢查異常:', error)
  }
}

checkMissingFAQs()


