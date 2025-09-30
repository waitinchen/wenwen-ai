import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 語氣靈推薦引擎 v2.0 - 主入口函式
// WEN 1.2.0 - 五層架構設計實現
// deno-lint-ignore-file no-explicit-any

import { DataLayer } from "./lib/data-layer.ts";
import { IntentClassifier } from "./lib/intent-classifier.ts";
import { RecommendationEngine } from "./lib/recommendation-engine.ts";
import { ToneRenderer } from "./lib/tone-renderer.ts";
import { FeedbackLogger } from "./lib/feedback-logger.ts";
import { safeFetch } from "./lib/utils/safe-fetch.ts";
import { HallucinationFirewall } from "./lib/utils/hallucination-firewall.ts";

// 環境變數配置
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// 初始化各層模組
const dataLayer = new DataLayer(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY);
const intentClassifier = new IntentClassifier();
const recommendationEngine = new RecommendationEngine(dataLayer);
const toneRenderer = new ToneRenderer();
const feedbackLogger = new FeedbackLogger(dataLayer);
const hallucinationFirewall = new HallucinationFirewall();

interface ChatRequest {
  session_id: string;
  message: {
    role: string;
    content: string;
  };
  user_meta: {
    external_id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface ChatResponse {
  response: string;
  session_id: string;
  intent: string;
  confidence: number;
  recommended_stores: any[];
  debug: any;
  version: string;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: ChatRequest = await req.json();
    const { session_id, message, user_meta } = requestData;
    const currentSessionId = session_id || `session-${Date.now()}`;
    
    console.log(`[${currentSessionId}] 🎯 語氣靈引擎 v2.0 啟動`);
    console.log(`[${currentSessionId}] 💬 用戶訊息: "${message.content}"`);

    // ===== 1️⃣ 資料層：確保用戶資料存在 =====
    const userId = await dataLayer.ensureUserExists(user_meta, currentSessionId);
    const sessionData = await dataLayer.ensureSessionExists(currentSessionId, userId, user_meta);

    // ===== 2️⃣ 語意理解層：意圖分類與語系偵測 =====
    const intentResult = await intentClassifier.classifyIntent(message.content);
    console.log(`[${currentSessionId}] 🧠 意圖分析: ${intentResult.primary} (信心度: ${intentResult.confidence})`);
    console.log(`[${currentSessionId}] 🌍 語系: ${intentResult.language}`);
    console.log(`[${currentSessionId}] ❓ 是否追問: ${intentResult.isFollowUp}`);

    // ===== 3️⃣ 推薦策略層：獲取商家資料 =====
    const recommendedStores = await recommendationEngine.getStoresByIntent(
      intentResult.primary,
      intentResult.isFollowUp,
      currentSessionId
    );

    console.log(`[${currentSessionId}] 📊 推薦結果: ${recommendedStores.length} 家商家`);

    // ===== 4️⃣ 幻覺防線：嚴格驗證 =====
    const validatedStores = hallucinationFirewall.validateStores(
      recommendedStores,
      intentResult.primary,
      currentSessionId
    );

    // ===== 5️⃣ 語氣生成層：生成回應 =====
    const systemPrompt = toneRenderer.generateSystemPrompt(
      intentResult,
      validatedStores,
      message.content,
      currentSessionId
    );

    console.log(`[${currentSessionId}] 🎨 生成語氣模板: ${toneRenderer.getCurrentToneName()}`);

    // ===== 6️⃣ 調用 Claude API =====
    const claudeResponse = await safeFetch('https://api.anthropic.com/v1/messages', {
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
            content: message.content
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API 失敗: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content[0].text;

    // ===== 7️⃣ 記錄回饋層：完整記錄 =====
    await feedbackLogger.logInteraction({
      sessionId: currentSessionId,
      userId,
      userMessage: message.content,
      aiResponse,
      intent: intentResult.primary,
      stores: validatedStores,
      userMeta: user_meta,
      confidence: intentResult.confidence,
      tone: toneRenderer.getCurrentToneName()
    });

    // ===== 8️⃣ 回應結果 =====
    const responseBody: ChatResponse = {
      response: aiResponse,
      session_id: currentSessionId,
      intent: intentResult.primary,
      confidence: intentResult.confidence,
      recommended_stores: validatedStores.map(store => ({
        id: store.id,
        name: store.store_name,
        category: store.category,
        is_partner: store.is_partner_store,
        address: store.address,
        phone: store.phone
      })),
      debug: {
        language: intentResult.language,
        isFollowUp: intentResult.isFollowUp,
        matchedKeywords: intentResult.keywords,
        storeCount: validatedStores.length,
        tone: toneRenderer.getCurrentToneName(),
        engine: 'wen-v2.0'
      },
      version: 'WEN 1.2.0'
    };

    console.log(`[${currentSessionId}] ✅ 回應生成完成`);

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('語氣靈引擎錯誤:', error);
    
    const errorResponse = {
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'WEN 1.2.0'
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
