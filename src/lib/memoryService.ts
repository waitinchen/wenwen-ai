import { PrismaClient, MemoryItem } from '@prisma/client';
import CryptoJS from 'crypto-js';

const prisma = new PrismaClient();

// 加密金鑰 - 實際使用時應該從環境變數讀取
const ENCRYPTION_KEY = process.env.MEMORY_ENCRYPTION_KEY || 'wenwen-memory-key-2025';

// 記憶處理介面
export interface MemoryProcessingResult {
  summary: string;
  intent: string;
  keywords: string[];
  meta: Record<string, any>;
}

// 記憶檢索結果
export interface MemoryRetrievalResult {
  memories: MemoryItem[];
  totalCount: number;
  relevanceScore: number;
}

class MemoryService {
  /**
   * 加密資料
   */
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  /**
   * 解密資料
   */
  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 處理對話內容，抽取摘要和意圖
   */
  async processConversation(
    userId: string,
    sessionId: string | null,
    content: string
  ): Promise<MemoryProcessingResult> {
    // 簡單的摘要抽取邏輯（實際可以整合 AI 摘要）
    const summary = this.extractSummary(content);
    const intent = this.extractIntent(content);
    const keywords = this.extractKeywords(content);
    const meta = {
      wordCount: content.length,
      timestamp: new Date().toISOString(),
      processingVersion: '1.0'
    };

    return {
      summary,
      intent,
      keywords,
      meta
    };
  }

  /**
   * 抽取摘要（簡單版本）
   */
  private extractSummary(content: string): string {
    // 簡單截取前100字作為摘要
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }

  /**
   * 抽取意圖分類
   */
  private extractIntent(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('推薦') || lowerContent.includes('建議')) {
      return 'recommendation';
    } else if (lowerContent.includes('問題') || lowerContent.includes('怎麼')) {
      return 'question';
    } else if (lowerContent.includes('謝謝') || lowerContent.includes('感謝')) {
      return 'gratitude';
    } else if (lowerContent.includes('預約') || lowerContent.includes('訂位')) {
      return 'booking';
    } else {
      return 'general';
    }
  }

  /**
   * 抽取關鍵字
   */
  private extractKeywords(content: string): string[] {
    // 簡單的關鍵字抽取邏輯
    const commonWords = ['的', '了', '是', '在', '有', '和', '與', '或', '但', '然而', '所以', '因為', '如果'];
    const words = content.split(/\s+/).filter(word => 
      word.length > 1 && !commonWords.includes(word)
    );
    
    return [...new Set(words)].slice(0, 10); // 去重並限制數量
  }

  /**
   * 檢查是否重複記憶
   */
  async checkDuplicate(userId: string, content: string): Promise<boolean> {
    const existingMemories = await prisma.memoryItem.findMany({
      where: {
        userId,
        content: this.encrypt(content)
      },
      take: 1
    });

    return existingMemories.length > 0;
  }

  /**
   * 創建記憶項目
   */
  async createMemory(
    userId: string,
    sessionId: string | null,
    content: string,
    processingResult?: MemoryProcessingResult
  ): Promise<MemoryItem> {
    // 檢查重複
    const isDuplicate = await this.checkDuplicate(userId, content);
    if (isDuplicate) {
      throw new Error('重複的記憶內容');
    }

    // 處理內容
    const result = processingResult || await this.processConversation(userId, sessionId, content);

    // 創建記憶項目
    const memoryItem = await prisma.memoryItem.create({
      data: {
        userId,
        sessionId,
        content: this.encrypt(content),
        summary: result.summary ? this.encrypt(result.summary) : null,
        intent: result.intent,
        keywords: JSON.stringify(result.keywords),
        meta: JSON.stringify(result.meta),
        encrypted: true,
        expiresAt: this.calculateExpirationDate(result.intent)
      }
    });

    return memoryItem;
  }

  /**
   * 計算到期時間
   */
  private calculateExpirationDate(intent: string): Date | null {
    const now = new Date();
    
    switch (intent) {
      case 'gratitude':
        return null; // 感謝訊息永不過期
      case 'question':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30天
      case 'recommendation':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7天
      default:
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14天
    }
  }

  /**
   * 檢索用戶記憶
   */
  async retrieveMemories(
    userId: string,
    limit: number = 10,
    intent?: string,
    sessionId?: string
  ): Promise<MemoryRetrievalResult> {
    const where: any = {
      userId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    };

    if (intent) {
      where.intent = intent;
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    const memories = await prisma.memoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // 解密記憶內容
    const decryptedMemories = memories.map(memory => ({
      ...memory,
      content: this.decrypt(memory.content),
      summary: memory.summary ? this.decrypt(memory.summary) : null
    }));

    // 計算相關性分數（簡單版本）
    const relevanceScore = this.calculateRelevanceScore(decryptedMemories, intent);

    return {
      memories: decryptedMemories as MemoryItem[],
      totalCount: decryptedMemories.length,
      relevanceScore
    };
  }

  /**
   * 計算相關性分數
   */
  private calculateRelevanceScore(memories: any[], intent?: string): number {
    if (memories.length === 0) return 0;
    
    let score = 0;
    memories.forEach(memory => {
      if (intent && memory.intent === intent) {
        score += 10;
      }
      score += 1; // 基礎分數
    });
    
    return Math.min(score / memories.length, 10);
  }

  /**
   * 刪除記憶
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    try {
      await prisma.memoryItem.delete({
        where: { id: memoryId }
      });
      return true;
    } catch (error) {
      console.error('刪除記憶失敗:', error);
      return false;
    }
  }

  /**
   * 清理過期記憶
   */
  async cleanupExpiredMemories(): Promise<number> {
    const result = await prisma.memoryItem.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    return result.count;
  }

  /**
   * 匯出用戶記憶
   */
  async exportUserMemories(userId: string): Promise<MemoryItem[]> {
    const memories = await prisma.memoryItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // 解密所有記憶
    return memories.map(memory => ({
      ...memory,
      content: this.decrypt(memory.content),
      summary: memory.summary ? this.decrypt(memory.summary) : null
    })) as MemoryItem[];
  }

  /**
   * 獲取記憶統計
   */
  async getMemoryStats(userId: string): Promise<{
    totalMemories: number;
    activeMemories: number;
    expiredMemories: number;
    intentDistribution: Record<string, number>;
  }> {
    const [total, active, expired, allMemories] = await Promise.all([
      prisma.memoryItem.count({ where: { userId } }),
      prisma.memoryItem.count({
        where: {
          userId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }),
      prisma.memoryItem.count({
        where: {
          userId,
          expiresAt: { lt: new Date() }
        }
      }),
      prisma.memoryItem.findMany({
        where: { userId },
        select: { intent: true }
      })
    ]);

    // 計算意圖分布
    const intentDistribution: Record<string, number> = {};
    allMemories.forEach(memory => {
      if (memory.intent) {
        intentDistribution[memory.intent] = (intentDistribution[memory.intent] || 0) + 1;
      }
    });

    return {
      totalMemories: total,
      activeMemories: active,
      expiredMemories: expired,
      intentDistribution
    };
  }
}

// 導出單例實例
export const memoryService = new MemoryService();
export default memoryService;
