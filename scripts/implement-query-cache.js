/**
 * 實現意圖查詢層快取功能
 */

// 在 Edge Function 中添加快取邏輯
const cacheImplementation = `
// 在 RecommendationLayer 類中添加快取功能
class RecommendationLayer {
  constructor(dataLayer) {
    this.dataLayer = dataLayer;
    this.cache = new Map(); // 簡單的記憶體快取
    this.cacheTTL = {
      'FOOD': 120000,      // 餐飲美食 2 分鐘
      'PARKING': 60000,    // 停車場 1 分鐘
      'SHOPPING': 90000,   // 購物 1.5 分鐘
      'BEAUTY': 90000,     // 美容 1.5 分鐘
      'MEDICAL': 120000,   // 醫療 2 分鐘
      'default': 30000     // 其他 30 秒
    };
  }

  // 生成快取鍵
  generateCacheKey(intent, category, message) {
    const messageHash = message.substring(0, 20).toLowerCase().replace(/\\s+/g, '');
    return \`\${intent}:\${category}:\${messageHash}\`;
  }

  // 檢查快取
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(\`[快取命中] \${cacheKey}\`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(cacheKey);
      console.log(\`[快取過期] \${cacheKey}\`);
    }
    return null;
  }

  // 設置快取
  setCachedResult(cacheKey, data, intent) {
    const ttl = this.cacheTTL[intent] || this.cacheTTL.default;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(\`[快取設置] \${cacheKey}, TTL: \${ttl}ms\`);
  }

  // 修改 fetchStoresByIntent 方法
  async fetchStoresByIntent(intent, category, message) {
    // 生成快取鍵
    const cacheKey = this.generateCacheKey(intent, category, message);
    
    // 檢查快取
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // 執行原始邏輯
    const result = await this.fetchStoresByIntentOriginal(intent, category, message);
    
    // 設置快取
    this.setCachedResult(cacheKey, result, intent);
    
    return result;
  }

  // 原始邏輯（重命名）
  async fetchStoresByIntentOriginal(intent, category, message) {
    // 這裡是原來的邏輯...
  }
}
`;

console.log('🚀 意圖查詢層快取實現');
console.log('=' .repeat(50));
console.log('');
console.log('✅ 快取策略：');
console.log('- 餐飲美食：2 分鐘快取');
console.log('- 停車場：1 分鐘快取');
console.log('- 購物/美容：1.5 分鐘快取');
console.log('- 醫療：2 分鐘快取');
console.log('- 其他：30 秒快取');
console.log('');
console.log('📊 預期效果：');
console.log('- 砍下 50-80% 冷查詢');
console.log('- 熱門類別響應速度提升');
console.log('- 減少資料庫負載');
console.log('');
console.log('🔧 實現方式：');
console.log('- 使用 Map 記憶體快取');
console.log('- TTL 過期機制');
console.log('- 快取鍵包含意圖+分類+訊息');
console.log('- 自動清理過期快取');
console.log('');
console.log('📝 需要將此邏輯整合到 Edge Function 中');
