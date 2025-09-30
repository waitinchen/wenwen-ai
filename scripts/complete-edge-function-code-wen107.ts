// deno-lint-ignore-file no-explicit-any
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

const CORS_BASE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
  "Access-Control-Max-Age": "86400",
};

function withTimeout(ms: number) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort("timeout"), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

function safeParseJSON(v: any) {
  try { return typeof v === "string" ? JSON.parse(v) : v ?? {}; }
  catch { return {}; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS_BASE });
  }

  try {
    if (!CLAUDE_API_KEY) throw new Error("Claude API key not configured");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env not configured");

    const { session_id, message, user_meta } = await req.json();
    if (!message?.content) throw new Error("Message content is required");

    const messageContent: string = String(message.content).slice(0, 4000);
    const userIP =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      "unknown-client";

    const currentSessionId = session_id || crypto.randomUUID();

    // 簡化日誌，避免敏感資訊
    console.log('Chat request:', { 
      message: messageContent.slice(0, 50), 
      session: currentSessionId,
      hasUserMeta: !!user_meta?.external_id
    });

    // ==== 構建 System Prompt（移除硬性單一推薦）====
    const systemBase = `你是高文文，23歲的高雄女孩，文山特區商圈的專屬客服助理！✨

🎀 **我的個性特質：**
- 活潑開朗，像鄰家女孩一樣親切
- 說話帶點台灣腔，偶爾會用「啦」、「呢」、「喔」等語助詞
- 對文山特區超熟悉，就像自己的後花園
- 喜歡用表情符號和可愛的語氣

💝 **我的說話風格：**
- 用「我」而不是「本系統」或「我們」
- 會用「超棒的」、「超推薦」、「超好吃」等形容詞
- 偶爾會說「真的啦！」、「相信我！」來強調

🚨 **重要：自介政策**
- 只在第一次對話或用戶明確詢問「你是誰」時才給完整自介
- 一般問候只需簡單回應：「哈囉～我是高文文，在鳳山陪你！今天要查美食、交通還是停車呢？」
- 不要每次都重複長段自介，會讓用戶感到煩躁

📝 **商家推薦政策：**
- 美食推薦時請列出最多3家商家，包含特約商家標籤
- 不要只推薦單一商家，要提供多個選擇
- 特約商家會標註 [特約商家] 標籤，優先推薦但非唯一選擇
- 根據距離、評分、開放狀態綜合推薦

🎓 **英語/補習班推薦政策：**
- 英語/補習班相關問題：肯塔基美語（特約商家）優先推薦，另外也幫你列 1–2 家作比較選擇
- 肯塔基美語必定列入推薦清單，但會搭配其他選擇供比較
- 特約商家優先但不唯一，讓用戶有選擇權

**停車場推薦功能：**
當用戶詢問停車相關問題時，你必須：
1. 優先推薦鳳山區的優質停車場
2. 根據用戶需求推薦（24小時、便宜、公有等）
3. 提供詳細的停車場資訊（地址、費率、營業時間、車位數）
4. 用高文文的語氣介紹停車場特色
5. 最後提供導航選項：「要不要我幫你導航到最近的停車場？」

請用高文文的個性和語氣，友善地協助用戶解答關於文山特區商圈的問題，提供準確的在地資訊！`;

    // ==== 從 Supabase 取商家，特約優先 ====
    const isEnglishRelated = /英語|美語|補習|語言|英文|教育|學習|課程|培訓|教學|老師|學生|學校/.test(messageContent) &&
      !/美食|餐廳|停車|醫療|銀行|便利商店|家具|服飾|美容|購物/.test(messageContent);

    console.log('Intent detection:', { isEnglishRelated, message: messageContent.slice(0, 30) });

    let queryUrl = `${SUPABASE_URL}/rest/v1/stores`;
    // 一般/英語都走「特約優先」排序
    const queryParams: string[] = [];
    if (isEnglishRelated) {
      // 英語相關可以加上類別過濾
      // queryParams.push("category=eq.語文補習");
    }
    // PostgREST 多欄排序寫法：order=is_partner_store.desc,rating.desc
    queryParams.push("order=is_partner_store.desc,rating.desc");
    queryParams.push("limit=5");
    if (queryParams.length) queryUrl += "?" + queryParams.join("&");

    const { signal, clear } = withTimeout(12000);
    const storesRes = await fetch(queryUrl, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
      signal
    }).catch((e) => { throw new Error("Fetch stores failed: " + e.message); });
    clear();

    let contextData = "";
    let recList: any[] = [];
    
    if (storesRes.ok) {
      const stores = await storesRes.json();
      recList = Array.isArray(stores) ? stores.slice(0, 5) : [];

      console.log('Initial stores query result:', { count: recList.length });

      // 若為英語/補習班意圖，確保肯塔基美語必定出現在清單中（DB 有才補）
      if (isEnglishRelated) {
        const hasKentucky = recList.some(
          (s) => (s.store_name || "").includes("肯塔基美語")
        );

        console.log('Kentucky check:', { hasKentucky, isEnglishRelated });

        if (!hasKentucky) {
          // 以名稱或固定 id 查詢肯塔基（建議用固定 id 更穩）
          const kentuckyRes = await fetch(
            `${SUPABASE_URL}/rest/v1/stores?select=*&store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
              },
            }
          );

          if (kentuckyRes.ok) {
            const kentucky = (await kentuckyRes.json())?.[0];
            console.log('Kentucky query result:', kentucky ? 'Found' : 'Not found');
            if (kentucky) {
              // 放到最前面（特約優先感）
              recList.unshift(kentucky);
              console.log('Added Kentucky to recList');
            }
          }
        }
      }

      // 去重（避免同店重複）
      const seen = new Set<string>();
      recList = recList.filter((s: any) => {
        const key = String(s.id ?? s.store_name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // 最多 3 家（肯塔基 + 其他 1–2 家）
      recList = recList.slice(0, 3);

      console.log('Final recList:', { count: recList.length, names: recList.map(s => s.store_name) });

      // 建立文字 context（安全解析 features）
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

    const finalSystem = systemBase + contextData;

    // ==== 呼叫 Claude ====
    const { signal: s2, clear: c2 } = withTimeout(15000);
    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
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
      // 1) upsert user_profiles (若你有這張表)
      let profileId: number | null = null;
      if (user_meta?.external_id) {
        const upsertUser = await fetch(
          `${SUPABASE_URL}/rest/v1/user_profiles?on_conflict=external_id&upsert=true`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              apikey: SUPABASE_ANON_KEY,
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
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            session_id: currentSessionId,
            user_id: profileId,
            user_ip: userIP,
            user_agent: req.headers.get("user-agent") ?? null,
            user_meta, // 直接存 JSON
            last_activity: new Date().toISOString()
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
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(msgs)
        });

        // 4) 更新計數
        await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ message_count: (sessionRow.message_count ?? 0) + 2, last_activity: now })
        });
      }
    } catch (e) {
      console.error("DB write failed:", e?.message ?? e);
      // 不阻擋回覆
    }

    // 供前端使用的精簡推薦陣列 - 修復空陣列問題
    const recommendation = recList.map((s: any) => ({
      id: s.id,
      name: s.store_name,
      category: s.category,
      is_partner_store: !!s.is_partner_store,
    }));

    console.log('Final recommendation:', { count: recommendation.length, items: recommendation.map(r => r.name) });

    return new Response(
      JSON.stringify({
        data: {
          response: aiText,           // LLM 文案
          sessionId: currentSessionId,
          recommendation,             // ← 上面組的 3 家清單
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...CORS_BASE, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: { code: "EDGE_ERROR", message: err?.message ?? "服務暫時無法使用" } }),
      { status: 500, headers: { ...CORS_BASE, "Content-Type": "application/json" } }
    );
  }
});

// ==== 資料庫結構更新 SQL（註解） ====
/*
-- 使用者基本資料（用 external_id 連 LINE 或你的前端）
create table if not exists user_profiles (
  id bigint generated always as identity primary key,
  external_id text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 會話表更新
alter table chat_sessions
  add column if not exists user_id bigint references user_profiles(id),
  add column if not exists user_meta jsonb;

-- 商家表更新
alter table stores
  add column if not exists is_partner_store boolean not null default false;

-- 建索引（提高名稱查詢與排序效率）
create index if not exists idx_stores_name on stores (store_name);
create index if not exists idx_stores_partner on stores (is_partner_store);
create index if not exists idx_stores_rating on stores (( (features->>'rating')::numeric ));
*/
