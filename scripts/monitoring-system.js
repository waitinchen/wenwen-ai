/**
 * WEN 1.1.7 監控系統
 * 實時監控 AI 回應品質和幻覺檢測
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 監控配置
const MONITORING_CONFIG = {
  // 幻覺檢測關鍵字
  hallucinationKeywords: [
    '鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館', '阿村魯肉飯',
    '英文達人', '環球英語', '東門市場', '文山樓'
  ],
  
  // 可疑回應模式
  suspiciousPatterns: [
    /嘿～這附近我蠻推薦的/,
    /我超推薦.*的啦/,
    /相信對你的學習會有幫助/,
    /有空不妨去看看/,
    /這幾家我都很推薦/
  ],
  
  // 監控閾值
  thresholds: {
    maxHallucinationRate: 0.05, // 5%
    maxResponseTime: 10000, // 10秒
    minStoreCount: 0, // 最少推薦商家數
    maxStoreCount: 5 // 最多推薦商家數
  }
};

class MonitoringSystem {
  constructor() {
    this.alerts = [];
    this.metrics = {
      totalRequests: 0,
      hallucinationDetected: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
  }

  /**
   * 監控 AI 回應
   */
  async monitorAIResponse(sessionId, requestData, responseData, responseTime) {
    const monitoringResult = {
      sessionId,
      timestamp: new Date().toISOString(),
      requestData: {
        message: requestData.message,
        intent: requestData.intent
      },
      responseData: {
        response: responseData.response,
        storeCount: responseData.recommended_stores?.length || 0,
        version: responseData.version
      },
      performance: {
        responseTime,
        isValid: true
      },
      issues: []
    };

    // 檢查回應時間
    if (responseTime > MONITORING_CONFIG.thresholds.maxResponseTime) {
      monitoringResult.performance.isValid = false;
      monitoringResult.issues.push('回應時間過長');
    }

    // 檢查幻覺
    const hallucinationCheck = this.checkHallucination(responseData.response);
    if (hallucinationCheck.hasHallucination) {
      monitoringResult.performance.isValid = false;
      monitoringResult.issues.push('檢測到幻覺內容');
      monitoringResult.hallucinationDetails = hallucinationCheck;
    }

    // 檢查推薦商家數量
    const storeCount = responseData.recommended_stores?.length || 0;
    if (storeCount < MONITORING_CONFIG.thresholds.minStoreCount || 
        storeCount > MONITORING_CONFIG.thresholds.maxStoreCount) {
      monitoringResult.issues.push('推薦商家數量異常');
    }

    // 更新指標
    this.updateMetrics(monitoringResult);

    // 記錄監控結果
    await this.logMonitoringResult(monitoringResult);

    // 檢查是否需要警報
    if (!monitoringResult.performance.isValid || monitoringResult.issues.length > 0) {
      await this.triggerAlert(monitoringResult);
    }

    return monitoringResult;
  }

  /**
   * 檢查幻覺內容
   */
  checkHallucination(response) {
    const issues = [];
    
    // 檢查黑名單關鍵字
    const foundKeywords = MONITORING_CONFIG.hallucinationKeywords.filter(keyword => 
      response.includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      issues.push(`發現黑名單關鍵字: ${foundKeywords.join(', ')}`);
    }

    // 檢查可疑模式
    const foundPatterns = MONITORING_CONFIG.suspiciousPatterns.filter(pattern => 
      pattern.test(response)
    );
    
    if (foundPatterns.length > 0) {
      issues.push(`發現可疑回應模式: ${foundPatterns.length} 個`);
    }

    // 檢查是否包含具體商家但沒有資料
    if (response.includes('推薦') && !response.includes('目前沒有找到相關商家')) {
      const hasStoreNames = /[\u4e00-\u9fa5]{2,}[\u7f8e\u96f6\u9910\u5ef3\u5c0f\u98ef\u6599\u7406\u9910\u996e]/.test(response);
      if (hasStoreNames) {
        issues.push('可能包含未驗證的商家推薦');
      }
    }

    return {
      hasHallucination: issues.length > 0,
      issues,
      foundKeywords,
      foundPatterns: foundPatterns.length
    };
  }

  /**
   * 更新監控指標
   */
  updateMetrics(monitoringResult) {
    this.metrics.totalRequests++;
    
    if (monitoringResult.hallucinationDetails?.hasHallucination) {
      this.metrics.hallucinationDetected++;
    }

    // 更新平均回應時間
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
    this.metrics.averageResponseTime = (totalTime + monitoringResult.performance.responseTime) / this.metrics.totalRequests;

    // 更新錯誤率
    const errorCount = this.metrics.totalRequests - this.metrics.totalRequests + (monitoringResult.performance.isValid ? 0 : 1);
    this.metrics.errorRate = errorCount / this.metrics.totalRequests;
  }

  /**
   * 記錄監控結果
   */
  async logMonitoringResult(monitoringResult) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/monitoring_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: monitoringResult.sessionId,
          timestamp: monitoringResult.timestamp,
          request_data: monitoringResult.requestData,
          response_data: monitoringResult.responseData,
          performance: monitoringResult.performance,
          issues: monitoringResult.issues,
          hallucination_details: monitoringResult.hallucinationDetails
        })
      });

      if (!response.ok) {
        console.error('監控記錄失敗:', response.status);
      }
    } catch (error) {
      console.error('監控記錄異常:', error);
    }
  }

  /**
   * 觸發警報
   */
  async triggerAlert(monitoringResult) {
    const alert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'HALLUCINATION_DETECTED',
      severity: monitoringResult.hallucinationDetails?.hasHallucination ? 'HIGH' : 'MEDIUM',
      sessionId: monitoringResult.sessionId,
      issues: monitoringResult.issues,
      details: monitoringResult
    };

    this.alerts.push(alert);

    // 發送警報通知
    console.warn('🚨 監控警報觸發:', alert);

    // 這裡可以整合到 Slack、Email 或其他通知系統
    await this.sendAlertNotification(alert);
  }

  /**
   * 發送警報通知
   */
  async sendAlertNotification(alert) {
    // 實現通知邏輯（Slack、Email、SMS 等）
    console.log(`📧 發送警報通知: ${alert.type} - ${alert.severity}`);
  }

  /**
   * 獲取監控報告
   */
  getMonitoringReport() {
    const hallucinationRate = this.metrics.totalRequests > 0 ? 
      this.metrics.hallucinationDetected / this.metrics.totalRequests : 0;

    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      hallucinationRate,
      status: {
        isHealthy: hallucinationRate < MONITORING_CONFIG.thresholds.maxHallucinationRate,
        issues: this.alerts.length,
        lastAlert: this.alerts[this.alerts.length - 1]?.timestamp
      },
      alerts: this.alerts.slice(-10) // 最近 10 個警報
    };
  }

  /**
   * 重置監控數據
   */
  reset() {
    this.alerts = [];
    this.metrics = {
      totalRequests: 0,
      hallucinationDetected: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
  }
}

// 全域監控實例
const globalMonitor = new MonitoringSystem();

// 導出監控函數
export const monitorAIResponse = (sessionId, requestData, responseData, responseTime) => {
  return globalMonitor.monitorAIResponse(sessionId, requestData, responseData, responseTime);
};

export const getMonitoringReport = () => {
  return globalMonitor.getMonitoringReport();
};

export const resetMonitoring = () => {
  globalMonitor.reset();
};

// 定時生成監控報告
setInterval(() => {
  const report = globalMonitor.getMonitoringReport();
  if (!report.status.isHealthy) {
    console.warn('⚠️ 系統健康狀況異常:', report);
  }
}, 60000); // 每分鐘檢查一次

export default MonitoringSystem;
