import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// WEN 1.1.8 - AI幻覺緊急修復版本：強化空資料處理 + 防幻覺約束
// deno-lint-ignore-file no-explicit-any
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// 資料庫寫入統一使用 Service Role Key（避免 RLS 限制）
const DB_KEY = SUPABASE_SERVICE_ROLE_KEY;

const CORS_BASE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
};

const withTimeout = (ms: number) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, clear: () => clearTimeout(t) };
};

const safeParseJSON = (s: any) => {
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return {};
  }
}

// 通用資料庫查詢防護函數
const safeDatabaseQuery = async (url: string, headers: any, queryName: string, sessionId: string) => {
  try {
    console.log(`[${sessionId}] 🔍 執行資料庫查詢: ${queryName}`);
    const response = await fetch(url, { headers });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        console.log(`[${sessionId}] ✅ ${queryName} 查詢成功: ${data.length} 筆資料`);
        return data;
      } else {
        console.log(`[${sessionId}] ⚠️ ${queryName} 查詢返回空結果`);
        return [];
      }
    } else {
      console.error(`[${sessionId}] ❌ ${queryName} 查詢失敗: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error(`[${sessionId}] ❌ ${queryName} 查詢異常:`, error);
    return [];
  }
}

// 商家資料驗證函數
const validateStoreData = (stores: any[], sessionId: string) => {
  return stores.filter((store: any) => {
    if (!store.store_name || !store.category) {
      console.warn(`[${sessionId}] ⚠️ 商家資料不完整，已過濾:`, store);
      return false;
    }
    return true;
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_BASE });
  }

  try {
    if (!CLAUDE_API_KEY) throw new Error("Claude API key not configured");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase Service Role key (SERVICE_ROLE_KEY) not configured");

    const { session_id, message, user_meta } = await req.json();
    if (!message?.content) throw new Error("Message content is required");

    const messageContent: string = String(message.content).slice(0, 4000);
    const currentSessionId = session_id || `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const userIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    console.log(`[${currentSessionId}] 收到請求: ${messageContent}`);
    console.log(`[${currentSessionId}] Claude Model: ${CLAUDE_MODEL}`);

    // ==== 商家推薦邏輯 ====
    let recList: any[] = [];
    let contextData = "";

    // 關鍵詞檢測
    const englishKeywords = ['美語', '英語', '英文', '學美語', '學英語', '英文學習', '語言學習', '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦'];
    const isEnglishRelated = englishKeywords.some(keyword => messageContent.includes(keyword)) && 
                            !messageContent.includes('美食') && 
                            !messageContent.includes('餐廳') && 
                            !messageContent.includes('傢俱') && 
                            !messageContent.includes('家具') && 
                            !messageContent.includes('停車') && 
                            !messageContent.includes('購物') && 
                            !messageContent.includes('服飾') && 
                            !messageContent.includes('美容') && 
                            !messageContent.includes('醫療') && 
                            !messageContent.includes('銀行') && 
                            !messageContent.includes('便利商店');

    const isParkingRelated = messageContent.includes('停車') || messageContent.includes('停車場') || messageContent.includes('車位');
    
    // 美食查詢意圖檢測
    const foodKeywords = ['美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝', '食物', '菜', '飯', '麵', '火鍋', '燒烤', '日式', '中式', '西式', '韓式', '泰式'];
    const isFoodRelated = foodKeywords.some(keyword => messageContent.includes(keyword));

    console.log(`[${currentSessionId}] 英語學習意圖: ${isEnglishRelated}`);
    console.log(`[${currentSessionId}] 停車場查詢意圖: ${isParkingRelated}`);
    console.log(`[${currentSessionId}] 美食查詢意圖: ${isFoodRelated}`);

    // 查詢商家資料
    const isPartnerQuery = messageContent.includes('特約') || messageContent.includes('合作');
    let queryUrl = `${SUPABASE_URL}/rest/v1/stores`;
    if (isPartnerQuery) {
      queryUrl += '?is_partner_store=eq.true&order=rating.desc&limit=3';
    } else {
      queryUrl += '?order=is_partner_store.desc,rating.desc&limit=5';
    }

    const { signal: s1, clear: c1 } = withTimeout(10000);
    const storesRes = await fetch(queryUrl, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
      signal: s1
    });
    c1();

    if (storesRes.ok) {
      const stores = await storesRes.json();
      recList = Array.isArray(stores) ? stores : [];
      
      // 停車場意圖：查詢真實的停車場資料
      if (isParkingRelated) {
        console.log(`[${currentSessionId}] 🅿️ 檢測到停車場查詢意圖`);
        const parkingRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.停車場&limit=5`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
        });
        if (parkingRes.ok) {
          const parkingData = await parkingRes.json();
          if (parkingData.length > 0) {
            recList = parkingData; // 使用真實停車場資料
            console.log(`[${currentSessionId}] ✅ 找到 ${parkingData.length} 筆停車場資料`);
          }
        }
      }

      // 美食查詢意圖：查詢餐飲美食類別
      if (isFoodRelated && !isParkingRelated && !isEnglishRelated) {
        console.log(`[${currentSessionId}] 🍽️ 檢測到美食查詢意圖`);
        try {
          const foodRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.餐飲美食&limit=5`, {
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
          });
          
          if (foodRes.ok) {
            const foodData = await foodRes.json();
            if (foodData && foodData.length > 0) {
              recList = foodData; // 使用美食資料
              console.log(`[${currentSessionId}] ✅ 找到 ${foodData.length} 筆美食資料`);
            } else {
              console.log(`[${currentSessionId}] ⚠️ 美食查詢返回空結果`);
              // 不設置 recList，讓後續邏輯處理
            }
          } else {
            console.error(`[${currentSessionId}] ❌ 美食查詢失敗: ${foodRes.status}`);
            // 不設置 recList，讓後續邏輯處理
          }
        } catch (error) {
          console.error(`[${currentSessionId}] ❌ 美食查詢異常:`, error);
          // 不設置 recList，讓後續邏輯處理
        }
      }

      // 英語意圖：只推薦肯塔基美語一家（除非用戶追問）
      if (isEnglishRelated && !isParkingRelated && !isFoodRelated) {
        console.log(`[${currentSessionId}] 🎓 檢測到英語學習意圖`);
        
        // 檢查是否為追問（包含更多關鍵字或明確要求更多推薦）
        const isFollowUpQuery = messageContent.includes('還有其他') || 
                               messageContent.includes('更多') || 
                               messageContent.includes('其他選擇') ||
                               messageContent.includes('還有嗎') ||
                               messageContent.includes('其他') ||
                               messageContent.includes('另外') ||
                               messageContent.includes('還有什麼');
        
        if (isFollowUpQuery) {
          console.log(`[${currentSessionId}] 🔍 檢測到追問，查詢更多英語教育商家`);
          // 追問時：用關鍵字搜索商家資料庫
          const educationRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.教育培訓&limit=5`, {
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
          });
          if (educationRes.ok) {
            const educationData = await educationRes.json();
            if (educationData.length > 0) {
              recList = educationData; // 使用教育培訓類別的所有商家
              console.log(`[${currentSessionId}] ✅ 追問模式：找到 ${educationData.length} 筆教育培訓商家`);
            }
          }
        } else {
          console.log(`[${currentSessionId}] 🎯 首次查詢：只推薦肯塔基美語`);
          // 首次查詢：只推薦肯塔基美語
          const kentuckyRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`, {
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
          });
          if (kentuckyRes.ok) {
            const kentucky = await kentuckyRes.json();
            if (kentucky.length > 0) {
              recList = [kentucky[0]]; // 只保留肯塔基美語
              console.log(`[${currentSessionId}] ✅ 首次查詢：只推薦肯塔基美語`);
            }
          }
        }
      }

      // 限制推薦數量並去重
      const seen = new Set();
      recList = recList.filter((s: any) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      }).slice(0, 3);

      // 資料驗證：確保所有推薦商家都有必要的資訊
      const validatedRecList = recList.filter((s: any) => {
        if (!s.store_name || !s.category) {
          console.warn(`[${currentSessionId}] ⚠️ 商家資料不完整，已過濾:`, s);
          return false;
        }
        return true;
      });

      if (validatedRecList.length === 0) {
        console.log(`[${currentSessionId}] ⚠️ 驗證後無有效商家資料`);
        contextData = "\n\n⚠️ 目前沒有找到相關商家資料，請稍後再試或聯繫客服。";
        
        // 強制設置空的推薦清單，防止 AI 幻覺
        recList = [];
      } else {
        contextData = "\n\n文山特區商圈商家資訊:\n";
        validatedRecList.forEach((s: any, i: number) => {
          const features = safeParseJSON(s.features);
          contextData += `${i + 1}. ${s.store_name} ${s.is_partner_store ? '[特約商家]' : ''}\n`;
          contextData += `   類別: ${s.category}\n`;
          contextData += `   地址: ${s.address || '地址請洽詢店家'}\n`;
          contextData += `   電話: ${s.phone || '電話請洽詢店家'}\n`;
          contextData += `   評分: ${features.rating || '無'}\n`;
          contextData += `   營業狀態: ${features.open_status || '未知'}\n`;
          contextData += `   特色: ${features.description || '無'}\n\n`;
        });
      }
    }

    // Fallback 機制：只有在英語學習查詢且推薦清單為空時，才添加肯塔基美語
    if (recList.length === 0 && isEnglishRelated && !isFoodRelated && !isParkingRelated) {
      console.log(`[${currentSessionId}] ⚠️ 英語學習查詢推薦清單為空，啟動 Fallback 機制`);
      const fallbackRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      if (fallbackRes.ok) {
        const fallback = await fallbackRes.json();
        if (fallback.length > 0) {
          recList = [fallback[0]];
          console.log(`[${currentSessionId}] ✅ Fallback 成功：添加肯塔基美語`);
        } else {
          console.log(`[${currentSessionId}] ❌ Fallback 失敗：無法找到肯塔基美語`);
        }
      }
    } else if (recList.length === 0) {
      console.log(`[${currentSessionId}] ⚠️ 推薦清單為空，但非英語學習查詢，不啟動 Fallback 機制`);
    }

    const systemBase = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切的語調回應，就像在地朋友一樣。 (WEN 1.1.8 - AI幻覺緊急修復版)

重要規則：
1. 每次對話都提供相關商家推薦，優先推薦特約商家
2. 英語學習查詢：首次只推薦肯塔基美語一家，除非用戶明確追問更多選擇
3. 其他查詢：提供 2-3 家相關商家推薦
4. 回答要簡潔實用，避免冗長描述
5. 絕對不要編造虛假的地址或聯絡資訊，如果沒有具體地址就說「地址請洽詢店家」
6. 如果推薦清單為空，請禮貌地告知用戶目前沒有找到相關商家，並詢問是否有其他需求
7. 停車場資訊請提供詳細地址、收費方式、開放時間等，如果沒有具體資訊就說「請洽詢管理單位」
8. 嚴格按照商家類別推薦：美食推薦只推薦餐飲美食類別，英語學習只推薦教育培訓類別
9. 絕對不要將教育機構（如肯塔基美語）描述為餐廳或美食店
10. 如果商家類別與查詢意圖不符，請明確說明並提供正確的商家資訊

⚠️ 嚴禁幻覺規則：
11. 絕對不要編造不存在的商家名稱（如「英文達人」、「環球英語」、「東門市場」、「文山樓」等）
12. 絕對不要編造虛假的地址、電話號碼或營業資訊
13. 只能推薦下方提供的真實商家資料，不得自行創造任何商家資訊
14. 如果推薦清單不足，請明確說明「目前只有以下商家」並只推薦真實存在的商家
15. 所有地址、電話、營業資訊都必須與下方提供的資料完全一致
16. 如果下方沒有提供任何商家資料，請明確告知「目前沒有找到相關商家，請稍後再試或聯繫客服」
17. 絕對不要因為沒有資料就自行編造商家來填補推薦清單
18. 如果看到「⚠️ 目前沒有找到相關商家資料」，請直接告知用戶沒有找到商家，不要推薦任何商家
19. 絕對不要編造「好客食堂」、「福源小館」、「阿村魯肉飯」等不存在的商家名稱
20. 如果沒有真實的商家資料，寧可不推薦也不要編造虛假資訊`;

    const systemPrompt = `${systemBase}${contextData}`;
    console.log(`[${currentSessionId}] System Prompt 長度: ${systemPrompt.length}`);

    // ==== 調用 Claude API ====
    const { signal: claudeSignal, clear: clearClaudeTimeout } = withTimeout(15000);
    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: messageContent }],
      }),
      signal: claudeSignal,
    });
    clearClaudeTimeout();

    if (!claudeResp.ok) {
      const errorText = await claudeResp.text();
      console.error(`[${currentSessionId}] Claude API failed: ${claudeResp.status} - ${errorText}`);
      throw new Error(`Claude API failed: ${claudeResp.status}`);
    }

    const claudeData = await claudeResp.json();
    const aiText = claudeData?.content?.[0]?.text ?? "抱歉，我暫時無法回應。";
    console.log(`[${currentSessionId}] Claude 回應: ${aiText.slice(0, 100)}...`);

    // ==== 使用者/會話 upsert + 訊息寫入 ====
    try {
      // 1) upsert user_profiles
      let profileId: number | null = null;
      if (user_meta?.external_id) {
        console.log(`[${currentSessionId}] 🔄 開始寫入用戶資料...`);
        const upsertUser = await fetch(
          `${SUPABASE_URL}/rest/v1/user_profiles`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${DB_KEY}`,
              apikey: DB_KEY,
              "Content-Type": "application/json",
              Prefer: "return=representation,resolution=merge-duplicates"
            },
            body: JSON.stringify({
              external_id: user_meta.external_id,
              display_name: user_meta.display_name ?? null,
              avatar_url: user_meta.avatar_url ?? null,
              updated_at: new Date().toISOString()
            })
          }
        );

        console.log(`[${currentSessionId}] 用戶資料寫入狀態:`, upsertUser.status);
        if (!upsertUser.ok) {
          const errorText = await upsertUser.text();
          console.error(`[${currentSessionId}] 用戶資料寫入失敗:`, errorText);
        } else {
          const j = await upsertUser.json();
          profileId = j?.[0]?.id ?? null;
          console.log(`[${currentSessionId}] ✅ 用戶資料寫入成功，ID:`, profileId);
        }
      }

      // 2) upsert chat_sessions
      console.log(`[${currentSessionId}] 🔄 開始寫入會話資料...`);
      const upsertSession = await fetch(
        `${SUPABASE_URL}/rest/v1/chat_sessions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DB_KEY}`,
            apikey: DB_KEY,
            "Content-Type": "application/json",
            Prefer: "return=representation,resolution=merge-duplicates"
          },
          body: JSON.stringify({
            session_id: currentSessionId,
            user_id: profileId,
            user_ip: userIP,
            user_agent: req.headers.get("user-agent") ?? null,
            user_meta: user_meta ? JSON.stringify(user_meta) : null,
            started_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            message_count: 0,
          })
        }
      );
      console.log(`[${currentSessionId}] 會話寫入狀態:`, upsertSession.status);
      if (!upsertSession.ok) {
        const errorText = await upsertSession.text();
        console.error(`[${currentSessionId}] 會話寫入失敗:`, errorText);
      }
      const sessionRow = upsertSession.ok ? (await upsertSession.json())?.[0] : null;
      const sessionId = sessionRow?.id;
      console.log(`[${currentSessionId}] 會話ID:`, sessionId);

      if (sessionId) {
        console.log(`[${currentSessionId}] ✅ 會話寫入成功，開始寫入消息...`);
        const now = new Date().toISOString();

        // 3) 寫兩則訊息
        const msgs = [
          { session_id: sessionId, message_type: "user", content: messageContent, created_at: now },
          { session_id: sessionId, message_type: "bot", content: aiText, created_at: now }
        ];

        const messageRes = await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${DB_KEY}`, apikey: DB_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(msgs)
        });

        console.log(`[${currentSessionId}] 消息寫入狀態:`, messageRes.status);
        if (!messageRes.ok) {
          const errorText = await messageRes.text();
          console.error(`[${currentSessionId}] 消息寫入失敗:`, errorText);
        } else {
          console.log(`[${currentSessionId}] ✅ 消息寫入成功`);
        }

        // 4) 更新計數
        const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${DB_KEY}`, apikey: DB_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ message_count: (sessionRow.message_count ?? 0) + 2, last_activity: now })
        });

        console.log(`[${currentSessionId}] 會話更新狀態:`, updateRes.status);
        if (!updateRes.ok) {
          const errorText = await updateRes.text();
          console.error(`[${currentSessionId}] 會話更新失敗:`, errorText);
        } else {
          console.log(`[${currentSessionId}] ✅ 會話更新成功`);
        }
      } else {
        console.error(`[${currentSessionId}] ❌ 會話ID為空，無法寫入消息`);
      }
    } catch (e) {
      console.error(`[${currentSessionId}] DB write failed:`, e?.message ?? e);
    }

    const responseBody = {
      response: aiText,
      sessionId: currentSessionId,
      recommendation: recList.map(r => ({
        id: r.id,
        name: r.store_name,
        category: r.category,
        is_partner_store: r.is_partner_store,
        address: r.address,
        phone: r.phone,
        features: r.features
      })),
      debug: {
        isEnglishRelated,
        isParkingRelated,
        isFoodRelated,
        recCount: recList.length,
        fallbackTriggered: recList.length === 0 && isEnglishRelated && !isFoodRelated && !isParkingRelated
      },
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(responseBody), {
      headers: { ...CORS_BASE, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...CORS_BASE, "Content-Type": "application/json" },
    });
  }
});
