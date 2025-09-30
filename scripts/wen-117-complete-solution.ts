import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// WEN 1.1.7 - 全面解決方案：徹底修復 AI 幻覺問題
// 部署日期: 2025-09-24
// 版本: WEN 1.1.7-COMPLETE-SOLUTION
// deno-lint-ignore-file no-explicit-any

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 防幻覺黑名單 =====
const HALLUCINATION_BLACKLIST = [
  // 已知虛假商家
  '鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館', '阿村魯肉飯',
  '英文達人', '環球英語', '東門市場', '文山樓', '美語街123號',
  // 常見幻覺模式
  '牛肉麵店', '小館', 'Pizza', '食堂', '小館', '魯肉飯'
];

// ===== 工具函數 =====
const CORS_BASE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
};

const safeParseJSON = (s: any) => {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return {};
  }
};

// ===== 資料驗證器 =====
class DataValidator {
  static validateStoreData(store: any): boolean {
    // 基本欄位檢查
    if (!store.store_name || !store.category) {
      return false;
    }
    
    // 黑名單檢查
    if (HALLUCINATION_BLACKLIST.some(blacklisted => 
      store.store_name.includes(blacklisted) || 
      store.address?.includes(blacklisted)
    )) {
      console.log(`🚫 商家在黑名單中，已過濾: ${store.store_name}`);
      return false;
    }
    
    // 地址格式檢查（必須包含數字或特定格式）
    if (store.address && !this.isValidAddress(store.address)) {
      console.log(`⚠️ 地址格式異常，已過濾: ${store.address}`);
      return false;
    }
    
    return true;
  }
  
  static isValidAddress(address: string): boolean {
    // 檢查是否包含數字（門牌號碼）
    if (!/\d/.test(address)) {
      return false;
    }
    
    // 檢查是否包含有效的地址關鍵字
    const validKeywords = ['路', '街', '巷', '弄', '號', '樓', '高雄市', '鳳山區'];
    return validKeywords.some(keyword => address.includes(keyword));
  }
  
  static sanitizeStoreData(store: any): any {
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

// ===== 意圖分類器 =====
class IntentClassifier {
  static classifyIntent(message: string): {
    intent: string;
    confidence: number;
    isFollowUp: boolean;
  } {
    const normalizedMessage = message.toLowerCase().trim();
    
    // 英語學習關鍵字
    const englishKeywords = [
      '美語', '英語', '英文', '學美語', '學英語', '英文學習', '語言學習', 
      '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦'
    ];
    
    // 美食關鍵字
    const foodKeywords = [
      '美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝', '食物', '菜', '飯', '麵',
      '火鍋', '燒烤', '日式', '中式', '西式', '韓式', '泰式', '早餐', '午餐', '晚餐'
    ];
    
    // 停車關鍵字
    const parkingKeywords = [
      '停車', '停車場', '車位', '停車位', '停車費', '停車場位置', '哪裡停車'
    ];
    
    // 追問關鍵字
    const followUpKeywords = [
      '還有其他', '更多', '其他選擇', '還有嗎', '其他', '另外', '還有什麼'
    ];
    
    const isFollowUp = followUpKeywords.some(keyword => 
      normalizedMessage.includes(keyword.toLowerCase())
    );
    
    // 意圖分類邏輯
    if (englishKeywords.some(keyword => normalizedMessage.includes(keyword)) && 
        !foodKeywords.some(keyword => normalizedMessage.includes(keyword))) {
      return { intent: 'ENGLISH_LEARNING', confidence: 0.9, isFollowUp };
    }
    
    if (foodKeywords.some(keyword => normalizedMessage.includes(keyword)) && 
        !englishKeywords.some(keyword => normalizedMessage.includes(keyword))) {
      return { intent: 'FOOD', confidence: 0.8, isFollowUp };
    }
    
    if (parkingKeywords.some(keyword => normalizedMessage.includes(keyword))) {
      return { intent: 'PARKING', confidence: 0.8, isFollowUp };
    }
    
    return { intent: 'GENERAL', confidence: 0.6, isFollowUp };
  }
}

// ===== 推薦引擎 =====
class RecommendationEngine {
  static async getRecommendations(
    intent: string, 
    isFollowUp: boolean,
    sessionId: string
  ): Promise<any[]> {
    console.log(`[${sessionId}] 🎯 推薦策略：意圖=${intent}, 追問=${isFollowUp}`);
    
    let queryUrl = '';
    
    switch (intent) {
      case 'FOOD':
        queryUrl = `${SUPABASE_URL}/rest/v1/stores?category=eq.餐飲美食&order=is_partner_store.desc,rating.desc&limit=5`;
        break;
        
      case 'ENGLISH_LEARNING':
        if (!isFollowUp) {
          // 首次查詢只推薦肯塔基美語
          queryUrl = `${SUPABASE_URL}/rest/v1/stores?store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`;
        } else {
          // 追問時推薦所有教育培訓商家
          queryUrl = `${SUPABASE_URL}/rest/v1/stores?category=eq.教育培訓&order=is_partner_store.desc,rating.desc&limit=5`;
        }
        break;
        
      case 'PARKING':
        queryUrl = `${SUPABASE_URL}/rest/v1/stores?category=eq.停車場&order=rating.desc&limit=5`;
        break;
        
      default:
        queryUrl = `${SUPABASE_URL}/rest/v1/stores?order=is_partner_store.desc,rating.desc&limit=3`;
    }
    
    try {
      const response = await fetch(queryUrl, {
        headers: { 
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 
          apikey: SUPABASE_ANON_KEY 
        }
      });
      
      if (response.ok) {
        const stores = await response.json();
        const validatedStores = stores.filter(DataValidator.validateStoreData);
        console.log(`[${sessionId}] ✅ 查詢成功：${validatedStores.length} 家有效商家`);
        return validatedStores;
      } else {
        console.error(`[${sessionId}] ❌ 查詢失敗：${response.status}`);
        return [];
      }
    } catch (error) {
      console.error(`[${sessionId}] ❌ 查詢異常：`, error);
      return [];
    }
  }
}

// ===== 語氣生成器 =====
class ToneGenerator {
  static generateSystemPrompt(
    intent: string,
    stores: any[],
    userMessage: string,
    sessionId: string
  ): string {
    console.log(`[${sessionId}] 🎨 生成語氣模板，意圖=${intent}`);
    
    let contextData = "";
    
    if (stores.length === 0) {
      contextData = "\n\n⚠️ 目前沒有找到相關商家資料，請稍後再試或聯繫客服。";
    } else {
      contextData = "\n\n文山特區商圈商家資訊:\n";
      stores.forEach((store, i) => {
        const sanitizedStore = DataValidator.sanitizeStoreData(store);
        const features = safeParseJSON(store.features);
        
        contextData += `${i + 1}. ${sanitizedStore.store_name} ${sanitizedStore.is_partner_store ? '[特約商家]' : ''}\n`;
        contextData += `   類別: ${sanitizedStore.category}\n`;
        contextData += `   地址: ${sanitizedStore.address}\n`;
        contextData += `   電話: ${sanitizedStore.phone}\n`;
        contextData += `   營業時間: ${sanitizedStore.business_hours}\n`;
        if (features?.rating) {
          contextData += `   評分: ${features.rating}\n`;
        }
        if (features?.description) {
          contextData += `   特色: ${features.description}\n`;
        }
        contextData += "\n";
      });
    }
    
    const systemBase = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切、像在地朋友一樣的語氣回答問題。 (WEN 1.1.7 - 全面解決方案)

🚨 嚴格防幻覺規則（絕對遵守）：
1. 你只能使用我提供的商家資料，絕對不能編造任何不存在的商家
2. 如果沒有提供商家資料，請明確告知「目前沒有找到相關商家」
3. 絕對不要編造「鳳山牛肉麵」、「山城小館」、「Coz Pizza」等不存在的商家
4. 絕對不要編造任何地址、電話或營業資訊
5. 如果推薦清單為空，請誠實告知用戶沒有找到商家
6. 寧可不推薦也不要編造虛假資訊
7. 所有推薦都必須基於真實的資料庫資料
8. 如果看到「⚠️ 目前沒有找到相關商家資料」，請直接告知用戶沒有找到商家
9. 絕對不要使用「嘿～這附近我蠻推薦的」等可能誤導用戶的開頭語
10. 如果沒有真實商家資料，請說「抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服」

語氣指導：
- 誠實、親切、專業
- 不誇大、不編造
- 提供真實有用的資訊
- 如果沒有資料就誠實告知

${contextData}

請根據上述資料回應：${userMessage}`;

    return systemBase;
  }
}

// ===== 日誌記錄器 =====
class Logger {
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
      await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          role: 'user',
          content: userMessage,
          metadata: userMeta
        })
      });
      
      // 記錄 AI 回應
      await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          role: 'assistant',
          content: aiResponse,
          metadata: { 
            intent, 
            recommended_stores: stores.map(s => s.id),
            store_count: stores.length,
            version: 'WEN 1.1.7'
          }
        })
      });
      
      console.log(`[${sessionId}] ✅ 互動記錄成功`);
    } catch (error) {
      console.error(`[${sessionId}] ❌ 記錄失敗:`, error);
    }
  }
}

// ===== 主服務邏輯 =====
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_BASE });
  }

  try {
    const { session_id, message, user_meta } = await req.json();
    const messageContent = message.content;
    const currentSessionId = session_id || `session-${Date.now()}`;
    
    console.log(`[${currentSessionId}] 🚀 WEN 1.1.7 全面解決方案啟動`);

    // 1. 意圖分類
    const intentResult = IntentClassifier.classifyIntent(messageContent);
    console.log(`[${currentSessionId}] 🧠 意圖分析: ${intentResult.intent} (信心度: ${intentResult.confidence})`);

    // 2. 獲取推薦商家
    const stores = await RecommendationEngine.getRecommendations(
      intentResult.intent,
      intentResult.isFollowUp,
      currentSessionId
    );

    console.log(`[${currentSessionId}] 📊 推薦結果: ${stores.length} 家商家`);

    // 3. 生成系統提示
    const systemPrompt = ToneGenerator.generateSystemPrompt(
      intentResult.intent,
      stores,
      messageContent,
      currentSessionId
    );

    // 4. 調用 Claude API
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
        messages: [{ role: 'user', content: messageContent }]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API 失敗: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content[0].text;

    // 5. 記錄互動
    await Logger.logInteraction(
      currentSessionId,
      user_meta?.external_id || 'anonymous',
      messageContent,
      aiResponse,
      intentResult.intent,
      stores,
      user_meta
    );

    // 6. 返回結果
    return new Response(JSON.stringify({
      response: aiResponse,
      session_id: currentSessionId,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      recommended_stores: stores.map(s => ({
        id: s.id,
        name: s.store_name,
        category: s.category,
        is_partner: s.is_partner_store
      })),
      debug: {
        isFollowUp: intentResult.isFollowUp,
        storeCount: stores.length,
        version: 'WEN 1.1.7-COMPLETE-SOLUTION'
      },
      version: 'WEN 1.1.7'
    }), {
      headers: { ...CORS_BASE, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('WEN 1.1.7 錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'WEN 1.1.7'
    }), {
      headers: { ...CORS_BASE, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
