/**
 * 推薦策略層模組 - 類別限定與 fallback 策略
 * 負責：根據意圖獲取商家資料、特約商家優先、fallback 機制
 */

import { DataLayer, StoreData } from "./data-layer.ts";

export interface RecommendationConfig {
  maxStores: number;
  prioritizePartnerStores: boolean;
  enableFallback: boolean;
}

export class RecommendationEngine {
  private dataLayer: DataLayer;
  private defaultConfig: RecommendationConfig = {
    maxStores: 5,
    prioritizePartnerStores: true,
    enableFallback: true
  };

  constructor(dataLayer: DataLayer) {
    this.dataLayer = dataLayer;
  }

  /**
   * 根據意圖獲取商家資料
   */
  async getStoresByIntent(
    intent: string,
    isFollowUp: boolean,
    sessionId: string,
    config: RecommendationConfig = this.defaultConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🎯 推薦策略：意圖=${intent}, 追問=${isFollowUp}`);

    let stores: StoreData[] = [];

    switch (intent) {
      case 'FOOD':
        stores = await this.getFoodStores(sessionId, config);
        break;
      
      case 'ENGLISH_LEARNING':
        stores = await this.getEnglishLearningStores(isFollowUp, sessionId, config);
        break;
      
      case 'PARKING':
        stores = await this.getParkingStores(sessionId, config);
        break;
      
      case 'SHOPPING':
        stores = await this.getShoppingStores(sessionId, config);
        break;
      
      case 'BEAUTY':
        stores = await this.getBeautyStores(sessionId, config);
        break;
      
      case 'MEDICAL':
        stores = await this.getMedicalStores(sessionId, config);
        break;
      
      default:
        stores = await this.getGeneralStores(sessionId, config);
        break;
    }

    // 應用 fallback 策略
    if (stores.length === 0 && config.enableFallback) {
      stores = await this.applyFallbackStrategy(intent, sessionId, config);
    }

    // 限制返回數量
    return stores.slice(0, config.maxStores);
  }

  /**
   * 美食商家推薦
   */
  private async getFoodStores(
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🍽️ 查詢餐飲美食商家`);
    
    const stores = await this.dataLayer.getStoresByCategory('餐飲美食', config.maxStores, sessionId);
    
    if (config.prioritizePartnerStores) {
      return this.prioritizePartnerStores(stores);
    }
    
    return stores;
  }

  /**
   * 英語學習商家推薦
   */
  private async getEnglishLearningStores(
    isFollowUp: boolean,
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🎓 查詢英語學習商家，追問=${isFollowUp}`);
    
    if (!isFollowUp) {
      // 首次查詢：只推薦肯塔基美語
      const stores = await this.dataLayer.getStoresByName('肯塔基美語', sessionId);
      return stores;
    } else {
      // 追問時：查詢所有教育培訓商家
      const stores = await this.dataLayer.getStoresByCategory('教育培訓', config.maxStores, sessionId);
      
      if (config.prioritizePartnerStores) {
        return this.prioritizePartnerStores(stores);
      }
      
      return stores;
    }
  }

  /**
   * 停車場商家推薦
   */
  private async getParkingStores(
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🅿️ 查詢停車場商家`);
    
    const stores = await this.dataLayer.getStoresByCategory('停車場', config.maxStores, sessionId);
    
    // 停車場按評分排序（不考慮特約狀態）
    return stores.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * 購物商家推薦
   */
  private async getShoppingStores(
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🛍️ 查詢購物商家`);
    
    const stores = await this.dataLayer.getStoresByCategory('購物零售', config.maxStores, sessionId);
    
    if (config.prioritizePartnerStores) {
      return this.prioritizePartnerStores(stores);
    }
    
    return stores;
  }

  /**
   * 美容商家推薦
   */
  private async getBeautyStores(
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 💄 查詢美容商家`);
    
    const stores = await this.dataLayer.getStoresByCategory('美容美髮', config.maxStores, sessionId);
    
    if (config.prioritizePartnerStores) {
      return this.prioritizePartnerStores(stores);
    }
    
    return stores;
  }

  /**
   * 醫療商家推薦
   */
  private async getMedicalStores(
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🏥 查詢醫療商家`);
    
    const stores = await this.dataLayer.getStoresByCategory('醫療保健', config.maxStores, sessionId);
    
    // 醫療機構按評分排序（不考慮特約狀態）
    return stores.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  /**
   * 一般商家推薦
   */
  private async getGeneralStores(
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🌟 查詢一般商家`);
    
    const stores = await this.dataLayer.getGeneralStores(config.maxStores, sessionId);
    
    if (config.prioritizePartnerStores) {
      return this.prioritizePartnerStores(stores);
    }
    
    return stores;
  }

  /**
   * 特約商家優先排序
   */
  private prioritizePartnerStores(stores: StoreData[]): StoreData[] {
    return stores.sort((a, b) => {
      // 特約商家優先
      if (a.is_partner_store && !b.is_partner_store) return -1;
      if (!a.is_partner_store && b.is_partner_store) return 1;
      
      // 相同特約狀態時按評分排序
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  /**
   * Fallback 策略
   */
  private async applyFallbackStrategy(
    intent: string,
    sessionId: string,
    config: RecommendationConfig
  ): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🔄 應用 Fallback 策略: ${intent}`);

    switch (intent) {
      case 'ENGLISH_LEARNING':
        // 英語學習的 fallback：強制查詢肯塔基美語
        console.log(`[${sessionId}] 🎓 Fallback: 強制查詢肯塔基美語`);
        return await this.dataLayer.getStoresByName('肯塔基美語', sessionId);
      
      case 'FOOD':
        // 美食的 fallback：查詢所有商家，篩選餐飲相關
        console.log(`[${sessionId}] 🍽️ Fallback: 查詢所有商家`);
        const allStores = await this.dataLayer.getGeneralStores(config.maxStores * 2, sessionId);
        return allStores.filter(store => 
          store.category.includes('餐飲') || 
          store.category.includes('美食') ||
          store.store_name.includes('餐廳') ||
          store.store_name.includes('食堂')
        );
      
      case 'PARKING':
        // 停車場的 fallback：查詢所有商家，篩選停車相關
        console.log(`[${sessionId}] 🅿️ Fallback: 查詢所有商家`);
        const allStores2 = await this.dataLayer.getGeneralStores(config.maxStores * 2, sessionId);
        return allStores2.filter(store => 
          store.category.includes('停車') ||
          store.store_name.includes('停車')
        );
      
      default:
        // 一般 fallback：返回特約商家
        console.log(`[${sessionId}] ⭐ Fallback: 返回特約商家`);
        return await this.dataLayer.getPartnerStores(config.maxStores, sessionId);
    }
  }

  /**
   * 獲取推薦統計資訊
   */
  getRecommendationStats(stores: StoreData[]): {
    totalStores: number;
    partnerStores: number;
    averageRating: number;
    categories: string[];
  } {
    const partnerStores = stores.filter(store => store.is_partner_store).length;
    const averageRating = stores.reduce((sum, store) => sum + (store.rating || 0), 0) / stores.length;
    const categories = [...new Set(stores.map(store => store.category))];

    return {
      totalStores: stores.length,
      partnerStores,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      categories
    };
  }

  /**
   * 驗證推薦結果
   */
  validateRecommendation(
    stores: StoreData[],
    intent: string,
    sessionId: string
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // 檢查商家資料完整性
    stores.forEach((store, index) => {
      if (!store.store_name) {
        issues.push(`商家 ${index + 1} 缺少店名`);
      }
      if (!store.category) {
        issues.push(`商家 ${index + 1} 缺少類別`);
      }
    });

    // 檢查意圖與類別的匹配性
    if (intent === 'FOOD') {
      const nonFoodStores = stores.filter(store => 
        !store.category.includes('餐飲') && 
        !store.category.includes('美食')
      );
      if (nonFoodStores.length > 0) {
        issues.push(`美食查詢包含非餐飲商家: ${nonFoodStores.map(s => s.store_name).join(', ')}`);
      }
    }

    if (intent === 'ENGLISH_LEARNING') {
      const nonEducationStores = stores.filter(store => 
        !store.category.includes('教育') && 
        !store.category.includes('培訓')
      );
      if (nonEducationStores.length > 0) {
        issues.push(`英語學習查詢包含非教育商家: ${nonEducationStores.map(s => s.store_name).join(', ')}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
