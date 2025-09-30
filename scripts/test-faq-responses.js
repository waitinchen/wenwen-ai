/**
 * 從admin/faqs模擬民眾提問10題，測試高文文是否能正常使用常見問題的答案
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 模擬民眾提問的10個問題
const testQuestions = [
  '有日式料理嗎？',
  '停車場推薦',
  '哪裡可以買衣服？',
  '有24小時營業的餐廳嗎？',
  '公園在哪裡？',
  '有藥局嗎？',
  '推薦韓式料理',
  '哪裡有火鍋店？',
  '有書店嗎？',
  '便利商店位置'
]

async function testFAQResponses() {
  console.log('🧪 測試高文文對常見問題的回答能力...')
  
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

    console.log(`\n📊 FAQ數據統計:`)
    console.log(`總FAQ數量: ${faqs.length}`)

    // 按分類統計
    const categoryStats = {}
    faqs.forEach(faq => {
      categoryStats[faq.category] = (categoryStats[faq.category] || 0) + 1
    })

    console.log('\n📂 各分類FAQ統計:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 題`)
    })

    console.log('\n🎯 模擬民眾提問測試:')
    
    testQuestions.forEach((question, index) => {
      console.log(`\n${index + 1}. 民眾提問: "${question}"`)
      
      // 查找匹配的FAQ
      const matchingFAQ = faqs.find(faq => 
        faq.question === question || 
        faq.question.includes(question) || 
        question.includes(faq.question)
      )
      
      if (matchingFAQ) {
        console.log(`   ✅ 找到匹配FAQ: "${matchingFAQ.question}"`)
        console.log(`   📝 分類: ${matchingFAQ.category}`)
        console.log(`   💬 答案: ${matchingFAQ.answer.substring(0, 100)}...`)
        
        // 檢查答案質量
        const answerLength = matchingFAQ.answer.length
        const hasStoreNames = /[A-Za-z0-9\u4e00-\u9fff]+(?:店|館|中心|醫院|診所|藥局|停車場|公園|夜市|書院|城堡|觀景台)/.test(matchingFAQ.answer)
        const isHonestResponse = matchingFAQ.answer.includes('抱歉') || matchingFAQ.answer.includes('目前沒有')
        
        console.log(`   📊 答案質量:`)
        console.log(`      - 長度: ${answerLength} 字符`)
        console.log(`      - 包含商家名稱: ${hasStoreNames ? '是' : '否'}`)
        console.log(`      - 誠實回應: ${isHonestResponse ? '是' : '否'}`)
        
        if (answerLength > 50 && (hasStoreNames || isHonestResponse)) {
          console.log(`   ✅ 答案質量良好`)
        } else {
          console.log(`   ⚠️ 答案質量需要改善`)
        }
      } else {
        console.log(`   ❌ 未找到匹配的FAQ`)
        
        // 嘗試模糊匹配
        const fuzzyMatches = faqs.filter(faq => 
          faq.question.toLowerCase().includes(question.toLowerCase()) ||
          question.toLowerCase().includes(faq.question.toLowerCase())
        )
        
        if (fuzzyMatches.length > 0) {
          console.log(`   🔍 找到 ${fuzzyMatches.length} 個模糊匹配:`)
          fuzzyMatches.slice(0, 2).forEach(match => {
            console.log(`      - "${match.question}" (${match.category})`)
          })
        }
      }
    })

    // 測試高文文回答能力
    console.log('\n🤖 測試高文文回答能力:')
    
    const testResults = {
      totalQuestions: testQuestions.length,
      matchedFAQs: 0,
      fuzzyMatches: 0,
      noMatches: 0,
      goodAnswers: 0,
      needsImprovement: 0
    }

    testQuestions.forEach(question => {
      const matchingFAQ = faqs.find(faq => 
        faq.question === question || 
        faq.question.includes(question) || 
        question.includes(faq.question)
      )
      
      if (matchingFAQ) {
        testResults.matchedFAQs++
        
        const answerLength = matchingFAQ.answer.length
        const hasStoreNames = /[A-Za-z0-9\u4e00-\u9fff]+(?:店|館|中心|醫院|診所|藥局|停車場|公園|夜市|書院|城堡|觀景台)/.test(matchingFAQ.answer)
        const isHonestResponse = matchingFAQ.answer.includes('抱歉') || matchingFAQ.answer.includes('目前沒有')
        
        if (answerLength > 50 && (hasStoreNames || isHonestResponse)) {
          testResults.goodAnswers++
        } else {
          testResults.needsImprovement++
        }
      } else {
        testResults.noMatches++
      }
    })

    console.log('\n📊 測試結果統計:')
    console.log(`總測試問題: ${testResults.totalQuestions}`)
    console.log(`精確匹配: ${testResults.matchedFAQs}`)
    console.log(`無匹配: ${testResults.noMatches}`)
    console.log(`良好答案: ${testResults.goodAnswers}`)
    console.log(`需要改善: ${testResults.needsImprovement}`)
    
    const matchRate = ((testResults.matchedFAQs / testResults.totalQuestions) * 100).toFixed(1)
    const goodAnswerRate = ((testResults.goodAnswers / testResults.totalQuestions) * 100).toFixed(1)
    
    console.log(`\n📈 性能指標:`)
    console.log(`匹配率: ${matchRate}%`)
    console.log(`良好答案率: ${goodAnswerRate}%`)
    
    if (matchRate >= 80 && goodAnswerRate >= 70) {
      console.log(`\n🎉 高文文回答能力良好！`)
    } else if (matchRate >= 60 && goodAnswerRate >= 50) {
      console.log(`\n⚠️ 高文文回答能力一般，需要改善`)
    } else {
      console.log(`\n❌ 高文文回答能力需要大幅改善`)
    }

    // 推薦改善的FAQ
    console.log('\n💡 改善建議:')
    if (testResults.noMatches > 0) {
      console.log(`- 新增 ${testResults.noMatches} 個常見問題的FAQ`)
    }
    if (testResults.needsImprovement > 0) {
      console.log(`- 改善 ${testResults.needsImprovement} 個FAQ答案的質量`)
    }
    console.log('- 定期更新FAQ數據庫')
    console.log('- 建立FAQ自動匹配機制')

  } catch (error) {
    console.error('測試異常:', error)
  }
}

testFAQResponses()


