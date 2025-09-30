/**
 * 建立幻覺商家檢測機制
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 幻覺商家檢測系統
class HallucinationDetector {
  constructor(stores) {
    this.stores = stores
    this.storeNames = new Set(stores.map(store => store.store_name))
    this.commonWords = new Set([
      '文山特區', '鳳山', '高雄', '台灣', '提供', '服務', '推薦', '選擇', '等', '包括', '各種', '不錯', '優質', '專業', '連鎖', '大型', '小型', '地方', '特色', '美食', '餐廳', '咖啡', '書店', '超市', '藥局', '診所', '醫院', '停車場', '公園', '夜市', '景點', '購物', '中心', '館', '店', '等', '提供', '各種', '服務', '推薦', '選擇', '不錯', '優質', '專業', '連鎖', '大型', '小型', '地方', '特色', '美食', '餐廳', '咖啡', '書店', '超市', '藥局', '診所', '醫院', '停車場', '公園', '夜市', '景點', '購物', '中心', '館', '店', '等', '提供', '各種', '服務', '推薦', '選擇', '不錯', '優質', '專業', '連鎖', '大型', '小型', '地方', '特色', '美食', '餐廳', '咖啡', '書店', '超市', '藥局', '診所', '醫院', '停車場', '公園', '夜市', '景點', '購物', '中心', '館', '店'
    ])
  }

  detectHallucinations(text) {
    const hallucinations = []
    const sentences = text.split(/[。！？]/)
    
    sentences.forEach(sentence => {
      const words = sentence.split(/[，。、\s()（）]+/)
      
      words.forEach(word => {
        const cleanWord = word.trim()
        
        if (this.isPotentialHallucination(cleanWord)) {
          hallucinations.push({
            word: cleanWord,
            sentence: sentence,
            reason: this.getHallucinationReason(cleanWord)
          })
        }
      })
    })
    
    return hallucinations
  }

  isPotentialHallucination(word) {
    // 過濾太短的詞
    if (word.length < 3) return false
    
    // 過濾常見詞彙
    if (this.commonWords.has(word)) return false
    
    // 過濾純數字
    if (/^\d+$/.test(word)) return false
    
    // 過濾純英文單詞
    if (/^[A-Za-z]+$/.test(word) && word.length < 5) return false
    
    // 檢查是否為真實商家名稱
    if (this.storeNames.has(word)) return false
    
    // 檢查部分匹配
    for (const storeName of this.storeNames) {
      if (storeName.includes(word) || word.includes(storeName)) {
        return false
      }
    }
    
    return true
  }

  getHallucinationReason(word) {
    if (word.includes('提供') || word.includes('服務')) {
      return '描述性詞彙'
    }
    if (word.includes('等') || word.includes('各種')) {
      return '概括性詞彙'
    }
    if (word.includes('建議') || word.includes('詢問')) {
      return '建議性詞彙'
    }
    if (word.length > 10) {
      return '過長的描述'
    }
    return '未識別的詞彙'
  }

  generateReport(faqs) {
    const report = {
      totalFAQs: faqs.length,
      totalHallucinations: 0,
      hallucinationsByCategory: {},
      topHallucinations: [],
      recommendations: []
    }

    faqs.forEach(faq => {
      const hallucinations = this.detectHallucinations(faq.answer)
      report.totalHallucinations += hallucinations.length
      
      if (!report.hallucinationsByCategory[faq.category]) {
        report.hallucinationsByCategory[faq.category] = 0
      }
      report.hallucinationsByCategory[faq.category] += hallucinations.length
    })

    // 統計最常見的幻覺詞彙
    const hallucinationCounts = {}
    faqs.forEach(faq => {
      const hallucinations = this.detectHallucinations(faq.answer)
      hallucinations.forEach(h => {
        hallucinationCounts[h.word] = (hallucinationCounts[h.word] || 0) + 1
      })
    })

    report.topHallucinations = Object.entries(hallucinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))

    // 生成建議
    if (report.totalHallucinations > 0) {
      report.recommendations.push('建議定期檢查FAQ答案中的商家名稱準確性')
      report.recommendations.push('建立商家名稱白名單機制')
      report.recommendations.push('改善商家名稱匹配算法')
    }

    return report
  }
}

async function createVerificationSystem() {
  console.log('🔍 建立幻覺商家檢測機制...')
  
  try {
    // 獲取所有商家數據
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, store_name, category, approval')
      .eq('approval', 'approved')

    if (storesError) {
      console.error('商家查詢錯誤:', storesError)
      return
    }

    // 獲取所有FAQ數據
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

    const detector = new HallucinationDetector(stores)
    const report = detector.generateReport(faqs)

    console.log('\n📊 幻覺商家檢測報告:')
    console.log(`總FAQ數量: ${report.totalFAQs}`)
    console.log(`總幻覺數量: ${report.totalHallucinations}`)
    console.log(`幻覺率: ${((report.totalHallucinations / report.totalFAQs) * 100).toFixed(2)}%`)

    console.log('\n📂 各分類幻覺統計:')
    Object.entries(report.hallucinationsByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 個`)
    })

    console.log('\n🔝 最常見的幻覺詞彙:')
    report.topHallucinations.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.word} (${item.count} 次)`)
    })

    console.log('\n💡 改善建議:')
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`)
    })

    // 測試檢測機制
    console.log('\n🧪 測試檢測機制:')
    const testFAQs = faqs.slice(0, 3)
    
    testFAQs.forEach((faq, index) => {
      console.log(`\n${index + 1}. ${faq.question}`)
      const hallucinations = detector.detectHallucinations(faq.answer)
      
      if (hallucinations.length > 0) {
        console.log(`   ⚠️ 發現 ${hallucinations.length} 個潛在幻覺:`)
        hallucinations.slice(0, 3).forEach(h => {
          console.log(`      - "${h.word}" (${h.reason})`)
        })
      } else {
        console.log(`   ✅ 未發現幻覺`)
      }
    })

    console.log('\n✅ 幻覺商家檢測機制建立完成！')

  } catch (error) {
    console.error('建立檢測機制異常:', error)
  }
}

createVerificationSystem()


