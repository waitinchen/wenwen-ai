/**
 * 改善商家名稱匹配算法
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 改善的商家名稱匹配算法
class ImprovedStoreMatcher {
  constructor(stores) {
    this.stores = stores
    this.storeNameMap = new Map()
    this.buildStoreMap()
  }

  buildStoreMap() {
    this.stores.forEach(store => {
      const storeName = store.store_name
      
      // 完整名稱映射
      this.storeNameMap.set(storeName, store)
      
      // 部分名稱映射
      const words = storeName.split(/[\s\-_()（）]+/)
      words.forEach(word => {
        if (word.length > 2) {
          this.storeNameMap.set(word, store)
        }
      })
      
      // 去除常見後綴的映射
      const commonSuffixes = ['店', '館', '中心', '醫院', '診所', '藥局', '停車場', '公園', '夜市', '書院', '城堡', '觀景台']
      commonSuffixes.forEach(suffix => {
        if (storeName.endsWith(suffix)) {
          const baseName = storeName.slice(0, -suffix.length)
          if (baseName.length > 2) {
            this.storeNameMap.set(baseName, store)
          }
        }
      })
    })
  }

  findStore(mention) {
    const cleanMention = mention.trim()
    
    // 1. 精確匹配
    if (this.storeNameMap.has(cleanMention)) {
      return this.storeNameMap.get(cleanMention)
    }
    
    // 2. 部分匹配
    for (const [key, store] of this.storeNameMap) {
      if (cleanMention.includes(key) || key.includes(cleanMention)) {
        return store
      }
    }
    
    // 3. 模糊匹配（去除標點符號）
    const cleanMentionNoPunct = cleanMention.replace(/[，。、\s()（）]/g, '')
    for (const [key, store] of this.storeNameMap) {
      const cleanKey = key.replace(/[，。、\s()（）]/g, '')
      if (cleanMentionNoPunct.includes(cleanKey) || cleanKey.includes(cleanMentionNoPunct)) {
        return store
      }
    }
    
    return null
  }

  extractStoreMentions(text) {
    const mentions = []
    const sentences = text.split(/[。！？]/)
    
    sentences.forEach(sentence => {
      // 查找商家名稱模式
      const patterns = [
        /([A-Za-z0-9\u4e00-\u9fff]+(?:店|館|中心|醫院|診所|藥局|停車場|公園|夜市|書院|城堡|觀景台))/g,
        /([A-Za-z0-9\u4e00-\u9fff]+(?:\s+[A-Za-z0-9\u4e00-\u9fff]+)*)/g
      ]
      
      patterns.forEach(pattern => {
        const matches = sentence.match(pattern)
        if (matches) {
          matches.forEach(match => {
            const cleanMatch = match.trim()
            if (cleanMatch.length > 2) {
              const store = this.findStore(cleanMatch)
              if (store) {
                mentions.push({
                  mention: cleanMatch,
                  store: store,
                  confidence: this.calculateConfidence(cleanMatch, store.store_name)
                })
              }
            }
          })
        }
      })
    })
    
    return mentions
  }

  calculateConfidence(mention, storeName) {
    if (mention === storeName) return 1.0
    if (storeName.includes(mention)) return 0.9
    if (mention.includes(storeName)) return 0.8
    
    // 計算字符相似度
    const similarity = this.calculateSimilarity(mention, storeName)
    return similarity > 0.7 ? similarity : 0
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  levenshteinDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }
}

async function testImprovedMatching() {
  console.log('🔧 測試改善的商家名稱匹配算法...')
  
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

    // 獲取FAQ數據
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')
      .limit(5)

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

    const matcher = new ImprovedStoreMatcher(stores)
    
    console.log(`\n📊 商家數據: ${stores.length} 家`)
    console.log(`📝 FAQ數據: ${faqs.length} 題`)
    
    console.log('\n🔍 測試匹配結果:')
    
    faqs.forEach((faq, index) => {
      console.log(`\n${index + 1}. ${faq.question}`)
      
      const mentions = matcher.extractStoreMentions(faq.answer)
      
      if (mentions.length > 0) {
        console.log(`   ✅ 找到 ${mentions.length} 個商家提及:`)
        mentions.forEach(mention => {
          console.log(`      - ${mention.mention} → ${mention.store.store_name} (信心度: ${(mention.confidence * 100).toFixed(1)}%)`)
        })
      } else {
        console.log(`   ❌ 未找到商家提及`)
      }
    })

    console.log('\n✅ 改善的匹配算法測試完成！')

  } catch (error) {
    console.error('測試異常:', error)
  }
}

testImprovedMatching()


