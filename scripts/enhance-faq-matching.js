/**
 * FAQ 模糊比對增強實現
 */

const faqEnhancementImplementation = `
// 在 FAQService 中增強模糊比對
class FAQService {
  constructor(dataLayer) {
    this.dataLayer = dataLayer;
    this.synonymsCache = new Map();
  }

  // 載入同義詞表
  async loadSynonyms() {
    if (this.synonymsCache.size > 0) return;
    
    try {
      const { data } = await this.dataLayer.supabase
        .from('faq_synonyms')
        .select('original_term, synonym, weight');
      
      if (data) {
        data.forEach(row => {
          const key = row.original_term.toLowerCase();
          if (!this.synonymsCache.has(key)) {
            this.synonymsCache.set(key, []);
          }
          this.synonymsCache.get(key).push({
            synonym: row.synonym.toLowerCase(),
            weight: row.weight
          });
        });
        console.log(\`[同義詞載入] 載入 \${data.length} 個同義詞對\`);
      }
    } catch (error) {
      console.warn('[同義詞載入] 載入失敗:', error.message);
    }
  }

  // 中文斷詞 + 同義詞匹配
  async enhancedFuzzyMatch(userQuestion, threshold = 0.6) {
    await this.loadSynonyms();
    
    const questionLower = userQuestion.toLowerCase();
    const questionWords = this.tokenizeChinese(questionLower);
    
    // 擴展問題詞彙（包含同義詞）
    const expandedWords = new Set(questionWords);
    for (const word of questionWords) {
      const synonyms = this.synonymsCache.get(word);
      if (synonyms) {
        synonyms.forEach(syn => {
          if (syn.weight >= 0.7) {
            expandedWords.add(syn.synonym);
          }
        });
      }
    }
    
    console.log(\`[FAQ增強] 原始詞彙: \${questionWords.join(', ')}\`);
    console.log(\`[FAQ增強] 擴展詞彙: \${Array.from(expandedWords).join(', ')}\`);

    // 獲取所有 FAQ
    const faqs = await this.dataLayer.getAllFAQs();
    if (!faqs || faqs.length === 0) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const faq of faqs) {
      const faqWords = this.tokenizeChinese(faq.question.toLowerCase());
      const score = this.calculateEnhancedSimilarity(
        Array.from(expandedWords), 
        faqWords, 
        questionLower, 
        faq.question.toLowerCase()
      );

      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = { ...faq, matchScore: score, matchType: 'enhanced_fuzzy' };
      }
    }

    if (bestMatch) {
      console.log(\`[FAQ增強] 最佳匹配: \${bestMatch.question} (分數: \${bestScore.toFixed(3)})\`);
    }

    return bestMatch;
  }

  // 中文斷詞（簡化版）
  tokenizeChinese(text) {
    // 簡化的中文斷詞，實際應用中可以使用更專業的斷詞庫
    const words = [];
    
    // 移除標點符號
    const cleanText = text.replace(/[，。！？、；：""''（）【】]/g, ' ');
    
    // 按空格分割
    const spaceWords = cleanText.split(/\\s+/).filter(w => w.length > 0);
    
    // 添加完整詞彙
    words.push(...spaceWords);
    
    // 添加子詞彙（2-4 字符）
    spaceWords.forEach(word => {
      if (word.length >= 2) {
        for (let i = 0; i <= word.length - 2; i++) {
          for (let j = 2; j <= Math.min(4, word.length - i); j++) {
            const subword = word.substring(i, i + j);
            if (subword.length >= 2) {
              words.push(subword);
            }
          }
        }
      }
    });
    
    return [...new Set(words)]; // 去重
  }

  // 增強的相似度計算
  calculateEnhancedSimilarity(questionWords, faqWords, originalQuestion, originalFAQ) {
    let score = 0;
    
    // 1. 詞彙匹配分數 (40%)
    const wordMatches = questionWords.filter(word => 
      faqWords.some(faqWord => 
        faqWord.includes(word) || word.includes(faqWord)
      )
    ).length;
    const wordScore = wordMatches / Math.max(questionWords.length, faqWords.length) * 0.4;
    
    // 2. 完整句子相似度 (30%)
    const sentenceScore = this.calculateLevenshteinSimilarity(originalQuestion, originalFAQ) * 0.3;
    
    // 3. 關鍵詞權重 (30%)
    const keywords = ['停車', '餐廳', '推薦', '多少', '哪裡', '費用', '時間', '地址'];
    const keywordMatches = keywords.filter(keyword => 
      originalQuestion.includes(keyword) && originalFAQ.includes(keyword)
    ).length;
    const keywordScore = keywordMatches / keywords.length * 0.3;
    
    score = wordScore + sentenceScore + keywordScore;
    
    console.log(\`[FAQ增強] 相似度計算: 詞彙(\${wordScore.toFixed(3)}) + 句子(\${sentenceScore.toFixed(3)}) + 關鍵詞(\${keywordScore.toFixed(3)}) = \${score.toFixed(3)}\`);
    
    return score;
  }

  // Levenshtein 距離計算
  calculateLevenshteinSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen;
  }
}
`;

console.log('🚀 FAQ 模糊比對增強實現');
console.log('=' .repeat(50));
console.log('');
console.log('✅ 增強功能：');
console.log('- 中文斷詞處理');
console.log('- 同義詞表匹配');
console.log('- 多維度相似度計算');
console.log('- 關鍵詞權重加成');
console.log('');
console.log('📊 相似度計算：');
console.log('- 詞彙匹配：40%');
console.log('- 句子相似度：30%');
console.log('- 關鍵詞權重：30%');
console.log('');
console.log('🔧 同義詞支援：');
console.log('- 「停車費」≈「收費」、「價錢」');
console.log('- 「餐廳」≈「美食」、「餐飲」');
console.log('- 「推薦」≈「介紹」、「建議」');
console.log('- 「附近」≈「周邊」、「旁邊」');
console.log('');
console.log('📝 需要將此邏輯整合到 Edge Function 中');
