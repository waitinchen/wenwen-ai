/**
 * 證據優先把關系統 - 取代黑名單架構
 * 實現：證據優先（Evidence-required）+ 資格規則（Eligibility）+ 審核狀態（Approval Status）
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 證據優先把關系統 =====
class EvidenceBasedGatekeeper {
  private sessionId: string;
  private userMessage: string;
  private originalResponse: string;
  private validationResults: ValidationResult[] = [];
  private correctionHistory: Correction[] = [];

  constructor(sessionId: string, userMessage: string, originalResponse: string) {
    this.sessionId = sessionId;
    this.userMessage = userMessage;
    this.originalResponse = originalResponse;
  }

  /**
   * 執行證據優先把關流程
   */
  async executeEvidenceBasedGatekeeping(): Promise<GatekeeperResult> {
    console.log(`[${this.sessionId}] 🔍 證據優先把關系統啟動`);

    try {
      // 1. 證據優先檢查
      const evidenceCheck = await this.checkEvidenceRequired();
      
      // 2. 資格規則檢查
      const eligibilityCheck = await this.checkEligibilityRules();
      
      // 3. 審核狀態檢查
      const approvalCheck = await this.checkApprovalStatus();
      
      // 4. 語氣合格檢查
      const toneCheck = await this.checkToneQualification();
      
      // 5. 綜合評估
      const overallResult = this.evaluateOverallResult([
        evidenceCheck,
        eligibilityCheck,
        approvalCheck,
        toneCheck
      ]);

      return {
        passed: overallResult.passed,
        finalResponse: overallResult.finalResponse,
        validationResults: this.validationResults,
        corrections: this.correctionHistory,
        gatekeeperVersion: 'EVIDENCE-BASED-GATEKEEPER-v1.0',
        evidenceStandards: {
          evidenceRequired: evidenceCheck.passed,
          eligibilityRules: eligibilityCheck.passed,
          approvalStatus: approvalCheck.passed,
          toneQualification: toneCheck.passed
        }
      };

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 證據優先把關失敗:`, error);
      return {
        passed: false,
        finalResponse: '抱歉，系統暫時無法回應，請稍後再試。',
        validationResults: this.validationResults,
        corrections: this.correctionHistory,
        gatekeeperVersion: 'EVIDENCE-BASED-GATEKEEPER-v1.0-ERROR',
        evidenceStandards: {
          evidenceRequired: false,
          eligibilityRules: false,
          approvalStatus: false,
          toneQualification: false
        }
      };
    }
  }

  /**
   * 1. 證據優先檢查
   * 確保所有提到的實體都有證據支持
   */
  private async checkEvidenceRequired(): Promise<ValidationResult> {
    console.log(`[${this.sessionId}] 🔍 證據優先檢查`);
    
    const issues: string[] = [];
    const mentionedEntities = this.extractMentionedEntities(this.originalResponse);
    
    for (const entity of mentionedEntities) {
      // 檢查實體是否有證據支持
      const hasEvidence = await this.checkEntityEvidence(entity);
      
      if (!hasEvidence) {
        issues.push(`實體 "${entity}" 缺乏證據支持`);
        this.addCorrection(`移除缺乏證據的實體: ${entity}`);
      }
    }
    
    // 檢查是否包含未驗證的資訊
    const unverifiedPatterns = [
      /地址.*請洽詢/,
      /電話.*請洽詢/,
      /營業時間.*請洽詢/
    ];
    
    for (const pattern of unverifiedPatterns) {
      if (pattern.test(this.originalResponse)) {
        // 這不是錯誤，而是正常的未驗證資訊標示
        console.log(`[${this.sessionId}] ℹ️ 發現未驗證資訊標示，這是正常的`);
      }
    }
    
    const result: ValidationResult = {
      standard: '證據優先',
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'CRITICAL' : 'PASSED'
    };
    
    this.validationResults.push(result);
    return result;
  }

  /**
   * 2. 資格規則檢查
   * 檢查是否符合資格規則
   */
  private async checkEligibilityRules(): Promise<ValidationResult> {
    console.log(`[${this.sessionId}] 📋 資格規則檢查`);
    
    const issues: string[] = [];
    
    // 檢查授權合規性
    const authorizedEntities = ['肯塔基美語'];
    const unauthorizedEntities = ['英文達人', '環球英語', '東門市場', '文山樓'];
    
    for (const unauthorized of unauthorizedEntities) {
      if (this.originalResponse.includes(unauthorized)) {
        issues.push(`未授權實體: ${unauthorized}`);
        this.addCorrection(`移除未授權實體: ${unauthorized}`);
      }
    }
    
    // 檢查英語學習合規性
    if (this.originalResponse.includes('英語') || this.originalResponse.includes('美語')) {
      const hasAuthorized = authorizedEntities.some(entity => 
        this.originalResponse.includes(entity)
      );
      
      if (!hasAuthorized && this.originalResponse.includes('推薦')) {
        issues.push(`英語學習推薦缺乏授權實體`);
        this.addCorrection(`添加授權實體: 肯塔基美語`);
      }
    }
    
    const result: ValidationResult = {
      standard: '資格規則',
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'CRITICAL' : 'PASSED'
    };
    
    this.validationResults.push(result);
    return result;
  }

  /**
   * 3. 審核狀態檢查
   * 檢查所有提到的商家是否已通過審核
   */
  private async checkApprovalStatus(): Promise<ValidationResult> {
    console.log(`[${this.sessionId}] ✅ 審核狀態檢查`);
    
    const issues: string[] = [];
    const mentionedStores = this.extractMentionedStores(this.originalResponse);
    
    for (const store of mentionedStores) {
      // 檢查商家審核狀態
      const approvalStatus = await this.checkStoreApprovalStatus(store);
      
      if (approvalStatus !== 'approved') {
        issues.push(`商家 "${store}" 審核狀態: ${approvalStatus}`);
        this.addCorrection(`移除未審核商家: ${store}`);
      }
    }
    
    const result: ValidationResult = {
      standard: '審核狀態',
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'CRITICAL' : 'PASSED'
    };
    
    this.validationResults.push(result);
    return result;
  }

  /**
   * 4. 語氣合格檢查
   * 檢查是否保持高文文的人格特徵
   */
  private async checkToneQualification(): Promise<ValidationResult> {
    console.log(`[${this.sessionId}] 🎭 語氣合格檢查`);
    
    const issues: string[] = [];
    
    // 檢查正面人格特徵
    const positiveTraits = ['溫暖', '親切', '像在地朋友', '熱情', '友善', '專業', '可靠', '誠實'];
    const hasPositiveTrait = positiveTraits.some(trait => 
      this.originalResponse.includes(trait)
    );
    
    if (!hasPositiveTrait && this.originalResponse.length > 20) {
      issues.push(`缺乏高文文正面人格特徵`);
      this.addCorrection(`增強正面人格特徵`);
    }
    
    // 檢查負面人格特徵
    const negativeTraits = ['冷漠', '機械', '客服腔調', '過度正式', '不自然', '誇大', '虛假'];
    for (const trait of negativeTraits) {
      if (this.originalResponse.includes(trait)) {
        issues.push(`包含負面人格特徵: ${trait}`);
        this.addCorrection(`移除負面特徵: ${trait}`);
      }
    }
    
    // 檢查禁止的語氣模式
    const forbiddenPatterns = [
      '嘿～這附近我蠻推薦的',
      '我超推薦.*的啦',
      '相信對你的學習會有幫助',
      '有空不妨去看看',
      '這幾家我都很推薦'
    ];
    
    for (const pattern of forbiddenPatterns) {
      if (this.originalResponse.includes(pattern)) {
        issues.push(`包含禁止的語氣模式: ${pattern}`);
        this.addCorrection(`修正語氣模式: ${pattern}`);
      }
    }
    
    const result: ValidationResult = {
      standard: '語氣合格',
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'HIGH' : 'PASSED'
    };
    
    this.validationResults.push(result);
    return result;
  }

  // ===== 輔助方法 =====

  /**
   * 提取回應中提到的實體
   */
  private extractMentionedEntities(response: string): string[] {
    const entities: string[] = [];
    
    // 提取商家名稱
    const storeNamePattern = /[\u4e00-\u9fa5]{2,}[\u7f8e\u96f6\u9910\u5ef3\u5c0f\u98ef\u6599\u7406\u9910\u996e\u5b78\u6821\u6559\u5ba2]/g;
    const storeMatches = response.match(storeNamePattern);
    if (storeMatches) entities.push(...storeMatches);
    
    // 提取地址
    const addressPattern = /[\u4e00-\u9fa5]{2,}[\u8def\u8857\u5df7\u5f04\u865f\u6a13]/g;
    const addressMatches = response.match(addressPattern);
    if (addressMatches) entities.push(...addressMatches);
    
    return entities;
  }

  /**
   * 提取回應中提到的商家
   */
  private extractMentionedStores(response: string): string[] {
    const stores: string[] = [];
    
    // 提取商家名稱（更精確的模式）
    const storePattern = /[\u4e00-\u9fa5]{2,}[\u7f8e\u96f6\u9910\u5ef3\u5c0f\u98ef\u6599\u7406\u9910\u996e\u5b78\u6821\u6559\u5ba2]/g;
    const matches = response.match(storePattern);
    
    if (matches) {
      stores.push(...matches);
    }
    
    return stores;
  }

  /**
   * 檢查實體是否有證據支持
   */
  private async checkEntityEvidence(entity: string): Promise<boolean> {
    try {
      // 檢查是否在資料庫中存在
      const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=ilike.%${encodeURIComponent(entity)}%`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const stores = await response.json();
        return stores.length > 0;
      }
      return false;
    } catch (error) {
      console.error(`檢查實體證據失敗: ${entity}`, error);
      return false;
    }
  }

  /**
   * 檢查商家審核狀態
   */
  private async checkStoreApprovalStatus(storeName: string): Promise<string> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=ilike.%${encodeURIComponent(storeName)}%&select=approval`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const stores = await response.json();
        if (stores.length > 0) {
          return stores[0].approval || 'unknown';
        }
      }
      return 'not_found';
    } catch (error) {
      console.error(`檢查審核狀態失敗: ${storeName}`, error);
      return 'error';
    }
  }

  /**
   * 綜合評估結果
   */
  private evaluateOverallResult(results: ValidationResult[]): {
    passed: boolean;
    finalResponse: string;
  } {
    const hasCriticalIssues = results.some(r => r.severity === 'CRITICAL');
    const hasHighIssues = results.some(r => r.severity === 'HIGH');
    
    if (hasCriticalIssues) {
      return {
        passed: false,
        finalResponse: await this.generateEvidenceBasedResponse()
      };
    }
    
    if (hasHighIssues) {
      return {
        passed: false,
        finalResponse: await this.generateCorrectedResponse()
      };
    }
    
    return {
      passed: true,
      finalResponse: this.originalResponse
    };
  }

  /**
   * 生成證據優先的回應
   */
  private async generateEvidenceBasedResponse(): Promise<string> {
    const corrections = this.correctionHistory.map(c => c.description);
    
    if (corrections.some(c => c.includes('缺乏證據支持') || c.includes('移除缺乏證據'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    if (corrections.some(c => c.includes('未授權實體') || c.includes('移除未授權'))) {
      return '關於英語學習，我推薦肯塔基美語，這是一家專業的英語教學機構。';
    }
    
    if (corrections.some(c => c.includes('審核狀態') || c.includes('移除未審核'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    return '抱歉，系統回應需要調整，請稍後再試。';
  }

  /**
   * 生成修正後的回應
   */
  private async generateCorrectedResponse(): Promise<string> {
    const corrections = this.correctionHistory.map(c => c.description);
    
    if (corrections.some(c => c.includes('增強正面人格特徵') || c.includes('修正語氣模式'))) {
      return '讓我為您推薦一些不錯的選擇，這些都是文山特區值得信賴的商家。';
    }
    
    return this.originalResponse;
  }

  /**
   * 添加修正記錄
   */
  private addCorrection(description: string): void {
    this.correctionHistory.push({
      description,
      timestamp: new Date().toISOString(),
      severity: 'HIGH'
    });
    console.log(`[${this.sessionId}] 🔧 修正: ${description}`);
  }
}

// ===== 介面定義 =====
interface ValidationResult {
  standard: string;
  passed: boolean;
  issues: string[];
  severity: 'PASSED' | 'HIGH' | 'CRITICAL';
}

interface Correction {
  description: string;
  timestamp: string;
  severity: string;
}

interface GatekeeperResult {
  passed: boolean;
  finalResponse: string;
  validationResults: ValidationResult[];
  corrections: Correction[];
  gatekeeperVersion: string;
  evidenceStandards: {
    evidenceRequired: boolean;
    eligibilityRules: boolean;
    approvalStatus: boolean;
    toneQualification: boolean;
  };
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
    
    console.log(`[${currentSessionId}] 🚀 證據優先把關服務啟動`);

    // 創建證據優先把關實例
    const gatekeeper = new EvidenceBasedGatekeeper(
      currentSessionId,
      messageContent,
      original_response || '原始回應未提供'
    );

    // 執行證據優先把關流程
    const gatekeeperResult = await gatekeeper.executeEvidenceBasedGatekeeping();

    // 記錄把關結果
    console.log(`[${currentSessionId}] 📊 把關結果:`, {
      passed: gatekeeperResult.passed,
      corrections: gatekeeperResult.corrections.length,
      standards: gatekeeperResult.evidenceStandards
    });

    return new Response(JSON.stringify({
      response: gatekeeperResult.finalResponse,
      session_id: currentSessionId,
      gatekeeper: {
        passed: gatekeeperResult.passed,
        validationResults: gatekeeperResult.validationResults,
        corrections: gatekeeperResult.corrections,
        evidenceStandards: gatekeeperResult.evidenceStandards,
        version: gatekeeperResult.gatekeeperVersion
      },
      debug: {
        originalResponseLength: original_response?.length || 0,
        finalResponseLength: gatekeeperResult.finalResponse.length,
        correctionsApplied: gatekeeperResult.corrections.length,
        standardsPassed: Object.values(gatekeeperResult.evidenceStandards).filter(Boolean).length
      },
      version: 'EVIDENCE-BASED-GATEKEEPER-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('證據優先把關錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'EVIDENCE-BASED-GATEKEEPER-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
