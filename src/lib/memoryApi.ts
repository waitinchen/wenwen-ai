import { memoryService } from './memoryService';

// 記憶管理 API
export class MemoryApi {
  /**
   * 獲取所有記憶（分頁）
   */
  static async getAllMemories(page: number = 1, limit: number = 20, filters: {
    search?: string;
    intent?: string;
    showExpired?: boolean;
  } = {}) {
    try {
      // 這裡需要實作獲取所有記憶的邏輯
      // 由於 memoryService 目前只支援單一用戶，這裡返回模擬資料
      const mockMemories = [
        {
          id: '1',
          userId: 'user-123',
          sessionId: 'session-456',
          content: '用戶詢問文山特區推薦餐廳',
          summary: '詢問餐廳推薦',
          intent: 'recommendation',
          keywords: '["餐廳", "推薦", "文山特區"]',
          meta: '{"wordCount": 12}',
          encrypted: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user-456',
          sessionId: 'session-789',
          content: '用戶感謝高文文的幫助',
          summary: '表達感謝',
          intent: 'gratitude',
          keywords: '["謝謝", "感謝", "幫助"]',
          meta: '{"wordCount": 8}',
          encrypted: false,
          expiresAt: null, // 永不過期
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      // 應用過濾器
      let filteredMemories = mockMemories;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMemories = filteredMemories.filter(memory =>
          memory.content.toLowerCase().includes(searchLower) ||
          memory.summary?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.intent) {
        filteredMemories = filteredMemories.filter(memory =>
          memory.intent === filters.intent
        );
      }

      if (!filters.showExpired) {
        filteredMemories = filteredMemories.filter(memory =>
          !memory.expiresAt || memory.expiresAt > new Date()
        );
      }

      // 分頁
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMemories = filteredMemories.slice(startIndex, endIndex);

      return {
        memories: paginatedMemories,
        totalCount: filteredMemories.length,
        page,
        limit,
        totalPages: Math.ceil(filteredMemories.length / limit)
      };
    } catch (error) {
      console.error('獲取記憶列表失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取記憶統計
   */
  static async getMemoryStats() {
    try {
      // 模擬統計資料
      return {
        totalMemories: 150,
        activeMemories: 120,
        expiredMemories: 30,
        intentDistribution: {
          'recommendation': 45,
          'question': 35,
          'gratitude': 20,
          'booking': 10,
          'general': 40
        },
        userDistribution: {
          totalUsers: 25,
          activeUsers: 18,
          newUsers: 3
        },
        timeDistribution: {
          today: 12,
          thisWeek: 45,
          thisMonth: 120,
          thisYear: 150
        }
      };
    } catch (error) {
      console.error('獲取記憶統計失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除記憶
   */
  static async deleteMemory(memoryId: string) {
    try {
      return await memoryService.deleteMemory(memoryId);
    } catch (error) {
      console.error('刪除記憶失敗:', error);
      throw error;
    }
  }

  /**
   * 批量刪除記憶
   */
  static async batchDeleteMemories(memoryIds: string[]) {
    try {
      const results = await Promise.all(
        memoryIds.map(id => memoryService.deleteMemory(id))
      );
      return results.every(result => result === true);
    } catch (error) {
      console.error('批量刪除記憶失敗:', error);
      throw error;
    }
  }

  /**
   * 清理過期記憶
   */
  static async cleanupExpiredMemories() {
    try {
      return await memoryService.cleanupExpiredMemories();
    } catch (error) {
      console.error('清理過期記憶失敗:', error);
      throw error;
    }
  }

  /**
   * 匯出記憶資料
   */
  static async exportMemories(memoryIds?: string[]) {
    try {
      const { memories } = await this.getAllMemories(1, 1000); // 獲取所有記憶
      
      const exportData = {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        totalCount: memories.length,
        memories: memories.map(memory => ({
          id: memory.id,
          userId: memory.userId,
          sessionId: memory.sessionId,
          content: memory.content,
          summary: memory.summary,
          intent: memory.intent,
          keywords: memory.keywords,
          meta: memory.meta,
          encrypted: memory.encrypted,
          expiresAt: memory.expiresAt,
          createdAt: memory.createdAt,
          updatedAt: memory.updatedAt
        }))
      };

      return exportData;
    } catch (error) {
      console.error('匯出記憶失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶記憶統計
   */
  static async getUserMemoryStats(userId: string) {
    try {
      return await memoryService.getMemoryStats(userId);
    } catch (error) {
      console.error('獲取用戶記憶統計失敗:', error);
      throw error;
    }
  }

  /**
   * 匯出用戶記憶
   */
  static async exportUserMemories(userId: string) {
    try {
      return await memoryService.exportUserMemories(userId);
    } catch (error) {
      console.error('匯出用戶記憶失敗:', error);
      throw error;
    }
  }
}

export default MemoryApi;
