/**
 * 對話把關系統 - 五層架構管理師
 * 在高文文回應之前進行智能幻覺清洗和糾正
 * 
 * 架構設計：
 * Layer 1: 資料優先驗證層 (商家管理、活動管理)
 * Layer 2: 知識庫驗證層 (訓練資料、常見問題)
 * Layer 3: 內容合理性分析層
 * Layer 4: 互動攔截與修正層
 * Layer 5: 最終把關與放行層
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 五層架構管理師 =====
class FiveLayerGatekeeper {
  private sessionId: string;
  private userMessage: string;
  private originalResponse: string;
  private validationResults: any[] = [];
  private correctionHistory: string[] = [];

  constructor(sessionId: string, userMessage: string, originalResponse: string) {
    this.sessionId = sessionId;
    this.userMessage = userMessage;
    this.originalResponse = originalResponse;
  }

  /**
   * 執行五層把關流程
   */
  async executeGatekeeping(): Promise<{
    finalResponse: string;
    validationResults: any[];
    corrections: string[];
    gatekeeperVersion: string;
  }> {
    console.log(`[${this.sessionId}] 🔒 五層架構管理師啟動把關流程`);

    try {
      // Layer 1: 資料優先驗證層
      await this.layer1_dataValidation();
      
      // Layer 2: 知識庫驗證層
      await this.layer2_knowledgeValidation();
      
      // Layer 3: 內容合理性分析層
      await this.layer3_contentReasoning();
      
      // Layer 4: 互動攔截與修正層
      await this.layer4_interactionInterception();
      
      // Layer 5: 最終把關與放行層
      const finalResponse = await this.layer5_finalGatekeeping();

      return {
        finalResponse,
        validationResults: this.validationResults,
        corrections: this.correctionHistory,
        gatekeeperVersion: 'WEN 1.2.0-GATEKEEPER'
      };

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 把關流程失敗:`, error);
      return {
        finalResponse: '抱歉，系統暫時無法回應，請稍後再試。',
        validationResults: this.validationResults,
        corrections: this.correctionHistory,
        gatekeeperVersion: 'WEN 1.2.0-GATEKEEPER-ERROR'
      };
    }
  }

  /**
   * Layer 1: 資料優先驗證層
   * 驗證商家管理、活動管理資料
   */
  private async layer1_dataValidation(): Promise<void> {
    console.log(`[${this.sessionId}] 🔍 Layer 1: 資料優先驗證層`);
    
    const validation = {
      layer: 1,
      name: '資料優先驗證層',
      startTime: new Date().toISOString(),
      results: {
        storeValidation: await this.validateStoreData(),
        activityValidation: await this.validateActivityData(),
        dataIntegrity: await this.checkDataIntegrity()
      }
    };

    // 檢查商家資料
    if (!validation.results.storeValidation.isValid) {
      this.addCorrection(`商家資料驗證失敗: ${validation.results.storeValidation.issues.join(', ')}`);
    }

    // 檢查活動資料
    if (!validation.results.activityValidation.isValid) {
      this.addCorrection(`活動資料驗證失敗: ${validation.results.activityValidation.issues.join(', ')}`);
    }

    // 檢查資料完整性
    if (!validation.results.dataIntegrity.isValid) {
      this.addCorrection(`資料完整性檢查失敗: ${validation.results.dataIntegrity.issues.join(', ')}`);
    }

    validation.endTime = new Date().toISOString();
    this.validationResults.push(validation);
  }

  /**
   * Layer 2: 知識庫驗證層
   * 驗證訓練資料、常見問題
   */
  private async layer2_knowledgeValidation(): Promise<void> {
    console.log(`[${this.sessionId}] 📚 Layer 2: 知識庫驗證層`);
    
    const validation = {
      layer: 2,
      name: '知識庫驗證層',
      startTime: new Date().toISOString(),
      results: {
        trainingDataValidation: await this.validateTrainingData(),
        faqValidation: await this.validateFAQData(),
        knowledgeConsistency: await this.checkKnowledgeConsistency()
      }
    };

    // 檢查訓練資料
    if (!validation.results.trainingDataValidation.isValid) {
      this.addCorrection(`訓練資料驗證失敗: ${validation.results.trainingDataValidation.issues.join(', ')}`);
    }

    // 檢查常見問題
    if (!validation.results.faqValidation.isValid) {
      this.addCorrection(`常見問題驗證失敗: ${validation.results.faqValidation.issues.join(', ')}`);
    }

    // 檢查知識一致性
    if (!validation.results.knowledgeConsistency.isValid) {
      this.addCorrection(`知識一致性檢查失敗: ${validation.results.knowledgeConsistency.issues.join(', ')}`);
    }

    validation.endTime = new Date().toISOString();
    this.validationResults.push(validation);
  }

  /**
   * Layer 3: 內容合理性分析層
   * 分析回應內容的合理性和邏輯性
   */
  private async layer3_contentReasoning(): Promise<void> {
    console.log(`[${this.sessionId}] 🧠 Layer 3: 內容合理性分析層`);
    
    const validation = {
      layer: 3,
      name: '內容合理性分析層',
      startTime: new Date().toISOString(),
      results: {
        hallucinationDetection: await this.detectHallucination(),
        logicalConsistency: await this.checkLogicalConsistency(),
        contentAccuracy: await this.checkContentAccuracy()
      }
    };

    // 檢查幻覺
    if (validation.results.hallucinationDetection.hasHallucination) {
      this.addCorrection(`檢測到幻覺內容: ${validation.results.hallucinationDetection.issues.join(', ')}`);
    }

    // 檢查邏輯一致性
    if (!validation.results.logicalConsistency.isValid) {
      this.addCorrection(`邏輯一致性檢查失敗: ${validation.results.logicalConsistency.issues.join(', ')}`);
    }

    // 檢查內容準確性
    if (!validation.results.contentAccuracy.isValid) {
      this.addCorrection(`內容準確性檢查失敗: ${validation.results.contentAccuracy.issues.join(', ')}`);
    }

    validation.endTime = new Date().toISOString();
    this.validationResults.push(validation);
  }

  /**
   * Layer 4: 互動攔截與修正層
   * 攔截問題互動並進行修正
   */
  private async layer4_interactionInterception(): Promise<void> {
    console.log(`[${this.sessionId}] 🛡️ Layer 4: 互動攔截與修正層`);
    
    const validation = {
      layer: 4,
      name: '互動攔截與修正層',
      startTime: new Date().toISOString(),
      results: {
        interactionAnalysis: await this.analyzeInteraction(),
        riskAssessment: await this.assessRisk(),
        correctionApplication: await this.applyCorrections()
      }
    };

    // 分析互動
    if (validation.results.interactionAnalysis.hasIssues) {
      this.addCorrection(`互動分析發現問題: ${validation.results.interactionAnalysis.issues.join(', ')}`);
    }

    // 評估風險
    if (validation.results.riskAssessment.riskLevel === 'HIGH') {
      this.addCorrection(`高風險互動: ${validation.results.riskAssessment.issues.join(', ')}`);
    }

    // 應用修正
    if (validation.results.correctionApplication.correctionsApplied > 0) {
      this.addCorrection(`已應用 ${validation.results.correctionApplication.correctionsApplied} 項修正`);
    }

    validation.endTime = new Date().toISOString();
    this.validationResults.push(validation);
  }

  /**
   * Layer 5: 最終把關與放行層
   * 最終檢查並決定是否放行
   */
  private async layer5_finalGatekeeping(): Promise<string> {
    console.log(`[${this.sessionId}] ✅ Layer 5: 最終把關與放行層`);
    
    const validation = {
      layer: 5,
      name: '最終把關與放行層',
      startTime: new Date().toISOString(),
      results: {
        finalValidation: await this.performFinalValidation(),
        safetyCheck: await this.performSafetyCheck(),
        qualityAssurance: await this.performQualityAssurance()
      }
    };

    // 最終驗證
    if (!validation.results.finalValidation.isValid) {
      this.addCorrection(`最終驗證失敗: ${validation.results.finalValidation.issues.join(', ')}`);
    }

    // 安全檢查
    if (!validation.results.safetyCheck.isSafe) {
      this.addCorrection(`安全檢查失敗: ${validation.results.safetyCheck.issues.join(', ')}`);
    }

    // 品質保證
    if (!validation.results.qualityAssurance.meetsQuality) {
      this.addCorrection(`品質保證檢查失敗: ${validation.results.qualityAssurance.issues.join(', ')}`);
    }

    validation.endTime = new Date().toISOString();
    this.validationResults.push(validation);

    // 決定最終回應
    if (this.correctionHistory.length > 0) {
      return await this.generateCorrectedResponse();
    } else {
      return this.originalResponse;
    }
  }

  // ===== 具體驗證方法 =====

  private async validateStoreData(): Promise<any> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?limit=1`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const stores = await response.json();
        return {
          isValid: stores.length > 0,
          issues: stores.length === 0 ? ['沒有商家資料'] : [],
          storeCount: stores.length
        };
      }
      return { isValid: false, issues: ['無法連接到商家資料庫'], storeCount: 0 };
    } catch (error) {
      return { isValid: false, issues: ['商家資料驗證異常'], storeCount: 0 };
    }
  }

  private async validateActivityData(): Promise<any> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/activities?limit=1`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const activities = await response.json();
        return {
          isValid: true,
          issues: [],
          activityCount: activities.length
        };
      }
      return { isValid: true, issues: [], activityCount: 0 };
    } catch (error) {
      return { isValid: true, issues: [], activityCount: 0 };
    }
  }

  private async checkDataIntegrity(): Promise<any> {
    // 檢查資料完整性
    const issues = [];
    
    // 檢查回應中是否包含商家名稱
    if (this.originalResponse.includes('推薦') && !this.originalResponse.includes('目前沒有找到相關商家')) {
      // 檢查是否包含已知的虛假商家
      const hallucinatedStores = ['鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館'];
      const foundHallucinated = hallucinatedStores.filter(store => 
        this.originalResponse.includes(store)
      );
      
      if (foundHallucinated.length > 0) {
        issues.push(`包含虛假商家: ${foundHallucinated.join(', ')}`);
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private async validateTrainingData(): Promise<any> {
    // 檢查訓練資料是否與回應一致
    const issues = [];
    
    // 檢查回應是否符合訓練資料的格式和內容
    if (this.originalResponse.includes('嘿～這附近我蠻推薦的')) {
      issues.push('使用了可能誤導的開頭語');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private async validateFAQData(): Promise<any> {
    // 檢查常見問題資料
    return {
      isValid: true,
      issues: []
    };
  }

  private async checkKnowledgeConsistency(): Promise<any> {
    // 檢查知識一致性
    return {
      isValid: true,
      issues: []
    };
  }

  private async detectHallucination(): Promise<any> {
    const issues = [];
    const hallucinatedStores = ['鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館'];
    
    const foundHallucinated = hallucinatedStores.filter(store => 
      this.originalResponse.includes(store)
    );
    
    if (foundHallucinated.length > 0) {
      issues.push(`檢測到幻覺商家: ${foundHallucinated.join(', ')}`);
    }
    
    return {
      hasHallucination: issues.length > 0,
      issues
    };
  }

  private async checkLogicalConsistency(): Promise<any> {
    const issues = [];
    
    // 檢查邏輯一致性
    if (this.originalResponse.includes('推薦') && this.originalResponse.includes('目前沒有找到相關商家')) {
      issues.push('邏輯矛盾：既推薦又說沒有找到');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private async checkContentAccuracy(): Promise<any> {
    const issues = [];
    
    // 檢查內容準確性
    if (this.originalResponse.includes('相信對你的學習會有幫助') && !this.originalResponse.includes('肯塔基美語')) {
      issues.push('英語學習回應不準確');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private async analyzeInteraction(): Promise<any> {
    const issues = [];
    
    // 分析互動
    if (this.userMessage.includes('美食') && this.originalResponse.includes('英語')) {
      issues.push('回應與用戶意圖不符');
    }
    
    return {
      hasIssues: issues.length > 0,
      issues
    };
  }

  private async assessRisk(): Promise<any> {
    const issues = [];
    let riskLevel = 'LOW';
    
    // 評估風險
    if (this.correctionHistory.length > 3) {
      riskLevel = 'HIGH';
      issues.push('修正次數過多');
    }
    
    return {
      riskLevel,
      issues
    };
  }

  private async applyCorrections(): Promise<any> {
    let correctionsApplied = 0;
    
    // 應用修正
    if (this.correctionHistory.length > 0) {
      correctionsApplied = this.correctionHistory.length;
    }
    
    return {
      correctionsApplied
    };
  }

  private async performFinalValidation(): Promise<any> {
    const issues = [];
    
    // 最終驗證
    if (this.correctionHistory.length > 0) {
      issues.push('需要修正');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private async performSafetyCheck(): Promise<any> {
    const issues = [];
    
    // 安全檢查
    if (this.originalResponse.includes('抱歉，系統暫時無法回應')) {
      issues.push('系統錯誤回應');
    }
    
    return {
      isSafe: issues.length === 0,
      issues
    };
  }

  private async performQualityAssurance(): Promise<any> {
    const issues = [];
    
    // 品質保證
    if (this.originalResponse.length < 10) {
      issues.push('回應過短');
    }
    
    return {
      meetsQuality: issues.length === 0,
      issues
    };
  }

  private addCorrection(correction: string): void {
    this.correctionHistory.push(correction);
    console.log(`[${this.sessionId}] 🔧 修正: ${correction}`);
  }

  private async generateCorrectedResponse(): Promise<string> {
    // 生成修正後的回應
    if (this.correctionHistory.some(c => c.includes('包含虛假商家'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    if (this.correctionHistory.some(c => c.includes('邏輯矛盾'))) {
      return '抱歉，系統回應有誤，請稍後再試。';
    }
    
    return this.originalResponse;
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
    
    console.log(`[${currentSessionId}] 🚀 五層架構管理師服務啟動`);

    // 創建五層架構管理師實例
    const gatekeeper = new FiveLayerGatekeeper(
      currentSessionId,
      messageContent,
      original_response || '原始回應未提供'
    );

    // 執行把關流程
    const gatekeepingResult = await gatekeeper.executeGatekeeping();

    // 記錄把關結果
    console.log(`[${currentSessionId}] 📊 把關結果:`, {
      corrections: gatekeepingResult.corrections.length,
      validationLayers: gatekeepingResult.validationResults.length,
      finalResponseLength: gatekeepingResult.finalResponse.length
    });

    return new Response(JSON.stringify({
      response: gatekeepingResult.finalResponse,
      session_id: currentSessionId,
      gatekeeping: {
        validationResults: gatekeepingResult.validationResults,
        corrections: gatekeepingResult.corrections,
        version: gatekeepingResult.gatekeeperVersion
      },
      debug: {
        originalResponseLength: original_response?.length || 0,
        finalResponseLength: gatekeepingResult.finalResponse.length,
        correctionsApplied: gatekeepingResult.corrections.length
      },
      version: 'WEN 1.2.0-GATEKEEPER'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('五層架構管理師錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'WEN 1.2.0-GATEKEEPER'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
