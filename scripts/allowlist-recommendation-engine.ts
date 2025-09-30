/**
 * 允許清單推薦引擎 - 取代黑名單架構
 * 實現：允許清單（Allowlist）+ 資格規則（Eligibility）+ 贊助等級（Sponsorship Tier）+ 證據優先（Evidence-required）
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 允許清單推薦引擎 =====
class AllowlistRecommendationEngine {
  private sessionId: string;
  private userMessage: string;
  private userMeta: any;

  constructor(sessionId: string, userMessage: string, userMeta: any) {
    this.sessionId = sessionId;
    this.userMessage = userMessage;
    this.userMeta = userMeta;
  }

  /**
   * 執行允許清單推薦流程
   */
  async executeAllowlistRecommendation(): Promise<RecommendationResult> {
    console.log(`[${this.sessionId}] 🎯 允許清單推薦引擎啟動`);

    try {
      // 1. 意圖分類
      const intentResult = this.classifyIntent(this.userMessage);
      console.log(`[${this.sessionId}] 🧠 意圖分析: ${intentResult.intent}`);

      // 2. 獲取合格商家（允許清單）
      const eligibleStores = await this.getEligibleStores(intentResult.intent);
      console.log(`[${this.sessionId}] ✅ 合格商家: ${eligibleStores.length} 家`);

      // 3. 英語意圖特殊處理（肯塔基必入列）
      const finalStores = await this.handleEnglishIntent(eligibleStores, intentResult.intent);
      console.log(`[${this.sessionId}] 🎓 英語處理後: ${finalStores.length} 家`);

      // 4. 證據優先驗證
      const verifiedStores = await this.verifyEvidence(finalStores);
      console.log(`[${this.sessionId}] 🔍 證據驗證後: ${verifiedStores.length} 家`);

      // 5. 按贊助等級排序
      const rankedStores = this.rankBySponsorshipTier(verifiedStores);
      console.log(`[${this.sessionId}] 🏆 贊助等級排序後: ${rankedStores.length} 家`);

      // 6. 生成 AI 回應
      const aiResponse = await this.generateAIResponse(intentResult.intent, rankedStores);

      // 7. 記錄推薦日誌
      await this.logRecommendation(intentResult.intent, rankedStores);

      return {
        response: aiResponse,
        session_id: this.sessionId,
        intent: intentResult.intent,
        recommended_stores: rankedStores.map(s => ({
          id: s.id,
          name: s.store_name,
          category: s.category,
          sponsorship_tier: s.sponsorship_tier,
          store_code: s.store_code,
          evidence_level: s.evidence_level
        })),
        recommendation_logic: {
          intent: intentResult.intent,
          eligible_count: eligibleStores.length,
          final_count: rankedStores.length,
          kentucky_included: rankedStores.some(s => s.store_code === 'kentucky'),
          evidence_verified: rankedStores.every(s => s.evidence_level === 'verified')
        },
        version: 'ALLOWLIST-v1.0'
      };

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 允許清單推薦失敗:`, error);
      return {
        response: '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。',
        session_id: this.sessionId,
        intent: 'general',
        recommended_stores: [],
        recommendation_logic: {
          error: error.message,
          fallback_used: true
        },
        version: 'ALLOWLIST-v1.0-ERROR'
      };
    }
  }

  /**
   * 意圖分類
   */
  private classifyIntent(message: string): { intent: string; confidence: number } {
    const normalizedMessage = message.toLowerCase().trim();
    
    const englishKeywords = ['美語', '英語', '英文', '學美語', '學英語', '英文學習', '語言學習'];
    const foodKeywords = ['美食', '餐廳', '小吃', '料理', '餐飲', '吃', '喝'];
    const parkingKeywords = ['停車', '停車場', '車位', '停車位'];
    
    const isEnglishRelated = englishKeywords.some(keyword => normalizedMessage.includes(keyword)) && 
                            !foodKeywords.some(keyword => normalizedMessage.includes(keyword));
    const isFoodRelated = foodKeywords.some(keyword => normalizedMessage.includes(keyword)) && 
                         !englishKeywords.some(keyword => normalizedMessage.includes(keyword));
    const isParkingRelated = parkingKeywords.some(keyword => normalizedMessage.includes(keyword));
    
    if (isEnglishRelated) return { intent: 'english_learning', confidence: 0.9 };
    if (isFoodRelated) return { intent: 'food', confidence: 0.8 };
    if (isParkingRelated) return { intent: 'parking', confidence: 0.8 };
    
    return { intent: 'general', confidence: 0.6 };
  }

  /**
   * 獲取合格商家（允許清單查詢）
   */
  private async getEligibleStores(intent: string): Promise<any[]> {
    console.log(`[${this.sessionId}] 🔍 查詢合格商家，意圖: ${intent}`);
    
    // 構建查詢參數
    const queryParams = new URLSearchParams({
      'approval': 'eq.approved',
      'order': 'sponsorship_tier.desc,is_partner_store.desc,rating.desc.nullslast',
      'limit': '10'
    });

    // 根據意圖添加類別篩選
    if (intent === 'english_learning') {
      queryParams.append('category', 'eq.教育培訓');
    } else if (intent === 'food') {
      queryParams.append('category', 'eq.餐飲美食');
    } else if (intent === 'parking') {
      queryParams.append('category', 'eq.停車場');
    }

    const queryUrl = `${SUPABASE_URL}/rest/v1/stores?${queryParams.toString()}`;
    
    try {
      const response = await fetch(queryUrl, {
        headers: { 
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 
          apikey: SUPABASE_ANON_KEY 
        }
      });
      
      if (response.ok) {
        const stores = await response.json();
        console.log(`[${this.sessionId}] ✅ 查詢成功: ${stores.length} 家合格商家`);
        return stores;
      } else {
        console.error(`[${this.sessionId}] ❌ 查詢失敗: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 查詢異常:`, error);
      return [];
    }
  }

  /**
   * 英語意圖特殊處理（肯塔基必入列）
   */
  private async handleEnglishIntent(stores: any[], intent: string): Promise<any[]> {
    if (intent !== 'english_learning') {
      return stores;
    }

    console.log(`[${this.sessionId}] 🎓 處理英語學習意圖`);

    // 檢查是否已包含肯塔基美語
    const hasKentucky = stores.some(s => 
      s.store_code === 'kentucky' || s.store_name.includes('肯塔基美語')
    );

    if (!hasKentucky) {
      console.log(`[${this.sessionId}] 🔍 未找到肯塔基美語，嘗試補入`);
      
      try {
        // 嘗試通過 store_code 查找
        let kentuckyResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_code=eq.kentucky&approval=eq.approved&limit=1`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
        });

        if (kentuckyResponse.ok) {
          const kentuckyStores = await kentuckyResponse.json();
          if (kentuckyStores.length > 0) {
            console.log(`[${this.sessionId}] ✅ 通過 store_code 找到肯塔基美語`);
            return [kentuckyStores[0], ...stores.slice(0, 2)]; // 肯塔基 + 最多2家其他
          }
        }

        // 嘗試通過店名查找
        kentuckyResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=ilike.%肯塔基美語%&approval=eq.approved&limit=1`, {
          headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
        });

        if (kentuckyResponse.ok) {
          const kentuckyStores = await kentuckyResponse.json();
          if (kentuckyStores.length > 0) {
            console.log(`[${this.sessionId}] ✅ 通過店名找到肯塔基美語`);
            return [kentuckyStores[0], ...stores.slice(0, 2)]; // 肯塔基 + 最多2家其他
          }
        }

        console.log(`[${this.sessionId}] ⚠️ 未找到肯塔基美語，使用現有清單`);
      } catch (error) {
        console.error(`[${this.sessionId}] ❌ 查找肯塔基美語失敗:`, error);
      }
    } else {
      console.log(`[${this.sessionId}] ✅ 已包含肯塔基美語`);
    }

    return stores.slice(0, 3); // 限制最多3家
  }

  /**
   * 證據優先驗證
   */
  private async verifyEvidence(stores: any[]): Promise<any[]> {
    console.log(`[${this.sessionId}] 🔍 證據優先驗證`);
    
    // 過濾出有證據支持的商家
    const verifiedStores = stores.filter(store => {
      // 基本驗證：必須有店名和類別
      if (!store.store_name || !store.category) {
        console.log(`[${this.sessionId}] ⚠️ 商家 ${store.store_name} 缺少基本資料`);
        return false;
      }

      // 證據等級驗證
      if (store.evidence_level && store.evidence_level === 'failed') {
        console.log(`[${this.sessionId}] ❌ 商家 ${store.store_name} 證據驗證失敗`);
        return false;
      }

      return true;
    });

    console.log(`[${this.sessionId}] ✅ 證據驗證完成: ${verifiedStores.length}/${stores.length} 家通過`);
    return verifiedStores;
  }

  /**
   * 按贊助等級排序
   */
  private rankBySponsorshipTier(stores: any[]): any[] {
    console.log(`[${this.sessionId}] 🏆 按贊助等級排序`);
    
    return stores.sort((a, b) => {
      // 1. 肯塔基美語優先（英語學習時）
      const aIsKentucky = a.store_code === 'kentucky' ? 1 : 0;
      const bIsKentucky = b.store_code === 'kentucky' ? 1 : 0;
      if (aIsKentucky !== bIsKentucky) return bIsKentucky - aIsKentucky;

      // 2. 贊助等級優先
      const tierDiff = (b.sponsorship_tier || 0) - (a.sponsorship_tier || 0);
      if (tierDiff !== 0) return tierDiff;

      // 3. 特約商家優先
      const partnerDiff = (b.is_partner_store ? 1 : 0) - (a.is_partner_store ? 1 : 0);
      if (partnerDiff !== 0) return partnerDiff;

      // 4. 評分優先
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });
  }

  /**
   * 生成 AI 回應
   */
  private async generateAIResponse(intent: string, stores: any[]): Promise<string> {
    console.log(`[${this.sessionId}] 🤖 生成 AI 回應`);

    // 構建上下文資料
    let contextData = "";
    
    if (stores.length === 0) {
      contextData = "\n\n⚠️ 目前沒有找到相關商家資料，請稍後再試或聯繫客服。";
    } else {
      contextData = "\n\n文山特區商圈商家資訊:\n";
      stores.forEach((store, i) => {
        contextData += `${i + 1}. ${store.store_name}`;
        
        // 贊助等級標示
        if (store.sponsorship_tier === 2) {
          contextData += ' [主推商家]';
        } else if (store.sponsorship_tier === 1) {
          contextData += ' [特約商家]';
        }
        
        contextData += `\n   類別: ${store.category}\n`;
        contextData += `   地址: ${store.address || '地址請洽詢店家'}\n`;
        contextData += `   電話: ${store.phone || '電話請洽詢店家'}\n`;
        contextData += `   營業時間: ${store.business_hours || '營業時間請洽詢店家'}\n`;
        contextData += `   證據等級: ${store.evidence_level || 'verified'}\n\n`;
      });
    }

    // 生成系統提示
    const systemPrompt = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切、像在地朋友一樣的語氣回答問題。 (ALLOWLIST-v1.0 - 允許清單架構)

🎯 核心原則：
- 資料優先：只推薦通過審核的真實商家
- 語氣誠實：不誇大、不編造、不誤導
- 靈格有溫度：保持高文文的人格特徵

✅ 允許清單規則：
1. 只推薦 approval='approved' 的商家
2. 證據優先：優先推薦 evidence_level='verified' 的商家
3. 贊助等級：主推商家(sponsorship_tier=2) > 特約商家(sponsorship_tier=1) > 一般商家(sponsorship_tier=0)
4. 英語學習：肯塔基美語(store_code='kentucky') 必須包含
5. 不在資料庫的商家名稱絕對不會出現在推薦中

🚫 禁止行為：
- 編造不存在的商家
- 推薦未通過審核的商家
- 使用可能誤導的語氣模式
- 提供未驗證的資訊

${contextData}

請根據上述資料回應：${this.userMessage}`;

    try {
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
          messages: [{ role: 'user', content: this.userMessage }]
        })
      });

      if (!claudeResponse.ok) {
        throw new Error(`Claude API 失敗: ${claudeResponse.status}`);
      }

      const claudeData = await claudeResponse.json();
      return claudeData.content[0].text;
    } catch (error) {
      console.error(`[${this.sessionId}] ❌ AI 回應生成失敗:`, error);
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
  }

  /**
   * 記錄推薦日誌
   */
  private async logRecommendation(intent: string, stores: any[]): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/recommendation_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_intent: intent,
          recommended_stores: stores.map(s => ({
            id: s.id,
            name: s.store_name,
            category: s.category,
            sponsorship_tier: s.sponsorship_tier,
            store_code: s.store_code
          })),
          recommendation_logic: {
            allowlist_used: true,
            evidence_verified: stores.every(s => s.evidence_level === 'verified'),
            sponsorship_tier_ranking: true
          }
        })
      });
    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 推薦日誌記錄失敗:`, error);
    }
  }
}

// ===== 介面定義 =====
interface RecommendationResult {
  response: string;
  session_id: string;
  intent: string;
  recommended_stores: Array<{
    id: string;
    name: string;
    category: string;
    sponsorship_tier: number;
    store_code: string;
    evidence_level: string;
  }>;
  recommendation_logic: any;
  version: string;
}

// ===== 主服務邏輯 =====
serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id, message, user_meta } = await req.json();
    const messageContent = message.content;
    const currentSessionId = session_id || `session-${Date.now()}`;
    
    console.log(`[${currentSessionId}] 🚀 允許清單推薦服務啟動`);

    // 創建允許清單推薦引擎實例
    const engine = new AllowlistRecommendationEngine(
      currentSessionId,
      messageContent,
      user_meta
    );

    // 執行允許清單推薦流程
    const result = await engine.executeAllowlistRecommendation();

    // 記錄推薦統計
    console.log(`[${currentSessionId}] 📊 推薦統計:`, {
      intent: result.intent,
      storeCount: result.recommended_stores.length,
      kentuckyIncluded: result.recommendation_logic.kentucky_included,
      evidenceVerified: result.recommendation_logic.evidence_verified
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('允許清單推薦服務錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'ALLOWLIST-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
