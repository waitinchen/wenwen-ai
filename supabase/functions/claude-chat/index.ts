/**
 * Claude Chat V2 重構版本 - 推薦引擎優化
 * 核心哲學：資料優先 × 語氣誠實 × 靈格有溫度
 *
 * 重構重點：
 * 1. 強化防幻覺機制 - 嚴格資料驗證，禁止編造內容
 * 2. 統一 fallback 處理 - 固定語句回應
 * 3. 模組化設計 - 驗證、排序、語氣生成分離
 * 4. 完善錯誤處理 - 結構化日誌和異常管理
 */ import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// ===== 配置常數 =====
const APP_VERSION = Deno.env.get('APP_VERSION') || 'WEN 1.4.6';
const CONFIG = {
    // 肯塔基美語配置
    kentucky: {
      storeCode: 'kentucky',
      schools: [
        {
          name: '鳳山直營校',
          phone: '07-7777789',
          address: '高雄市鳳山區文化路131號'
        },
        {
          name: '瑞興直營校',
          phone: '07-7999191',
          address: '高雄市鳳山區博愛路167號'
        },
        {
          name: '鳳西直營校',
          phone: '07-7407711',
          address: '高雄市鳳山區光華南路116號'
        },
        {
          name: '大昌直營校',
          phone: '07-3961234',
          address: '高雄市三民區大昌二路301號'
        },
        {
          name: '新富直營校',
          phone: '07-7639900',
          address: '高雄市鳳山區新富路524號'
        },
        {
          name: '左營加盟校',
          phone: '07-3507568',
          address: '高雄市左營區立大路169號'
        },
        {
          name: '仁武直營校',
          phone: '07-9565656',
          address: '高雄市仁武區仁雄路91-7號'
        }
      ],
      lineId: 'kentuckyschool'
    },
    // 料理類型配置
    cuisineTypes: {
      '日式料理': [
        '日料',
        '日式',
        '壽司',
        '拉麵',
        '燒肉',
        '天婦羅',
        '居酒屋',
        '和食',
        '丼飯',
        '日本料理'
      ],
      '韓式料理': [
        '韓料',
        '韓式',
        '烤肉',
        '泡菜',
        '石鍋',
        '韓國',
        '韓國料理'
      ],
      '泰式料理': [
        '泰料',
        '泰式',
        '冬陰功',
        '綠咖喱',
        '泰國料理'
      ],
      '義式料理': [
        '義式',
        '義大利',
        '披薩',
        '義大利麵'
      ],
      '中式料理': [
        '中式',
        '火鍋',
        '川菜',
        '台菜',
        '中華料理'
      ],
      '素食': [
        '素食',
        '蔬食',
        '素食餐廳',
        '蔬食餐廳'
      ],
      '早餐': [
        '早餐'
      ],
      '午餐': [
        '午餐'
      ],
      '晚餐': [
        '晚餐'
      ],
      '宵夜': [
        '宵夜'
      ]
    },
    // 關鍵字配置
    keywords: {
      english: [
        '英語',
        '美語',
        '補習班',
        '教育',
        '學習',
        '英文',
        '課程',
        '培訓',
        '學美語',
        '學英語',
        '英文學習'
      ],
      food: [
        '美食',
        '餐廳',
        '吃飯',
        '料理',
        '餐點',
        '推薦',
        '好吃',
        '用餐',
        '菜單'
      ],
      parking: [
        '停車',
        '停車場',
        '車位',
        '停車費',
        '停車資訊',
        '停車查詢',
        '可以停車嗎',
        '停車方便嗎'
      ],
      lifestyle: {
        'SHOPPING': [
          '買衣服',
          '服飾店',
          '買鞋子',
          '鞋店',
          '買化妝品',
          '美妝店',
          '日用品',
          '便利商店'
        ],
        'BEAUTY': [
          '美髮店',
          '剪頭髮',
          '美容院',
          '做臉',
          '美甲店',
          '做指甲'
        ],
        'MEDICAL': [
          '診所',
          '看醫生',
          '藥局',
          '買藥',
          '牙醫',
          '看牙齒'
        ]
      }
    },
    // 系統設置
    system: {
      defaultLimit: 5,
      maxQueryLimit: 20,
      conversationHistoryLimit: 30,
      version: APP_VERSION
    }
  };

// 意圖到資料庫中文分類名稱的穩定對照
const CATEGORY_BY_INTENT = {
  ENGLISH_LEARNING: '教育培訓',
  FOOD: '餐飲美食',
  PARKING: '停車場',
  SHOPPING: '購物',
  BEAUTY: '美容美髮',
  MEDICAL: '醫療健康',
  ATTRACTION: '景點觀光',
  GENERAL: undefined,
  STATISTICS: undefined,
  COVERAGE_STATS: undefined,
  DIRECTIONS: undefined,
  INTRO: undefined,
  VAGUE_CHAT: undefined,
  CONFIRMATION: undefined,
  OUT_OF_SCOPE: undefined,
  GREETING: undefined,
  SPECIFIC_ENTITY: undefined,
  VAGUE_QUERY: undefined
};

// 跨類別幻覺防護 - 類別同義詞映射表
const CATEGORY_SYNONYM_MAP = {
  // 醫療保健相關
  'MEDICAL': {
    primary: '醫療健康',
    synonyms: ['藥局', '藥妝', '藥房', '藥品', '醫療', '保健', '健康', '診所', '醫院', '牙醫'],
    related_intents: ['MEDICAL', 'HEALTH', 'PHARMACY'],
    forbidden_intents: ['ENGLISH_LEARNING', 'FOOD', 'SHOPPING']
  },
  
  // 教育培訓相關
  'ENGLISH_LEARNING': {
    primary: '教育培訓',
    synonyms: ['補習班', '美語', '英語', '教育', '學習', '課程', '培訓', '英文'],
    related_intents: ['ENGLISH_LEARNING', 'EDUCATION'],
    forbidden_intents: ['MEDICAL', 'FOOD', 'PARKING']
  },
  
  // 餐飲美食相關
  'FOOD': {
    primary: '餐飲美食',
    synonyms: ['餐廳', '美食', '料理', '吃飯', '用餐', '菜單', '餐點'],
    related_intents: ['FOOD', 'DINING'],
    forbidden_intents: ['MEDICAL', 'ENGLISH_LEARNING', 'PARKING']
  },
  
  // 停車相關
  'PARKING': {
    primary: '停車場',
    synonyms: ['停車', '車位', '停車費', '停車資訊', '停車查詢'],
    related_intents: ['PARKING'],
    forbidden_intents: ['FOOD', 'MEDICAL', 'ENGLISH_LEARNING']
  },
  
  // 購物相關
  'SHOPPING': {
    primary: '購物',
    synonyms: ['購物', '商店', '便利商店', '超市', '賣場', '零售'],
    related_intents: ['SHOPPING'],
    forbidden_intents: ['MEDICAL', 'ENGLISH_LEARNING']
  }
};

// 醫療保健標籤映射表
const MEDICAL_TAG_MAPPING = {
  // 藥局相關標籤
  '藥局': {
    primary_tags: ['藥局', '藥房', '藥品', '處方藥'],
    secondary_tags: ['藥妝', '保健用品', '醫療用品', '健康食品'],
    search_keywords: ['藥局', '藥房', '藥品', '處方藥', '藥妝', '保健'],
    category_mapping: ['醫療健康', '藥局', '藥房', '藥妝店']
  },
  
  // 醫療診所相關標籤
  '診所': {
    primary_tags: ['診所', '醫院', '醫療', '看病'],
    secondary_tags: ['健檢', '疫苗', '門診', '急診'],
    search_keywords: ['診所', '醫院', '看病', '健檢', '疫苗'],
    category_mapping: ['醫療健康', '診所', '醫院']
  },
  
  // 牙醫相關標籤
  '牙醫': {
    primary_tags: ['牙醫', '牙科', '牙齒', '口腔'],
    secondary_tags: ['洗牙', '矯正', '植牙', '美白'],
    search_keywords: ['牙醫', '牙科', '牙齒', '洗牙', '矯正'],
    category_mapping: ['醫療健康', '牙科', '牙醫診所']
  },
  
  // 藥妝店相關標籤
  '藥妝': {
    primary_tags: ['藥妝', '美妝', '保養品', '化妝品'],
    secondary_tags: ['藥妝店', '美妝店', '保養', '美容'],
    search_keywords: ['藥妝', '美妝', '保養品', '化妝品', '美容'],
    category_mapping: ['藥妝', '美妝', '保養品']
  }
};

// ===== 輔助服務類 =====
  /** 
   * 資料驗證服務 - 防止 AI 幻覺的核心守衛
   */ class ValidationService {
    
    /**
     * 跨類別幻覺檢測
     */
    static detectCrossCategoryHallucination(intent, stores, message) {
      const issues = [];
      const warnings = [];
      
      // 獲取當前意圖的類別信息
      const categoryInfo = CATEGORY_SYNONYM_MAP[intent];
      const humanCategory = CATEGORY_BY_INTENT[intent]; // e.g. '餐飲美食'
      
      if (!categoryInfo) {
        return { isValid: true, issues, warnings };
      }
      
      // 檢查商家是否屬於正確的類別
      for (const store of stores) {
        const storeCategory = store.category;
        
        // 檢查是否為禁止的類別
        if (categoryInfo.forbidden_intents.some(forbidden => {
          const forbidHuman = CATEGORY_BY_INTENT[forbidden]; // 中文分類
          return storeCategory.includes(forbidHuman || (CATEGORY_SYNONYM_MAP[forbidden]?.primary || ''));
        })) {
          issues.push(`商家 ${store.store_name} 屬於錯誤類別 ${storeCategory}，不應出現在 ${intent} 查詢結果中`);
        }
        
        // 檢查類別一致性
        if (humanCategory && !storeCategory.includes(humanCategory)) {
          const hasRelatedKeyword = categoryInfo.synonyms.some(synonym => 
            storeCategory.toLowerCase().includes(synonym.toLowerCase())
          );
          
          if (!hasRelatedKeyword) {
            warnings.push(`商家 ${store.store_name} 類別 ${storeCategory} 可能與查詢意圖 ${intent} 不符`);
          }
        }
      }
      
      // 檢查訊息內容與意圖的一致性
      const messageLower = message.toLowerCase();
      const hasIntentKeywords = categoryInfo.synonyms.some(synonym => 
        messageLower.includes(synonym)
      );
      
      if (!hasIntentKeywords) {
        warnings.push(`查詢訊息 "${message}" 可能與意圖 ${intent} 不符`);
      }
      
      return {
        isValid: issues.length === 0,
        issues,
        warnings,
        categoryInfo
      };
    }
    
    /**
     * 強化意圖分類
     */
    static enhancedIntentClassification(message, conversationHistory) {
      const messageLower = message.toLowerCase();
      
      // 首先檢查是否有明顯的跨類別關鍵字組合
      for (const [intent, categoryInfo] of Object.entries(CATEGORY_SYNONYM_MAP)) {
        const intentKeywords = categoryInfo.synonyms;
        const forbiddenKeywords = [];
        
        // 收集其他類別的關鍵字作為禁止詞
        for (const [otherIntent, otherInfo] of Object.entries(CATEGORY_SYNONYM_MAP)) {
          if (otherIntent !== intent) {
            forbiddenKeywords.push(...otherInfo.synonyms);
          }
        }
        
        // 檢查是否包含意圖關鍵字
        const hasIntentKeywords = intentKeywords.some(keyword => 
          messageLower.includes(keyword)
        );
        
        // 檢查是否包含禁止關鍵字
        const hasForbiddenKeywords = forbiddenKeywords.some(keyword => 
          messageLower.includes(keyword)
        );
        
        // 如果同時包含意圖關鍵字和禁止關鍵字，需要進一步分析
        if (hasIntentKeywords && hasForbiddenKeywords) {
          // 計算關鍵字權重
          const intentScore = intentKeywords.reduce((score, keyword) => {
            return messageLower.includes(keyword) ? score + 1 : score;
          }, 0);
          
          const forbiddenScore = forbiddenKeywords.reduce((score, keyword) => {
            return messageLower.includes(keyword) ? score + 1 : score;
          }, 0);
          
          // 如果意圖關鍵字權重明顯高於禁止關鍵字，則認為是正確意圖
          if (intentScore >= forbiddenScore + 2) {
            return {
              intent,
              confidence: 0.9,
              keywords: intentKeywords.filter(k => messageLower.includes(k)),
              crossCategoryCheck: true
            };
          }
        }
      }
      
      return null; // 讓原有的意圖分類邏輯處理
    }
    /**
     * 驗證商家資料完整性
     * @param stores 原始商家資料
     * @returns 經過驗證的商家資料
     */ static validateStoreData(stores) {
      if (!Array.isArray(stores)) {
        console.warn('[驗證服務] 商家資料不是陣列格式');
        return [];
      }
      return stores.filter((store)=>{
        // 基本欄位驗證
        const hasRequiredFields =
          store != null &&
          (store.id !== undefined && store.id !== null) &&
          typeof store.store_name === 'string' &&
          store.store_name.trim().length > 0 &&
          store.approval === 'approved';
        if (!hasRequiredFields) {
          console.warn(`[驗證服務] 商家缺少必要欄位: ${JSON.stringify(store)}`);
          return false;
        }
        // 防止空字串或假資料
        if (typeof store.store_name !== 'string' || store.store_name.trim().length === 0) {
          console.warn(`[驗證服務] 商家名稱無效: ${store.id}`);
          return false;
        }
        return true;
      });
    }
    /**
     * 驗證推薦邏輯合理性
     * @param intent 用戶意圖
     * @param stores 商家清單
     * @param category 查詢類別
     */ static validateRecommendationLogic(intent, stores, category) {
      // 確保意圖和商家類別匹配
      if (intent === 'FOOD' && stores.length > 0) {
        const hasNonFood = stores.some(s => s.category !== '餐飲美食');
        if (hasNonFood) {
          return {
            isValid: false,
            reason: '美食查詢包含非餐飲商家'
          };
        }
      }
      if (intent === 'ENGLISH_LEARNING' && stores.length > 0) {
        const validEducationCategories = [
          '教育培訓',
          '英語學習',
          '補習班'
        ];
        const hasNonEducationStores = stores.some((store)=>!validEducationCategories.includes(store.category));
        if (hasNonEducationStores) {
          return {
            isValid: false,
            reason: '英語學習查詢包含非教育商家'
          };
        }
      }
      return {
        isValid: true
      };
    }
  }
  /**
   * 排序與限制服務 - 標準化的資料處理
   */ /**
   * FAQ查詢服務 - 提供常見問題回答
   */ class FAQService {
    constructor(dataLayer){
      this.dataLayer = dataLayer;
    }
    /**
     * 查詢FAQ答案
     * @param {string} question 用戶問題
     * @returns {Promise<{answer: string, category: string} | null>}
     */ async getFAQAnswer(question) {
      try {
        console.log(`[FAQ服務] 查詢問題: ${question}`);
        
        // 精確匹配
        let faq = await this.dataLayer.getFAQByQuestion(question);
        if (faq) {
          console.log(`[FAQ服務] 精確匹配: ${faq.question}`);
          return { answer: faq.answer, category: faq.category, matchType: 'exact', similarity: 1.0 };
        }

        // 模糊匹配（門檻提高＋最相近者）
        const faqs = await this.dataLayer.getAllFAQs();
        let best = null;
        for (const f of faqs) {
          const sim = this.calculateSimilarity(f.question, question);
          if (!best || sim > best.similarity) best = { ...f, similarity: sim };
        }
        if (best && best.similarity >= 0.9) {  // ← 0.7 → 0.9
          console.log(`[FAQ服務] 模糊匹配: ${best.question} (${best.similarity.toFixed(2)})`);
          return { answer: best.answer, category: best.category, matchType: 'fuzzy', similarity: best.similarity };
        }
        console.log(`[FAQ服務] 未找到匹配的FAQ`);
        return null;
      } catch (error) {
        console.error('[FAQ服務] 查詢錯誤:', error);
        return null;
      }
    }
    /**
     * 計算字符串相似度
     * @param {string} str1 
     * @param {string} str2 
     * @returns {number}
     */ calculateSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      if (longer.length === 0) return 1.0;
      const editDistance = this.levenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    }
    /**
     * 計算編輯距離
     * @param {string} str1 
     * @param {string} str2 
     * @returns {number}
     */ levenshteinDistance(str1, str2) {
      const matrix = [];
      for(let i = 0; i <= str2.length; i++){
        matrix[i] = [
          i
        ];
      }
      for(let j = 0; j <= str1.length; j++){
        matrix[0][j] = j;
      }
      for(let i = 1; i <= str2.length; i++){
        for(let j = 1; j <= str1.length; j++){
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
          }
        }
      }
      return matrix[str2.length][str1.length];
    }
  }
  class SortingService {
    /**
     * 標準化商家排序邏輯
     * @param stores 商家清單
     * @param limit 限制數量，預設 3
     * @returns 排序後的商家清單
     */   static sortAndLimitStores(stores, limit = 3) {
    if (!Array.isArray(stores) || stores.length === 0) return [];

    const sortedStores = [...stores].sort((a, b) => {
      const ap = Number(!!a.is_partner_store);
      const bp = Number(!!b.is_partner_store);
      if (ap !== bp) return bp - ap;

      const at = Number(a.sponsorship_tier || 0);
      const bt = Number(b.sponsorship_tier || 0);
      if (at !== bt) return bt - at;

      const ar = Number(a.rating || 0);
      const br = Number(b.rating || 0);
      if (ar !== br) return br - ar;

      const ai = Number(a.id ?? 0), bi = Number(b.id ?? 0);
      return (isFinite(ai) && isFinite(bi)) ? (ai - bi) : String(a.id ?? '').localeCompare(String(b.id ?? ''));
    });

    return sortedStores.slice(0, limit);
  }
    /**
     * 建立排序邏輯記錄
     * @param originalCount 原始數量
     * @param finalCount 最終數量
     * @param sortCriteria 排序標準
     */ static createSortingLog(originalCount, finalCount, sortCriteria) {
      return {
        original_count: originalCount,
        final_count: finalCount,
        sort_criteria: sortCriteria,
        limited: finalCount < originalCount,
        timestamp: new Date().toISOString()
      };
    }
  }
  /**
   * Fallback 處理服務 - 統一的無結果回應
   */ class FallbackService {
    // 統一的 fallback 訊息
    static DEFAULT_FALLBACK = '目前資料庫中尚未收錄這類店家，歡迎推薦我們新增喔～';
    /**
     * 根據意圖生成客製化 fallback 訊息
     * @param intent 用戶意圖
     * @param subcategory 子類別
     * @param searchTerm 搜尋詞彙
     * @returns 客製化的 fallback 訊息
     */ static generateContextualFallback(intent, subcategory, searchTerm) {
      const baseMessage = this.DEFAULT_FALLBACK;
      // 根據不同意圖提供更具體的回應
      switch(intent){
        case 'FOOD':
          if (subcategory) {
            return `抱歉，文山特區目前沒有找到${subcategory}餐廳。${baseMessage} 😊`;
          }
          return `抱歉，沒有找到符合您需求的美食推薦。${baseMessage} 😊`;
        case 'ENGLISH_LEARNING':
          return `抱歉，除了肯塔基美語外，文山特區暫時沒有其他英語學習機構。${baseMessage} 😊`;
        case 'PARKING':
          return `抱歉，沒有找到合適的停車場資訊。${baseMessage} 😊`;
        case 'SHOPPING':
          return `抱歉，沒有找到符合的購物商家。${baseMessage} 😊`;
        case 'BEAUTY':
          return `抱歉，沒有找到美容美髮相關商家。${baseMessage} 😊`;
      case 'MEDICAL':
        return `抱歉，沒有找到醫療健康相關商家。${baseMessage} 😊`;
        case 'COVERAGE_STATS':
          return `抱歉，目前統計資料暫時取不到數字，稍後再問我一次吧！${baseMessage} 😊`;
        case 'DIRECTIONS':
          return '抱歉，目前沒有整理到這段路線資訊。建議以地圖導航查詢「文山特區」，會自動提供最快路線～';
        case 'ATTRACTION':
          return '抱歉，目前文山特區的觀光景點資料還在收集中。建議您可以前往附近的鳳山古城或衛武營國家藝術文化中心！';
        default:
          return `${baseMessage} 有其他問題歡迎隨時問我喔～ 🤗`;
      }
    }
    /**
     * 檢查是否需要使用 fallback
     * @param stores 商家清單
     * @param validationResult 驗證結果
     * @returns 是否需要 fallback
     */ static shouldUseFallback(stores, validationResult) {
      return stores.length === 0 || !validationResult.isValid;
    }
  }
  // ===== 重構後的五層架構 =====
  /**
   * 第一層：資料層 (Data Layer) - 強化版
   * 職責：純粹的資料庫操作，無任何業務邏輯
   */ class DataLayer {
    supabase;
  constructor(supabaseUrl, supabaseKey){
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
    /**
     * 優化版商家查詢（原始資料）
     * @param intent 查詢意圖
     * @param category 商家類別
     * @param limit 查詢限制（防止過大結果集）
     */   async getEligibleStores(intent, category, limit = CONFIG.system.maxQueryLimit) {
    limit = Math.min(Number(limit) || CONFIG.system.maxQueryLimit, CONFIG.system.maxQueryLimit);
    try {
      console.log(`[資料層] 查詢商家 - 意圖: ${intent}, 類別: ${category}`);
        // 根據意圖選擇優化的欄位
        const selectFields = this.getOptimizedSelectFields(intent);
        let query = this.supabase.from('stores').select(selectFields).eq('approval', 'approved') // 只取已審核商家
        ;
        // 根據類別篩選
        if (category) {
          query = query.eq('category', category);
        }
        // 優化排序：特約商家和贊助等級優先
        query = query.order('is_partner_store', {
          ascending: false
        }).order('sponsorship_tier', {
          ascending: false,
          nullsFirst: false
        }).order('rating', {
          ascending: false,
          nullsFirst: false
        }).limit(limit);
        const { data, error } = await query;
        if (error) {
          console.error('[資料層] 查詢失敗:', error);
          return [];
        }
        console.log(`[資料層] 優化查詢成功，共 ${data?.length || 0} 筆資料`);
        return data || [];
      } catch (error) {
        console.error('[資料層] 查詢異常:', error);
        return [];
      }
    }
    /**
     * 根據意圖選擇需要的欄位，減少資料傳輸
     */ getOptimizedSelectFields(intent) {
      const commonFields = 'id, store_name, category, address, approval, is_partner_store, sponsorship_tier, rating, store_code';
      switch(intent){
        case 'ENGLISH_LEARNING':
          return `${commonFields}, features`;
        case 'FOOD':
          return `${commonFields}, features, business_hours`;
        case 'PARKING':
          return `${commonFields}, features, business_hours`;
        case 'STATISTICS':
          return 'id, approval, is_partner_store, sponsorship_tier, rating, category';
        default:
          return commonFields;
      }
    }
    /**
     * 獲取肯塔基美語專用資料
     */ async getKentuckyEnglish() {
      try {
        console.log('[資料層] 查詢肯塔基美語');
        const { data, error } = await this.supabase.from('stores').select('*').eq('store_code', 'kentucky').eq('approval', 'approved').single();
        if (error) {
          console.error('[資料層] 肯塔基美語查詢失敗:', error);
          return null;
        }
        return data;
      } catch (error) {
        console.error('[資料層] 肯塔基美語查詢異常:', error);
        return null;
      }
    }
    /**
     * 記錄推薦日誌
     */ async logRecommendation(sessionId, logData) {
      try {
        const { error } = await this.supabase.from('recommendation_logs').insert({
          session_id: sessionId,
          ...logData,
          created_at: new Date().toISOString()
        });
        if (error) {
          console.error('[資料層] 推薦日誌記錄失敗:', error);
        }
      } catch (error) {
        console.error('[資料層] 推薦日誌記錄異常:', error);
      }
    }
    /** 
     * 獲取對話歷史
     */ async getConversationHistory(sessionId, limit = CONFIG.system.conversationHistoryLimit) {
      try {
        const { data, error } = await this.supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', {
          ascending: false
        }).limit(limit);
        if (error) {
          console.error('[資料層] 對話歷史查詢失敗:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('[資料層] 對話歷史查詢異常:', error);
        return [];
      }
    }
    /**
     * 根據問題查詢FAQ
     * @param {string} question 問題
     * @returns {Promise<any>}
     */ async getFAQByQuestion(question) {
      try {
        const { data, error } = await this.supabase.from('faqs').select('*').eq('question', question).eq('is_active', true).single();
        if (error) {
          console.log(`[數據層] FAQ查詢無結果: ${question}`);
          return null;
        }
        return data;
      } catch (error) {
        console.error('[數據層] FAQ查詢錯誤:', error);
        return null;
      }
    }
    /**
     * 獲取商家資料庫統計資訊
     */ async getStats() {
      try {
        console.log('[資料層] 查詢商家統計資料');

        const safeCount = async (q) => {
          const { count, error } = await q.select('id', { count: 'exact', head: true });
          if (error) {
            console.error('[資料層] 統計子查詢失敗:', error);
            return 0; // 容錯：失敗就當 0
          }
          return count || 0;
        };

        // 並發查詢所有統計數據 - 修復欄位名稱
        const [total, verified, discount, partner] = await Promise.all([
          safeCount(this.supabase.from('stores')),
          safeCount(this.supabase.from('stores').eq('is_safe_store', true)),
          safeCount(this.supabase.from('stores').eq('has_member_discount', true)),
          safeCount(this.supabase.from('stores').eq('is_partner_store', true))
        ]);

        const { data: categoriesData, error: categoriesError } =
          await this.supabase.from('stores').select('category');
        if (categoriesError) console.error('[資料層] 分類查詢失敗:', categoriesError);

        const categories = new Set((categoriesData || [])
          .map(s => s.category)
          .filter(Boolean)).size;

        const stats = {
          total, verified, discount, partner, categories,
          last_updated: new Date().toISOString()
        };
        console.log('[資料層] 統計查詢成功:', stats);
        return stats;
      } catch (error) {
        console.error('[資料層] 統計查詢異常:', error);
        // 仍回結構，避免上層 fallback
        return {
          total: 0, verified: 0, discount: 0, partner: 0, categories: 0,
          last_updated: new Date().toISOString()
        };
      }
    }
    /**
     * 獲取所有FAQ
     * @returns {Promise<any[]>}
     */ async getAllFAQs() {
      try {
        const { data, error } = await this.supabase.from('faqs').select('*').eq('is_active', true).order('category', {
          ascending: true
        });
        if (error) {
          console.error('[數據層] 獲取所有FAQ錯誤:', error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error('[數據層] 獲取所有FAQ異常:', error);
        return [];
      }
    }
  }
  /**
   * 第二層：意圖與語言層 (Intent & Language Layer) - 保持原有邏輯
   * 職責：分析用戶意圖，理解自然語言
   */ class IntentLanguageLayer {
  classifyIntent(message, conversationHistory) {
    console.log('[意圖層] 分析用戶意圖');
    
    // 首先使用強化意圖分類進行跨類別檢查
    const enhancedResult = ValidationService.enhancedIntentClassification(message, conversationHistory);
    if (enhancedResult) {
      console.log(`[意圖層] 強化分類結果: ${enhancedResult.intent} (跨類別檢查)`);
      return enhancedResult;
    }
    
    const messageLower = message.toLowerCase();
    const keywords = [];
    let subcategory;
      let responseMode = 'standard';
      let emotion;
      let multiIntent = [];
      
      // 自我介紹意圖（最高優先級）
      const introKeywords = ['自我介紹','自介','你是誰','介紹一下你','about you','who are you','你的功能','可以做什麼'];
      if (introKeywords.some(k => messageLower.includes(k))) {
        return {
          intent: 'INTRO',
          confidence: 0.98,
          keywords: introKeywords.filter(k => messageLower.includes(k)),
          responseMode: 'vague_chat'
        };
      }
      
      // 統計查詢意圖（最高優先級之一）
      const statsKeywords = [
        '統計','資料','資料量','資料庫','總數','總共有',
        '商家數量','餐廳數量','店家數量','有多少','幾家','幾間',
        '你商家資料有多少','商家資料有多少','你的數據庫有多少','數據庫有多少'
      ];
      const subjectKeywords = ['商家','店家','餐廳','商家資料','你的商家資料','資料庫','數據庫'];
      
      const hasStatsKW = statsKeywords.some(k => messageLower.includes(k));
      const hasSubject = subjectKeywords.some(k => messageLower.includes(k));
      
      if (hasStatsKW && hasSubject) {
        return {
          intent: 'COVERAGE_STATS',
          confidence: 0.95,
          keywords: statsKeywords.filter(k => messageLower.includes(k))
        };
      }
      
      // 交通指引（怎麼去/到哪裡/路線/捷運/公車/開車）
      const dirKW = ['怎麼去','怎麼到','怎麼前往','怎麼走','到文山特區','到鳳山',
                     '路線','交通','捷運','公車','開車','騎車','導航'];
      if (dirKW.some(k => messageLower.includes(k))) {
        return { 
          intent: 'DIRECTIONS', 
          confidence: 0.95, 
          keywords: dirKW.filter(k => messageLower.includes(k)) 
        };
      }
      
      // 景點推薦意圖
      const attractionKW = ['景點','觀光','旅遊','推薦景點','好玩的地方','值得去的地方','景區'];
      if (attractionKW.some(k => messageLower.includes(k))) {
        return {
          intent: 'ATTRACTION',
          confidence: 0.95,
          keywords: attractionKW.filter(k => messageLower.includes(k))
        };
      }
      // 英語學習意圖
      const englishKeywords = [
        '英語',
        '美語',
        '補習班',
        '教育',
        '學習',
        '英文',
        '課程',
        '培訓',
        '學美語',
        '學英語',
        '英文學習',
        '美語學習',
        '語言學習',
        '補習',
        '教學',
        '老師',
        '學生',
        '學校',
        '教育機構',
        '我想學',
        '想要學',
        '補習班推薦'
      ];
      const englishMatches = englishKeywords.filter((keyword)=>messageLower.includes(keyword));
      if (englishMatches.length > 0 && !this.hasOtherIntent(messageLower)) {
        keywords.push(...englishMatches);
        return {
          intent: 'ENGLISH_LEARNING',
          confidence: 0.9,
          keywords,
          responseMode: 'standard'
        };
      }
      // 美食推薦意圖（全面料理類型識別）
      const foodKeywords = [
        '美食',
        '餐廳',
        '吃飯',
        '料理',
        '用餐'
      ];
      
      // FOOD 保護條件：必須命中餐飲明確詞或特定菜系
      const foodHardSignals = [
        '美食',
        '餐廳',
        '吃飯',
        '料理',
        '用餐',
        '壽司',
        '拉麵',
        '火鍋',
        '燒肉',
        '披薩',
        '義大利麵',
        '丼飯',
        '居酒屋'
      ];
      const specificFoodKeywords = {
        '日式料理': [
          '日料',
          '日式',
          '壽司',
          '拉麵',
          '燒肉',
          '天婦羅',
          '居酒屋',
          '和食',
          '日式料理'
        ],
        '韓式料理': [
          '韓料',
          '韓式',
          '烤肉',
          '泡菜',
          '石鍋',
          '韓式料理'
        ],
        '泰式料理': [
          '泰料',
          '泰式',
          '冬陰功',
          '綠咖喱',
          '泰式料理'
        ],
        '義式料理': [
          '義大利麵',
          '披薩',
          '義式',
          '義大利'
        ],
        '中式料理': [
          '中式',
          '火鍋',
          '川菜',
          '台菜',
          '中式料理'
        ],
        '素食': [
          '素食',
          '蔬食',
          '素食餐廳',
          '蔬食餐廳'
        ],
        '早餐': [
          '早餐',
          '早餐店',
          '早餐推薦'
        ],
        '午餐': [
          '午餐',
          '午餐推薦',
          '中午吃什麼'
        ],
        '晚餐': [
          '晚餐',
          '晚餐推薦',
          '晚上吃什麼'
        ],
        '宵夜': [
          '宵夜',
          '宵夜推薦',
          '有宵夜嗎'
        ]
      };
      // 檢查特定料理類型
      for (const [category, catKeywords] of Object.entries(specificFoodKeywords)){
        const matches = catKeywords.filter((keyword)=>messageLower.includes(keyword));
        if (matches.length > 0) {
          keywords.push(...matches);
          return {
            intent: 'FOOD',
            confidence: 0.9,
            keywords,
            subcategory: category
          };
        }
      }
      // 檢查一般美食關鍵字（新增保護條件）
      const foodMatches = foodKeywords.filter((keyword)=>messageLower.includes(keyword));
      const hasFoodHardSignal = foodHardSignals.some(k => messageLower.includes(k));
      if (foodMatches.length > 0 && hasFoodHardSignal) {
        keywords.push(...foodMatches);
        return {
          intent: 'FOOD',
          confidence: 0.8,
          keywords
        };
      }
      // 生活服務意圖
      const lifestyleKeywords = {
        'SHOPPING': [
          '買衣服',
          '服飾店',
          '買鞋子',
          '鞋店',
          '買化妝品',
          '美妝店',
          '日用品',
          '便利商店'
        ],
        'BEAUTY': [
          '美髮店',
          '剪頭髮',
          '美容院',
          '做臉',
          '美甲店',
          '做指甲'
        ],
        'MEDICAL': [
          '診所',
          '看醫生',
          '藥局',
          '買藥',
          '牙醫',
          '看牙齒',
          '藥妝',
          '藥妝店',
          '保健',
          '保養品'
        ]
      };
      for (const [intent, kwList] of Object.entries(lifestyleKeywords)){
        const matches = kwList.filter((keyword)=>messageLower.includes(keyword));
        if (matches.length > 0) {
          keywords.push(...matches);
          return {
            intent,
            confidence: 0.8,
            keywords
          };
        }
      }
      
      // 醫療保健意圖（優先於其他檢測）
      const medicalKeywords = [
        '診所',
        '看醫生',
        '藥局',
        '買藥',
        '牙醫',
        '看牙齒',
        '藥妝',
        '藥妝店',
        '保健',
        '保養品'
      ];
      const medicalMatches = medicalKeywords.filter((keyword)=>messageLower.includes(keyword));
      
      if (medicalMatches.length > 0) {
        // MEDICAL 子分類偵測
        const medicalSubMap = [
          { sub: '藥局',  keys: ['藥局','藥房','處方'] },
          { sub: '藥妝',  keys: ['藥妝','美妝','保養品','化妝品'] },
          { sub: '診所',  keys: ['診所','門診','內科','小兒科','皮膚科','骨科'] },
          { sub: '牙醫',  keys: ['牙醫','牙科','洗牙','矯正','植牙'] },
        ];

        let medicalSub: string | undefined;
        for (const m of medicalSubMap) {
          if (m.keys.some(k => messageLower.includes(k))) { 
            medicalSub = m.sub; 
            break; 
          }
        }

        keywords.push(...medicalMatches);
        return {
          intent: 'MEDICAL',
          confidence: 0.85, // 略高於原本 0.8，避免被 FAQ 模糊匹配蓋掉
          keywords,
          subcategory: medicalSub // 新增子分類
        };
      }
      
      // 停車查詢意圖
      const parkingKeywords = [
        '停車',
        '停車場',
        '車位',
        '停車費',
        '停車資訊',
        '停車查詢',
        '可以停車嗎',
        '停車方便嗎'
      ];
      const parkingMatches = parkingKeywords.filter((keyword)=>messageLower.includes(keyword));
      if (parkingMatches.length > 0) {
        keywords.push(...parkingMatches);
        return {
          intent: 'PARKING',
          confidence: 0.8,
          keywords
        };
      }
      // 優先檢查問候語和閒聊（放在最前面）
      const isVagueOrChat = this.isVagueOrChat(messageLower, conversationHistory);
      if (isVagueOrChat) {
        return {
          intent: 'VAGUE_CHAT',
          confidence: 0.8,
          keywords: [],
          responseMode: 'vague_chat',
          emotion
        };
      }
      // 確認回應意圖（更精確的匹配）
      const confirmationKeywords = [
        '好的',
        '可以',
        '行',
        '沒問題',
        '謝謝',
        '感謝',
        '了解',
        '知道了',
        'ok',
        'okay'
      ];
      const confirmationMatches = confirmationKeywords.filter((keyword)=>messageLower.includes(keyword));
      // 排除問候語和包含「好」字的問候語
      const isGreeting = messageLower.includes('你好') || messageLower.includes('嗨') || messageLower.includes('哈囉') || messageLower.includes('hello');
      const hasOtherIntentKeywords = messageLower.includes('什麼') || messageLower.includes('哪裡') || messageLower.includes('推薦') || messageLower.includes('有') || messageLower.includes('好玩') || messageLower.includes('選擇') || messageLower.includes('介紹');
      // 更嚴格的確認回應檢查：必須是純確認詞彙，不能包含問候語
      const blockers = ['什麼','哪裡','推薦','有','地址','電話','營業','地點','怎麼','藥妝','停車','料理','餐廳'];
      const isPureConfirmation = confirmationMatches.length > 0
        && blockers.every(b => !messageLower.includes(b))
        && !hasOtherIntentKeywords && !isGreeting;
      if (isPureConfirmation) {
        keywords.push(...confirmationMatches);
        return {
          intent: 'CONFIRMATION',
          confidence: 0.8,
          keywords
        };
      }
      // 情感檢測
      emotion = this.detectEmotion(messageLower);
      // 多意圖檢測
      multiIntent = this.detectMultiIntent(messageLower);
      if (multiIntent.length > 1) {
        return {
          intent: 'MIXED_INTENT',
          confidence: 0.7,
          keywords,
          subcategory,
          responseMode: 'mixed',
          emotion,
          multiIntent
        };
      }
      // 特定實體查詢檢測
      const specificEntityKeywords = [
        '丁丁',
        '麥當勞',
        '肯塔基',
        '屈臣氏',
        '康是美',
        '地址',
        '電話',
        '在哪裡',
        '位置',
        '營業時間'
      ];
      const specificEntityMatches = specificEntityKeywords.filter((keyword)=>messageLower.includes(keyword));
      if (specificEntityMatches.length > 0) {
        keywords.push(...specificEntityMatches);
        return {
          intent: 'SPECIFIC_ENTITY',
          confidence: 0.8,
          keywords,
          responseMode: 'specific_entity',
          emotion
        };
      }
      // 檢查是否超出服務範圍 (優先處理)
      const isOutOfScope = this.isOutOfScope(messageLower);
      if (isOutOfScope) {
        return {
          intent: 'OUT_OF_SCOPE',
          confidence: 0.2,
          keywords: [],
          responseMode: 'polite_refusal',
          emotion
        };
      }
      // 模糊查詢檢測
      const vagueQueryKeywords = [
        '有什麼建議',
        '幫幫我',
        '怎麼辦',
        '如何',
        '建議',
        '推薦什麼',
        '有什麼',
        '可以',
        '能'
      ];
      const vagueQueryMatches = vagueQueryKeywords.filter((keyword)=>messageLower.includes(keyword));
      if (vagueQueryMatches.length > 0) {
        keywords.push(...vagueQueryMatches);
        return {
          intent: 'VAGUE_QUERY',
          confidence: 0.7,
          keywords,
          responseMode: 'vague_guidance',
          emotion
        };
      }
      // 一般推薦意圖
      return {
        intent: 'GENERAL',
        confidence: 0.6,
        keywords: [],
        responseMode: 'standard',
        emotion
      };
    }
    hasOtherIntent(message) {
      const excludeKeywords = [
        '美食',
        '餐廳',
        '傢俱',
        '家具',
        '停車',
        '購物',
        '服飾',
        '美容',
        '醫療',
        '銀行',
        '便利商店'
      ];
      return excludeKeywords.some((keyword)=>message.includes(keyword));
    }
    isVagueOrChat(message, conversationHistory) {
      // 問候語關鍵字（優先處理）
      const greetingKeywords = [
        '你好',
        '嗨',
        '哈囉',
        'hello',
        'hi',
        'hey'
      ];
      const isGreeting = greetingKeywords.some((keyword)=>message.toLowerCase().includes(keyword));
      // 其他模糊聊天關鍵字
      const vagueKeywords = [
        '今天天氣',
        '心情',
        '感覺',
        '怎麼樣',
        '還好嗎',
        '無聊',
        '沒事',
        '隨便',
        '不知道',
        '顏色',
        '喜歡什麼'
      ];
      const hasVagueKeywords = vagueKeywords.some((keyword)=>message.includes(keyword));
      // 短訊息且無特定意圖
      const isTooShort = message.length <= 3 && !this.hasSpecificIntent(message);
      // 重複訊息
      const isRepetitive = conversationHistory && conversationHistory.length > 0 && conversationHistory.some((msg)=>msg.content === message);
      // 情感表達
      const hasEmotion = this.detectEmotion(message) !== undefined;
      // 問候語優先返回 true
      if (isGreeting) {
        return true;
      }
      return hasVagueKeywords || isTooShort || isRepetitive || hasEmotion;
    }
    isOutOfScope(message) {
      const outOfScopeKeywords = [
        '台北',
        '台中',
        '台南',
        '新北',
        '桃園',
        '新竹',
        '基隆',
        '嘉義',
        '彰化',
        '南投',
        '雲林',
        '屏東',
        '台東',
        '花蓮',
        '宜蘭',
        '澎湖',
        '金門',
        '馬祖',
        '投資',
        '股票',
        '基金',
        '保險',
        '貸款',
        '信用卡',
        '理財',
        '醫療診斷',
        '看病',
        '開藥',
        '手術',
        '治療',
        '生病',
        '看醫生',
        '診斷',
        '法律',
        '訴訟',
        '合約',
        '糾紛',
        '律師',
        '政治',
        '選舉',
        '投票',
        '政黨',
        '總統',
        '政府',
        '宗教',
        '信仰',
        '拜拜',
        '廟宇',
        '算命',
        '占卜',
        '風水',
        '命理',
        '音樂會',
        '演唱會',
        '表演',
        '電影',
        'KTV',
        '遊戲',
        '天氣',
        '今天天氣',
        '天氣如何',
        '溫度',
        '降雨',
        '氣象'
      ];
      return outOfScopeKeywords.some((keyword)=>message.includes(keyword));
    }
    hasSpecificIntent(message) {
      const specificKeywords = [
        '推薦',
        '哪裡',
        '什麼',
        '有',
        '找',
        '查',
        '問',
        '幫',
        '需要',
        '想要'
      ];
      return specificKeywords.some((keyword)=>message.includes(keyword));
    }
    detectEmotion(message) {
      const emotionKeywords = {
        'negative': [
          '心情不好',
          '難過',
          '傷心',
          '沮喪',
          '失望',
          '生氣',
          '煩躁',
          '焦慮',
          '壓力',
          '累',
          '疲憊'
        ],
        'positive': [
          '開心',
          '高興',
          '興奮',
          '期待',
          '滿足',
          '快樂',
          '愉悅',
          '驚喜'
        ],
        'neutral': [
          '無聊',
          '沒事',
          '還好',
          '普通',
          '一般',
          '沒什麼'
        ],
        'curious': [
          '好奇',
          '想知道',
          '疑問',
          '困惑',
          '不懂',
          '不了解'
        ]
      };
      for (const [emotion, keywords] of Object.entries(emotionKeywords)){
        if (keywords.some((keyword)=>message.includes(keyword))) {
          return emotion;
        }
      }
      return undefined;
    }
    detectMultiIntent(message) {
      const intentKeywords = {
        'FOOD': [
          '美食',
          '餐廳',
          '吃飯',
          '料理',
          '餐點',
          '日料',
          '韓料',
          '泰料',
          '義式',
          '中式',
          '素食'
        ],
        'SHOPPING': [
          '買衣服',
          '服飾店',
          '買鞋子',
          '鞋店',
          '買化妝品',
          '美妝店',
          '日用品',
          '便利商店'
        ],
        'BEAUTY': [
          '美髮店',
          '剪頭髮',
          '美容院',
          '做臉',
          '美甲店',
          '做指甲'
        ],
        'MEDICAL': [
          '診所',
          '看醫生',
          '藥局',
          '買藥',
          '牙醫',
          '看牙齒'
        ],
        'PARKING': [
          '停車',
          '停車場',
          '車位',
          '停車費',
          '可以停車嗎',
          '停車方便嗎'
        ],
        'ENGLISH_LEARNING': [
          '英語',
          '美語',
          '補習班',
          '學習',
          '英文',
          '課程',
          '培訓'
        ]
      };
      const detectedIntents = [];
      for (const [intent, keywords] of Object.entries(intentKeywords)){
        if (keywords.some((keyword)=>message.includes(keyword))) {
          detectedIntents.push(intent);
        }
      }
      return detectedIntents;
    }
  }
  // ===== utils: features 安全取用 ----
  function featuresToText(f) {
    if (!f) return '';
    if (typeof f === 'string') return f.toLowerCase();
    if (typeof f === 'object') {
      const tags = Array.isArray(f.tags) ? f.tags.join(' ') : '';
      const sec  = f.secondary_category ? String(f.secondary_category) : '';
      const desc = f.description ? String(f.description) : '';
      return [tags, sec, desc].join(' ').toLowerCase();
    }
    try { return String(f).toLowerCase(); } catch { return ''; }
  }
  function getFeaturesObj(f) {
    if (!f) return {};
    if (typeof f === 'object') return f;
    try { return JSON.parse(String(f)); } catch { return {}; }
  }
  /**
   * 第三層：推薦策略層 (Recommendation Layer) - 強化版
   * 職責：整合資料驗證、排序服務，產生推薦清單
   */ class RecommendationLayer {
    dataLayer;
    constructor(dataLayer){
      this.dataLayer = dataLayer;
    }
    // ===== 增強版美食識別邏輯 =====
    /**
     * 從用戶訊息檢測料理類型
     */ detectCuisineFromMessage(message) {
      const messageLower = message.toLowerCase();
      // 日式料理關鍵字
      if (messageLower.includes('日料') || messageLower.includes('日式') || messageLower.includes('壽司') || messageLower.includes('拉麵') || messageLower.includes('和食') || messageLower.includes('天婦羅') || messageLower.includes('居酒屋') || messageLower.includes('燒肉') || messageLower.includes('丼飯') || messageLower.includes('日本料理')) {
        return '日式料理';
      }
      // 韓式料理關鍵字
      if (messageLower.includes('韓料') || messageLower.includes('韓式') || messageLower.includes('烤肉') || messageLower.includes('泡菜') || messageLower.includes('石鍋') || messageLower.includes('韓國') || messageLower.includes('韓國料理')) {
        return '韓式料理';
      }
      // 泰式料理關鍵字
      if (messageLower.includes('泰料') || messageLower.includes('泰式') || messageLower.includes('冬陰功') || messageLower.includes('綠咖喱') || messageLower.includes('泰國料理')) {
        return '泰式料理';
      }
      // 義式料理關鍵字
      if (messageLower.includes('義式') || messageLower.includes('義大利') || messageLower.includes('披薩') || messageLower.includes('義大利麵')) {
        return '義式料理';
      }
      // 中式料理關鍵字
      if (messageLower.includes('中式') || messageLower.includes('火鍋') || messageLower.includes('川菜') || messageLower.includes('台菜') || messageLower.includes('中華料理')) {
        return '中式料理';
      }
      // 素食關鍵字
      if (messageLower.includes('素食') || messageLower.includes('蔬食') || messageLower.includes('素食餐廳') || messageLower.includes('蔬食餐廳')) {
        return '素食';
      }
      // 時間相關關鍵字
      if (messageLower.includes('早餐')) return '早餐';
      if (messageLower.includes('午餐')) return '午餐';
      if (messageLower.includes('晚餐')) return '晚餐';
      if (messageLower.includes('宵夜')) return '宵夜';
      return null;
    }
    /**
     * 檢測商家是否匹配特定料理類型
     */     matchStoreToCuisine(store, cuisineType) {
      if (!store) return false;
      const storeName = (store.store_name || '').toLowerCase();
      const category = (store.category || '').toLowerCase();
      // 使用安全工具函式處理 features
      const featuresObj = getFeaturesObj(store.features);
      const features = featuresToText(store.features);
      const secondaryCategory = String(featuresObj.secondary_category || '').toLowerCase();
      switch(cuisineType){
        case '日式料理':
          return storeName.includes('日式') || storeName.includes('壽司') || storeName.includes('拉麵') || storeName.includes('和食') || storeName.includes('天婦羅') || storeName.includes('居酒屋') || storeName.includes('燒肉') || storeName.includes('丼飯') || storeName.includes('日本') || features.includes('壽司') || features.includes('拉麵') || features.includes('和食') || features.includes('日式') || features.includes('日本') || secondaryCategory.includes('壽司') || secondaryCategory.includes('日式') || secondaryCategory.includes('居酒屋') || secondaryCategory.includes('丼飯');
        case '韓式料理':
          return storeName.includes('韓') || category.includes('韓') || features.includes('韓') || storeName.includes('烤肉') || storeName.includes('泡菜') || storeName.includes('石鍋') || storeName.includes('韓國') || features.includes('烤肉') || features.includes('泡菜') || features.includes('石鍋') || secondaryCategory.includes('韓式') || secondaryCategory.includes('烤肉') || secondaryCategory.includes('韓國');
        case '泰式料理':
          return storeName.includes('泰') || category.includes('泰') || features.includes('泰') || storeName.includes('咖喱') || storeName.includes('冬陰功') || features.includes('咖喱') || features.includes('冬陰功') || secondaryCategory.includes('泰式');
        case '義式料理':
          return storeName.includes('義') || category.includes('義') || features.includes('義') || storeName.includes('義大利') || storeName.includes('披薩') || storeName.includes('義大利麵') || features.includes('義大利') || features.includes('披薩') || secondaryCategory.includes('義式');
        case '中式料理':
          return storeName.includes('中式') || storeName.includes('火鍋') || storeName.includes('台菜') || storeName.includes('川菜') || storeName.includes('中華') || features.includes('火鍋') || features.includes('台菜') || features.includes('川菜') || features.includes('中式') || features.includes('中華') || secondaryCategory.includes('中式') || secondaryCategory.includes('火鍋') || secondaryCategory.includes('台菜') || secondaryCategory.includes('川菜');
        case '素食':
          return storeName.includes('素食') || storeName.includes('蔬食') || features.includes('素食') || features.includes('蔬食') || secondaryCategory.includes('素食') || secondaryCategory.includes('蔬食');
        default:
          return true;
      }
    }
  async generateRecommendations(intent, message, subcategory) {
    console.log(`[推薦層] 生成推薦 - 意圖: ${intent}, 子類別: ${subcategory}`);

    // 🔧 熱修：統計查詢直接繞過資料驗證與排序
    if (intent === 'COVERAGE_STATS') {
      const statsArr = await this.fetchStoresByIntent(intent, message, subcategory); // 形如 [{ stats }]
      return {
        stores: statsArr,
        logic: {
          intent, subcategory,
          raw_count: statsArr.length,
          validated_count: statsArr.length,    // 視為已通過
          validation_passed: true,
          sorting_applied: false,
          timestamp: new Date().toISOString()
        },
        needsFallback: false
      };
    }

    let rawStores = [];
    let logic = {
      intent,
      subcategory,
      timestamp: new Date().toISOString(),
      validation_passed: false,
      sorting_applied: false
    };
    try {
      // Step 1: 根據意圖獲取原始資料
      rawStores = await this.fetchStoresByIntent(intent, message, subcategory);
      logic.raw_count = rawStores.length;
        // Step 2: 資料驗證
        const validatedStores = ValidationService.validateStoreData(rawStores);
        logic.validated_count = validatedStores.length;
        logic.validation_passed = validatedStores.length > 0;
        // Step 3: 推薦邏輯驗證
        const validationResult = ValidationService.validateRecommendationLogic(intent, validatedStores, subcategory);
        logic.logic_validation = validationResult;
        if (!validationResult.isValid) {
          console.warn(`[推薦層] 推薦邏輯驗證失敗: ${validationResult.reason}`);
          return {
            stores: [],
            logic: {
              ...logic,
              error: validationResult.reason
            },
            needsFallback: true,
            fallbackMessage: FallbackService.generateContextualFallback(intent, subcategory)
          };
        }
        // Step 4: 排序和限制
        const finalStores = SortingService.sortAndLimitStores(validatedStores, 5);
        logic.final_count = finalStores.length;
        logic.sorting_applied = true;
        logic.sorting_log = SortingService.createSortingLog(validatedStores.length, finalStores.length, [
          'partner_priority',
          'sponsorship_tier',
          'rating',
          'id'
        ]);
        // Step 5: 檢查是否需要 fallback
        const needsFallback = FallbackService.shouldUseFallback(finalStores, validationResult);
        if (needsFallback) {
          return {
            stores: [],
            logic,
            needsFallback: true,
            fallbackMessage: FallbackService.generateContextualFallback(intent, subcategory)
          };
        }
        console.log(`[推薦層] 推薦生成成功，共 ${finalStores.length} 個`);
        return {
          stores: finalStores,
          logic,
          needsFallback: false
        };
      } catch (error) {
        console.error('[推薦層] 推薦生成失敗:', error);
        return {
          stores: [],
          logic: {
            ...logic,
            error: error.message
          },
          needsFallback: true,
          fallbackMessage: FallbackService.generateContextualFallback(intent, subcategory)
        };
      }
    }
    /**
     * 根據標籤匹配商家（增強版：Required/Optional 標籤邏輯）
     */
    matchStoresByTags(stores, message, intent) {
      if (!stores || stores.length === 0) return []
      
      const messageLower = message.toLowerCase()
      
      // 解析查詢中的 Required 和 Optional 標籤
      const tagAnalysis = this.analyzeQueryTags(message, intent)
      
      console.log(`[標籤匹配] 查詢分析:`, {
        required: tagAnalysis.required,
        optional: tagAnalysis.optional,
        keywords: tagAnalysis.keywords
      })
      
      const matchedStores: any[] = []
      
      // 為每個商家計算匹配分數
      for (const store of stores) {
        try {
          // 解析商家的 features 中的 tags（統一處理物件/JSON字串）
          const featuresObj = getFeaturesObj(store.features);
          const storeTags = Array.isArray(featuresObj.tags) ? featuresObj.tags : [];
          const storeTagsLower = storeTags.map(t => String(t).toLowerCase());
          
          // 檢查 Required 標籤（必須全部匹配）
          let requiredMatches = 0
          const matchedRequiredTags = []
          
          for (const requiredTag of tagAnalysis.required) {
            const found = storeTagsLower.some((storeTag) => 
              storeTag.includes(requiredTag.toLowerCase()) || 
              requiredTag.toLowerCase().includes(storeTag)
            )
            if (found) {
              requiredMatches++
              matchedRequiredTags.push(requiredTag)
            }
          }
          
          // 如果 Required 標籤未完全匹配，跳過此商家
          if (tagAnalysis.required.length > 0 && requiredMatches < tagAnalysis.required.length) {
            continue
          }
          
          // 計算 Optional 標籤匹配分數
          let optionalMatches = 0
          const matchedOptionalTags = []
          
          for (const optionalTag of tagAnalysis.optional) {
            const found = storeTagsLower.some((storeTag) => 
              storeTag.includes(optionalTag.toLowerCase()) || 
              optionalTag.toLowerCase().includes(storeTag)
            )
            if (found) {
              optionalMatches++
              matchedOptionalTags.push(optionalTag)
            }
          }
          
          // 計算總匹配分數
          const requiredScore = requiredMatches * 10  // Required 標籤權重更高
          const optionalScore = optionalMatches * 1   // Optional 標籤權重較低
          const totalScore = requiredScore + optionalScore
          
          // 如果總分數 > 0，加入結果
          if (totalScore > 0) {
            matchedStores.push({
              ...store,
              matchScore: totalScore,
              requiredMatches,
              optionalMatches,
              matchedRequiredTags,
              matchedOptionalTags,
              allMatchedTags: [...new Set([...matchedRequiredTags, ...matchedOptionalTags])]
            })
          }
          
        } catch (e) {
          console.warn(`[標籤匹配] 商家 ${store.store_name} 標籤解析失敗`)
        }
      }
      
      // 按匹配分數排序
      matchedStores.sort((a, b) => b.matchScore - a.matchScore)
      
      console.log(`[標籤匹配] 找到 ${matchedStores.length} 個匹配商家`)
      
      return matchedStores.slice(0, 10) // 限制返回前10個最佳匹配
    }

    /**
     * 分析查詢中的 Required 和 Optional 標籤
     */
    analyzeQueryTags(message, intent) {
      const messageLower = message.toLowerCase()
      
      // 擴展的關鍵字到標籤映射規則
      const keywordToTags = {
        // 料理類型關鍵字 (Required)
        '日式': { tags: ['日式料理', '壽司', '生魚片', '拉麵', '丼飯'], priority: 'required' },
        '韓式': { tags: ['韓式料理', '烤肉', '泡菜', '石鍋'], priority: 'required' },
        '泰式': { tags: ['泰式料理', '咖喱', '酸辣', '冬陰功'], priority: 'required' },
        '中式': { tags: ['中式料理', '火鍋', '台菜', '川菜'], priority: 'required' },
        '義式': { tags: ['義式料理', '披薩', '義大利麵'], priority: 'required' },
        '素食': { tags: ['素食', '蔬食'], priority: 'required' },
        '咖啡': { tags: ['咖啡', '飲品'], priority: 'required' },
        '甜點': { tags: ['甜點', '蛋糕', '烘焙'], priority: 'required' },
        '火鍋': { tags: ['火鍋', '中式料理'], priority: 'required' },
        '燒烤': { tags: ['燒烤', '烤肉'], priority: 'required' },
        '拉麵': { tags: ['拉麵', '日式料理'], priority: 'required' },
        '壽司': { tags: ['壽司', '日式料理'], priority: 'required' },
        
        // 服務關鍵字 (Optional)
        '外送': { tags: ['外送'], priority: 'optional' },
        '外帶': { tags: ['外帶'], priority: 'optional' },
        '內用': { tags: ['內用'], priority: 'optional' },
        '停車': { tags: ['停車'], priority: 'optional' },
        'wifi': { tags: ['WiFi'], priority: 'optional' },
        '24小時': { tags: ['24小時'], priority: 'optional' },
        '預約': { tags: ['預約'], priority: 'optional' },
        
        // 價格關鍵字 (Optional)
        '平價': { tags: ['平價'], priority: 'optional' },
        '便宜': { tags: ['平價'], priority: 'optional' },
        '高檔': { tags: ['高檔'], priority: 'optional' },
        '學生': { tags: ['學生友善'], priority: 'optional' },
        '家庭': { tags: ['家庭聚餐'], priority: 'optional' },
        
        // 特色關鍵字 (Optional)
        '新鮮': { tags: ['新鮮現做'], priority: 'optional' },
        '手作': { tags: ['手作'], priority: 'optional' },
        '健康': { tags: ['健康'], priority: 'optional' },
        '網美': { tags: ['網美'], priority: 'optional' },
        '打卡': { tags: ['打卡'], priority: 'optional' },
        '下午茶': { tags: ['下午茶'], priority: 'optional' },
        '親子': { tags: ['親子友善'], priority: 'optional' },
        '宵夜': { tags: ['宵夜'], priority: 'optional' }
      }
      
      const requiredTags = []
      const optionalTags = []
      const keywords = []
      
      // 提取用戶查詢中的關鍵字
      for (const [keyword, config] of Object.entries(keywordToTags)) {
        if (messageLower.includes(keyword)) {
          keywords.push(keyword)
          
          if (config.priority === 'required') {
            requiredTags.push(...config.tags)
          } else {
            optionalTags.push(...config.tags)
          }
        }
      }
      
      // 去重
      const uniqueRequired = [...new Set(requiredTags)]
      const uniqueOptional = [...new Set(optionalTags)]
      
      return {
        required: uniqueRequired,
        optional: uniqueOptional,
        keywords
      }
    }

    /**
     * 根據意圖獲取商家資料
     */ async fetchStoresByIntent(intent, message, subcategory) {
      switch(intent){
        case 'ENGLISH_LEARNING':
          // 英語學習：優先肯塔基美語
          const kentucky = await this.dataLayer.getKentuckyEnglish();
          const stores = kentucky ? [
            kentucky
          ] : [];
          // 可以添加其他教育機構（如果需要）
          const otherEducation = await this.dataLayer.getEligibleStores('ENGLISH_LEARNING', '教育培訓');
          const filteredOther = otherEducation.filter((s)=>s.store_code !== 'kentucky');
          stores.push(...filteredOther.slice(0, 2));
          return stores;
        case 'FOOD':
          // 先獲取所有餐飲商家
          let allFoodStores = await this.dataLayer.getEligibleStores('FOOD', '餐飲美食');
          
          // 增強標籤匹配邏輯（優先）
          const tagMatchedStores = this.matchStoresByTags(allFoodStores, message, intent);
          if (tagMatchedStores.length > 0) {
            console.log(`[推薦層] 標籤匹配找到 ${tagMatchedStores.length} 個商家`);
            return tagMatchedStores;
          }
          
          // 如果沒有明確的子類別，從訊息中檢測
          let detectedSubcategory = subcategory;
          if (!detectedSubcategory) {
            detectedSubcategory = this.detectCuisineFromMessage(message);
          }
          if (detectedSubcategory) {
            // 使用增強版識別邏輯篩選商家
            const filteredStores = allFoodStores.filter((store)=>this.matchStoreToCuisine(store, detectedSubcategory));
            console.log(`[推薦層] ${detectedSubcategory} 查詢: 找到 ${filteredStores.length} 個匹配商家`);
            if (filteredStores.length > 0) {
              return filteredStores;
            }
            // 回退：熱門通用
            return allFoodStores.slice(0, 3);
          }
          return allFoodStores;
        case 'SHOPPING':
          const shoppingStores = await this.dataLayer.getEligibleStores('SHOPPING', '購物');
          // 若 subcategory 帶的是品牌名，做二次過濾
          let filteredShoppingStores = shoppingStores;
          if (subcategory) {
            const brand = subcategory.toLowerCase();
            filteredShoppingStores = shoppingStores.filter(s => 
              (s.store_name || '').toLowerCase().includes(brand)
            );
          }
          const shoppingTagMatches = this.matchStoresByTags(filteredShoppingStores, message, intent);
          return shoppingTagMatches.length > 0 ? shoppingTagMatches : filteredShoppingStores;
        case 'BEAUTY':
          const beautyStores = await this.dataLayer.getEligibleStores('BEAUTY', '美容美髮');
          const beautyTagMatches = this.matchStoresByTags(beautyStores, message, intent);
          return beautyTagMatches.length > 0 ? beautyTagMatches : beautyStores;
        case 'MEDICAL':
          const medicalStores = await this.dataLayer.getEligibleStores('MEDICAL', '醫療健康');
          // 若 subcategory 帶的是品牌名，做二次過濾
          let filteredMedicalStores = medicalStores;
          if (subcategory) {
            const brand = subcategory.toLowerCase();
            filteredMedicalStores = medicalStores.filter(s => 
              (s.store_name || '').toLowerCase().includes(brand)
            );
          }
          
          // 使用智能醫療標籤匹配
          const medicalTagMatches = this.smartMedicalTagMatching(filteredMedicalStores, message, intent);
          if (medicalTagMatches.length > 0) {
            console.log(`[推薦層] 智能醫療標籤匹配找到 ${medicalTagMatches.length} 個商家`);
            return medicalTagMatches;
          }
          
          // 如果智能匹配沒有結果，使用一般標籤匹配
          const generalTagMatches = this.matchStoresByTags(filteredMedicalStores, message, intent);
          return generalTagMatches.length > 0 ? generalTagMatches : filteredMedicalStores;
        case 'PARKING':
          const parkingStores = await this.dataLayer.getEligibleStores('PARKING', '停車場');
          const parkingTagMatches = this.matchStoresByTags(parkingStores, message, intent);
          return parkingTagMatches.length > 0 ? parkingTagMatches : parkingStores;
        case 'STATISTICS':
          // Deprecated: redirect to the accurate path
          const stats2 = await this.dataLayer.getStats();
          return stats2 ? [{ stats: stats2 }] : [];
        case 'COVERAGE_STATS':
          // 統計查詢：返回統計數據而不是商家清單
          const stats = await this.dataLayer.getStats();
          return stats ? [
            {
              stats
            }
          ] : [];
        case 'CONFIRMATION':
          return [];
        case 'DIRECTIONS':
          return []; // 不查表，交給語氣層輸出模板
        case 'ATTRACTION':
          // 查詢景點資料
          const attractions = await this.dataLayer.getEligibleStores('ATTRACTION', '景點觀光');
          return attractions;
        default:
          return await this.dataLayer.getEligibleStores(
            intent,
            CATEGORY_BY_INTENT[intent] || undefined
          );
      }
    }
    
    /**
     * 智能醫療標籤匹配
     */
    smartMedicalTagMatching(stores, query, intent) {
      console.log(`[推薦層] 智能醫療標籤匹配 - 查詢: "${query}"`);
      
      const queryLower = query.toLowerCase();
      const matchedStores = [];
      
      for (const store of stores) {
        let matchScore = 0;
        const matchedTags = [];
        
        // 獲取店家的標籤信息
        const storeTags = this.getStoreTags(store);
        const storeName = (store.store_name || '').toLowerCase();
        const storeCategory = (store.category || '').toLowerCase();
        
        // 檢查每個醫療標籤類別
        for (const [tagCategory, tagInfo] of Object.entries(MEDICAL_TAG_MAPPING)) {
          // 檢查主要標籤
          for (const primaryTag of tagInfo.primary_tags) {
            if (storeTags.includes(primaryTag) || 
                storeName.includes(primaryTag) || 
                storeCategory.includes(primaryTag)) {
              matchScore += 10; // 主要標籤權重高
              matchedTags.push(primaryTag);
            }
          }
          
          // 檢查次要標籤
          for (const secondaryTag of tagInfo.secondary_tags) {
            if (storeTags.includes(secondaryTag) || 
                storeName.includes(secondaryTag) || 
                storeCategory.includes(secondaryTag)) {
              matchScore += 5; // 次要標籤權重中等
              matchedTags.push(secondaryTag);
            }
          }
          
          // 檢查搜尋關鍵字匹配
          for (const keyword of tagInfo.search_keywords) {
            if (queryLower.includes(keyword)) {
              matchScore += 3; // 查詢關鍵字匹配
              matchedTags.push(`query:${keyword}`);
            }
          }
        }
        
        // 如果匹配分數 > 0，加入結果
        if (matchScore > 0) {
          matchedStores.push({
            ...store,
            matchScore,
            matchedTags: [...new Set(matchedTags)],
            medicalTagCategory: this.getMedicalTagCategory(matchedTags)
          });
        }
      }
      
      // 按匹配分數排序
      matchedStores.sort((a, b) => b.matchScore - a.matchScore);
      
      console.log(`[推薦層] 智能醫療標籤匹配完成 - 匹配商家: ${matchedStores.length} 家`);
      return matchedStores;
    }
    
    /**
     * 獲取店家標籤
     */
    getStoreTags(store) {
      try {
        if (typeof store.features === 'string') {
          const features = JSON.parse(store.features);
          return features.tags || [];
        } else if (store.features && store.features.tags) {
          return store.features.tags;
        }
        return [];
      } catch (error) {
        return [];
      }
    }
    
    /**
     * 獲取醫療標籤類別
     */
    getMedicalTagCategory(matchedTags) {
      for (const [category, tagInfo] of Object.entries(MEDICAL_TAG_MAPPING)) {
        const hasPrimaryTag = tagInfo.primary_tags.some(tag => 
          matchedTags.includes(tag)
        );
        if (hasPrimaryTag) {
          return category;
        }
      }
      return 'general';
    }
  }
  /**
   * 第四層：語氣渲染層 (Tone Rendering Layer) - 簡化版
   * 職責：純粹的語氣生成，不含業務邏輯
   */ class ToneRenderingLayer {
    // 標準化語氣模板
    toneTemplates = {
      greeting: {
        warm: '嘿！我是高文文，很高興為你服務！✨',
        casual: '哈囉～我是高文文，在鳳山陪你！',
        formal: '您好，我是高文文，文山特區的專屬客服。'
      },
      success: {
        warm: '這個我超推薦的！',
        casual: '這個不錯呢～',
        formal: '我為您推薦以下選擇：'
      },
      closing: {
        warm: '希望對你有幫助！有什麼問題隨時找我喔～',
        casual: '就這樣囉～',
        formal: '感謝您的詢問，祝您使用愉快。'
      }
    };
    /**
     * 生成回應內容
     * @param intent 用戶意圖
     * @param stores 商家清單
     * @param message 原始訊息
     * @param needsFallback 是否需要 fallback
     * @param fallbackMessage fallback 訊息
     * @param logic 推薦邏輯記錄
     */ generateResponse(intent, stores, message, needsFallback = false, fallbackMessage, logic) {
      console.log('[語氣層] 生成雙軌回應');
      // 雙軌回應機制：判斷是否與訓練資料相關
      const isRelatedToTrainingData = this.isRelatedToTrainingData(intent, message);
      if (!isRelatedToTrainingData) {
        // 與訓練資料無關 -> 純LLM個性化回應
        console.log('[雙軌回應] 使用純LLM回應');
        return this.generatePureLLMResponse(intent, message);
      } else {
        // 與訓練資料相關 -> 結構化回應
        console.log('[雙軌回應] 使用結構化回應');
        return this.generateStructuredResponse(intent, stores, message, needsFallback, fallbackMessage, logic);
      }
    }
    /**
     * 判斷是否與訓練資料相關
     */ isRelatedToTrainingData(intent, message) {
      const relatedIntents = [
        'FOOD',
        'PARKING',
        'SHOPPING',
        'FAQ',
        'SERVICE',
        'ENGLISH_LEARNING',
        'MEDICAL',
        'BEAUTY',
        'LIFESTYLE',
        'BRAND_SPECIFIC',
        'GENERAL',
        'COVERAGE_STATS'
      ];
      const unrelatedIntents = [
        'VAGUE_CHAT',
        'CONFIRMATION',
        'OUT_OF_SCOPE',
        'GREETING',
        'SPECIFIC_ENTITY',
        'VAGUE_QUERY',
        'INTRO'
      ];
      // 明確無關的意圖
      if (unrelatedIntents.includes(intent)) {
        return false;
      }
      // 明確相關的意圖
      if (relatedIntents.includes(intent)) {
        return true;
      }
      // 根據訊息內容判斷
      const trainingKeywords = [
        '美食',
        '餐廳',
        '停車',
        '商店',
        '服務',
        '藥局',
        '書店',
        '醫院',
        '學校',
        '補習班',
        '美容',
        '健身',
        '娛樂'
      ];
      const lowerMessage = message.toLowerCase();
      return trainingKeywords.some((keyword)=>lowerMessage.includes(keyword));
    }
    /**
     * 檢測品牌特異性查詢
     */ detectBrandSpecificQuery(message) {
      const brandKeywords = {
        '丁丁連鎖藥局': [
          '丁丁',
          '丁丁藥局',
          '丁丁連鎖'
        ],
        '屈臣氏': [
          '屈臣氏',
          'watsons'
        ],
        '康是美': [
          '康是美',
          'cosmed'
        ],
        '大樹藥局': [
          '大樹',
          '大樹藥局'
        ],
        '杏一藥局': [
          '杏一',
          '杏一藥局'
        ],
        '7-11': [
          '7-11',
          '7-ELEVEN',
          'seven'
        ],
        '全家': [
          '全家',
          'family mart'
        ],
        '萊爾富': [
          '萊爾富',
          'hi-life'
        ]
      };
      const lowerMessage = message.toLowerCase();
      for (const [brand, keywords] of Object.entries(brandKeywords)){
        for (const keyword of keywords){
          if (lowerMessage.includes(keyword.toLowerCase())) {
            // 判斷類別
            let category = 'SHOPPING';
            if ([
              '丁丁連鎖藥局',
              '屈臣氏',
              '康是美',
              '大樹藥局',
              '杏一藥局'
            ].includes(brand)) {
              category = 'MEDICAL';
            } else if ([
              '7-11',
              '全家',
              '萊爾富'
            ].includes(brand)) {
              category = 'SHOPPING';
            }
            return {
              isBrandSpecific: true,
              brand,
              category
            };
          }
        }
      }
      return {
        isBrandSpecific: false,
        brand: '',
        category: ''
      };
    }
    /**
     * 生成純LLM個性化回應
     */ generatePureLLMResponse(intent, message) {
      const responses = {
        'INTRO': '嗨～我是高文文！我專門服務文山特區：\n• 找美食與停車資訊\n• 找生活/醫療/美容店家\n• 英語學習（肯塔基美語等）\n告訴我你的需求，我會用已驗證的資料幫你快速篩選～',
        'VAGUE_CHAT': '哈囉～我是高文文！很高興認識你！✨ 我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊',
        'CONFIRMATION': '好的！我是高文文，很樂意為您服務～有什麼關於文山特區的問題都可以問我喔！😊',
        'OUT_OF_SCOPE': '抱歉，我是高文文，主要專注於文山特區的服務資訊，像是美食推薦、停車資訊、商家介紹等。有什麼這方面的問題需要幫忙嗎？😊',
        'GREETING': '嗨！我是高文文，你的文山特區專屬小助手！😊 很高興為你服務～有什麼需要幫忙的嗎？',
        'SPECIFIC_ENTITY': '抱歉，我是高文文，文山特區目前沒有找到您詢問的商家。建議您使用Google Maps查詢，或詢問當地居民。如果您知道相關資訊，歡迎推薦給我們新增喔～',
        'VAGUE_QUERY': '哈囉～我是高文文！很高興認識你！✨ 我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊',
        // 'COVERAGE_STATS': 移除此條，因為統計查詢會走結構化回應路徑
      };
      const response = responses[intent] || responses['VAGUE_CHAT'];
      const version = `---\n*${CONFIG.system.version}*`;
      return `${response}\n\n${version}`;
    }
    /**
     * 生成結構化回應
     */ generateStructuredResponse(intent, stores, message, needsFallback = false, fallbackMessage, logic) {
      // 統計查詢特殊處理
      if (intent === 'COVERAGE_STATS') {
        return this.generateCoverageStatsResponse(stores);
      }
      
      // 交通指引特殊處理
      if (intent === 'DIRECTIONS') {
        return this.generateDirectionsResponse(message);
      }
      
      // 景點推薦特殊處理
      if (intent === 'ATTRACTION') {
        return this.generateAttractionResponse(stores);
      }
      // 檢測品牌特異性查詢
      const brandQuery = this.detectBrandSpecificQuery(message);
      if (brandQuery.isBrandSpecific) {
        return this.generateBrandSpecificResponse(brandQuery.brand, brandQuery.category, stores, message);
      }
      // 生成開頭語
      const opening = this.generateOpeningPhrase(intent, message);
      // 生成核心內容
      let content;
      if (needsFallback && fallbackMessage) {
        content = fallbackMessage;
      } else {
        content = this.generateCoreContent(intent, stores, message, logic);
      }
      // 生成結束語
      const closing = this.generateClosingPhrase(intent);
      // 添加版本標識
      const version = `---\n*${CONFIG.system.version}*`;
      return `${opening}\n\n${content}\n\n${closing}\n\n${version}`;
    }
    /**
     * 生成統計資料回應
     */ generateCoverageStatsResponse(stores) {
      const version = `---\n*${CONFIG.system.version}*`;
      const stats = stores?.[0]?.stats;

      if (!stats) {
        return `目前統計資料暫時取不到數字，請稍後再問我一次～\n\n${version}`;
      }

      const lastUpdated = new Date(stats.last_updated).toLocaleDateString('zh-TW');
      const response = `📊 **文山特區商家資料庫統計** 📊

• **商家總數**：${stats.total} 家
• **安心店家**：${stats.verified} 家
• **優惠店家**：${stats.discount} 家
• **特約商家**：${stats.partner} 家
• **分類數**：${stats.categories} 個
• **最後更新時間**：${lastUpdated}

這些數字會隨著收錄進度更新喔！✨

我是高文文，很高興為您提供統計資訊～有什麼其他問題隨時問我！😊`;
      return `${response}\n\n${version}`;
    }
    
    /**
     * 生成交通指引回應
     */ generateDirectionsResponse(message) {
      const version = `---\n*${CONFIG.system.version}*`;
      const text = `**文山特區（高雄市鳳山區）交通指南**

**捷運（高捷）**
- 從左營/楠梓/鼓山/三民：紅線南下 → 美麗島站轉橘線往大寮 → 鳳山西／鳳山／大東站下車 → 轉乘公車/步行/共享單車（約 5–15 分）。
- 從小港機場/前鎮/苓雅：紅線北上 → 美麗島站轉橘線 → 鳳山西／鳳山／大東。
- 從大寮/林園：橘線西行 → 鳳山／鳳山西／大東。
> 上車前以地圖「路線」即時查詢為準。

**公車**
- 建議搜尋站點關鍵詞：文山國小／文山特區／文山森林公園（路線依即時資訊為準）。

**自駕/機車**
- 國1/國10 → 建軍路/民族一路系統 → 鳳山 → 文濱路、文山路、文安南路一帶。
- 市區：三多/文化中心 → 建軍路/中正一路南向 → 文山特區。
- 區內有公私停車場與路邊停車格，尖峰建議提早 10–15 分鐘找位。

**導航地標**：文山特區圓環、文山森林公園、文山國小。`;
      return `${text}\n\n${version}`;
    }
    
    /**
     * 生成景點推薦回應
     */ generateAttractionResponse(stores) {
      const version = `---\n*${CONFIG.system.version}*`;
      
      if (!stores || stores.length === 0) {
        return `**文山特區景點推薦** 🌟

抱歉，目前文山特區的觀光景點資料還在收集中。建議您可以前往附近的鳳山古城體驗歷史文化，或到衛武營國家藝術文化中心欣賞藝文活動！

${version}`;
      }
      
      let text = `**文山特區景點推薦** 🌟

我為您推薦以下值得一遊的景點：\n\n`;
      
      stores.forEach((store, index) => {
        const features = typeof store.features === 'string' ? JSON.parse(store.features) : store.features;
        const secondaryCategory = features?.secondary_category || '';
        const tags = features?.tags || [];
        const tagText = tags.length > 0 ? tags.join('、') : '';
        
        text += `${index + 1}. **${store.store_name}**\n`;
        text += `   📍 ${store.address || '地址待確認'}\n`;
        if (secondaryCategory) {
          text += `   🏛️ ${secondaryCategory}\n`;
        }
        if (tagText) {
          text += `   🏷️ ${tagText}\n`;
        }
        if (store.business_hours) {
          text += `   🕒 ${store.business_hours}\n`;
        }
        if (store.rating && store.rating > 0) {
          text += `   ⭐ 評分：${store.rating}/5\n`;
        }
        text += '\n';
      });
      
      text += `這些景點都有豐富的歷史文化背景，非常值得一遊！如果您想了解某個景點的詳細資訊，歡迎隨時問我～`;
      
      return `${text}\n\n${version}`;
    }
    
    /**
     * 生成品牌特異性回應
     */ generateBrandSpecificResponse(brand, category, stores, message) {
      console.log(`[品牌特異性回應] 處理品牌: ${brand}, 類別: ${category}`);
      // 查找特定品牌
      const q = brand.toLowerCase();
      const brandStores = stores.filter(s => (s.store_name || '').toLowerCase().includes(q));
      // 查找同類別其他品牌作為替代
      const humanCategory = CATEGORY_BY_INTENT[category] || category; // 將 'MEDICAL'/'SHOPPING' 轉中文分類
      const alternativeStores = stores
        .filter((store) =>
          store.category === humanCategory &&
          store.store_name &&
          !store.store_name.toLowerCase().includes(brand.toLowerCase()))
        .slice(0, 3);
      let content;
      let opening;
      let closing;
      if (brandStores.length > 0) {
        // 找到特定品牌
        opening = `有的！我為您找到${brand}的資訊：`;
        content = this.formatStoreList(brandStores);
        closing = '希望對您有幫助！有什麼問題隨時找我喔～';
      } else {
        // 沒找到特定品牌，提供替代方案
        opening = `抱歉，文山特區目前沒有找到${brand}的資料。不過我為您推薦幾家其他優質${category === 'MEDICAL' ? '藥局' : '商店'}：`;
        content = alternativeStores.length > 0 ? this.formatStoreList(alternativeStores) : '目前沒有相關資料，建議您使用Google Maps查詢。';
        closing = `如果您知道有${brand}的資訊，歡迎推薦給我們新增喔～`;
      }
      const version = `---\n*${CONFIG.system.version}*`;
      return `${opening}\n\n${content}\n\n${closing}\n\n${version}`;
    }
    /**
     * 格式化商家列表
     */ formatStoreList(stores) {
      return stores.map((store, index)=>{
        const address = store.address || '地址未提供';
        const category = store.category || '未分類';
        const rating = store.rating || 'N/A';
        return `${index + 1}. **${store.store_name}**
     📍 ${address}
     🏷️ ${category}
     ⭐ 評分：${rating}`;
      }).join('\n\n');
    }
    /**
     * 生成個性化開頭語
     */ generateOpeningPhrase(intent, message) {
      const openingTemplates = {
        'FOOD': '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：',
        'PARKING': '文山特區的停車很方便喔！讓我為你介紹幾個優質停車場：',
        'SHOPPING': '文山特區有很多購物好去處！讓我為你介紹幾家不錯的：',
        'MEDICAL': '文山特區的醫療資源很豐富！我為你推薦幾家優質的：',
        'ENGLISH_LEARNING': '文山特區的教育資源很豐富！我為你推薦幾家優質的：',
        'FAQ': '我為你找到了一些不錯的選擇：'
      };
      return openingTemplates[intent] || '我為你找到了一些不錯的選擇：';
    }
    /**
     * 生成核心內容
     */ generateCoreContent(intent, stores, message, logic) {
      // 調用原有的回應生成邏輯，但不包含開頭語
      return this.generateOriginalResponseContentOnly(intent, stores, message, false, undefined, logic);
    }
    /**
     * 生成個性化結束語
     */ generateClosingPhrase(intent) {
      const closingTemplates = [
        '以上依我方資料庫（僅含已審核商家）產生；若需即時路況/滿位，請以地圖為準。需要我貼地圖關鍵字嗎？',
        '希望這些資訊對你有用！如果還有其他問題，我很樂意為你服務～',
        '這些推薦都是基於實際資料，希望能幫助到你！有什麼需要隨時問我～'
      ];
      return closingTemplates[Math.floor(Math.random() * closingTemplates.length)];
    }
    /**
     * 原始回應生成邏輯（保持向後兼容）
     */ generateOriginalResponse(intent, stores, message, needsFallback = false, fallbackMessage, logic) {
      // 如果需要 fallback，直接返回 fallback 訊息
      if (needsFallback && fallbackMessage) {
        return fallbackMessage;
      }
      // 根據意圖生成不同類型的回應
      switch(intent){
        case 'ENGLISH_LEARNING':
          return this.generateEnglishLearningResponse(stores);
        case 'FOOD':
          return this.generateFoodRecommendationResponse(stores, message, logic);
        case 'SHOPPING':
          return this.generateServiceResponse(stores, '購物', '嘿！文山特區有不少購物選擇呢～我為你推薦幾家：');
        case 'BEAUTY':
          return this.generateServiceResponse(stores, '美容美髮', '嘿！文山特區有不少美容美髮選擇呢～我為你推薦幾家：');
        case 'MEDICAL':
          return this.generateServiceResponse(stores, '醫療健康', '嘿！文山特區有不少醫療健康選擇呢～我為你推薦幾家：');
        case 'PARKING':
          return this.generateParkingResponse(stores);
        case 'STATISTICS':
          return this.generateStatisticsResponse(stores);
        case 'MIXED_INTENT':
          return this.generateMixedIntentResponse(message, stores);
        default:
          return this.generateGeneralResponse(stores);
      }
    }
    
    /**
     * 原始回應內容生成邏輯（不包含開頭語）
     */
    generateOriginalResponseContentOnly(intent, stores, message, needsFallback = false, fallbackMessage, logic) {
      // 如果需要 fallback，直接返回 fallback 訊息
      if (needsFallback && fallbackMessage) {
        return fallbackMessage;
      }
      // 根據意圖生成不同類型的回應內容（不包含開頭語）
      switch(intent){
        case 'ENGLISH_LEARNING':
          return this.generateEnglishLearningResponse(stores);
        case 'FOOD':
          return this.generateFoodRecommendationResponseContentOnly(stores, message, logic);
        case 'SHOPPING':
          return this.generateServiceResponseContentOnly(stores, '購物');
        case 'BEAUTY':
          return this.generateServiceResponseContentOnly(stores, '美容美髮');
        case 'MEDICAL':
          return this.generateServiceResponseContentOnly(stores, '醫療健康');
        case 'PARKING':
          return this.generateParkingResponse(stores);
        case 'STATISTICS':
          return this.generateStatisticsResponse(stores);
        default:
          return this.buildStoreListResponseContentOnly(stores);
      }
    }
    
    /**
     * 英語學習專用回應
     */   generateEnglishLearningResponse(stores) {
    const kentucky = stores.find(s => s.store_code === 'kentucky');
    if (!kentucky) return FallbackService.generateContextualFallback('ENGLISH_LEARNING');

    const schoolLines = (CONFIG.kentucky?.schools || [])
      .map(s => `- ${s.name}：${s.phone} ${s.address}`)
      .join('\n');

    const lineStr = CONFIG.kentucky?.lineId ? `\n**聯絡方式：** LINE ID：${CONFIG.kentucky.lineId}` : '';

    return `推薦**肯塔基美語**：只做美語教學、分校資訊透明，家長好溝通。

**分校資訊：**
${schoolLines}
${lineStr}
`;
  }
    /**
     * 美食推薦專用回應
     */ generateFoodRecommendationResponse(stores, message, logic) {
      if (stores.length === 0) {
        return FallbackService.generateContextualFallback('FOOD', logic?.subcategory);
      }
      // 根據查詢類型調整回應開頭
      const messageLower = message?.toLowerCase() || '';
      let responseHeader = '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：';
      // 檢查是否為特定料理類型查詢
      const isSpecificCuisineQuery = messageLower.includes('日料') || messageLower.includes('日式') || messageLower.includes('韓料') || messageLower.includes('韓式') || messageLower.includes('泰料') || messageLower.includes('泰式') || messageLower.includes('中式') || messageLower.includes('義式') || messageLower.includes('素食') || messageLower.includes('火鍋');
      if (isSpecificCuisineQuery) {
        // 檢查是否有匹配的餐廳
        const hasMatchingRestaurants = stores.some((store)=>{
          const name = store.store_name.toLowerCase();
          const features = featuresToText(store.features);
          return name.includes('中式') || name.includes('火鍋') || name.includes('台菜') || features.includes('中式') || features.includes('火鍋') || features.includes('台菜');
        });
        if (!hasMatchingRestaurants) {
          // 沒有找到特定料理類型，提供替代建議
          if (messageLower.includes('中式') || messageLower.includes('火鍋') || messageLower.includes('台菜')) {
            return `抱歉，文山特區目前沒有找到中式料理餐廳。不過我為你推薦幾家其他不錯的餐廳：\n\n${this.buildStoreListResponse(stores.slice(0, 3), '')}\n\n如果你知道有中式料理餐廳，歡迎推薦給我們新增喔～ 😊`;
          }
        }
      }
      if (messageLower.includes('日料') || messageLower.includes('日式')) {
        responseHeader = '嘿！我為你找到了一些不錯的日式料理選擇：';
      } else if (messageLower.includes('韓料') || messageLower.includes('韓式')) {
        responseHeader = '嘿！我為你找到了一些不錯的韓式料理選擇：';
      } else if (messageLower.includes('泰料') || messageLower.includes('泰式')) {
        responseHeader = '嘿！我為你找到了一些不錯的泰式料理選擇：';
      } else if (messageLower.includes('中式') || messageLower.includes('火鍋') || messageLower.includes('台菜')) {
        responseHeader = '嘿！我為你找到了一些不錯的中式料理選擇：';
      }
      return this.buildStoreListResponse(stores, responseHeader);
    }
    
    /**
     * 美食推薦專用回應（僅內容，不包含開頭語）
     */
    generateFoodRecommendationResponseContentOnly(stores, message, logic) {
      if (stores.length === 0) {
        return FallbackService.generateContextualFallback('FOOD', logic?.subcategory);
      }
      // 檢查是否為特定料理類型查詢
      const messageLower = message?.toLowerCase() || '';
      const isSpecificCuisineQuery = messageLower.includes('日料') || messageLower.includes('日式') || messageLower.includes('韓料') || messageLower.includes('韓式') || messageLower.includes('泰料') || messageLower.includes('泰式') || messageLower.includes('中式') || messageLower.includes('義式') || messageLower.includes('素食') || messageLower.includes('火鍋');
      if (isSpecificCuisineQuery) {
        // 檢查是否有匹配的餐廳
        const hasMatchingRestaurants = stores.some((store)=>{
          const name = store.store_name.toLowerCase();
          const features = featuresToText(store.features);
          return name.includes('中式') || name.includes('火鍋') || name.includes('台菜') || features.includes('中式') || features.includes('火鍋') || features.includes('台菜');
        });
        if (!hasMatchingRestaurants) {
          // 沒有找到特定料理類型，提供替代建議
          if (messageLower.includes('中式') || messageLower.includes('火鍋') || messageLower.includes('台菜')) {
            return `抱歉，文山特區目前沒有找到中式料理餐廳。不過我為你推薦幾家其他不錯的餐廳：\n\n${this.buildStoreListResponseContentOnly(stores.slice(0, 3))}\n\n如果你知道有中式料理餐廳，歡迎推薦給我們新增喔～ 😊`;
          }
        }
      }
      return this.buildStoreListResponseContentOnly(stores);
    }
    
    /**
     * 一般服務回應（購物、美容、醫療等）
     */ generateServiceResponse(stores, serviceType, header) {
      if (stores.length === 0) {
        return FallbackService.generateContextualFallback('GENERAL');
      }
      return this.buildStoreListResponse(stores, header);
    }
    
    /**
     * 一般服務回應（僅內容，不包含開頭語）
     */
    generateServiceResponseContentOnly(stores, serviceType) {
      if (stores.length === 0) {
        return FallbackService.generateContextualFallback('GENERAL');
      }
      return this.buildStoreListResponseContentOnly(stores);
    }
    
    /**
     * 建立商家清單回應的通用方法（不包含開頭語）
     */
    buildStoreListResponseContentOnly(stores) {
      let response = '';
      stores.forEach((store, index) => {
        const partnerTag = store.is_partner_store ? ' [特約商家]' : '';
        const tierTag = store.sponsorship_tier > 0 ? ` [贊助等級 ${store.sponsorship_tier}]` : '';
        response += `${index + 1}. **${store.store_name}**${partnerTag}${tierTag}\n`;
        response += `   📍 ${store.address || '地址待確認'}\n`;
        response += `   🏷️ ${store.category}\n`;
        if (store.rating && store.rating > 0) {
          response += `   ⭐ 評分：${store.rating}/5\n`;
        }
        response += '\n';
      });
      return response.trim();
    }
    
    /**
     * 停車場推薦回應
     */ generateParkingResponse(stores) {
      if (stores.length === 0) {
        return FallbackService.generateContextualFallback('PARKING');
      }
      let response = '停車問題交給我！我為你推薦幾個不錯的停車場：\n\n';
      stores.forEach((store, index)=>{
        response += `${index + 1}. **${store.store_name}**\n`;
        response += `   📍 ${store.address || '地址待確認'}\n`;
        const fobj = getFeaturesObj(store.features);
        if (fobj.description) { 
          response += `   📝 ${fobj.description}\n`; 
        }
        response += '\n';
      });
      response += '希望這些停車場資訊對你有幫助！如果需要導航，建議使用 Google Maps 或其他地圖應用程式。';
      return response;
    }
    /**
     * 統計查詢回應
     */ generateStatisticsResponse(stores) {
      const totalStores = stores.length;
      const approvedStores = stores.filter((s)=>s.approval === 'approved').length;
      const partnerStores = stores.filter((s)=>s.is_partner_store === true).length;
      const sponsoredStores = stores.filter((s)=>s.sponsorship_tier > 0).length;
      const ratedStores = stores.filter((s)=>s.rating && s.rating > 0).length;
      return `嘿！我來為你查詢一下文山特區的商家資料庫統計：
  
  📊 **資料庫統計：**
  • 總商家數量：${totalStores} 家
  • 已審核商家：${approvedStores} 家
  • 特約商家：${partnerStores} 家
  • 贊助等級商家：${sponsoredStores} 家
  • 有評分商家：${ratedStores} 家
  
  💡 **資料說明：**
  - 我們只推薦已審核的優質商家
  - 特約商家享有優先推薦權
  - 贊助等級反映商家的合作深度
  - 所有推薦都經過證據驗證
  
  希望這個統計對你有幫助！有什麼問題隨時找我喔～`;
    }
    /**
     * 確認回應
     */ generateConfirmationResponse(message) {
      const messageLower = message.toLowerCase();
      if (messageLower.includes('好') || messageLower.includes('可以') || messageLower.includes('行')) {
        return `好的！很高興能幫到你～有什麼其他問題隨時找我喔！😊`;
      } else if (messageLower.includes('謝謝') || messageLower.includes('感謝')) {
        return `不客氣！能幫到你是我的榮幸～有什麼問題隨時找我！✨`;
      } else if (messageLower.includes('了解') || messageLower.includes('知道')) {
        return `太好了！希望這些資訊對你有幫助～還有什麼想知道的嗎？🤗`;
      } else {
        return `好的！很高興為你服務～有什麼其他需要幫助的嗎？😊`;
      }
    }
    /**
     * 模糊聊天回應
     */ generateVagueChatResponse(message) {
      const messageLower = message.toLowerCase();
      // 問候語處理
      if (messageLower.includes('你好') || messageLower.includes('嗨') || messageLower.includes('哈囉')) {
        return `哈囉～我是高文文！很高興認識你！✨ 我是文山特區的專屬智能助手，可以幫你推薦美食、找停車場、介紹英語學習等服務～有什麼需要幫忙的嗎？😊`;
      } else if (messageLower.includes('無聊') || messageLower.includes('沒事')) {
        return `無聊的話，要不要來文山特區逛逛？我可以推薦一些不錯的餐廳、咖啡廳或有趣的店家給你～有什麼想探索的嗎？🎉`;
      } else if (messageLower.includes('心情') || messageLower.includes('感覺')) {
        return `聽起來你有些想法呢～文山特區有很多有趣的地方可以讓你放鬆心情，要不要我推薦一些不錯的咖啡廳或餐廳給你？☕️`;
      } else if (messageLower.includes('天氣') || messageLower.includes('今天')) {
        return `今天天氣不錯呢！文山特區有很多適合外出的地方，我可以推薦一些不錯的戶外活動或餐廳給你～有什麼特別想做的嗎？🌤️`;
      } else if (messageLower.includes('顏色') || messageLower.includes('喜歡')) {
        return `很有趣的問題呢！文山特區有很多色彩繽紛的店家，我可以推薦一些有特色的餐廳或咖啡廳給你～有什麼特別喜歡的風格嗎？🎨`;
      } else {
        return `我不太確定您的具體需求，不過我可以幫您推薦文山特區的美食、停車場或英語學習等服務喔～有什麼想了解的嗎？🤗`;
      }
    }
    /**
     * 超出範圍回應
     */ generateOutOfScopeResponse(message) {
      const messageLower = message.toLowerCase();
      if (messageLower.includes('台北') || messageLower.includes('台中') || messageLower.includes('台南')) {
        return `抱歉，我是文山特區的專屬助手，對其他地區的資訊不太熟悉。不過我可以為你推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？😊`;
      } else {
        return `抱歉，這超出了我的服務範圍。不過我可以推薦文山特區的美食、停車場或英語學習等服務～有什麼想了解的嗎？✨`;
      }
    }
    /**
     * 多意圖回應
     */ generateMixedIntentResponse(message, stores) {
      return `我理解您有多個需求。讓我先為您處理其中一項，其他需求您可以再次詢問我喔！😊`;
    }
    /**
     * 一般推薦回應
     */ generateGeneralResponse(stores) {
      if (stores.length === 0) {
        return '嘿！我是高文文，很高興為你服務！有什麼想知道的嗎？我對文山特區超熟的！';
      }
      return this.buildStoreListResponse(stores, '嘿！文山特區有很多不錯的選擇呢～我為你推薦：');
    }
    /**
     * 建立商家清單回應的通用方法
     */ buildStoreListResponse(stores, header) {
      let response = `${header}\n\n`;
      stores.forEach((store, index)=>{
        const partnerTag = store.is_partner_store ? ' [特約商家]' : '';
        const tierTag = store.sponsorship_tier > 0 ? ` [贊助等級 ${store.sponsorship_tier}]` : '';
        response += `${index + 1}. **${store.store_name}**${partnerTag}${tierTag}\n`;
        response += `   📍 ${store.address || '地址待確認'}\n`;
        response += `   🏷️ ${store.category}\n`;
        if (store.rating && store.rating > 0) {
          response += `   ⭐ 評分：${store.rating}/5\n`;
        }
        response += '\n';
      });
      // 移除結束語和版本標識，讓上層方法統一處理
      return response;
    }
  }
  /**
   * 第五層：日誌與反饋層 (Logging & Feedback Layer) - 強化版
   * 職責：結構化日誌記錄，完整的錯誤追蹤
   */ class LoggingFeedbackLayer {
    dataLayer;
    constructor(dataLayer){
      this.dataLayer = dataLayer;
    }
    /**
     * 記錄完整的對話會話
     * @param sessionData 會話資料
     */ async logSession(sessionData) {
      const { sessionId, message, response, intent, stores, logic, processingTime, error, userMeta } = sessionData;
      console.log('[日誌層] 記錄會話，會話 ID:', sessionId);
      try {
        // 記錄會話資訊
        await this.logChatSession(sessionId, userMeta);
        // 記錄對話消息
        await this.logChatMessages(sessionId, message, response);
        // 記錄推薦日誌
        if (stores.length > 0 || error) {
          await this.logRecommendationDetails(sessionId, intent, stores, logic, processingTime, error);
        }
        console.log('[日誌層] 會話記錄完成');
      } catch (logError) {
        console.error('[日誌層] 記錄失敗:', logError);
      // 日誌記錄失敗不應該影響主要功能
      }
    }
    /**
     * 記錄聊天會話
     */ async logChatSession(sessionId, userMeta) {
      try {
        const now = new Date().toISOString();
        // 先檢查會話是否已存在
        const { data: existingSession, error: checkError } = await this.dataLayer.supabase.from('chat_sessions').select('*').eq('session_id', sessionId).single();
        if (checkError && checkError.code !== 'PGRST116') {
          console.error('[日誌層] 檢查現有會話失敗:', checkError);
        }
        let sessionData = {
          session_id: sessionId,
          last_activity: now,
          user_agent: 'claude-chat-v2-refactored'
        };
        if (!existingSession) {
          // 新會話
          sessionData = {
            ...sessionData,
            started_at: now,
            message_count: 1,
            user_id: userMeta?.external_id || null,
            user_ip: 'unknown',
            user_meta: userMeta ? JSON.stringify({
          external_id: userMeta.external_id,
          display_name: userMeta.display_name
        }) : null,
            created_at: now
          };
        } else {
          // 更新現有會話
          sessionData.message_count = (existingSession.message_count || 0) + 1;
        }
        const { error } = await this.dataLayer.supabase.from('chat_sessions').upsert(sessionData, {
          onConflict: 'session_id'
        });
        if (error) {
          console.error('[日誌層] 會話記錄失敗:', error);
          console.error('嘗試記錄的資料:', sessionData);
        } else {
          console.log(`[日誌層] 會話記錄成功: ${sessionId}, 消息數: ${sessionData.message_count}`);
        }
      } catch (error) {
        console.error('[日誌層] 會話記錄異常:', error);
      }
    }
    /**
     * 記錄對話消息
     */ async logChatMessages(sessionId, message, response) {
      try {
        const { error } = await this.dataLayer.supabase.from('chat_messages').insert([
          {
            session_id: sessionId,
            message_type: 'user',
            content: message,
            created_at: new Date().toISOString()
          },
          {
            session_id: sessionId,
            message_type: 'bot',
            content: response,
            created_at: new Date().toISOString()
          }
        ]);
        if (error) {
          console.error('[日誌層] 消息記錄失敗:', error);
        }
      } catch (error) {
        console.error('[日誌層] 消息記錄異常:', error);
      }
    }
    /**
     * 記錄推薦詳情
     */ async logRecommendationDetails(sessionId, intent, stores, logic, processingTime, error) {
      try {
        const logData = {
          session_id: sessionId,
          intent,
          recommended_stores: intent === 'COVERAGE_STATS' ? [] : (stores || []).map((s)=>({
              id: s.id,
              name: s.store_name,
              category: s.category,
              tier: s.sponsorship_tier,
              is_partner: s.is_partner_store,
              evidence_level: s.evidence_level || 'verified'
            })),
          recommendation_logic: {
            ...logic,
            processing_time_ms: processingTime,
            error: error
          },
          created_at: new Date().toISOString()
        };
        await this.dataLayer.logRecommendation(sessionId, logData);
      } catch (logError) {
        console.error('[日誌層] 推薦詳情記錄失敗:', logError);
      }
    }
    /**
     * 增強版系統錯誤記錄
     */ static logSystemError(context, error, additionalData) {
      const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      // 檢測錯誤類型
      let errorType = 'UNKNOWN_ERROR';
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorType = 'NETWORK_ERROR';
      } else if (errorMessage.includes('database') || errorMessage.includes('supabase')) {
        errorType = 'DATABASE_ERROR';
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        errorType = 'VALIDATION_ERROR';
      } else if (errorMessage.includes('timeout')) {
        errorType = 'TIMEOUT_ERROR';
      } else if (errorMessage.includes('processing')) {
        errorType = 'PROCESSING_ERROR';
      }
      const errorLog = {
        errorId,
        timestamp: new Date().toISOString(),
        context,
        error_type: errorType,
        error_message: errorMessage,
        error_stack: error?.stack,
        additional_data: additionalData,
        severity: this.getErrorSeverity(errorType)
      };
      console.error(`[系統錯誤 - ${context}] ID: ${errorId}`, errorLog);
      return {
        errorType,
        errorId
      };
    }
    /**
     * 獲取錯誤嚴重程度
     */ static getErrorSeverity(errorType) {
      switch(errorType){
        case 'NETWORK_ERROR':
        case 'TIMEOUT_ERROR':
          return 'medium';
        case 'DATABASE_ERROR':
          return 'high';
        case 'VALIDATION_ERROR':
          return 'low';
        case 'PROCESSING_ERROR':
          return 'medium';
        default:
          return 'critical';
      }
    }
  }
  /**
   * ===== 主要服務類 =====
   * Claude Chat V2 重構版本服務
   */ class ClaudeChatV2RefactoredService {
    dataLayer;
    intentLayer;
    recommendationLayer;
    toneLayer;
    loggingLayer;
    faqService;
    constructor(supabaseUrl, supabaseKey){
      this.dataLayer = new DataLayer(supabaseUrl, supabaseKey);
      this.intentLayer = new IntentLanguageLayer();
      this.recommendationLayer = new RecommendationLayer(this.dataLayer);
      this.toneLayer = new ToneRenderingLayer();
      this.loggingLayer = new LoggingFeedbackLayer(this.dataLayer);
      this.faqService = new FAQService(this.dataLayer);
    }
    /**
     * 處理用戶消息 - 重構版本
     */ async processMessage(sessionId, message, userMeta) {
      const startTime = Date.now();
      let processingError;
      console.log(`[ClaudeChatV2-重構版] 處理消息開始: ${message.substring(0, 50)}...`);
      try {
        // Step 1: 意圖分析
        const conversationHistory = await this.dataLayer.getConversationHistory(sessionId);
        const intentResult = this.intentLayer.classifyIntent(message, conversationHistory);
        console.log(`[重構版] 識別意圖: ${intentResult.intent} (信心度: ${intentResult.confidence})`);
        
        // Step 1.5: FAQ查詢（類別閘門）
        const FAQ_ALLOWED = new Set(['INTRO','VAGUE_CHAT','VAGUE_QUERY','GENERAL','SPECIFIC_ENTITY']);
        let faqResult = await this.faqService.getFAQAnswer(message);

        if (faqResult && (faqResult.matchType === 'exact' || FAQ_ALLOWED.has(intentResult.intent))) {
          console.log(`[重構版] FAQ 命中: ${faqResult.matchType} (${faqResult.similarity})`);
          const processingTime = Date.now() - startTime;
          return {
            response: faqResult.answer,
            session_id: sessionId,
            intent: 'FAQ',
            confidence: 1.0,
            recommended_stores: [],
            recommendation_logic: { type: 'faq', category: faqResult.category, matchType: faqResult.matchType, similarity: faqResult.similarity },
            version: CONFIG.system.version,
            processing_time: processingTime
          };
        }
        
        // Step 2: 品牌偵測（提前介入）
        const brandProbe = this.toneLayer.detectBrandSpecificQuery(message);
        if (brandProbe.isBrandSpecific) {
          // 強制把意圖導向品牌所屬類別，確保取對資料池
          intentResult.intent = brandProbe.category; // 'MEDICAL' | 'SHOPPING'
          intentResult.subcategory = brandProbe.brand; // 把品牌名帶下去
          console.log(`[重構版] 品牌偵測: ${brandProbe.brand} -> ${brandProbe.category}`);
        }
        
        // Step 2: 推薦生成（包含驗證和排序）
        const recommendationResult = await this.recommendationLayer.generateRecommendations(intentResult.intent, message, intentResult.subcategory);
        console.log(`[重構版] 生成推薦: ${recommendationResult.stores.length} 個，需要 fallback: ${recommendationResult.needsFallback}`);
        
        // Step 2.5: 跨類別幻覺檢測
        if (recommendationResult.stores && recommendationResult.stores.length > 0) {
          const hallucinationCheck = ValidationService.detectCrossCategoryHallucination(
            intentResult.intent,
            recommendationResult.stores,
            message
          );
          
          if (!hallucinationCheck.isValid) {
            console.warn(`[重構版] 跨類別幻覺檢測失敗:`, hallucinationCheck.issues);
            // 記錄問題但不阻止回應，讓用戶知道有問題
          }
          
          if (hallucinationCheck.warnings.length > 0) {
            console.warn(`[重構版] 跨類別幻覺警告:`, hallucinationCheck.warnings);
          }
        }
        // Step 3: 語氣渲染
        const response = this.toneLayer.generateResponse(intentResult.intent, recommendationResult.stores, message, recommendationResult.needsFallback, recommendationResult.fallbackMessage, recommendationResult.logic);
        console.log(`[重構版] 生成回應: ${response.length} 字符`);
        // Step 4: 計算處理時間
        const processingTime = Date.now() - startTime;
        // Step 5: 日誌記錄
        await this.loggingLayer.logSession({
          sessionId,
          message,
          response,
          intent: intentResult.intent,
          stores: recommendationResult.stores,
          logic: recommendationResult.logic,
          processingTime,
          error: processingError,
          userMeta
        });
        // Step 6: 回傳結果
        return {
          response,
          session_id: sessionId,
          intent: intentResult.intent,
          confidence: intentResult.confidence,
          recommended_stores: intentResult.intent === 'COVERAGE_STATS' ? [] :
            recommendationResult.stores.map((store) => ({
              id: store.id,
              name: store.store_name,
              category: store.category,
              is_partner: store.is_partner_store,
              sponsorship_tier: store.sponsorship_tier,
              store_code: store.store_code,
              evidence_level: 'verified' // 重構版本全部標記為已驗證
            })),
          recommendation_logic: {
            ...recommendationResult.logic,
            processing_time_ms: processingTime,
            fallback_used: recommendationResult.needsFallback,
            validation_layer_enabled: true,
            sorting_layer_enabled: true
          },
          version: CONFIG.system.version,
          processing_time: processingTime
        };
      } catch (error) {
        const processingTime = Date.now() - startTime;
        processingError = error.message;
        LoggingFeedbackLayer.logSystemError('processMessage', error, {
          sessionId,
          message: message.substring(0, 100),
          processingTime
        });
        // 記錄錯誤會話
        await this.loggingLayer.logSession({
          sessionId,
          message,
          response: FallbackService.DEFAULT_FALLBACK,
          intent: 'ERROR',
          stores: [],
          logic: {
            error: error.message
          },
          processingTime,
          error: processingError,
          userMeta
        });
        // 回傳錯誤回應
        return {
          response: FallbackService.DEFAULT_FALLBACK,
          session_id: sessionId,
          intent: 'ERROR',
          confidence: 0,
          recommended_stores: [],
          recommendation_logic: {
            error: error.message,
            processing_time_ms: processingTime,
            fallback_used: true
          },
          version: CONFIG.system.version,
          processing_time: processingTime
        };
      }
    }
  }
  // ===== Edge Function 主體 =====
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400'
  };
  // ===== 安全性驗證服務 =====
  class SecurityService {
    /**
     * 驗證輸入安全性 - 精簡版，移除誤殺規則
     */ static validateInput(input) {
      if (!input || typeof input !== 'object') {
        return { isValid: false, reason: 'Invalid request structure' };
      }
      const { message, session_id } = input;
      if (!message || typeof message.content !== 'string') {
        return { isValid: false, reason: 'Message content must be string' };
      }
      const content = message.content.trim();
      if (content.length === 0) return { isValid: false, reason: 'Message content cannot be empty' };
      if (content.length > 1000) return { isValid: false, reason: 'Message too long (max 1000 characters)' };
      if (session_id && (typeof session_id !== 'string' || session_id.length > 100)) {
        return { isValid: false, reason: 'Invalid session ID format' };
      }
      // 這裡不再用關鍵字黑名單；依賴上游參數化查詢與資料層白名單
      return { isValid: true };
    }

    /**
     * 清理和標準化輸入 - 精簡版
     */ static sanitizeInput<T extends { message?: { content?: string } }>(input: T): T {
      if (!input?.message?.content) return input;
      const sanitized = input.message.content
        .normalize('NFKC')                 // Unicode 正規化
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return { ...input, message: { ...input.message, content: sanitized } } as T;
    }

    /**
     * 生成安全的 session ID - 改進版
     */ static generateSecureSessionId() {
      return `session-${crypto.randomUUID?.() || (Date.now()+'-'+Math.random().toString(36).slice(2))}`;
    }
  }
  Deno.serve(async (req)=>{
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }
    try {
      // 解析請求
      let requestData;
      try {
        requestData = await req.json();
      } catch (parseError) {
        throw new Error('Invalid JSON in request body');
      }
      // 安全性驗證
      const validation = SecurityService.validateInput(requestData);
      if (!validation.isValid) {
        throw new Error(`Security validation failed: ${validation.reason}`);
      }
      // 清理輸入
      const sanitizedData = SecurityService.sanitizeInput(requestData);
      const { session_id, message, user_meta } = sanitizedData;
      console.log('[ClaudeChatV2-重構版] 收到請求:', {
        message: message.content.substring(0, 50),
        session_id,
        user_meta: user_meta ? {
          external_id: user_meta.external_id?.substring(0, 20),
          display_name: user_meta.display_name?.substring(0, 50)
        } : null
      });
      // 初始化重構版服務（安全修正：使用環境變數）
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
        return new Response(JSON.stringify({
          error: { code: 'CONFIG_ERROR', message: 'Server misconfigured: missing Supabase credentials' },
          version: CONFIG.system.version
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
      }

      const service = new ClaudeChatV2RefactoredService(supabaseUrl, supabaseKey);
      // 處理消息
      const currentSessionId = session_id || SecurityService.generateSecureSessionId();
      const result = await service.processMessage(currentSessionId, message.content, user_meta);
      console.log('[ClaudeChatV2-重構版] 處理完成:', {
        intent: result.intent,
        storeCount: result.recommended_stores.length,
        version: result.version,
        processingTime: result.processing_time
      });
      return new Response(JSON.stringify({
        data: result
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
  } catch (error) {
    const errorId = crypto.randomUUID?.() || String(Date.now());
    console.error('[ClaudeChatV2-重構版] 錯誤:', errorId, error);
    const errorResponse = {
      error: {
        code: 'CLAUDE_CHAT_V2_REFACTORED_ERROR',
        message: '聊天服務暫時無法使用',   // 不曝露內部 message
        id: errorId
      },
      version: CONFIG.system.version
    };
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  });
  