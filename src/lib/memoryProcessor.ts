import { memoryService, MemoryProcessingResult } from './memoryService.js';

// 對話記憶處理器
export class MemoryProcessor {
  private userId: string;
  private sessionId: string | null;

  constructor(userId: string, sessionId: string | null = null) {
    this.userId = userId;
    this.sessionId = sessionId;
  }

  /**
   * 處理單次對話並存儲記憶
   */
  async processAndStore(
    userMessage: string,
    botResponse: string,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      // Step A: 抽取摘要和意圖
      const processingResult = await memoryService.processConversation(
        this.userId,
        this.sessionId,
        `${userMessage}\n\n回應：${botResponse}`
      );

      // Step B: 去重檢查（在 memoryService.createMemory 中處理）
      
      // Step C: 寫入記憶
      await memoryService.createMemory(
        this.userId,
        this.sessionId,
        `${userMessage}\n\n回應：${botResponse}`,
        processingResult
      );

      console.log('記憶處理完成:', {
        userId: this.userId,
        sessionId: this.sessionId,
        intent: processingResult.intent,
        summary: processingResult.summary.substring(0, 50) + '...'
      });
    } catch (error) {
      console.error('記憶處理失敗:', error);
      // 不阻擋對話流程，繼續執行
    }
  }

  /**
   * 檢索相關記憶用於上下文注入
   */
  async retrieveRelevantMemories(
    currentMessage: string,
    limit: number = 5
  ): Promise<string> {
    try {
      // 根據當前訊息推測意圖
      const intent = this.guessIntent(currentMessage);
      
      // 檢索相關記憶
      const result = await memoryService.retrieveMemories(
        this.userId,
        limit,
        intent,
        this.sessionId
      );

      if (result.memories.length === 0) {
        return '';
      }

      // 格式化記憶為上下文
      const memoryContext = this.formatMemoriesForContext(result.memories);
      
      console.log('檢索到記憶:', {
        count: result.memories.length,
        relevanceScore: result.relevanceScore,
        intent
      });

      return memoryContext;
    } catch (error) {
      console.error('記憶檢索失敗:', error);
      return '';
    }
  }

  /**
   * 推測當前訊息的意圖
   */
  private guessIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('推薦') || lowerMessage.includes('建議')) {
      return 'recommendation';
    } else if (lowerMessage.includes('問題') || lowerMessage.includes('怎麼')) {
      return 'question';
    } else if (lowerMessage.includes('謝謝') || lowerMessage.includes('感謝')) {
      return 'gratitude';
    } else if (lowerMessage.includes('預約') || lowerMessage.includes('訂位')) {
      return 'booking';
    } else {
      return 'general';
    }
  }

  /**
   * 格式化記憶為上下文
   */
  private formatMemoriesForContext(memories: any[]): string {
    if (memories.length === 0) return '';

    let context = '\n\n🧠 **相關記憶上下文：**\n';
    
    memories.forEach((memory, index) => {
      const createdAt = new Date(memory.createdAt).toLocaleDateString('zh-TW');
      context += `${index + 1}. [${createdAt}] ${memory.summary || memory.content.substring(0, 100)}...\n`;
    });

    context += '\n請根據以上記憶提供更個性化和一致的服務。\n';
    
    return context;
  }

  /**
   * 獲取用戶記憶統計
   */
  async getMemoryStats() {
    try {
      return await memoryService.getMemoryStats(this.userId);
    } catch (error) {
      console.error('獲取記憶統計失敗:', error);
      return null;
    }
  }

  /**
   * 清理過期記憶
   */
  async cleanupExpiredMemories(): Promise<number> {
    try {
      return await memoryService.cleanupExpiredMemories();
    } catch (error) {
      console.error('清理過期記憶失敗:', error);
      return 0;
    }
  }
}

// 導出記憶處理器工廠函數
export function createMemoryProcessor(userId: string, sessionId?: string): MemoryProcessor {
  return new MemoryProcessor(userId, sessionId);
}

export default MemoryProcessor;
