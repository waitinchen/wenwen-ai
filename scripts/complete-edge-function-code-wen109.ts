// WEN 1.0.9 - 補強版本：保障推薦清單永不為空 + Service Role Key
// deno-lint-ignore-file no-explicit-any
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
  if (typeof s === "object" && s !== null) return s;
  if (typeof s === "string") {
    try { return JSON.parse(s); } catch { return {}; }
  }
  return {};
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS_BASE });
  }

  try {
    if (!CLAUDE_API_KEY) throw new Error("Claude API key not configured");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase Service Role key not configured");

    const { session_id, message, user_meta } = await req.json();
    if (!message?.content) throw new Error("Message content is required");

    const messageContent: string = String(message.content).slice(0, 4000);
    const currentSessionId = session_id || `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const userIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // ==== 商家推薦邏輯 ====
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

    let recList: any[] = [];
    let contextData = "";

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
      
      // 英語意圖：確保肯塔基美語在推薦清單中
      if (isEnglishRelated) {
        const hasKentucky = recList.some((s: any) => (s.store_name || '').includes('肯塔基美語'));
        if (!hasKentucky) {
          // 單獨查詢肯塔基美語
          const kentuckyRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`, {
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
          });
          if (kentuckyRes.ok) {
            const kentucky = await kentuckyRes.json();
            if (kentucky.length > 0) {
              recList.unshift(kentucky[0]); // 放到最前面
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

      contextData = "\n\n文山特區商圈商家資訊:\n";
      recList.forEach((s: any, i: number) => {
        const f = safeParseJSON(s.features);
        const rating = f.rating ?? "無評分";
        const reviews = f.reviews ?? 0;
        const district = f.district_area ?? "鳳山區";
        const tag = s.is_partner_store ? " [特約商家]" : "";
        contextData += `${i + 1}. ${s.store_name}${tag} (${s.category}) - ${s.address || '地址待確認'} - 評分: ${rating}（${reviews}則） - 區域: ${district}\n`;
      });
    } else {
      console.error('Stores query failed:', storesRes.status, await storesRes.text());
    }

    // -------- Fallback：確保推薦清單至少有肯塔基 --------
    if (recList.length === 0) {
      console.log('🔄 觸發 fallback：推薦清單為空，嘗試補上肯塔基');
      // 優先用固定 ID （較穩）、沒有再用名稱
      let kentucky: any | null = null;

      const KID = Deno.env.get("KENTUCKY_STORE_ID");
      if (KID) {
        console.log('🔍 使用固定 ID 查詢肯塔基:', KID);
        const r = await fetch(`${SUPABASE_URL}/rest/v1/stores?id=eq.${encodeURIComponent(KID)}&limit=1`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
        });
        if (r.ok) kentucky = (await r.json())?.[0] ?? null;
      }
      
      if (!kentucky) {
        console.log('🔍 使用名稱查詢肯塔基');
        const r2 = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
        });
        if (r2.ok) kentucky = (await r2.json())?.[0] ?? null;
      }

      if (kentucky) {
        recList = [kentucky];
        console.log('✅ Fallback 成功：補上肯塔基美語');
        
        // 重新建立 contextData
        contextData = "\n\n文山特區商圈商家資訊:\n";
        recList.forEach((s: any, i: number) => {
          const f = safeParseJSON(s.features);
          const rating = f.rating ?? "無評分";
          const reviews = f.reviews ?? 0;
          const district = f.district_area ?? "鳳山區";
          const tag = s.is_partner_store ? " [特約商家]" : "";
          contextData += `${i + 1}. ${s.store_name}${tag} (${s.category}) - ${s.address || '地址待確認'} - 評分: ${rating}（${reviews}則） - 區域: ${district}\n`;
        });
      } else {
        console.log('❌ Fallback 失敗：無法找到肯塔基美語');
      }
    }

    const systemBase = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切的語調回應，就像在地朋友一樣。

重要規則：
1. 每次對話都提供 2-3 家相關商家推薦，優先推薦特約商家
2. 如果用戶詢問英語學習相關，優先推薦肯塔基美語（特約商家）
3. 回答要簡潔實用，避免冗長描述
4. 如果用戶詢問停車，提供停車場資訊包括費率、營業時間、車位數
5. 用繁體中文回應，語氣友善親切`;

    const finalSystem = systemBase + contextData;

    // ==== 呼叫 Claude ====
    const { signal: s2, clear: c2 } = withTimeout(15000);
    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 900,
        temperature: 0.6,
        system: finalSystem,
        messages: [{ role: "user", content: messageContent }],
      }),
      signal: s2
    });
    c2();

    if (!claudeResp.ok) {
      const err = await claudeResp.text().catch(() => "");
      console.error("Claude error:", err);
      throw new Error("AI 服務暫時無法使用，請稍後再試");
    }
    const claudeData = await claudeResp.json();
    const aiText = claudeData?.content?.[0]?.text ?? "抱歉，我暫時無法回應。";

    // ==== 使用者/會話 upsert + 訊息寫入 ====
    try {
      // 1) upsert user_profiles
      let profileId: number | null = null;
      if (user_meta?.external_id) {
        const upsertUser = await fetch(
          `${SUPABASE_URL}/rest/v1/user_profiles?on_conflict=external_id&upsert=true`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${DB_KEY}`,
              apikey: DB_KEY,
              "Content-Type": "application/json",
              Prefer: "return=representation"
            },
            body: JSON.stringify({
              external_id: user_meta.external_id,
              display_name: user_meta.display_name ?? null,
              avatar_url: user_meta.avatar_url ?? null,
              updated_at: new Date().toISOString()
            })
          }
        );
        if (upsertUser.ok) {
          const j = await upsertUser.json();
          profileId = j?.[0]?.id ?? null;
        }
      }

      // 2) upsert chat_sessions
      const upsertSession = await fetch(
        `${SUPABASE_URL}/rest/v1/chat_sessions?on_conflict=session_id&upsert=true`,
        {
          method: "POST",
        headers: {
          Authorization: `Bearer ${DB_KEY}`,
          apikey: DB_KEY,
          "Content-Type": "application/json",
          Prefer: "return=representation"
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
            last_message_preview: messageContent.slice(0, 100)
          })
        }
      );
      const sessionRow = upsertSession.ok ? (await upsertSession.json())?.[0] : null;
      const sessionId = sessionRow?.id;

      if (sessionId) {
        const now = new Date().toISOString();

        // 3) 寫兩則訊息
        const msgs = [
          { session_id: sessionId, message_type: "user", content: messageContent, created_at: now },
          { session_id: sessionId, message_type: "bot",  content: aiText,         created_at: now }
        ];
        await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${DB_KEY}`, apikey: DB_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(msgs)
        });

        // 4) 更新計數
        await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${DB_KEY}`, apikey: DB_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ message_count: (sessionRow.message_count ?? 0) + 2, last_activity: now })
        });
      }
    } catch (e) {
      console.error("DB write failed:", e?.message ?? e);
      // 不阻擋回覆
    }

    // 供前端使用的精簡推薦陣列 - 確保不會為空
    const recommendation = recList.map((s: any) => ({
      id: s.id,
      name: s.store_name,
      category: s.category,
      is_partner_store: !!s.is_partner_store,
    }));

    console.log('Final recommendation:', { count: recommendation.length, items: recommendation.map(r => r.name) });

    // 如果推薦清單為空，至少提供肯塔基美語
    if (recommendation.length === 0 && isEnglishRelated) {
      const fallbackKentucky = {
        id: 610,
        name: "肯塔基美語",
        category: "語文補習",
        is_partner_store: true
      };
      recommendation.push(fallbackKentucky);
      console.log('Added fallback Kentucky to recommendation');
    }

    return new Response(JSON.stringify({
      response: aiText,
      sessionId: currentSessionId,
      recommendation: recommendation,
      debug: {
        isEnglishRelated,
        recCount: recList.length,
        fallbackTriggered: recommendation.length === 1 && isEnglishRelated
      }
    }), {
      status: 200,
      headers: { ...CORS_BASE, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Edge function error:", error?.message ?? error);
    return new Response(JSON.stringify({
      error: error?.message ?? "聊天服務暫時無法使用"
    }), {
      status: 500,
      headers: { ...CORS_BASE, "Content-Type": "application/json" }
    });
  }
});

/* 必要 SQL DDL（若尚未執行）：

-- 使用者基本資料（用 external_id 連 LINE 或你的前端）
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 會話表更新
ALTER TABLE chat_sessions
  ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES user_profiles(id),
  ADD COLUMN IF NOT EXISTS user_meta JSONB;

-- 商家表更新
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN NOT NULL DEFAULT false;

-- 建索引（提高名稱查詢與排序效率）
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores (store_name);
CREATE INDEX IF NOT EXISTS idx_stores_partner ON stores (is_partner_store);
CREATE INDEX IF NOT EXISTS idx_stores_rating ON stores ((features->>'rating'));

-- 環境變數設定（在 Supabase Dashboard > Settings > Edge Functions）
-- SUPABASE_URL: https://vqcuwjfxoxjgsrueqodj.supabase.co
-- SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo
-- SUPABASE_SERVICE_ROLE_KEY: [請在 Supabase Dashboard > Settings > API 中找到]
-- CLAUDE_API_KEY: [您的 Claude API Key]
-- KENTUCKY_STORE_ID: [可選] 肯塔基美語的固定 ID

*/
