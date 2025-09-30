/**
 * Claude 自動調用架構 - 語氣靈檢察官
 * 由 Claude 負責自動調用語氣靈檢察官進行驗收
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== Claude 自動調用架構 =====
class ClaudeAutoInvokeArchitecture {
  private sessionId: string;
  private userMessage: string;
  private originalResponse: string;
  private prosecutorResult: any = null;

  constructor(sessionId: string, userMessage: string, originalResponse: string) {
    this.sessionId = sessionId;
    this.userMessage = userMessage;
    this.originalResponse = originalResponse;
  }

  /**
   * 執行 Claude 自動調用流程
   */
  async executeAutoInvoke(): Promise<AutoInvokeResult> {
    console.log(`[${this.sessionId}] 🤖 Claude 自動調用架構啟動`);

    try {
      // 步驟 1: 調用語氣靈檢察官
      const prosecutorResult = await this.invokeToneSpiritProsecutor();
      
      // 步驟 2: 根據檢察結果決定後續處理
      const finalResult = await this.processProsecutorResult(prosecutorResult);
      
      // 步驟 3: 記錄調用結果
      await this.logInvokeResult(finalResult);
      
      return finalResult;

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ Claude 自動調用失敗:`, error);
      return {
        success: false,
        finalResponse: '抱歉，系統暫時無法回應，請稍後再試。',
        prosecutorResult: null,
        invokeDetails: {
          prosecutorCalled: false,
          prosecutorPassed: false,
          autoCorrectionApplied: false,
          error: error.message
        },
        autoInvokeVersion: 'CLAUDE-AUTO-INVOKE-v1.0-ERROR'
      };
    }
  }

  /**
   * 調用語氣靈檢察官
   */
  private async invokeToneSpiritProsecutor(): Promise<any> {
    console.log(`[${this.sessionId}] 🔍 調用語氣靈檢察官`);
    
    try {
      const prosecutorResponse = await fetch(`${SUPABASE_URL}/functions/v1/tone-spirit-prosecutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          message: { content: this.userMessage },
          user_meta: { auto_invoke: true },
          original_response: this.originalResponse
        })
      });

      if (!prosecutorResponse.ok) {
        throw new Error(`檢察官調用失敗: ${prosecutorResponse.status}`);
      }

      const prosecutorResult = await prosecutorResponse.json();
      console.log(`[${this.sessionId}] ✅ 檢察官調用成功:`, {
        passed: prosecutorResult.prosecutor?.passed,
        corrections: prosecutorResult.prosecutor?.corrections?.length || 0
      });

      return prosecutorResult;

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 檢察官調用異常:`, error);
      throw error;
    }
  }

  /**
   * 處理檢察官結果
   */
  private async processProsecutorResult(prosecutorResult: any): Promise<AutoInvokeResult> {
    console.log(`[${this.sessionId}] 🔄 處理檢察官結果`);
    
    const prosecutor = prosecutorResult.prosecutor;
    const passed = prosecutor?.passed || false;
    const corrections = prosecutor?.corrections || [];
    
    if (passed) {
      // 檢察官通過，直接使用原始回應
      console.log(`[${this.sessionId}] ✅ 檢察官通過，使用原始回應`);
      return {
        success: true,
        finalResponse: this.originalResponse,
        prosecutorResult,
        invokeDetails: {
          prosecutorCalled: true,
          prosecutorPassed: true,
          autoCorrectionApplied: false,
          correctionsCount: 0
        },
        autoInvokeVersion: 'CLAUDE-AUTO-INVOKE-v1.0'
      };
    } else {
      // 檢察官未通過，需要修正
      console.log(`[${this.sessionId}] ⚠️ 檢察官未通過，應用修正`);
      
      const correctedResponse = await this.applyAutoCorrection(corrections);
      
      return {
        success: true,
        finalResponse: correctedResponse,
        prosecutorResult,
        invokeDetails: {
          prosecutorCalled: true,
          prosecutorPassed: false,
          autoCorrectionApplied: true,
          correctionsCount: corrections.length
        },
        autoInvokeVersion: 'CLAUDE-AUTO-INVOKE-v1.0'
      };
    }
  }

  /**
   * 應用自動修正
   */
  private async applyAutoCorrection(corrections: any[]): Promise<string> {
    console.log(`[${this.sessionId}] 🔧 應用自動修正，修正項目: ${corrections.length}`);
    
    // 根據修正項目生成修正後的回應
    const correctionTypes = corrections.map(c => c.description);
    
    if (correctionTypes.some(c => c.includes('移除幻覺實體') || c.includes('移除幻覺模式'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    if (correctionTypes.some(c => c.includes('移除未授權補習班'))) {
      return '關於英語學習，我推薦肯塔基美語，這是一家專業的英語教學機構。';
    }
    
    if (correctionTypes.some(c => c.includes('修正語氣模式') || c.includes('增強正面人格特徵'))) {
      return '讓我為您推薦一些不錯的選擇，這些都是文山特區值得信賴的商家。';
    }
    
    // 預設修正回應
    return '抱歉，系統回應需要調整，請稍後再試。';
  }

  /**
   * 記錄調用結果
   */
  private async logInvokeResult(result: AutoInvokeResult): Promise<void> {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/auto_invoke_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          user_message: this.userMessage,
          original_response: this.originalResponse,
          final_response: result.finalResponse,
          prosecutor_result: result.prosecutorResult,
          invoke_details: result.invokeDetails,
          success: result.success,
          timestamp: new Date().toISOString()
        })
      });
      
      console.log(`[${this.sessionId}] 📝 調用結果記錄成功`);
    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 調用結果記錄失敗:`, error);
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
    const { session_id, message, user_meta, original_response } = await req.json();
    const messageContent = message.content;
    const currentSessionId = session_id || `session-${Date.now()}`;
    
    console.log(`[${currentSessionId}] 🚀 Claude 自動調用服務啟動`);

    // 創建自動調用架構實例
    const autoInvoke = new ClaudeAutoInvokeArchitecture(
      currentSessionId,
      messageContent,
      original_response || '原始回應未提供'
    );

    // 執行自動調用流程
    const result = await autoInvoke.executeAutoInvoke();

    // 記錄調用統計
    console.log(`[${this.sessionId}] 📊 自動調用統計:`, {
      success: result.success,
      prosecutorCalled: result.invokeDetails.prosecutorCalled,
      prosecutorPassed: result.invokeDetails.prosecutorPassed,
      correctionsApplied: result.invokeDetails.autoCorrectionApplied
    });

    return new Response(JSON.stringify({
      response: result.finalResponse,
      session_id: currentSessionId,
      autoInvoke: {
        success: result.success,
        prosecutorResult: result.prosecutorResult,
        invokeDetails: result.invokeDetails,
        version: result.autoInvokeVersion
      },
      debug: {
        originalResponseLength: original_response?.length || 0,
        finalResponseLength: result.finalResponse.length,
        prosecutorCalled: result.invokeDetails.prosecutorCalled,
        prosecutorPassed: result.invokeDetails.prosecutorPassed,
        correctionsApplied: result.invokeDetails.autoCorrectionApplied
      },
      version: 'CLAUDE-AUTO-INVOKE-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Claude 自動調用錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'CLAUDE-AUTO-INVOKE-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// ===== 介面定義 =====
interface AutoInvokeResult {
  success: boolean;
  finalResponse: string;
  prosecutorResult: any;
  invokeDetails: {
    prosecutorCalled: boolean;
    prosecutorPassed: boolean;
    autoCorrectionApplied: boolean;
    correctionsCount?: number;
    error?: string;
  };
  autoInvokeVersion: string;
}
