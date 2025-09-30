import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 50題模擬民眾提問
const simulatedQuestions = [
  // 美食推薦 (20題)
  '附近有什麼好吃的餐廳？',
  '有推薦的早餐店嗎？',
  '有日式料理嗎？',
  '有韓式料理嗎？',
  '有泰式料理嗎？',
  '有中式餐廳嗎？',
  '有素食餐廳嗎？',
  '推薦幾家咖啡廳',
  '有燒肉店嗎？',
  '有居酒屋嗎？',
  '哪裡有宵夜可以吃？',
  '有火鍋店嗎？',
  '有義大利麵店嗎？',
  '有壽司店嗎？',
  '有拉麵店嗎？',
  '有披薩店嗎？',
  '有牛排店嗎？',
  '有海鮮餐廳嗎？',
  '有24小時營業的餐廳嗎？',
  '有適合聚餐的餐廳嗎？',

  // 停車資訊 (15題)
  '附近有停車場嗎？',
  '停車費怎麼算？',
  '有免費停車場嗎？',
  '有地下停車場嗎？',
  '停車場營業時間？',
  '有機車停車位嗎？',
  '停車場有充電樁嗎？',
  '有代客泊車服務嗎？',
  '哪裡停車比較方便？',
  '停車場有殘障車位嗎？',
  '有路邊停車格嗎？',
  '停車場有監控嗎？',
  '有月租停車位嗎？',
  '停車場有洗車服務嗎？',
  '有大型車停車位嗎？',

  // 商家服務 (15題)
  '有藥局嗎？',
  '有書店嗎？',
  '有便利商店嗎？',
  '有超市嗎？',
  '有銀行嗎？',
  '有郵局嗎？',
  '有加油站嗎？',
  '有美髮店嗎？',
  '有診所嗎？',
  '有牙醫嗎？',
  '有眼科嗎？',
  '有中醫診所嗎？',
  '有公園嗎？',
  '有圖書館嗎？',
  '有電影院嗎？'
]

async function simulateQuestions() {
  console.log('🎭 開始模擬50題民眾提問...')
  
  const results = []
  let totalQuestions = 0
  let answeredQuestions = 0
  let faqMatchedQuestions = 0
  let fallbackQuestions = 0
  
  try {
    for (const question of simulatedQuestions) {
      totalQuestions++
      console.log(`\n❓ 問題 ${totalQuestions}: ${question}`)
      
      // 模擬FAQ查詢
      const { data: faqResult, error: faqError } = await supabase
        .from('faqs')
        .select('*')
        .eq('question', question)
        .eq('is_active', true)
        .single()
      
      if (faqError && faqError.code !== 'PGRST116') {
        console.log(`❌ FAQ查詢錯誤: ${faqError.message}`)
        continue
      }
      
      if (faqResult) {
        faqMatchedQuestions++
        console.log(`✅ FAQ匹配成功`)
        console.log(`📝 分類: ${faqResult.category}`)
        console.log(`💬 答案: ${faqResult.answer.substring(0, 100)}...`)
        
        results.push({
          question,
          type: 'FAQ_MATCH',
          category: faqResult.category,
          answer: faqResult.answer,
          quality: analyzeAnswerQuality(faqResult.answer)
        })
      } else {
        // 模擬模糊匹配
        const { data: fuzzyResults, error: fuzzyError } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_active', true)
          .or(`question.ilike.%${question.substring(0, 3)}%,question.ilike.%${question.substring(question.length-3)}%`)
          .limit(3)
        
        if (fuzzyResults && fuzzyResults.length > 0) {
          console.log(`🔍 模糊匹配找到 ${fuzzyResults.length} 個相關問題`)
          const bestMatch = fuzzyResults[0]
          console.log(`📝 最佳匹配: ${bestMatch.question}`)
          console.log(`💬 答案: ${bestMatch.answer.substring(0, 100)}...`)
          
          results.push({
            question,
            type: 'FUZZY_MATCH',
            category: bestMatch.category,
            answer: bestMatch.answer,
            quality: analyzeAnswerQuality(bestMatch.answer)
          })
        } else {
          fallbackQuestions++
          console.log(`❌ 未找到匹配的FAQ`)
          console.log(`🔄 將使用fallback回應`)
          
          const fallbackAnswer = generateFallbackAnswer(question)
          results.push({
            question,
            type: 'FALLBACK',
            category: 'UNKNOWN',
            answer: fallbackAnswer,
            quality: analyzeAnswerQuality(fallbackAnswer)
          })
        }
      }
      
      answeredQuestions++
    }
    
    // 分析結果
    console.log('\n📊 模擬結果分析:')
    console.log(`總問題數: ${totalQuestions}`)
    console.log(`已回答: ${answeredQuestions}`)
    console.log(`FAQ精確匹配: ${faqMatchedQuestions}`)
    console.log(`模糊匹配: ${results.filter(r => r.type === 'FUZZY_MATCH').length}`)
    console.log(`Fallback回應: ${fallbackQuestions}`)
    
    // 答案品質分析
    const qualityStats = analyzeQualityStats(results)
    console.log('\n📈 答案品質分析:')
    console.log(`優質答案: ${qualityStats.excellent}`)
    console.log(`良好答案: ${qualityStats.good}`)
    console.log(`一般答案: ${qualityStats.average}`)
    console.log(`需要改善: ${qualityStats.poor}`)
    
    // 生成改善計畫
    generateImprovementPlan(results, qualityStats)
    
  } catch (error) {
    console.error('❌ 模擬過程發生錯誤:', error)
  }
}

function analyzeAnswerQuality(answer) {
  const score = {
    hasSpecificInfo: 0,
    hasContactInfo: 0,
    isHonest: 0,
    isHelpful: 0,
    hasAlternatives: 0
  }
  
  // 檢查是否有具體資訊
  if (answer.includes('文山特區有') || answer.includes('鳳山') || answer.includes('高雄')) {
    score.hasSpecificInfo = 1
  }
  
  // 檢查是否有聯絡資訊
  if (answer.includes('電話') || answer.includes('地址') || answer.includes('LINE')) {
    score.hasContactInfo = 1
  }
  
  // 檢查是否誠實
  if (answer.includes('抱歉') || answer.includes('目前沒有')) {
    score.isHonest = 1
  }
  
  // 檢查是否有幫助
  if (answer.includes('建議') || answer.includes('推薦') || answer.includes('可以')) {
    score.isHelpful = 1
  }
  
  // 檢查是否有替代方案
  if (answer.includes('Google Maps') || answer.includes('其他') || answer.includes('或者')) {
    score.hasAlternatives = 1
  }
  
  const totalScore = Object.values(score).reduce((sum, val) => sum + val, 0)
  
  if (totalScore >= 4) return 'excellent'
  if (totalScore >= 3) return 'good'
  if (totalScore >= 2) return 'average'
  return 'poor'
}

function analyzeQualityStats(results) {
  const stats = { excellent: 0, good: 0, average: 0, poor: 0 }
  
  results.forEach(result => {
    stats[result.quality]++
  })
  
  return stats
}

function generateFallbackAnswer(question) {
  return '抱歉，我目前沒有這方面的詳細資訊。建議您使用Google Maps查詢，或詢問當地居民。'
}

function generateImprovementPlan(results, qualityStats) {
  console.log('\n🎯 回應品質改善計畫:')
  
  const totalQuestions = results.length
  const qualityRate = ((qualityStats.excellent + qualityStats.good) / totalQuestions * 100).toFixed(1)
  
  console.log(`\n📊 當前品質指標:`)
  console.log(`整體品質率: ${qualityRate}%`)
  console.log(`優質答案率: ${(qualityStats.excellent / totalQuestions * 100).toFixed(1)}%`)
  
  console.log(`\n🔧 改善建議:`)
  
  // 分析問題類型
  const categoryStats = {}
  results.forEach(result => {
    if (!categoryStats[result.category]) {
      categoryStats[result.category] = { total: 0, excellent: 0, good: 0, average: 0, poor: 0 }
    }
    categoryStats[result.category].total++
    categoryStats[result.category][result.quality]++
  })
  
  console.log(`\n📋 各分類改善重點:`)
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const qualityRate = ((stats.excellent + stats.good) / stats.total * 100).toFixed(1)
    console.log(`\n🏷️ ${category}:`)
    console.log(`   品質率: ${qualityRate}% (${stats.excellent + stats.good}/${stats.total})`)
    
    if (qualityRate < 80) {
      console.log(`   ⚠️ 需要改善 - 建議增加具體商家資訊`)
    }
    if (stats.poor > 0) {
      console.log(`   ❌ 有 ${stats.poor} 題需要重新整理答案`)
    }
  })
  
  console.log(`\n🚀 具體改善措施:`)
  console.log(`1. 增加FAQ覆蓋率 - 目前有 ${results.filter(r => r.type === 'FALLBACK').length} 題使用fallback`)
  console.log(`2. 提升答案具體性 - ${qualityStats.average + qualityStats.poor} 題需要更詳細的資訊`)
  console.log(`3. 加強聯絡資訊 - 提供電話、地址等實用資訊`)
  console.log(`4. 優化模糊匹配 - 改善相關問題的匹配準確度`)
  console.log(`5. 定期更新答案 - 確保資訊的時效性和準確性`)
  
  console.log(`\n📅 改善時程:`)
  console.log(`第1週: 修復品質差的答案 (${qualityStats.poor}題)`)
  console.log(`第2週: 提升一般答案的品質 (${qualityStats.average}題)`)
  console.log(`第3週: 增加缺失的FAQ (${results.filter(r => r.type === 'FALLBACK').length}題)`)
  console.log(`第4週: 優化整體答案結構和格式`)
}

// 執行模擬
simulateQuestions()


