import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// WEN 1.1.1 - Claude API 修復版本
// deno-lint-ignore-file no-explicit-any
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;

// 資料庫寫入統一使用 Service Role Key（避免 RLS 限制）
const DB_KEY = SUPABASE_SERVICE_ROLE_KEY;

const CORS_BASE = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_BASE });
  }

  try {
    console.log("🔍 Edge Function 啟動，檢查環境變數...");
    console.log("CLAUDE_API_KEY 存在:", !!CLAUDE_API_KEY);
    console.log("CLAUDE_API_KEY 長度:", CLAUDE_API_KEY?.length);
    console.log("SUPABASE_SERVICE_ROLE_KEY 存在:", !!SUPABASE_SERVICE_ROLE_KEY);

    if (!CLAUDE_API_KEY) throw new Error("Claude API key not configured");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase Service Role key not configured");

    const { session_id, message, user_meta } = await req.json();
    if (!message?.content) throw new Error("Message content is required");

    const messageContent: string = String(message.content).slice(0, 4000);
    const currentSessionId = session_id || `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const userIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // 簡化的商家推薦邏輯
    let recList: any[] = [];
    let contextData = '';

    // 查詢商家資料
    const storesRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?limit=3`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
    });

    if (storesRes.ok) {
      const stores = await storesRes.json();
      recList = Array.isArray(stores) ? stores.slice(0, 3) : [];
      
      contextData = "\n\n文山特區商圈商家資訊:\n";
      recList.forEach((s: any, i: number) => {
        const tag = s.is_partner_store ? " [特約商家]" : "";
        contextData += `${i + 1}. ${s.store_name}${tag} (${s.category}) - ${s.address || '地址待確認'}\n`;
      });
    }

    const systemBase = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切的語調回應，就像在地朋友一樣。 (WEN 1.1.1 - Claude API 修復版)

重要規則：
1. 每次對話都提供 2-3 家相關商家推薦，優先推薦特約商家
2. 回答要簡潔實用，避免冗長描述
3. 用繁體中文回應，語氣友善親切
4. 絕對不要編造虛假的地址或聯絡資訊，如果沒有具體地址就說「地址請洽詢店家」`;

    const finalSystem = systemBase + contextData;

    // ==== 呼叫 Claude API (修復版本) ====
    console.log("🔄 開始調用 Claude API...");
    
    const claudeResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307", // 使用較舊但穩定的模型
        max_tokens: 1000,
        system: finalSystem,
        messages: [{ role: "user", content: messageContent }]
      })
    });

    console.log("Claude API 回應狀態:", claudeResp.status);
    
    if (!claudeResp.ok) {
      const errorText = await claudeResp.text();
      console.error("Claude API 錯誤:", errorText);
      throw new Error(`Claude API failed: ${claudeResp.status} - ${errorText}`);
    }

    const claudeData = await claudeResp.json();
    const aiText = claudeData?.content?.[0]?.text ?? "抱歉，我暫時無法回應。";

    // ==== 簡化的資料庫寫入邏輯 ====
    try {
      console.log("🔄 開始資料庫寫入...");
      
      // 1) 寫入用戶資料
      let profileId: number | null = null;
      if (user_meta?.external_id) {
        const upsertUser = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
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
        });
        
        if (upsertUser.ok) {
          const j = await upsertUser.json();
          profileId = j?.[0]?.id ?? null;
          console.log("✅ 用戶資料寫入成功，ID:", profileId);
        } else {
          console.error("❌ 用戶資料寫入失敗:", await upsertUser.text());
        }
      }

      // 2) 寫入會話資料
      const upsertSession = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DB_KEY}`,
          apikey: DB_KEY,
          "Content-Type": "application/json",
          Prefer: "return=representation,resolution=merge-duplicates"
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          user_ip: userIP,
          user_agent: req.headers.get("user-agent") ?? null,
          user_meta: user_meta ? JSON.stringify(user_meta) : null,
          started_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          message_count: 0
        })
      });
      
      if (upsertSession.ok) {
        const sessionRow = await upsertSession.json();
        const sessionId = sessionRow?.[0]?.id;
        console.log("✅ 會話資料寫入成功，ID:", sessionId);

        if (sessionId) {
          // 3) 寫入消息
          const now = new Date().toISOString();
          const msgs = [
            { session_id: sessionId, message_type: "user", content: messageContent, created_at: now },
            { session_id: sessionId, message_type: "bot", content: aiText, created_at: now }
          ];
          
          const messageRes = await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${DB_KEY}`, apikey: DB_KEY, "Content-Type": "application/json" },
            body: JSON.stringify(msgs)
          });
          
          if (messageRes.ok) {
            console.log("✅ 消息寫入成功");
          } else {
            console.error("❌ 消息寫入失敗:", await messageRes.text());
          }

          // 4) 更新計數
          await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${DB_KEY}`, apikey: DB_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ message_count: 2, last_activity: now })
          });
        }
      } else {
        console.error("❌ 會話寫入失敗:", await upsertSession.text());
      }
    } catch (e) {
      console.error("資料庫寫入失敗:", e?.message ?? e);
      // 不阻擋回覆
    }

    // ==== 生成推薦清單 ====
    const recommendation = recList.map((s: any) => ({
      id: s.id,
      name: s.store_name,
      category: s.category,
      is_partner_store: s.is_partner_store || false
    }));

    return new Response(
      JSON.stringify({
        response: aiText,
        sessionId: currentSessionId,
        recommendation: recommendation
      }),
      { 
        headers: { 
          ...CORS_BASE, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...CORS_BASE, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
