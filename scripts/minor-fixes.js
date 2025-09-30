/**
 * 小修小補（微優先）
 */

const minorFixes = `
// 1. FallbackService.generateContextualFallback() 修復
class FallbackService {
  static generateContextualFallback(intent, searchTerm = undefined) {
    // 移除未使用的 searchTerm 參數警告
    // 如果之後需要插入關鍵字，searchTerm 會是 undefined，不會踩雷
    
    const fallbacks = {
      'FOOD': '抱歉，文山特區目前沒有找到相關的餐飲店家。建議您嘗試其他關鍵字或聯繫我們新增店家資訊。',
      'SHOPPING': '抱歉，目前沒有找到相關的購物資訊。建議您使用其他關鍵字搜尋。',
      'PARKING': '抱歉，目前沒有找到相關的停車場資訊。建議您使用其他關鍵字搜尋。',
      'BEAUTY': '抱歉，目前沒有找到相關的美容美髮店家。建議您使用其他關鍵字搜尋。',
      'MEDICAL': '抱歉，目前沒有找到相關的醫療店家。建議您使用其他關鍵字搜尋。',
      'default': '抱歉，我沒有找到相關的資訊。請嘗試使用其他關鍵字，或聯繫我們獲取幫助。'
    };
    
    return fallbacks[intent] || fallbacks.default;
  }
}

// 2. ToneRenderingLayer.generateCoverageStatsResponse() 時間格式化修復
class ToneRenderingLayer {
  generateCoverageStatsResponse(stores) {
    // 檢查是否有統計數據
    if (!stores || stores.length === 0 || !stores[0]?.stats) {
      const fallback = '抱歉，我是高文文，目前沒有可靠的統計數據可以提供。建議您稍後再試，或聯繫管理員獲取最新資訊。😊';
      const version = \`---\\n*WEN 1.4.6*\`;
      return \`\${fallback}\\n\\n\${version}\`;
    }
    
    const stats = stores[0].stats;
    // 修復：使用穩定的時區格式化
    const lastUpdated = new Date(stats.last_updated).toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const response = \`📊 **文山特區商家資料庫統計** 📊
  
  • **商家總數**：\${stats.total} 家
  • **安心店家**：\${stats.verified} 家  
  • **優惠店家**：\${stats.discount || 0} 家
  • **特約商家**：\${stats.partner} 家
  • **分類數**：\${stats.categories} 個
  • **最後更新時間**：\${lastUpdated}
  
  這些數字會隨著收錄進度更新喔！✨
  
  我是高文文，很高興為您提供統計資訊～有什麼其他問題隨時問我！😊\`;
    
    const version = \`---\\n*WEN 1.4.6*\`;
    return \`\${response}\\n\\n\${version}\`;
  }
}

// 3. LoggingFeedbackLayer.logRecommendationDetails() 修復
class LoggingFeedbackLayer {
  logRecommendationDetails(sessionId, intent, stores, message, processingTime) {
    // 構建 logData，移除重複的 session_id
    const logData = {
      intent,
      store_count: stores?.length || 0,
      processing_time_ms: processingTime,
      message_length: message?.length || 0,
      timestamp: new Date().toISOString()
    };
    
    // 調用 DataLayer.logRecommendation，sessionId 作為參數傳入
    return this.dataLayer.logRecommendation(sessionId, logData);
  }
}

// 4. DataLayer.logRecommendation() 確保正確處理
class DataLayer {
  async logRecommendation(sessionId, logData) {
    try {
      // logData 中不包含 session_id，避免重複
      const logEntry = {
        session_id: sessionId,  // 從參數獲取
        ...logData             // 展開其他數據
      };
      
      const { data, error } = await this.supabase
        .from('recommendation_logs')
        .insert(logEntry);
        
      if (error) {
        console.error('[日誌記錄] 插入失敗:', error);
      } else {
        console.log('[日誌記錄] 記錄成功:', logEntry);
      }
      
      return { data, error };
    } catch (error) {
      console.error('[日誌記錄] 異常:', error);
      return { data: null, error };
    }
  }
}
`;

console.log('🔧 小修小補（微優先）');
console.log('=' .repeat(50));
console.log('');
console.log('✅ 修復項目：');
console.log('');
console.log('1. FallbackService.generateContextualFallback()');
console.log('   - 移除未使用的 searchTerm 參數警告');
console.log('   - 確保呼叫端傳 undefined 不會踩雷');
console.log('');
console.log('2. ToneRenderingLayer.generateCoverageStatsResponse()');
console.log('   - 修復時間格式化使用穩定的時區');
console.log('   - 使用 toLocaleString(\'zh-TW\', { timeZone: \'Asia/Taipei\' })');
console.log('   - 確保在台灣環境下時間顯示正確');
console.log('');
console.log('3. LoggingFeedbackLayer.logRecommendationDetails()');
console.log('   - 移除 logData 中重複的 session_id');
console.log('   - 避免展開時重複欄位');
console.log('   - 確保函式參數為準');
console.log('');
console.log('4. DataLayer.logRecommendation()');
console.log('   - 確保正確處理 session_id');
console.log('   - 避免重複欄位問題');
console.log('   - 保持日誌記錄完整性');
console.log('');
console.log('📊 修復效果：');
console.log('- 消除未使用參數警告');
console.log('- 時間顯示穩定可靠');
console.log('- 日誌記錄結構清晰');
console.log('- 避免重複欄位問題');
console.log('');
console.log('📝 需要將這些修復整合到 Edge Function 中');
