import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 語氣靈引擎 v2.0 - 資料優先 × 語氣誠實 × 靈格有溫度
// WEN 1.2.0 - 架構級解法：五層設計實現
// deno-lint-ignore-file no-explicit-any

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 1️⃣ 資料層：嚴格資料驗證與來源控制 =====
class DataValidator {
  static validateStoreData(store: any): boolean {
    // 嚴格驗證：店名、類別、聯絡資訊不得為空
    if (!store.store_name || !store.category) {
      return false;
    }
    
    // 地址驗證（允許空值，但必須是有效格式）
    if (store.address && typeof store.address !== 'string') {
      return false;
    }
    
    // 電話驗證（允許空值，但必須是有效格式）
    if (store.phone && typeof store.phone !== 'string') {
      return false;
    }
    
    return true;
  }

  static sanitizeStoreData(store: any): any {
    // 清理和標準化資料
    return {
      id: store.id,
      store_name: store.store_name?.trim() || '未命名商家',
      category: store.category?.trim() || '其他',
      address: store.address?.trim() || '地址請洽詢店家',
      phone: store.phone?.trim() || '電話請洽詢店家',
      business_hours: store.business_hours?.trim() || '營業時間請洽詢店家',
      is_partner_store: Boolean(store.is_partner_store),
      features: store.features || {},
      rating: store.rating || 0,
      created_at: store.created_at,
      updated_at: store.updated_at
    };
  }
}

// ===== 2️⃣ 語意理解層：語義分類器判斷意圖 =====
class IntentClassifier {
  private static readonly INTENT_PATTERNS = {
    FOOD: [
      '美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝', '食物', '菜', '飯', '麵',
      '火鍋', '燒烤', '日式', '中式', '西式', '韓式', '泰式', '早餐', '午餐', '晚餐',
      '便當', '咖啡', '茶', '甜點', '蛋糕', '麵包', '包子', '餃子', '湯', '湯品'
    ],
    ENGLISH_LEARNING: [
      '美語', '英語', '英文', '學美語', '學英語', '英文學習', '語言學習', '補習',
      '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦',
      '英文班', '美語班', '語言班', '學習英文', '學英文'
    ],
    PARKING: [
      '停車', '停車場', '車位', '停車位', '停車費', '停車場位置', '哪裡停車',
      '停車場營業時間', '停車場收費', '免費停車', '付費停車'
    ],
    SHOPPING: [
      '購物', '買', '商店', '超市', '便利商店', '7-11', '全家', '萊爾富',
      '購物中心', '商場', '賣場', '百貨', '服飾', '衣服', '鞋子', '包包'
    ],
    BEAUTY: [
      '美容', '美髮', '理髮', '剪髮', '洗髮', '燙髮', '染髮', '造型', '化妝',
      '美甲', '指甲', 'spa', '按摩', '護膚', '保養'
    ],
    MEDICAL: [
      '醫院', '診所', '醫生', '看醫生', '看病', '掛號', '急診', '藥局', '藥房',
      '買藥', '處方籤', '健康檢查', '體檢'
    ],
    GENERAL: [
      '推薦', '介紹', '有什麼', '哪裡有', '附近', '文山特區', '鳳山', '高雄'
    ]
  };

  static classifyIntent(message: string): {
    primary: string;
    confidence: number;
    keywords: string[];
  } {
    const normalizedMessage = message.toLowerCase().trim();
    let maxScore = 0;
    let primaryIntent = 'GENERAL';
    let matchedKeywords: string[] = [];

    // 計算每個意圖的匹配分數
    for (const [intent, patterns] of Object.entries(this.INTENT_PATTERNS)) {
      const matched = patterns.filter(pattern => 
        normalizedMessage.includes(pattern.toLowerCase())
      );
      
      if (matched.length > 0) {
        const score = matched.length / patterns.length;
        if (score > maxScore) {
          maxScore = score;
          primaryIntent = intent;
          matchedKeywords = matched;
        }
      }
    }

    return {
      primary: primaryIntent,
      confidence: maxScore,
      keywords: matchedKeywords
    };
  }

  static isFollowUpQuery(message: string): boolean {
    const followUpPatterns = [
      '還有其他', '更多', '其他選擇', '還有嗎', '其他', '另外', '還有什麼',
      '除了', '之外', '別的', '其他推薦', '還有推薦', '再推薦'
    ];
    
    return followUpPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}

// ===== 3️⃣ 推薦策略層：多策略選擇與記憶用戶偏好 =====
class RecommendationStrategy {
  private static readonly PARTNER_STORE_PRIORITY = 10;
  private static readonly HIGH_RATING_THRESHOLD = 4.0;

  static async getStoresByIntent(
    intent: string, 
    isFollowUp: boolean,
    sessionId: string
  ): Promise<any[]> {
    console.log(`[${sessionId}] 🎯 推薦策略：意圖=${intent}, 追問=${isFollowUp}`);

    switch (intent) {
      case 'FOOD':
        return await this.getFoodStores(sessionId);
      
      case 'ENGLISH_LEARNING':
        return await this.getEnglishLearningStores(isFollowUp, sessionId);
      
      case 'PARKING':
        return await this.getParkingStores(sessionId);
      
      case 'SHOPPING':
        return await this.getShoppingStores(sessionId);
      
      case 'BEAUTY':
        return await this.getBeautyStores(sessionId);
      
      case 'MEDICAL':
        return await this.getMedicalStores(sessionId);
      
      default:
        return await this.getGeneralStores(sessionId);
    }
  }

  private static async getFoodStores(sessionId: string): Promise<any[]> {
    console.log(`[${sessionId}] 🍽️ 查詢餐飲美食商家`);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.餐飲美食&order=is_partner_store.desc,rating.desc&limit=5`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
    });
    
    if (response.ok) {
      const stores = await response.json();
      return stores.filter(DataValidator.validateStoreData);
    }
    return [];
  }

  private static async getEnglishLearningStores(isFollowUp: boolean, sessionId: string): Promise<any[]> {
    console.log(`[${sessionId}] 🎓 查詢英語學習商家，追問=${isFollowUp}`);
    
    if (!isFollowUp) {
      // 首次查詢：只推薦肯塔基美語
      const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const stores = await response.json();
        return stores.filter(DataValidator.validateStoreData);
      }
    } else {
      // 追問時：查詢所有教育培訓商家
      const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.教育培訓&order=is_partner_store.desc,rating.desc&limit=5`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const stores = await response.json();
        return stores.filter(DataValidator.validateStoreData);
      }
    }
    return [];
  }

  private static async getParkingStores(sessionId: string): Promise<any[]> {
    console.log(`[${sessionId}] 🅿️ 查詢停車場商家`);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.停車場&order=rating.desc&limit=5`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
    });
    
    if (response.ok) {
      const stores = await response.json();
      return stores.filter(DataValidator.validateStoreData);
    }
    return [];
  }

  private static async getShoppingStores(sessionId: string): Promise<any[]> {
    console.log(`[${sessionId}] 🛍️ 查詢購物商家`);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.購物零售&order=is_partner_store.desc,rating.desc&limit=5`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
    });
    
    if (response.ok) {
      const stores = await response.json();
      return stores.filter(DataValidator.validateStoreData);
    }
    return [];
  }

  private static async getBeautyStores(sessionId: string): Promise<any[]> {
    console.log(`[${sessionId}] 💄 查詢美容商家`);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.美容美髮&order=is_partner_store.desc,rating.desc&limit=5`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
    });
    
    if (response.ok) {
      const stores = await response.json();
      return stores.filter(DataValidator.validateStoreData);
    }
    return [];
  }

  private static async getMedicalStores(sessionId: string): Promise<any[]> {
    console.log(`[${sessionId}] 🏥 查詢醫療商家`);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.醫療保健&order=rating.desc&limit=5`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
    });
    
    if (response.ok) {
      const stores = await response.json();
      return stores.filter(DataValidator.validateStoreData);
    }
    return [];
  }

  private static async getGeneralStores(sessionId: string): Promise<any[]> {
    console.log(`[${sessionId}] 🌟 查詢一般商家`);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?order=is_partner_store.desc,rating.desc&limit=3`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
    });
    
    if (response.ok) {
      const stores = await response.json();
      return stores.filter(DataValidator.validateStoreData);
    }
    return [];
  }
}

// ===== 4️⃣ 語氣生成層：Prompt由冷資料+熱語氣模板組合 =====
class ToneTemplateEngine {
  private static readonly TONE_TEMPLATES = {
    FOOD: {
      greeting: "嘿～這附近我蠻推薦的！",
      enthusiasm: "🍱",
      closing: "有空不妨去看看！"
    },
    ENGLISH_LEARNING: {
      greeting: "學習英文的話，我推薦",
      enthusiasm: "📚",
      closing: "相信對你的學習會有幫助！"
    },
    PARKING: {
      greeting: "停車的話，這裡有幾個選擇：",
      enthusiasm: "🅿️",
      closing: "記得確認營業時間和收費標準喔！"
    },
    GENERAL: {
      greeting: "讓我為你推薦一些不錯的選擇：",
      enthusiasm: "✨",
      closing: "希望對你有幫助！"
    }
  };

  static generateSystemPrompt(
    intent: string,
    stores: any[],
    userMessage: string,
    sessionId: string
  ): string {
    console.log(`[${sessionId}] 🎨 生成語氣模板，意圖=${intent}`);

    const template = this.TONE_TEMPLATES[intent] || this.TONE_TEMPLATES.GENERAL;
    
    let contextData = "";
    
    if (stores.length === 0) {
      contextData = "\n\n⚠️ 目前沒有找到相關商家資料，請稍後再試或聯繫客服。";
    } else {
      contextData = "\n\n文山特區商圈商家資訊:\n";
      stores.forEach((store, i) => {
        const sanitizedStore = DataValidator.sanitizeStoreData(store);
        const features = typeof store.features === 'string' ? 
          JSON.parse(store.features) : store.features;
        
        contextData += `${i + 1}. ${sanitizedStore.store_name} ${sanitizedStore.is_partner_store ? '[特約商家]' : ''}\n`;
        contextData += `   類別: ${sanitizedStore.category}\n`;
        contextData += `   地址: ${sanitizedStore.address}\n`;
        contextData += `   電話: ${sanitizedStore.phone}\n`;
        contextData += `   營業時間: ${sanitizedStore.business_hours}\n`;
        if (features.rating) {
          contextData += `   評分: ${features.rating}\n`;
        }
        if (features.description) {
          contextData += `   特色: ${features.description}\n`;
        }
        contextData += "\n";
      });
    }

    const systemBase = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切、像在地朋友一樣的語氣回答問題。 (WEN 1.2.0 - 語氣靈靈魂版)

語氣指導原則：
- 用「嘿～」、「這附近我蠻推薦的！」等親切語調
- 像朋友推薦，不要像客服回報
- 可以加一些表情符號增加溫度
- 保持熱情但不過度誇張

嚴格約束規則：
1. 你只能使用我提供的商家資料，絕對不能編造任何不存在的商家
2. 所有店名、地址、電話、營業時間都必須與提供的資料完全一致
3. 如果沒有資料，請誠實告知，但可以加一句溫暖的安慰或提議
4. 絕對不要編造「好客食堂」、「福源小館」、「阿村魯肉飯」等不存在的商家
5. 如果看到「⚠️ 目前沒有找到相關商家資料」，請直接告知用戶沒有找到商家

${contextData}

請根據上述資料，回應下列問題：
「${userMessage}」`;

    return systemBase;
  }
}

// ===== 5️⃣ 訊息紀錄與回饋層：所有回應寫入DB =====
class FeedbackLogger {
  static async logInteraction(
    sessionId: string,
    userId: string,
    userMessage: string,
    aiResponse: string,
    intent: string,
    stores: any[],
    userMeta: any
  ): Promise<void> {
    console.log(`[${sessionId}] 📝 記錄互動回饋`);

    try {
      // 記錄用戶訊息
      await this.logMessage(sessionId, userId, userMessage, 'user', userMeta);
      
      // 記錄AI回應
      await this.logMessage(sessionId, userId, aiResponse, 'assistant', {
        intent,
        recommended_stores: stores.map(s => s.id),
        store_count: stores.length
      });

      // 更新會話統計
      await this.updateSessionStats(sessionId, intent, stores.length);

    } catch (error) {
      console.error(`[${sessionId}] ❌ 記錄回饋失敗:`, error);
    }
  }

  private static async logMessage(
    sessionId: string,
    userId: string,
    content: string,
    role: string,
    metadata: any
  ): Promise<void> {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        role,
        content,
        metadata
      })
    });

    if (!response.ok) {
      console.error(`記錄訊息失敗: ${response.status}`);
    }
  }

  private static async updateSessionStats(
    sessionId: string,
    intent: string,
    storeCount: number
  ): Promise<void> {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message_count: storeCount,
        last_activity: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error(`更新會話統計失敗: ${response.status}`);
    }
  }
}

// ===== 主服務邏輯 =====
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id, message, user_meta } = await req.json();
    const messageContent = message.content;
    const currentSessionId = session_id || `session-${Date.now()}`;
    
    console.log(`[${currentSessionId}] 🎯 語氣靈引擎 v2.0 啟動`);

    // ===== 2️⃣ 語意理解層：意圖分類 =====
    const intentResult = IntentClassifier.classifyIntent(messageContent);
    const isFollowUp = IntentClassifier.isFollowUpQuery(messageContent);
    
    console.log(`[${currentSessionId}] 🧠 意圖分析: ${intentResult.primary} (信心度: ${intentResult.confidence})`);
    console.log(`[${currentSessionId}] 🔍 匹配關鍵字: ${intentResult.keywords.join(', ')}`);
    console.log(`[${currentSessionId}] ❓ 是否追問: ${isFollowUp}`);

    // ===== 3️⃣ 推薦策略層：獲取商家資料 =====
    const stores = await RecommendationStrategy.getStoresByIntent(
      intentResult.primary,
      isFollowUp,
      currentSessionId
    );

    console.log(`[${currentSessionId}] 📊 推薦結果: ${stores.length} 家商家`);

    // ===== 4️⃣ 語氣生成層：生成系統提示 =====
    const systemPrompt = ToneTemplateEngine.generateSystemPrompt(
      intentResult.primary,
      stores,
      messageContent,
      currentSessionId
    );

    // ===== 調用 Claude API =====
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API 失敗: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content[0].text;

    // ===== 5️⃣ 訊息紀錄與回饋層：記錄互動 =====
    await FeedbackLogger.logInteraction(
      currentSessionId,
      user_meta?.external_id || 'anonymous',
      messageContent,
      aiResponse,
      intentResult.primary,
      stores,
      user_meta
    );

    // ===== 回應結果 =====
    const responseBody = {
      response: aiResponse,
      session_id: currentSessionId,
      intent: intentResult.primary,
      confidence: intentResult.confidence,
      recommended_stores: stores.map(s => ({
        id: s.id,
        name: s.store_name,
        category: s.category,
        is_partner: s.is_partner_store
      })),
      debug: {
        isFollowUp,
        matchedKeywords: intentResult.keywords,
        storeCount: stores.length,
        engine: 'voice-soul-v2.0'
      }
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('語氣靈引擎錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
