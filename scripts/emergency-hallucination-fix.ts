import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 緊急修復版本 - 強化防幻覺機制
// WEN 1.1.7 - 緊急修復 AI 幻覺問題
// deno-lint-ignore-file no-explicit-any

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

const CORS_BASE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
};

// 強化防幻覺機制
const HALLUCINATION_BLACKLIST = [
  '鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館', '阿村魯肉飯',
  '英文達人', '環球英語', '東門市場', '文山樓', '肯塔基美語', '美語街123號'
];

const safeParseJSON = (s: any) => {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return {};
  }
};

// 嚴格驗證商家資料
const validateStoreData = (store: any): boolean => {
  if (!store.store_name || !store.category) {
    return false;
  }
  
  // 檢查黑名單
  if (HALLUCINATION_BLACKLIST.some(blacklisted => 
    store.store_name.includes(blacklisted) || 
    store.address?.includes(blacklisted)
  )) {
    console.log(`🚫 商家在黑名單中，已過濾: ${store.store_name}`);
    return false;
  }
  
  return true;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_BASE });
  }

  try {
    const { session_id, message, user_meta } = await req.json();
    const messageContent = message.content;
    const currentSessionId = session_id || `session-${Date.now()}`;
    
    console.log(`[${currentSessionId}] 🚨 緊急修復版本啟動`);

    // 意圖分類
    const englishKeywords = ['美語', '英語', '英文', '學美語', '學英語', '英文學習', '語言學習', '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦'];
    const isEnglishRelated = englishKeywords.some(keyword => messageContent.includes(keyword)) && 
                            !messageContent.includes('美食') && 
                            !messageContent.includes('餐廳');
    
    const isParkingRelated = messageContent.includes('停車') || messageContent.includes('停車場') || messageContent.includes('車位');
    const foodKeywords = ['美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝', '食物', '菜', '飯', '麵'];
    const isFoodRelated = foodKeywords.some(keyword => messageContent.includes(keyword));

    // 查詢商家資料 - 嚴格驗證
    let recList: any[] = [];
    let contextData = "";

    if (isParkingRelated) {
      const parkingResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.停車場&limit=5`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      if (parkingResponse.ok) {
        const parkingStores = await parkingResponse.json();
        recList = parkingStores.filter(validateStoreData);
      }
    } else if (isFoodRelated) {
      const foodResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.餐飲美食&limit=5`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      if (foodResponse.ok) {
        const foodStores = await foodResponse.json();
        recList = foodStores.filter(validateStoreData);
      }
    } else if (isEnglishRelated) {
      const englishResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.教育培訓&limit=5`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      if (englishResponse.ok) {
        const englishStores = await englishResponse.json();
        recList = englishStores.filter(validateStoreData);
      }
    } else {
      const generalResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?limit=3`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      if (generalResponse.ok) {
        const generalStores = await generalResponse.json();
        recList = generalStores.filter(validateStoreData);
      }
    }

    console.log(`[${currentSessionId}] 📊 驗證後推薦商家: ${recList.length} 家`);

    // 生成上下文資料
    if (recList.length === 0) {
      contextData = "\n\n⚠️ 目前沒有找到相關商家資料，請稍後再試或聯繫客服。";
    } else {
      contextData = "\n\n文山特區商圈商家資訊:\n";
      recList.forEach((s: any, i: number) => {
        const features = safeParseJSON(s.features);
        contextData += `${i + 1}. ${s.store_name} ${s.is_partner_store ? '[特約商家]' : ''}\n`;
        contextData += `   類別: ${s.category}\n`;
        contextData += `   地址: ${s.address || '地址請洽詢店家'}\n`;
        contextData += `   電話: ${s.phone || '電話請洽詢店家'}\n`;
        contextData += `   營業狀態: ${features.open_status || '未知'}\n\n`;
      });
    }

    // 強化防幻覺 System Prompt
    const systemPrompt = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切的語調回應。 (WEN 1.1.7 - 緊急修復版)

🚨 嚴格防幻覺規則：
1. 你只能使用我提供的商家資料，絕對不能編造任何不存在的商家
2. 如果沒有提供商家資料，請明確告知「目前沒有找到相關商家」
3. 絕對不要編造「鳳山牛肉麵」、「山城小館」、「Coz Pizza」等不存在的商家
4. 絕對不要編造任何地址、電話或營業資訊
5. 如果推薦清單為空，請誠實告知用戶沒有找到商家
6. 寧可不推薦也不要編造虛假資訊
7. 所有推薦都必須基於真實的資料庫資料
8. 如果看到「⚠️ 目前沒有找到相關商家資料」，請直接告知用戶沒有找到商家

${contextData}

請根據上述資料回應：${messageContent}`;

    // 調用 Claude API
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

    // 記錄互動
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          role: 'user',
          content: messageContent
        })
      });

      await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          role: 'assistant',
          content: aiResponse,
          metadata: { 
            intent: isFoodRelated ? 'FOOD' : isEnglishRelated ? 'ENGLISH' : isParkingRelated ? 'PARKING' : 'GENERAL',
            store_count: recList.length
          }
        })
      });
    } catch (error) {
      console.error(`[${currentSessionId}] ❌ 記錄失敗:`, error);
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      session_id: currentSessionId,
      recommended_stores: recList.map(s => ({
        id: s.id,
        name: s.store_name,
        category: s.category,
        is_partner: s.is_partner_store
      })),
      debug: {
        storeCount: recList.length,
        version: 'WEN 1.1.7-EMERGENCY'
      },
      version: 'WEN 1.1.7'
    }), {
      headers: { ...CORS_BASE, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('緊急修復版本錯誤:', error);
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
