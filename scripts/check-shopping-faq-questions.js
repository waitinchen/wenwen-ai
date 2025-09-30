/**
 * 檢查購物消費FAQ問題
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkShoppingFAQs() {
  console.log('🛒 檢查購物消費FAQ問題...')
  
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('id, question, answer')
      .eq('category', '購物消費')
      .order('id', { ascending: true })

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('📊 購物消費FAQ問題清單:')
    data.forEach((faq, index) => {
      console.log(`${index + 1}. ${faq.question}`)
    })

    return data

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

checkShoppingFAQs()


