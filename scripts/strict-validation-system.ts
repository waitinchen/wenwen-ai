/**
 * 嚴格驗收標準系統 - 語氣靈檢察官
 * 驗收標準：
 * 0 幻覺：提到的資料必須存在於 DB 或 FAQ
 * 0 禁詞：未授權補習班絕對不出現
 * 100% 語氣合格：輸出保留高文文的人格
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ===== 環境變數配置 =====
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY")!;
const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-3-haiku-20240307";

// ===== 語氣靈檢察官 - 嚴格驗收標準 =====
class ToneSpiritProsecutor {
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
   * 執行嚴格驗收標準檢查
   */
  async executeStrictValidation(): Promise<ProsecutorResult> {
    console.log(`[${this.sessionId}] 🔍 語氣靈檢察官啟動嚴格驗收`);

    try {
      // 標準 1: 0 幻覺檢查
      const hallucinationCheck = await this.checkZeroHallucination();
      
      // 標準 2: 0 禁詞檢查
      const forbiddenWordsCheck = await this.checkZeroForbiddenWords();
      
      // 標準 3: 100% 語氣合格檢查
      const toneQualificationCheck = await this.checkToneQualification();
      
      // 綜合評估
      const overallResult = this.evaluateOverallResult([
        hallucinationCheck,
        forbiddenWordsCheck,
        toneQualificationCheck
      ]);

      return {
        passed: overallResult.passed,
        finalResponse: overallResult.finalResponse,
        validationResults: this.validationResults,
        corrections: this.correctionHistory,
        prosecutorVersion: 'TONE-SPIRIT-PROSECUTOR-v1.0',
        strictStandards: {
          zeroHallucination: hallucinationCheck.passed,
          zeroForbiddenWords: forbiddenWordsCheck.passed,
          toneQualification: toneQualificationCheck.passed
        }
      };

    } catch (error) {
      console.error(`[${this.sessionId}] ❌ 檢察官驗收失敗:`, error);
      return {
        passed: false,
        finalResponse: '抱歉，系統暫時無法回應，請稍後再試。',
        validationResults: this.validationResults,
        corrections: this.correctionHistory,
        prosecutorVersion: 'TONE-SPIRIT-PROSECUTOR-v1.0-ERROR',
        strictStandards: {
          zeroHallucination: false,
          zeroForbiddenWords: false,
          toneQualification: false
        }
      };
    }
  }

  /**
   * 標準 1: 0 幻覺檢查
   * 檢查所有提到的資料是否都存在於 DB 或 FAQ 中
   */
  private async checkZeroHallucination(): Promise<ValidationResult> {
    console.log(`[${this.sessionId}] 🔍 標準 1: 0 幻覺檢查`);
    
    const issues: string[] = [];
    const mentionedEntities = this.extractMentionedEntities(this.originalResponse);
    
    for (const entity of mentionedEntities) {
      // 檢查是否在資料庫中存在
      const existsInDB = await this.checkEntityExistsInDB(entity);
      
      // 檢查是否在 FAQ 中存在
      const existsInFAQ = await this.checkEntityExistsInFAQ(entity);
      
      if (!existsInDB && !existsInFAQ) {
        issues.push(`幻覺實體: "${entity}" 不存在於資料庫或 FAQ 中`);
        this.addCorrection(`移除幻覺實體: ${entity}`);
      }
    }
    
    // 檢查是否包含已知的幻覺模式
    const hallucinationPatterns = [
      '鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館',
      '英文達人', '環球英語', '東門市場', '文山樓'
    ];
    
    for (const pattern of hallucinationPatterns) {
      if (this.originalResponse.includes(pattern)) {
        issues.push(`檢測到已知幻覺模式: ${pattern}`);
        this.addCorrection(`移除幻覺模式: ${pattern}`);
      }
    }
    
    const result: ValidationResult = {
      standard: '0 幻覺',
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'CRITICAL' : 'PASSED'
    };
    
    this.validationResults.push(result);
    return result;
  }

  /**
   * 標準 2: 0 禁詞檢查
   * 檢查是否包含未授權的補習班名稱
   */
  private async checkZeroForbiddenWords(): Promise<ValidationResult> {
    console.log(`[${this.sessionId}] 🔍 標準 2: 0 禁詞檢查`);
    
    const issues: string[] = [];
    
    // 未授權補習班黑名單
    const forbiddenTutoringCenters = [
      '英文達人', '環球英語', '東門市場', '文山樓',
      '美語街123號', '英文補習班', '英語學習中心'
    ];
    
    for (const forbiddenWord of forbiddenTutoringCenters) {
      if (this.originalResponse.includes(forbiddenWord)) {
        issues.push(`檢測到未授權補習班: ${forbiddenWord}`);
        this.addCorrection(`移除未授權補習班: ${forbiddenWord}`);
      }
    }
    
    // 檢查是否包含授權補習班（肯塔基美語）
    const authorizedCenter = '肯塔基美語';
    if (this.originalResponse.includes('英語') || this.originalResponse.includes('美語')) {
      if (!this.originalResponse.includes(authorizedCenter)) {
        // 如果提到英語學習但沒有提到授權中心，檢查是否提到了未授權的
        const hasUnauthorized = forbiddenTutoringCenters.some(center => 
          this.originalResponse.includes(center)
        );
        
        if (hasUnauthorized) {
          issues.push(`英語學習回應包含未授權補習班`);
          this.addCorrection(`替換為授權補習班: ${authorizedCenter}`);
        }
      }
    }
    
    const result: ValidationResult = {
      standard: '0 禁詞',
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'CRITICAL' : 'PASSED'
    };
    
    this.validationResults.push(result);
    return result;
  }

  /**
   * 標準 3: 100% 語氣合格檢查
   * 檢查輸出是否保留高文文的人格
   */
  private async checkToneQualification(): Promise<ValidationResult> {
    console.log(`[${this.sessionId}] 🔍 標準 3: 100% 語氣合格檢查`);
    
    const issues: string[] = [];
    
    // 高文文人格特徵檢查
    const wenwenPersonalityTraits = {
      // 正面特徵（應該包含）
      positiveTraits: [
        '溫暖', '親切', '像在地朋友', '熱情', '友善',
        '專業', '可靠', '誠實', '真誠'
      ],
      
      // 負面特徵（應該避免）
      negativeTraits: [
        '冷漠', '機械', '客服腔調', '過度正式', '不自然',
        '誇大', '虛假', '不誠實'
      ],
      
      // 語氣模式（應該避免）
      forbiddenTonePatterns: [
        '嘿～這附近我蠻推薦的', // 可能誤導的開頭
        '我超推薦.*的啦', // 過度誇張
        '相信對你的學習會有幫助', // 空泛的承諾
        '有空不妨去看看', // 不負責任的建議
        '這幾家我都很推薦' // 缺乏具體性
      ]
    };
    
    // 檢查是否包含負面特徵
    for (const negativeTrait of wenwenPersonalityTraits.negativeTraits) {
      if (this.originalResponse.includes(negativeTrait)) {
        issues.push(`包含負面人格特徵: ${negativeTrait}`);
        this.addCorrection(`移除負面特徵: ${negativeTrait}`);
      }
    }
    
    // 檢查是否包含禁止的語氣模式
    for (const pattern of wenwenPersonalityTraits.forbiddenTonePatterns) {
      const regex = new RegExp(pattern);
      if (regex.test(this.originalResponse)) {
        issues.push(`包含禁止的語氣模式: ${pattern}`);
        this.addCorrection(`修正語氣模式: ${pattern}`);
      }
    }
    
    // 檢查是否缺乏正面特徵
    const hasPositiveTrait = wenwenPersonalityTraits.positiveTraits.some(trait => 
      this.originalResponse.includes(trait)
    );
    
    if (!hasPositiveTrait && this.originalResponse.length > 20) {
      issues.push(`缺乏高文文正面人格特徵`);
      this.addCorrection(`增強正面人格特徵`);
    }
    
    // 檢查回應長度是否合適
    if (this.originalResponse.length < 10) {
      issues.push(`回應過短，缺乏人格表達`);
      this.addCorrection(`增加回應內容以展現人格`);
    }
    
    const result: ValidationResult = {
      standard: '100% 語氣合格',
      passed: issues.length === 0,
      issues,
      severity: issues.length > 0 ? 'HIGH' : 'PASSED'
    };
    
    this.validationResults.push(result);
    return result;
  }

  // ===== 輔助方法 =====

  /**
   * 提取回應中提到的實體（商家名稱、地點等）
   */
  private extractMentionedEntities(response: string): string[] {
    const entities: string[] = [];
    
    // 提取商家名稱（通常是中文名稱）
    const storeNamePattern = /[\u4e00-\u9fa5]{2,}[\u7f8e\u96f6\u9910\u5ef3\u5c0f\u98ef\u6599\u7406\u9910\u996e\u5b78\u6821\u6559\u5ba2]/g;
    const matches = response.match(storeNamePattern);
    
    if (matches) {
      entities.push(...matches);
    }
    
    // 提取地址
    const addressPattern = /[\u4e00-\u9fa5]{2,}[\u8def\u8857\u5df7\u5f04\u865f\u6a13]/g;
    const addressMatches = response.match(addressPattern);
    
    if (addressMatches) {
      entities.push(...addressMatches);
    }
    
    return entities;
  }

  /**
   * 檢查實體是否在資料庫中存在
   */
  private async checkEntityExistsInDB(entity: string): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?store_name=ilike.%${encodeURIComponent(entity)}%`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const stores = await response.json();
        return stores.length > 0;
      }
      return false;
    } catch (error) {
      console.error(`檢查實體存在失敗: ${entity}`, error);
      return false;
    }
  }

  /**
   * 檢查實體是否在 FAQ 中存在
   */
  private async checkEntityExistsInFAQ(entity: string): Promise<boolean> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/faqs?content=ilike.%${encodeURIComponent(entity)}%`, {
        headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY }
      });
      
      if (response.ok) {
        const faqs = await response.json();
        return faqs.length > 0;
      }
      return false;
    } catch (error) {
      console.error(`檢查 FAQ 存在失敗: ${entity}`, error);
      return false;
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
        finalResponse: '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。'
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
   * 生成修正後的回應
   */
  private async generateCorrectedResponse(): Promise<string> {
    // 根據修正項目生成回應
    const corrections = this.correctionHistory.map(c => c.description);
    
    if (corrections.some(c => c.includes('移除幻覺實體') || c.includes('移除幻覺模式'))) {
      return '抱歉，目前沒有找到相關商家，請稍後再試或聯繫客服。';
    }
    
    if (corrections.some(c => c.includes('移除未授權補習班'))) {
      return '關於英語學習，我推薦肯塔基美語，這是一家專業的英語教學機構。';
    }
    
    if (corrections.some(c => c.includes('修正語氣模式') || c.includes('增強正面人格特徵'))) {
      return '讓我為您推薦一些不錯的選擇，這些都是文山特區值得信賴的商家。';
    }
    
    return '抱歉，系統回應需要調整，請稍後再試。';
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

interface ProsecutorResult {
  passed: boolean;
  finalResponse: string;
  validationResults: ValidationResult[];
  corrections: Correction[];
  prosecutorVersion: string;
  strictStandards: {
    zeroHallucination: boolean;
    zeroForbiddenWords: boolean;
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
    
    console.log(`[${currentSessionId}] 🚀 語氣靈檢察官服務啟動`);

    // 創建語氣靈檢察官實例
    const prosecutor = new ToneSpiritProsecutor(
      currentSessionId,
      messageContent,
      original_response || '原始回應未提供'
    );

    // 執行嚴格驗收標準檢查
    const prosecutorResult = await prosecutor.executeStrictValidation();

    // 記錄檢察結果
    console.log(`[${currentSessionId}] 📊 檢察結果:`, {
      passed: prosecutorResult.passed,
      corrections: prosecutorResult.corrections.length,
      standards: prosecutorResult.strictStandards
    });

    return new Response(JSON.stringify({
      response: prosecutorResult.finalResponse,
      session_id: currentSessionId,
      prosecutor: {
        passed: prosecutorResult.passed,
        validationResults: prosecutorResult.validationResults,
        corrections: prosecutorResult.corrections,
        strictStandards: prosecutorResult.strictStandards,
        version: prosecutorResult.prosecutorVersion
      },
      debug: {
        originalResponseLength: original_response?.length || 0,
        finalResponseLength: prosecutorResult.finalResponse.length,
        correctionsApplied: prosecutorResult.corrections.length,
        standardsPassed: Object.values(prosecutorResult.strictStandards).filter(Boolean).length
      },
      version: 'TONE-SPIRIT-PROSECUTOR-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('語氣靈檢察官錯誤:', error);
    return new Response(JSON.stringify({
      response: '抱歉，系統暫時無法回應，請稍後再試。',
      error: error.message,
      version: 'TONE-SPIRIT-PROSECUTOR-v1.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
