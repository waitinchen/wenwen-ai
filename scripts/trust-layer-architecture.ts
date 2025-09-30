/**
 * 信任層架構 - 統一管理合規性 + 數據事實性 + 安全過濾
 * 未來擴展架構，提供完整的信任管理解決方案
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 信任層架構 =====
class TrustLayerArchitecture {
  private sessionId: string;
  private userMessage: string;
  private originalResponse: string;
  private trustScore: number = 100;
  private trustComponents: TrustComponent[] = [];

  constructor(sessionId: string, userMessage: string, originalResponse: string) {
    this.sessionId = sessionId;
    this.userMessage = userMessage;
    this.originalResponse = originalResponse;
  }

  /**
   * 執行信任層評估
   */
  async executeTrustEvaluation(): Promise<TrustEvaluationResult> {
    console.log(`[${this.sessionId}] 🛡️ 信任層架構啟動評估`);

    try {
      // 1. 合規性檢查
      const complianceCheck = await this.checkCompliance();
      
      // 2. 數據事實性檢查
      const dataFactualityCheck = await this.checkDataFactuality();
      
      // 3. 安全過濾檢查
      const securityFilterCheck = await this.checkSecurityFilter();
      
      // 4. 計算信任分數
      const trustScore = this.calculateTrustScore([
        complianceCheck,
        dataFactualityCheck,
        securityFilterCheck
      ]);
      
      // 5. 決定最終回應
      const finalResponse = await this.determineFinalResponse(trustScore);
      
      return {
        trustScore,
        passed: trustScore >= 80, // 信任分數閾值
        finalResponse,
        trustComponents: this.trustComponents,
        evaluationDetails: {
          compliance: complianceCheck,
          dataFactuality: dataFactualityCheck,
          securityFilter: securityFilterCheck
        },
        trustLayerVersion: 'TRUST-LAYER-v1.0'
      };

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 信任層評估失敗:`, error);
      return {
        trustScore: 0,
        passed: false,
        finalResponse: '抱歉，系統暫時無法回應，請稍後再試。',
        trustComponents: this.trustComponents,
        evaluationDetails: null,
        trustLayerVersion: 'TRUST-LAYER-v1.0-ERROR'
      };
    }
  }

  /**
   * 1. 合規性檢查
   * 檢查是否符合法規、政策、授權要求
   */
  private async checkCompliance(): Promise<TrustComponent> {
    console.log(`[${this.sessionId}] 📋 合規性檢查`);
    
    const issues: string[] = [];
    const score = 100;
    
    // 檢查授權合規性
    const authorizedEntities = ['肯塔基美語'];
    const unauthorizedEntities = ['英文達人', '環球英語', '東門市場', '文山樓'];
    
    for (const unauthorized of unauthorizedEntities) {
      if (this.originalResponse.includes(unauthorized)) {
        issues.push(`未授權實體: ${unauthorized}`);
      }
    }
    
    // 檢查內容合規性
    const forbiddenContent = ['不當言論', '歧視性內容', '違法資訊'];
    for (const content of forbiddenContent) {
      if (this.originalResponse.includes(content)) {
        issues.push(`不合規內容: ${content}`);
      }
    }
    
    // 檢查隱私合規性
    const privacySensitive = ['個人資料', '聯絡方式', '身份資訊'];
    for (const sensitive of privacySensitive) {
      if (this.originalResponse.includes(sensitive)) {
        issues.push(`隱私敏感資訊: ${sensitive}`);
      }
    }
    
    const finalScore = Math.max(0, score - (issues.length * 20));
    
    const component: TrustComponent = {
      name: '合規性檢查',
      score: finalScore,
      maxScore: 100,
      issues,
      severity: finalScore < 60 ? 'CRITICAL' : finalScore < 80 ? 'HIGH' : 'PASSED'
    };
    
    this.trustComponents.push(component);
    return component;
  }

  /**
   * 2. 數據事實性檢查
   * 檢查數據的真實性、準確性、完整性
   */
  private async checkDataFactuality(): Promise<TrustComponent> {
    console.log(`[${this.sessionId}] 🔍 數據事實性檢查`);
    
    const issues: string[] = [];
    const score = 100;
    
    // 檢查商家資料真實性
    const mentionedStores = this.extractMentionedStores(this.originalResponse);
    for (const store of mentionedStores) {
      const existsInDB = await this.checkStoreExistsInDB(store);
      if (!existsInDB) {
        issues.push(`虛假商家: ${store}`);
      }
    }
    
    // 檢查地址真實性
    const mentionedAddresses = this.extractMentionedAddresses(this.originalResponse);
    for (const address of mentionedAddresses) {
      const isValidAddress = await this.validateAddress(address);
      if (!isValidAddress) {
        issues.push(`無效地址: ${address}`);
      }
    }
    
    // 檢查電話號碼真實性
    const mentionedPhones = this.extractMentionedPhones(this.originalResponse);
    for (const phone of mentionedPhones) {
      const isValidPhone = this.validatePhoneNumber(phone);
      if (!isValidPhone) {
        issues.push(`無效電話: ${phone}`);
      }
    }
    
    // 檢查營業時間真實性
    const mentionedHours = this.extractMentionedBusinessHours(this.originalResponse);
    for (const hours of mentionedHours) {
      const isValidHours = this.validateBusinessHours(hours);
      if (!isValidHours) {
        issues.push(`無效營業時間: ${hours}`);
      }
    }
    
    const finalScore = Math.max(0, score - (issues.length * 15));
    
    const component: TrustComponent = {
      name: '數據事實性檢查',
      score: finalScore,
      maxScore: 100,
      issues,
      severity: finalScore < 60 ? 'CRITICAL' : finalScore < 80 ? 'HIGH' : 'PASSED'
    };
    
    this.trustComponents.push(component);
    return component;
  }

  /**
   * 3. 安全過濾檢查
   * 檢查安全性、惡意內容、風險評估
   */
  private async checkSecurityFilter(): Promise<TrustComponent> {
    console.log(`[${this.sessionId}] 🔒 安全過濾檢查`);
    
    const issues: string[] = [];
    const score = 100;
    
    // 檢查惡意內容
    const maliciousPatterns = [
      /<script/i, /javascript:/i, /on\w+\s*=/i, // XSS 攻擊
      /eval\s*\(/i, /expression\s*\(/i, // 代碼注入
      /union\s+select/i, /drop\s+table/i, // SQL 注入
      /\.\.\//, /\.\.\\/, // 路徑遍歷
      /phishing|scam|fraud/i // 詐騙相關
    ];
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(this.originalResponse)) {
        issues.push(`惡意內容模式: ${pattern.source}`);
      }
    }
    
    // 檢查敏感資訊洩露
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // 信用卡號
      /\b\d{3}-\d{2}-\d{4}\b/, // 社會安全號碼
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // 郵箱
      /\b\d{3}-\d{3}-\d{4}\b/, // 電話號碼
      /\b\d{5}(-\d{4})?\b/ // 郵遞區號
    ];
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(this.originalResponse)) {
        issues.push(`敏感資訊洩露: ${pattern.source}`);
      }
    }
    
    // 檢查風險等級
    const riskKeywords = ['危險', '風險', '警告', '注意', '緊急'];
    const riskCount = riskKeywords.filter(keyword => 
      this.originalResponse.includes(keyword)
    ).length;
    
    if (riskCount > 2) {
      issues.push(`高風險內容: 包含 ${riskCount} 個風險關鍵字`);
    }
    
    const finalScore = Math.max(0, score - (issues.length * 25));
    
    const component: TrustComponent = {
      name: '安全過濾檢查',
      score: finalScore,
      maxScore: 100,
      issues,
      severity: finalScore < 60 ? 'CRITICAL' : finalScore < 80 ? 'HIGH' : 'PASSED'
    };
    
    this.trustComponents.push(component);
    return component;
  }

  // ===== 輔助方法 =====

  /**
   * 計算信任分數
   */
  private calculateTrustScore(components: TrustComponent[]): number {
    if (components.length === 0) return 0;
    
    const totalScore = components.reduce((sum, component) => sum + component.score, 0);
    const maxScore = components.reduce((sum, component) => sum + component.maxScore, 0);
    
    return Math.round((totalScore / maxScore) * 100);
  }

  /**
   * 決定最終回應
   */
  private async determineFinalResponse(trustScore: number): Promise<string> {
    if (trustScore >= 90) {
      return this.originalResponse; // 高信任度，直接通過
    } else if (trustScore >= 80) {
      return await this.sanitizeResponse(this.originalResponse); // 中等信任度，清理後通過
    } else if (trustScore >= 60) {
      return await this.generateSafeResponse(); // 低信任度，生成安全回應
    } else {
      return '抱歉，系統暫時無法回應，請稍後再試。'; // 極低信任度，拒絕回應
    }
  }

  /**
   * 清理回應內容
   */
  private async sanitizeResponse(response: string): Promise<string> {
    let sanitized = response;
    
    // 移除敏感資訊
    sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[信用卡號已隱藏]');
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN已隱藏]');
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[郵箱已隱藏]');
    
    // 移除惡意內容
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    return sanitized;
  }

  /**
   * 生成安全回應
   */
  private async generateSafeResponse(): Promise<string> {
    return '抱歉，目前沒有找到相關資訊，請稍後再試或聯繫客服。';
  }

  /**
   * 提取回應中提到的商家
   */
  private extractMentionedStores(response: string): string[] {
    const storePattern = /[\u4e00-\u9fa5]{2,}[\u7f8e\u96f6\u9910\u5ef3\u5c0f\u98ef\u6599\u7406\u9910\u996e\u5b78\u6821\u6559\u5ba2]/g;
    const matches = response.match(storePattern);
    return matches || [];
  }

  /**
   * 提取回應中提到的地址
   */
  private extractMentionedAddresses(response: string): string[] {
    const addressPattern = /[\u4e00-\u9fa5]{2,}[\u8def\u8857\u5df7\u5f04\u865f\u6a13]/g;
    const matches = response.match(addressPattern);
    return matches || [];
  }

  /**
   * 提取回應中提到的電話
   */
  private extractMentionedPhones(response: string): string[] {
    const phonePattern = /\b\d{2,4}-\d{3,4}-\d{3,4}\b/g;
    const matches = response.match(phonePattern);
    return matches || [];
  }

  /**
   * 提取回應中提到的營業時間
   */
  private extractMentionedBusinessHours(response: string): string[] {
    const hoursPattern = /\b\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\b/g;
    const matches = response.match(hoursPattern);
    return matches || [];
  }

  /**
   * 檢查商家是否在資料庫中存在
   */
  private async checkStoreExistsInDB(storeName: string): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=ilike.%${encodeURIComponent(storeName)}%`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const stores = await response.json();
        return stores.length > 0;
      }
      return false;
    } catch (error) {
      console.error(`檢查商家存在失敗: ${storeName}`, error);
      return false;
    }
  }

  /**
   * 驗證地址格式
   */
  private async validateAddress(address: string): Promise<boolean> {
    // 簡單的地址格式驗證
    const addressPattern = /[\u4e00-\u9fa5]{2,}[\u8def\u8857\u5df7\u5f04\u865f\u6a13]/;
    return addressPattern.test(address);
  }

  /**
   * 驗證電話號碼格式
   */
  private validatePhoneNumber(phone: string): boolean {
    const phonePattern = /^\d{2,4}-\d{3,4}-\d{3,4}$/;
    return phonePattern.test(phone);
  }

  /**
   * 驗證營業時間格式
   */
  private validateBusinessHours(hours: string): boolean {
    const hoursPattern = /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;
    return hoursPattern.test(hours);
  }
}

// ===== 介面定義 =====
interface TrustComponent {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
  severity: 'PASSED' | 'HIGH' | 'CRITICAL';
}

interface TrustEvaluationResult {
  trustScore: number;
  passed: boolean;
  finalResponse: string;
  trustComponents: TrustComponent[];
  evaluationDetails: {
    compliance: TrustComponent;
    dataFactuality: TrustComponent;
    securityFilter: TrustComponent;
  } | null;
  trustLayerVersion: string;
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
    
    console.log(`[${currentSessionId}] 🚀 信任層架構服務啟動`);

    // 創建信任層架構實例
    const trustLayer = new TrustLayerArchitecture(
      currentSessionId,
      messageContent,
      original_response || '原始回應未提供'
    );

    // 執行信任層評估
    const trustResult = await trustLayer.executeTrustEvaluation();

    // 記錄信任評估結果
    console.log(`[${currentSessionId}] 📊 信任評估結果:`, {
      trustScore: trustResult.trustScore,
      passed: trustResult.passed,
      components: trustResult.trustComponents.length
    });

    return new Response(JSON.stringify({
      response: trustResult.finalResponse,
      session_id: currentSessionId,
      trustLayer: {
        trustScore: trustResult.trustScore,
        passed: trustResult.passed,
        trustComponents: trustResult.trustComponents,
        evaluationDetails: trustResult.evaluationDetails,
        version: trustResult.trustLayerVersion
      },
      debug: {
        originalResponseLength: original_response?.length || 0,
        finalResponseLength: trustResult.finalResponse.length,
        trustScore: trustResult.trustScore,
        componentsEvaluated: trustResult.trustComponents.length
      },
      version: 'TRUST-LAYER-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('信任層架構錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'TRUST-LAYER-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
