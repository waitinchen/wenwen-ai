/**
 * 前端驗證機制 - 防止 AI 幻覺傳播到用戶端
 * WEN 1.1.7 - 全面解決方案
 */

// 已知的幻覺商家黑名單
const FRONTEND_HALLUCINATION_BLACKLIST = [
  '鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館', '阿村魯肉飯',
  '英文達人', '環球英語', '東門市場', '文山樓', '美語街123號'
];

// 幻覺檢測模式
const HALLUCINATION_PATTERNS = [
  /嘿～這附近我蠻推薦的/,
  /我超推薦.*的啦/,
  /相信對你的學習會有幫助/,
  /有空不妨去看看/,
  /這幾家我都很推薦/
];

export class FrontendValidationSystem {
  /**
   * 驗證 AI 回應是否包含幻覺
   */
  static validateAIResponse(response: string): {
    isValid: boolean;
    issues: string[];
    sanitizedResponse?: string;
  } {
    const issues: string[] = [];
    
    // 檢查黑名單商家
    const containsBlacklistedStores = FRONTEND_HALLUCINATION_BLACKLIST.some(store => 
      response.includes(store)
    );
    
    if (containsBlacklistedStores) {
      issues.push('包含已知的虛假商家名稱');
    }
    
    // 檢查幻覺模式
    const containsHallucinationPatterns = HALLUCINATION_PATTERNS.some(pattern => 
      pattern.test(response)
    );
    
    if (containsHallucinationPatterns) {
      issues.push('包含可能的幻覺語言模式');
    }
    
    // 檢查是否包含具體商家推薦但沒有資料
    if (response.includes('推薦') && !response.includes('目前沒有找到相關商家')) {
      const hasStoreNames = /[\u4e00-\u9fa5]{2,}[\u7f8e\u96f6\u9910\u5ef3\u5c0f\u98ef\u6599\u7406\u9910\u996e]/.test(response);
      if (hasStoreNames) {
        issues.push('可能包含未驗證的商家推薦');
      }
    }
    
    const isValid = issues.length === 0;
    
    // 如果需要，提供清理後的回應
    let sanitizedResponse = response;
    if (!isValid) {
      sanitizedResponse = this.sanitizeResponse(response);
    }
    
    return {
      isValid,
      issues,
      sanitizedResponse: isValid ? undefined : sanitizedResponse
    };
  }
  
  /**
   * 清理包含幻覺的回應
   */
  private static sanitizeResponse(response: string): string {
    let sanitized = response;
    
    // 移除黑名單商家
    FRONTEND_HALLUCINATION_BLACKLIST.forEach(store => {
      sanitized = sanitized.replace(new RegExp(store, 'g'), '[商家名稱已過濾]');
    });
    
    // 替換幻覺模式
    sanitized = sanitized.replace(/嘿～這附近我蠻推薦的/g, '抱歉，目前沒有找到相關商家');
    sanitized = sanitized.replace(/我超推薦.*的啦/g, '抱歉，目前沒有找到相關商家');
    sanitized = sanitized.replace(/相信對你的學習會有幫助/g, '如有需要請聯繫客服');
    sanitized = sanitized.replace(/有空不妨去看看/g, '如有需要請聯繫客服');
    sanitized = sanitized.replace(/這幾家我都很推薦/g, '如有需要請聯繫客服');
    
    // 添加警告標記
    if (sanitized !== response) {
      sanitized = '⚠️ 系統檢測到可能的異常回應，已進行安全過濾。\n\n' + sanitized;
    }
    
    return sanitized;
  }
  
  /**
   * 驗證商家資料
   */
  static validateStoreData(stores: any[]): {
    validStores: any[];
    invalidStores: any[];
    issues: string[];
  } {
    const validStores: any[] = [];
    const invalidStores: any[] = [];
    const issues: string[] = [];
    
    stores.forEach((store, index) => {
      // 檢查基本欄位
      if (!store.name || !store.category) {
        invalidStores.push(store);
        issues.push(`商家 ${index + 1}: 缺少必要欄位`);
        return;
      }
      
      // 檢查黑名單
      if (FRONTEND_HALLUCINATION_BLACKLIST.some(blacklisted => 
        store.name.includes(blacklisted)
      )) {
        invalidStores.push(store);
        issues.push(`商家 ${index + 1}: 包含黑名單商家名稱`);
        return;
      }
      
      // 檢查地址格式
      if (store.address && !this.isValidAddress(store.address)) {
        invalidStores.push(store);
        issues.push(`商家 ${index + 1}: 地址格式異常`);
        return;
      }
      
      validStores.push(store);
    });
    
    return {
      validStores,
      invalidStores,
      issues
    };
  }
  
  /**
   * 驗證地址格式
   */
  private static isValidAddress(address: string): boolean {
    // 檢查是否包含數字（門牌號碼）
    if (!/\d/.test(address)) {
      return false;
    }
    
    // 檢查是否包含有效的地址關鍵字
    const validKeywords = ['路', '街', '巷', '弄', '號', '樓', '高雄市', '鳳山區'];
    return validKeywords.some(keyword => address.includes(keyword));
  }
  
  /**
   * 記錄驗證結果
   */
  static logValidationResult(
    sessionId: string,
    validationResult: any,
    originalResponse: string
  ): void {
    console.log(`[${sessionId}] 🔍 前端驗證結果:`, {
      isValid: validationResult.isValid,
      issues: validationResult.issues,
      responseLength: originalResponse.length,
      timestamp: new Date().toISOString()
    });
    
    // 如果有問題，發送到監控系統
    if (!validationResult.isValid) {
      this.reportValidationIssue(sessionId, validationResult, originalResponse);
    }
  }
  
  /**
   * 報告驗證問題
   */
  private static reportValidationIssue(
    sessionId: string,
    validationResult: any,
    originalResponse: string
  ): void {
    // 這裡可以發送到監控系統或日誌服務
    console.warn(`[${sessionId}] 🚨 前端驗證問題報告:`, {
      issues: validationResult.issues,
      response: originalResponse.substring(0, 200) + '...',
      timestamp: new Date().toISOString()
    });
  }
}

// 使用範例
export const useFrontendValidation = () => {
  const validateResponse = (response: string, sessionId: string) => {
    const validationResult = FrontendValidationSystem.validateAIResponse(response);
    FrontendValidationSystem.logValidationResult(sessionId, validationResult, response);
    
    return {
      response: validationResult.isValid ? response : validationResult.sanitizedResponse!,
      isValid: validationResult.isValid,
      issues: validationResult.issues
    };
  };
  
  const validateStores = (stores: any[]) => {
    return FrontendValidationSystem.validateStoreData(stores);
  };
  
  return {
    validateResponse,
    validateStores
  };
};
