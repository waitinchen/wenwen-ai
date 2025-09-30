/**
 * 語意理解層模組 - 意圖分類與語系偵測
 * 負責：關鍵詞匹配、語義推理、語系偵測、追問檢測
 */

export interface IntentResult {
  primary: string;
  confidence: number;
  keywords: string[];
  language: string;
  isFollowUp: boolean;
}

export class IntentClassifier {
  // 意圖分類模式定義
  private static readonly INTENT_PATTERNS = {
    FOOD: [
      '美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝', '食物', '菜', '飯', '麵',
      '火鍋', '燒烤', '日式', '中式', '西式', '韓式', '泰式', '早餐', '午餐', '晚餐',
      '便當', '咖啡', '茶', '甜點', '蛋糕', '麵包', '包子', '餃子', '湯', '湯品',
      '推薦餐廳', '哪裡吃', '好吃', '美味', '用餐', '聚餐'
    ],
    ENGLISH_LEARNING: [
      '美語', '英語', '英文', '學美語', '學英語', '英文學習', '語言學習', '補習',
      '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦',
      '英文班', '美語班', '語言班', '學習英文', '學英文', '英文課程', '美語課程',
      '語言課程', '英文補習', '美語補習', '英文教學', '美語教學'
    ],
    PARKING: [
      '停車', '停車場', '車位', '停車位', '停車費', '停車場位置', '哪裡停車',
      '停車場營業時間', '停車場收費', '免費停車', '付費停車', '停車場推薦',
      '停車場資訊', '停車場地址', '停車場電話'
    ],
    SHOPPING: [
      '購物', '買', '商店', '超市', '便利商店', '7-11', '全家', '萊爾富',
      '購物中心', '商場', '賣場', '百貨', '服飾', '衣服', '鞋子', '包包',
      '購物推薦', '哪裡買', '商店推薦', '購物地點'
    ],
    BEAUTY: [
      '美容', '美髮', '理髮', '剪髮', '洗髮', '燙髮', '染髮', '造型', '化妝',
      '美甲', '指甲', 'spa', '按摩', '護膚', '保養', '美容院', '美髮店',
      '美容推薦', '美髮推薦', '造型推薦'
    ],
    MEDICAL: [
      '醫院', '診所', '醫生', '看醫生', '看病', '掛號', '急診', '藥局', '藥房',
      '買藥', '處方籤', '健康檢查', '體檢', '醫療', '保健', '醫療推薦',
      '診所推薦', '醫院推薦', '藥局推薦'
    ],
    GENERAL: [
      '推薦', '介紹', '有什麼', '哪裡有', '附近', '文山特區', '鳳山', '高雄',
      '好玩', '好去處', '景點', '地方', '店', '商家', '服務'
    ]
  };

  // 語系偵測模式
  private static readonly LANGUAGE_PATTERNS = {
    CHINESE: [
      '中文', '華語', '國語', '台語', '閩南語', '客家話'
    ],
    ENGLISH: [
      'english', 'english learning', 'english class', 'english course',
      'english teacher', 'english school', 'english study'
    ],
    JAPANESE: [
      '日本語', '日語', 'にほんご', 'nihongo', 'japanese'
    ]
  };

  // 追問模式檢測
  private static readonly FOLLOW_UP_PATTERNS = [
    '還有其他', '更多', '其他選擇', '還有嗎', '其他', '另外', '還有什麼',
    '除了', '之外', '別的', '其他推薦', '還有推薦', '再推薦', '補充',
    '還有什麼選擇', '其他選項', '還有哪些', '還能推薦'
  ];

  /**
   * 主要意圖分類方法
   */
  async classifyIntent(message: string): Promise<IntentResult> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // 語系偵測
    const language = this.detectLanguage(normalizedMessage);
    
    // 追問檢測
    const isFollowUp = this.detectFollowUp(normalizedMessage);
    
    // 意圖分類
    const intentClassification = this.classifyByPatterns(normalizedMessage);
    
    return {
      primary: intentClassification.intent,
      confidence: intentClassification.confidence,
      keywords: intentClassification.keywords,
      language,
      isFollowUp
    };
  }

  /**
   * 語系偵測
   */
  private detectLanguage(message: string): string {
    // 檢查英文模式
    for (const pattern of IntentClassifier.LANGUAGE_PATTERNS.ENGLISH) {
      if (message.includes(pattern)) {
        return 'ENGLISH';
      }
    }
    
    // 檢查日文模式
    for (const pattern of IntentClassifier.LANGUAGE_PATTERNS.JAPANESE) {
      if (message.includes(pattern)) {
        return 'JAPANESE';
      }
    }
    
    // 檢查中文模式
    for (const pattern of IntentClassifier.LANGUAGE_PATTERNS.CHINESE) {
      if (message.includes(pattern)) {
        return 'CHINESE';
      }
    }
    
    // 預設為中文（繁體）
    return 'CHINESE_TRADITIONAL';
  }

  /**
   * 追問檢測
   */
  private detectFollowUp(message: string): boolean {
    return IntentClassifier.FOLLOW_UP_PATTERNS.some(pattern => 
      message.includes(pattern.toLowerCase())
    );
  }

  /**
   * 基於模式的意圖分類
   */
  private classifyByPatterns(message: string): {
    intent: string;
    confidence: number;
    keywords: string[];
  } {
    let maxScore = 0;
    let primaryIntent = 'GENERAL';
    let matchedKeywords: string[] = [];

    // 計算每個意圖的匹配分數
    for (const [intent, patterns] of Object.entries(IntentClassifier.INTENT_PATTERNS)) {
      const matched = patterns.filter(pattern => 
        message.includes(pattern.toLowerCase())
      );
      
      if (matched.length > 0) {
        // 計算匹配分數：匹配數量 / 總模式數量
        const score = matched.length / patterns.length;
        
        // 考慮關鍵字長度權重（長關鍵字權重更高）
        const weightedScore = matched.reduce((sum, keyword) => {
          return sum + (keyword.length / 10); // 長度權重
        }, score);
        
        if (weightedScore > maxScore) {
          maxScore = weightedScore;
          primaryIntent = intent;
          matchedKeywords = matched;
        }
      }
    }

    // 特殊邏輯：英語學習意圖的強化檢測
    if (this.isEnglishLearningIntent(message, matchedKeywords)) {
      return {
        intent: 'ENGLISH_LEARNING',
        confidence: Math.max(maxScore, 0.8),
        keywords: matchedKeywords
      };
    }

    // 特殊邏輯：美食意圖的強化檢測
    if (this.isFoodIntent(message, matchedKeywords)) {
      return {
        intent: 'FOOD',
        confidence: Math.max(maxScore, 0.7),
        keywords: matchedKeywords
      };
    }

    return {
      intent: primaryIntent,
      confidence: maxScore,
      keywords: matchedKeywords
    };
  }

  /**
   * 英語學習意圖的強化檢測
   */
  private isEnglishLearningIntent(message: string, keywords: string[]): boolean {
    const englishKeywords = ['英語', '美語', '英文', '學英語', '學美語'];
    const hasEnglishKeyword = englishKeywords.some(keyword => 
      message.includes(keyword)
    );
    
    // 排除美食相關詞彙
    const foodKeywords = ['美食', '餐廳', '小吃', '料理', '餐飲'];
    const hasFoodKeyword = foodKeywords.some(keyword => 
      message.includes(keyword)
    );
    
    return hasEnglishKeyword && !hasFoodKeyword;
  }

  /**
   * 美食意圖的強化檢測
   */
  private isFoodIntent(message: string, keywords: string[]): boolean {
    const foodKeywords = ['美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝'];
    const hasFoodKeyword = foodKeywords.some(keyword => 
      message.includes(keyword)
    );
    
    // 排除英語學習相關詞彙
    const englishKeywords = ['英語', '美語', '英文', '學英語', '學美語'];
    const hasEnglishKeyword = englishKeywords.some(keyword => 
      message.includes(keyword)
    );
    
    return hasFoodKeyword && !hasEnglishKeyword;
  }

  /**
   * 獲取意圖的中文描述
   */
  getIntentDescription(intent: string): string {
    const descriptions = {
      FOOD: '美食推薦',
      ENGLISH_LEARNING: '英語學習',
      PARKING: '停車場查詢',
      SHOPPING: '購物推薦',
      BEAUTY: '美容美髮',
      MEDICAL: '醫療保健',
      GENERAL: '一般查詢'
    };
    
    return descriptions[intent] || '未知意圖';
  }

  /**
   * 獲取語系的中文描述
   */
  getLanguageDescription(language: string): string {
    const descriptions = {
      CHINESE_TRADITIONAL: '繁體中文',
      CHINESE: '簡體中文',
      ENGLISH: '英文',
      JAPANESE: '日文'
    };
    
    return descriptions[language] || '未知語系';
  }
}
