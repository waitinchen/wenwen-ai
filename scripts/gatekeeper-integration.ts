/**
 * 把關系統整合 - 與現有 WEN 系統整合
 * 在高文文回應之前進行五層把關
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 把關系統整合器 =====
class GatekeeperIntegrator {
  private sessionId: string;
  private userMessage: string;
  private userMeta: any;

  constructor(sessionId: string, userMessage: string, userMeta: any) {
    this.sessionId = sessionId;
    this.userMessage = userMessage;
    this.userMeta = userMeta;
  }

  /**
   * 執行完整的把關流程
   */
  async executeWithGatekeeping(): Promise<any> {
    console.log(`[${this.sessionId}] 🔒 啟動把關整合流程`);

    try {
      // 步驟 1: 獲取高文文原始回應
      const originalResponse = await this.getWenwenResponse();
      
      // 步驟 2: 執行五層把關
      const gatekeepingResult = await this.executeGatekeeping(originalResponse);
      
      // 步驟 3: 記錄把關結果
      await this.logGatekeepingResult(gatekeepingResult);
      
      // 步驟 4: 返回最終結果
      return {
        response: gatekeepingResult.finalResponse,
        session_id: this.sessionId,
        gatekeeping: gatekeepingResult.gatekeeping,
        original_response: originalResponse.response,
        debug: {
          gatekeepingEnabled: true,
          correctionsApplied: gatekeepingResult.corrections.length,
          validationLayers: gatekeepingResult.validationResults.length
        },
        version: 'WEN 1.2.0-WITH-GATEKEEPER'
      };

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 把關整合失敗:`, error);
      
      // 如果把關失敗，返回安全的預設回應
      return {
        response: '抱歉，系統暫時無法回應，請稍後再試。',
        session_id: this.sessionId,
        gatekeeping: {
          error: error.message,
          fallbackUsed: true
        },
        debug: {
          gatekeepingEnabled: true,
          error: error.message
        },
        version: 'WEN 1.2.0-WITH-GATEKEEPER-ERROR'
      };
    }
  }

  /**
   * 獲取高文文原始回應
   */
  private async getWenwenResponse(): Promise<any> {
    console.log(`[${this.sessionId}] 🤖 獲取高文文原始回應`);

    // 意圖分類
    const intentResult = this.classifyIntent(this.userMessage);
    console.log(`[${this.sessionId}] 🧠 意圖分析: ${intentResult.intent}`);

    // 獲取推薦商家
    const stores = await this.getRecommendations(intentResult.intent, intentResult.isFollowUp);
    console.log(`[${this.sessionId}] 📊 推薦結果: ${stores.length} 家商家`);

    // 生成系統提示
    const systemPrompt = this.generateSystemPrompt(intentResult.intent, stores);

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
        messages: [{ role: 'user', content: this.userMessage }]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API 失敗: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content[0].text;

    return {
      response: aiResponse,
      intent: intentResult.intent,
      stores: stores,
      systemPrompt: systemPrompt
    };
  }

  /**
   * 執行五層把關
   */
  private async executeGatekeeping(originalResponse: any): Promise<any> {
    console.log(`[${this.sessionId}] 🔍 執行五層把關`);

    const gatekeepingResult = {
      originalResponse: originalResponse.response,
      finalResponse: originalResponse.response,
      validationResults: [],
      corrections: [],
      gatekeeping: {
        version: 'WEN 1.2.0-GATEKEEPER',
        layers: 5,
        status: 'PASSED'
      }
    };

    // Layer 1: 資料優先驗證層
    const layer1Result = await this.layer1_dataValidation(originalResponse);
    gatekeepingResult.validationResults.push(layer1Result);
    
    if (!layer1Result.isValid) {
      gatekeepingResult.corrections.push(`Layer 1: ${layer1Result.issues.join(', ')}`);
      gatekeepingResult.gatekeeping.status = 'CORRECTED';
    }

    // Layer 2: 知識庫驗證層
    const layer2Result = await this.layer2_knowledgeValidation(originalResponse);
    gatekeepingResult.validationResults.push(layer2Result);
    
    if (!layer2Result.isValid) {
      gatekeepingResult.corrections.push(`Layer 2: ${layer2Result.issues.join(', ')}`);
      gatekeepingResult.gatekeeping.status = 'CORRECTED';
    }

    // Layer 3: 內容合理性分析層
    const layer3Result = await this.layer3_contentReasoning(originalResponse);
    gatekeepingResult.validationResults.push(layer3Result);
    
    if (!layer3Result.isValid) {
      gatekeepingResult.corrections.push(`Layer 3: ${layer3Result.issues.join(', ')}`);
      gatekeepingResult.gatekeeping.status = 'CORRECTED';
    }

    // Layer 4: 互動攔截與修正層
    const layer4Result = await this.layer4_interactionInterception(originalResponse);
    gatekeepingResult.validationResults.push(layer4Result);
    
    if (!layer4Result.isValid) {
      gatekeepingResult.corrections.push(`Layer 4: ${layer4Result.issues.join(', ')}`);
      gatekeepingResult.gatekeeping.status = 'CORRECTED';
    }

    // Layer 5: 最終把關與放行層
    const layer5Result = await this.layer5_finalGatekeeping(originalResponse);
    gatekeepingResult.validationResults.push(layer5Result);
    
    if (!layer5Result.isValid) {
      gatekeepingResult.corrections.push(`Layer 5: ${layer5Result.issues.join(', ')}`);
      gatekeepingResult.gatekeeping.status = 'CORRECTED';
    }

    // 如果需要修正，生成修正後的回應
    if (gatekeepingResult.corrections.length > 0) {
      gatekeepingResult.finalResponse = await this.generateCorrectedResponse(
        originalResponse, 
        gatekeepingResult.corrections
      );
    }

    return gatekeepingResult;
  }

  // ===== 五層把關具體實現 =====

  private async layer1_dataValidation(originalResponse: any): Promise<any> {
    const issues = [];
    
    // 檢查商家資料
    if (originalResponse.stores && originalResponse.stores.length === 0) {
      if (originalResponse.response.includes('推薦') && !originalResponse.response.includes('目前沒有找到相關商家')) {
        issues.push('沒有商家資料但仍在推薦');
      }
    }
    
    // 檢查幻覺商家
    const hallucinatedStores = ['鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館'];
    const foundHallucinated = hallucinatedStores.filter(store => 
      originalResponse.response.includes(store)
    );
    
    if (foundHallucinated.length > 0) {
      issues.push(`包含虛假商家: ${foundHallucinated.join(', ')}`);
    }
    
    return {
      layer: 1,
      name: '資料優先驗證層',
      isValid: issues.length === 0,
      issues
    };
  }

  private async layer2_knowledgeValidation(originalResponse: any): Promise<any> {
    const issues = [];
    
    // 檢查知識一致性
    if (originalResponse.intent === 'ENGLISH_LEARNING' && !originalResponse.response.includes('肯塔基美語')) {
      if (originalResponse.response.includes('推薦') && !originalResponse.response.includes('目前沒有找到相關商家')) {
        issues.push('英語學習回應不符合知識庫');
      }
    }
    
    return {
      layer: 2,
      name: '知識庫驗證層',
      isValid: issues.length === 0,
      issues
    };
  }

  private async layer3_contentReasoning(originalResponse: any): Promise<any> {
    const issues = [];
    
    // 檢查內容合理性
    if (originalResponse.response.includes('嘿～這附近我蠻推薦的') && originalResponse.stores.length === 0) {
      issues.push('使用了推薦語氣但沒有商家資料');
    }
    
    if (originalResponse.response.includes('相信對你的學習會有幫助') && !originalResponse.response.includes('肯塔基美語')) {
      issues.push('英語學習回應不準確');
    }
    
    return {
      layer: 3,
      name: '內容合理性分析層',
      isValid: issues.length === 0,
      issues
    };
  }

  private async layer4_interactionInterception(originalResponse: any): Promise<any> {
    const issues = [];
    
    // 檢查互動攔截
    if (this.userMessage.includes('美食') && originalResponse.response.includes('英語')) {
      issues.push('回應與用戶意圖不符');
    }
    
    return {
      layer: 4,
      name: '互動攔截與修正層',
      isValid: issues.length === 0,
      issues
    };
  }

  private async layer5_finalGatekeeping(originalResponse: any): Promise<any> {
    const issues = [];
    
    // 最終把關
    if (originalResponse.response.length < 10) {
      issues.push('回應過短');
    }
    
    return {
      layer: 5,
      name: '最終把關與放行層',
      isValid: issues.length === 0,
      issues
    };
  }

  private async generateCorrectedResponse(originalResponse: any, corrections: string[]): Promise<string> {
    console.log(`[${this.sessionId}] 🔧 生成修正後回應，修正項目: ${corrections.length}`);
    
    // 根據修正項目生成回應
    if (corrections.some(c => c.includes('包含虛假商家'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    if (corrections.some(c => c.includes('沒有商家資料但仍在推薦'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    if (corrections.some(c => c.includes('使用了推薦語氣但沒有商家資料'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    if (corrections.some(c => c.includes('回應與用戶意圖不符'))) {
      return '抱歉，我可能沒有理解您的問題，請您重新描述一下您的需求。';
    }
    
    // 預設修正回應
    return '抱歉，系統回應有誤，請稍後再試。';
  }

  // ===== 輔助方法 =====

  private classifyIntent(message: string): { intent: string; isFollowUp: boolean } {
    const englishKeywords = ['美語', '英語', '英文', '學美語', '學英語'];
    const foodKeywords = ['美食', '餐廳', '小吃', '料理', '餐飲'];
    const parkingKeywords = ['停車', '停車場', '車位'];
    
    const isEnglishRelated = englishKeywords.some(keyword => message.includes(keyword)) && 
                            !foodKeywords.some(keyword => message.includes(keyword));
    const isFoodRelated = foodKeywords.some(keyword => message.includes(keyword)) && 
                         !englishKeywords.some(keyword => message.includes(keyword));
    const isParkingRelated = parkingKeywords.some(keyword => message.includes(keyword));
    
    if (isEnglishRelated) return { intent: 'ENGLISH_LEARNING', isFollowUp: false };
    if (isFoodRelated) return { intent: 'FOOD', isFollowUp: false };
    if (isParkingRelated) return { intent: 'PARKING', isFollowUp: false };
    
    return { intent: 'GENERAL', isFollowUp: false };
  }

  private async getRecommendations(intent: string, isFollowUp: boolean): Promise<any[]> {
    let queryUrl = '';
    
    switch (intent) {
      case 'FOOD':
        queryUrl = `${SUPABASE_URL}/rest/v1/stores?category=eq.餐飲美食&limit=5`;
        break;
      case 'ENGLISH_LEARNING':
        if (!isFollowUp) {
          queryUrl = `${SUPABASE_URL}/rest/v1/stores?store_name=eq.${encodeURIComponent("肯塔基美語")}&limit=1`;
        } else {
          queryUrl = `${SUPABASE_URL}/rest/v1/stores?category=eq.教育培訓&limit=5`;
        }
        break;
      case 'PARKING':
        queryUrl = `${SUPABASE_URL}/rest/v1/stores?category=eq.停車場&limit=5`;
        break;
      default:
        queryUrl = `${SUPABASE_URL}/rest/v1/stores?limit=3`;
    }
    
    try {
      const response = await fetch(queryUrl, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('獲取推薦失敗:', error);
      return [];
    }
  }

  private generateSystemPrompt(intent: string, stores: any[]): string {
    let contextData = "";
    
    if (stores.length === 0) {
      contextData = "\n\n⚠️ 目前沒有找到相關商家資料，請稍後再試或聯繫客服。";
    } else {
      contextData = "\n\n文山特區商圈商家資訊:\n";
      stores.forEach((store, i) => {
        contextData += `${i + 1}. ${store.store_name} ${store.is_partner_store ? '[特約商家]' : ''}\n`;
        contextData += `   類別: ${store.category}\n`;
        contextData += `   地址: ${store.address || '地址請洽詢店家'}\n`;
        contextData += `   電話: ${store.phone || '電話請洽詢店家'}\n\n`;
      });
    }
    
    return `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切的語調回應。 (WEN 1.2.0 - 把關版本)

🚨 嚴格防幻覺規則：
1. 你只能使用我提供的商家資料，絕對不能編造任何不存在的商家
2. 如果沒有提供商家資料，請明確告知「目前沒有找到相關商家」
3. 絕對不要編造「鳳山牛肉麵」、「山城小館」、「Coz Pizza」等不存在的商家
4. 如果看到「⚠️ 目前沒有找到相關商家資料」，請直接告知用戶沒有找到商家

${contextData}

請根據上述資料回應：${this.userMessage}`;
  }

  private async logGatekeepingResult(gatekeepingResult: any): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/gatekeeping_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_message: this.userMessage,
          original_response: gatekeepingResult.originalResponse,
          final_response: gatekeepingResult.finalResponse,
          corrections: gatekeepingResult.corrections,
          validation_results: gatekeepingResult.validationResults,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('記錄把關結果失敗:', error);
    }
  }
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
    
    console.log(`[${currentSessionId}] 🚀 把關整合服務啟動`);

    // 創建把關整合器實例
    const integrator = new GatekeeperIntegrator(
      currentSessionId,
      messageContent,
      user_meta
    );

    // 執行把關整合流程
    const result = await integrator.executeWithGatekeeping();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('把關整合服務錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'WEN 1.2.0-WITH-GATEKEEPER'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
