/**
 * 增強版美食識別邏輯
 * 支援完整的子標籤系統
 */

// ===== 料理類型定義 =====
interface CuisineType {
  name: string
  keywords: string[]
  synonyms: string[]
  weight: number
}

// ===== 料理類型配置 =====
const CUISINE_TYPES: CuisineType[] = [
  {
    name: '日式料理',
    keywords: ['日式', '日料', '壽司', '拉麵', '和食', '天婦羅', '居酒屋', '燒肉', '丼飯', '日'],
    synonyms: ['日本料理', '和風', '日式餐廳'],
    weight: 1.0
  },
  {
    name: '韓式料理', 
    keywords: ['韓式', '韓料', '烤肉', '泡菜', '石鍋', '韓', '韓國'],
    synonyms: ['韓國料理', '韓風'],
    weight: 1.0
  },
  {
    name: '泰式料理',
    keywords: ['泰式', '泰料', '冬陰功', '綠咖喱', '泰'],
    synonyms: ['泰國料理', '泰風'],
    weight: 1.0
  },
  {
    name: '義式料理',
    keywords: ['義式', '義大利', '披薩', '義大利麵', '義'],
    synonyms: ['義大利料理', '義風'],
    weight: 1.0
  },
  {
    name: '中式料理',
    keywords: ['中式', '火鍋', '川菜', '台菜', '中'],
    synonyms: ['中華料理', '中餐'],
    weight: 1.0
  },
  {
    name: '素食',
    keywords: ['素食', '蔬食', '素食餐廳', '蔬食餐廳'],
    synonyms: ['素食主義', '蔬食主義'],
    weight: 1.0
  },
  {
    name: '早餐',
    keywords: ['早餐', '早餐店', '早餐推薦'],
    synonyms: ['早點', '晨食'],
    weight: 1.0
  },
  {
    name: '午餐',
    keywords: ['午餐', '午餐推薦', '中午吃什麼'],
    synonyms: ['午膳'],
    weight: 1.0
  },
  {
    name: '晚餐',
    keywords: ['晚餐', '晚餐推薦', '晚上吃什麼'],
    synonyms: ['晚膳'],
    weight: 1.0
  },
  {
    name: '宵夜',
    keywords: ['宵夜', '宵夜推薦', '有宵夜嗎'],
    synonyms: ['夜宵', '深夜食堂'],
    weight: 1.0
  }
]

// ===== 增強版美食識別類 =====
class EnhancedFoodDetector {
  
  /**
   * 從用戶訊息檢測料理類型
   */
  static detectCuisineFromMessage(message: string): string | null {
    const messageLower = message.toLowerCase()
    
    // 按權重排序檢查
    const sortedCuisines = CUISINE_TYPES.sort((a, b) => b.weight - a.weight)
    
    for (const cuisine of sortedCuisines) {
      // 檢查關鍵字
      for (const keyword of cuisine.keywords) {
        if (messageLower.includes(keyword.toLowerCase())) {
          return cuisine.name
        }
      }
      
      // 檢查同義詞
      for (const synonym of cuisine.synonyms) {
        if (messageLower.includes(synonym.toLowerCase())) {
          return cuisine.name
        }
      }
    }
    
    return null
  }
  
  /**
   * 檢測商家是否匹配特定料理類型
   */
  static matchStoreToCuisine(store: any, cuisineType: string): boolean {
    if (!store) return false
    
    const storeName = (store.store_name || '').toLowerCase()
    const category = (store.category || '').toLowerCase()
    const features = (store.features || '').toLowerCase()
    
    // 找到對應的料理類型配置
    const cuisineConfig = CUISINE_TYPES.find(c => c.name === cuisineType)
    if (!cuisineConfig) return false
    
    const searchText = `${storeName} ${category} ${features}`
    
    // 檢查關鍵字匹配
    for (const keyword of cuisineConfig.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return true
      }
    }
    
    // 檢查同義詞匹配
    for (const synonym of cuisineConfig.synonyms) {
      if (searchText.includes(synonym.toLowerCase())) {
        return true
      }
    }
    
    return false
  }
  
  /**
   * 為商家自動檢測所有可能的料理類型
   */
  static detectAllCuisineTypes(store: any): string[] {
    if (!store) return []
    
    const detectedCuisines: string[] = []
    
    for (const cuisine of CUISINE_TYPES) {
      if (this.matchStoreToCuisine(store, cuisine.name)) {
        detectedCuisines.push(cuisine.name)
      }
    }
    
    return detectedCuisines
  }
  
  /**
   * 獲取料理類型的詳細信息
   */
  static getCuisineInfo(cuisineType: string): CuisineType | null {
    return CUISINE_TYPES.find(c => c.name === cuisineType) || null
  }
  
  /**
   * 獲取所有支援的料理類型
   */
  static getAllSupportedCuisines(): string[] {
    return CUISINE_TYPES.map(c => c.name)
  }
  
  /**
   * 計算商家與料理類型的匹配度
   */
  static calculateMatchScore(store: any, cuisineType: string): number {
    if (!this.matchStoreToCuisine(store, cuisineType)) {
      return 0
    }
    
    const cuisineConfig = CUISINE_TYPES.find(c => c.name === cuisineType)
    if (!cuisineConfig) return 0
    
    let score = 0
    const storeName = (store.store_name || '').toLowerCase()
    const category = (store.category || '').toLowerCase()
    const features = (store.features || '').toLowerCase()
    const searchText = `${storeName} ${category} ${features}`
    
    // 計算匹配分數
    for (const keyword of cuisineConfig.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        score += cuisineConfig.weight
      }
    }
    
    for (const synonym of cuisineConfig.synonyms) {
      if (searchText.includes(synonym.toLowerCase())) {
        score += cuisineConfig.weight * 0.8 // 同義詞權重稍低
      }
    }
    
    return Math.min(score, 1.0) // 最大分數為 1.0
  }
}

// ===== 使用範例 =====
export const exampleUsage = {
  // 檢測用戶訊息中的料理類型
  detectFromMessage: () => {
    const message1 = "我想吃日料"
    const message2 = "推薦韓式餐廳"
    const message3 = "有什麼泰式料理嗎？"
    
    console.log(EnhancedFoodDetector.detectCuisineFromMessage(message1)) // "日式料理"
    console.log(EnhancedFoodDetector.detectCuisineFromMessage(message2)) // "韓式料理"
    console.log(EnhancedFoodDetector.detectCuisineFromMessage(message3)) // "泰式料理"
  },
  
  // 檢測商家匹配
  matchStore: () => {
    const store = {
      store_name: "櫻花壽司店",
      category: "餐飲美食",
      features: "專業日式料理，新鮮壽司"
    }
    
    console.log(EnhancedFoodDetector.matchStoreToCuisine(store, "日式料理")) // true
    console.log(EnhancedFoodDetector.matchStoreToCuisine(store, "韓式料理")) // false
    console.log(EnhancedFoodDetector.detectAllCuisineTypes(store)) // ["日式料理"]
  }
}

export { EnhancedFoodDetector, CUISINE_TYPES }
