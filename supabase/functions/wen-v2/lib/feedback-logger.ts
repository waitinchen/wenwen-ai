/**
 * 記錄回饋層模組 - 完整日誌記錄與回饋分析
 * 負責：聊天記錄、用戶行為分析、準確率回饋
 */

import { DataLayer, UserMeta } from "./data-layer.ts";
import { IntentResult } from "./intent-classifier.ts";
import { StoreData } from "./data-layer.ts";

export interface InteractionLog {
  sessionId: string;
  userId: number;
  userMessage: string;
  aiResponse: string;
  intent: string;
  confidence: number;
  stores: StoreData[];
  userMeta: UserMeta;
  tone: string;
  timestamp: string;
  responseTime: number;
}

export interface FeedbackAnalysis {
  intentAccuracy: number;
  recommendationRelevance: number;
  userSatisfaction: number;
  toneAppropriateness: number;
}

export class FeedbackLogger {
  private dataLayer: DataLayer;
  private interactionHistory: Map<string, InteractionLog[]> = new Map();

  constructor(dataLayer: DataLayer) {
    this.dataLayer = dataLayer;
  }

  /**
   * 記錄完整互動
   */
  async logInteraction(logData: {
    sessionId: string;
    userId: number;
    userMessage: string;
    aiResponse: string;
    intent: string;
    stores: StoreData[];
    userMeta: UserMeta;
    confidence: number;
    tone: string;
  }): Promise<void> {
    const startTime = Date.now();
    
    console.log(`[${logData.sessionId}] 📝 記錄互動回饋`);

    try {
      // 記錄用戶訊息
      await this.logUserMessage(logData);
      
      // 記錄AI回應
      await this.logAIResponse(logData);
      
      // 更新會話統計
      await this.updateSessionStats(logData);
      
      // 記錄本地互動歷史（用於分析）
      this.recordLocalInteraction(logData, Date.now() - startTime);
      
      console.log(`[${logData.sessionId}] ✅ 互動記錄完成`);

    } catch (error) {
      console.error(`[${logData.sessionId}] ❌ 記錄互動失敗:`, error);
    }
  }

  /**
   * 記錄用戶訊息
   */
  private async logUserMessage(logData: any): Promise<void> {
    await this.dataLayer.logMessage(
      logData.sessionId,
      logData.userId,
      'user',
      logData.userMessage,
      {
        intent: logData.intent,
        confidence: logData.confidence,
        timestamp: new Date().toISOString()
      },
      logData.sessionId
    );
  }

  /**
   * 記錄AI回應
   */
  private async logAIResponse(logData: any): Promise<void> {
    await this.dataLayer.logMessage(
      logData.sessionId,
      logData.userId,
      'assistant',
      logData.aiResponse,
      {
        intent: logData.intent,
        recommended_stores: logData.stores.map((s: StoreData) => s.id),
        store_count: logData.stores.length,
        tone: logData.tone,
        confidence: logData.confidence,
        timestamp: new Date().toISOString()
      },
      logData.sessionId
    );
  }

  /**
   * 更新會話統計
   */
  private async updateSessionStats(logData: any): Promise<void> {
    await this.dataLayer.updateSessionStats(
      logData.sessionId,
      logData.stores.length,
      logData.sessionId
    );
  }

  /**
   * 記錄本地互動歷史
   */
  private recordLocalInteraction(logData: any, responseTime: number): void {
    const interaction: InteractionLog = {
      sessionId: logData.sessionId,
      userId: logData.userId,
      userMessage: logData.userMessage,
      aiResponse: logData.aiResponse,
      intent: logData.intent,
      confidence: logData.confidence,
      stores: logData.stores,
      userMeta: logData.userMeta,
      tone: logData.tone,
      timestamp: new Date().toISOString(),
      responseTime
    };

    if (!this.interactionHistory.has(logData.sessionId)) {
      this.interactionHistory.set(logData.sessionId, []);
    }

    const sessionHistory = this.interactionHistory.get(logData.sessionId)!;
    sessionHistory.push(interaction);

    // 限制歷史記錄數量（避免記憶體溢出）
    if (sessionHistory.length > 100) {
      sessionHistory.shift();
    }
  }

  /**
   * 分析互動回饋
   */
  analyzeFeedback(sessionId: string): FeedbackAnalysis {
    const interactions = this.interactionHistory.get(sessionId) || [];
    
    if (interactions.length === 0) {
      return {
        intentAccuracy: 0,
        recommendationRelevance: 0,
        userSatisfaction: 0,
        toneAppropriateness: 0
      };
    }

    // 意圖準確率分析
    const intentAccuracy = this.calculateIntentAccuracy(interactions);
    
    // 推薦相關性分析
    const recommendationRelevance = this.calculateRecommendationRelevance(interactions);
    
    // 用戶滿意度分析（基於回應長度和追問行為）
    const userSatisfaction = this.calculateUserSatisfaction(interactions);
    
    // 語氣適切性分析
    const toneAppropriateness = this.calculateToneAppropriateness(interactions);

    return {
      intentAccuracy,
      recommendationRelevance,
      userSatisfaction,
      toneAppropriateness
    };
  }

  /**
   * 計算意圖準確率
   */
  private calculateIntentAccuracy(interactions: InteractionLog[]): number {
    // 基於信心度計算平均準確率
    const totalConfidence = interactions.reduce((sum, interaction) => 
      sum + interaction.confidence, 0
    );
    
    return interactions.length > 0 ? totalConfidence / interactions.length : 0;
  }

  /**
   * 計算推薦相關性
   */
  private calculateRecommendationRelevance(interactions: InteractionLog[]): number {
    let relevantCount = 0;
    
    interactions.forEach(interaction => {
      // 檢查推薦商家數量是否合理
      if (interaction.stores.length > 0 && interaction.stores.length <= 5) {
        relevantCount++;
      }
    });
    
    return interactions.length > 0 ? relevantCount / interactions.length : 0;
  }

  /**
   * 計算用戶滿意度
   */
  private calculateUserSatisfaction(interactions: InteractionLog[]): number {
    let satisfactionScore = 0;
    
    interactions.forEach(interaction => {
      // 基於AI回應長度判斷（適度長度表示用戶可能滿意）
      const responseLength = interaction.aiResponse.length;
      if (responseLength > 50 && responseLength < 500) {
        satisfactionScore += 1;
      } else if (responseLength > 500) {
        satisfactionScore += 0.8; // 過長可能表示用戶需要更多資訊
      }
      
      // 基於回應時間判斷（快速回應提升滿意度）
      if (interaction.responseTime < 2000) {
        satisfactionScore += 0.2;
      }
    });
    
    return interactions.length > 0 ? satisfactionScore / interactions.length : 0;
  }

  /**
   * 計算語氣適切性
   */
  private calculateToneAppropriateness(interactions: InteractionLog[]): number {
    const toneCounts = new Map<string, number>();
    
    interactions.forEach(interaction => {
      const count = toneCounts.get(interaction.tone) || 0;
      toneCounts.set(interaction.tone, count + 1);
    });
    
    // 如果語氣使用相對均衡，認為適切性較高
    const tones = Array.from(toneCounts.values());
    const maxCount = Math.max(...tones);
    const minCount = Math.min(...tones);
    
    return tones.length > 1 ? 1 - (maxCount - minCount) / maxCount : 1;
  }

  /**
   * 獲取會話統計資訊
   */
  getSessionStats(sessionId: string): {
    totalInteractions: number;
    averageConfidence: number;
    averageResponseTime: number;
    mostUsedIntent: string;
    mostUsedTone: string;
    totalStoresRecommended: number;
  } {
    const interactions = this.interactionHistory.get(sessionId) || [];
    
    if (interactions.length === 0) {
      return {
        totalInteractions: 0,
        averageConfidence: 0,
        averageResponseTime: 0,
        mostUsedIntent: '',
        mostUsedTone: '',
        totalStoresRecommended: 0
      };
    }

    const totalInteractions = interactions.length;
    const averageConfidence = interactions.reduce((sum, i) => sum + i.confidence, 0) / totalInteractions;
    const averageResponseTime = interactions.reduce((sum, i) => sum + i.responseTime, 0) / totalInteractions;
    const totalStoresRecommended = interactions.reduce((sum, i) => sum + i.stores.length, 0);

    // 找出最常用的意圖和語氣
    const intentCounts = new Map<string, number>();
    const toneCounts = new Map<string, number>();
    
    interactions.forEach(interaction => {
      intentCounts.set(interaction.intent, (intentCounts.get(interaction.intent) || 0) + 1);
      toneCounts.set(interaction.tone, (toneCounts.get(interaction.tone) || 0) + 1);
    });

    const mostUsedIntent = Array.from(intentCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    
    const mostUsedTone = Array.from(toneCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    return {
      totalInteractions,
      averageConfidence,
      averageResponseTime,
      mostUsedIntent,
      mostUsedTone,
      totalStoresRecommended
    };
  }

  /**
   * 清理過期歷史記錄
   */
  cleanupExpiredHistory(maxAgeHours: number = 24): void {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    for (const [sessionId, interactions] of this.interactionHistory.entries()) {
      const validInteractions = interactions.filter(interaction => 
        new Date(interaction.timestamp).getTime() > cutoffTime
      );
      
      if (validInteractions.length === 0) {
        this.interactionHistory.delete(sessionId);
      } else {
        this.interactionHistory.set(sessionId, validInteractions);
      }
    }
    
    console.log(`🧹 清理過期歷史記錄，保留 ${this.interactionHistory.size} 個活躍會話`);
  }

  /**
   * 導出互動歷史（用於分析）
   */
  exportInteractionHistory(sessionId?: string): InteractionLog[] {
    if (sessionId) {
      return this.interactionHistory.get(sessionId) || [];
    }
    
    // 導出所有會話的歷史記錄
    const allInteractions: InteractionLog[] = [];
    for (const interactions of this.interactionHistory.values()) {
      allInteractions.push(...interactions);
    }
    
    return allInteractions;
  }
}
