import React, { useState, useEffect } from 'react';
import { Trash2, Download, Brain, Search, Filter, Calendar, User, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { memoryService } from '@/lib/memoryService';

interface MemoryItem {
  id: string;
  userId: string;
  sessionId: string | null;
  content: string;
  summary: string | null;
  intent: string | null;
  keywords: string | null;
  meta: string | null;
  encrypted: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryStats {
  totalMemories: number;
  activeMemories: number;
  expiredMemories: number;
  intentDistribution: Record<string, number>;
}

const MemoryManagement: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [intentFilter, setIntentFilter] = useState<string>('');
  const [showExpired, setShowExpired] = useState(false);
  const [selectedMemories, setSelectedMemories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');

  // 載入記憶資料
  const loadMemories = async () => {
    try {
      setLoading(true);
      
      // 這裡需要實作獲取所有記憶的方法
      // 暫時使用模擬資料
      const mockMemories: MemoryItem[] = [
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
        }
      ];
      
      setMemories(mockMemories);
      
      // 載入統計資料
      const mockStats: MemoryStats = {
        totalMemories: 150,
        activeMemories: 120,
        expiredMemories: 30,
        intentDistribution: {
          'recommendation': 45,
          'question': 35,
          'gratitude': 20,
          'booking': 10,
          'general': 40
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('載入記憶失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  // 刪除記憶
  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('確定要刪除這個記憶嗎？')) return;
    
    try {
      const success = await memoryService.deleteMemory(memoryId);
      if (success) {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
        await loadMemories(); // 重新載入統計
      }
    } catch (error) {
      console.error('刪除記憶失敗:', error);
    }
  };

  // 批量刪除
  const handleBatchDelete = async () => {
    if (selectedMemories.size === 0) return;
    if (!confirm(`確定要刪除 ${selectedMemories.size} 個記憶嗎？`)) return;
    
    try {
      for (const memoryId of selectedMemories) {
        await memoryService.deleteMemory(memoryId);
      }
      setSelectedMemories(new Set());
      await loadMemories();
    } catch (error) {
      console.error('批量刪除失敗:', error);
    }
  };

  // 匯出記憶
  const handleExportMemories = async () => {
    try {
      const allMemories = memories.filter(memory => 
        selectedMemories.size === 0 || selectedMemories.has(memory.id)
      );
      
      const exportData = {
        exportDate: new Date().toISOString(),
        totalCount: allMemories.length,
        memories: allMemories.map(memory => ({
          id: memory.id,
          userId: memory.userId,
          sessionId: memory.sessionId,
          content: memory.content,
          summary: memory.summary,
          intent: memory.intent,
          keywords: memory.keywords,
          meta: memory.meta,
          expiresAt: memory.expiresAt,
          createdAt: memory.createdAt
        }))
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wenwen-memories-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('匯出失敗:', error);
    }
  };

  // 清理過期記憶
  const handleCleanupExpired = async () => {
    if (!confirm('確定要清理所有過期記憶嗎？')) return;
    
    try {
      const deletedCount = await memoryService.cleanupExpiredMemories();
      alert(`已清理 ${deletedCount} 個過期記憶`);
      await loadMemories();
    } catch (error) {
      console.error('清理過期記憶失敗:', error);
    }
  };

  // 過濾記憶
  const filteredMemories = memories.filter(memory => {
    const matchesSearch = searchTerm === '' || 
      memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIntent = intentFilter === '' || memory.intent === intentFilter;
    
    const matchesExpired = showExpired ? 
      (memory.expiresAt && memory.expiresAt < new Date()) :
      (!memory.expiresAt || memory.expiresAt >= new Date());
    
    return matchesSearch && matchesIntent && matchesExpired;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題和統計 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            記憶管理
          </h2>
          <p className="text-gray-600">管理高文文的對話記憶資料</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'stats' : 'list')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {viewMode === 'list' ? '統計檢視' : '列表檢視'}
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">總記憶數</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMemories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">有效記憶</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMemories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">過期記憶</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiredMemories}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活躍用戶</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(stats.intentDistribution).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 控制面板 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* 搜尋和過濾 */}
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜尋記憶內容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有意圖</option>
              <option value="recommendation">推薦</option>
              <option value="question">問題</option>
              <option value="gratitude">感謝</option>
              <option value="booking">預約</option>
              <option value="general">一般</option>
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">顯示過期記憶</span>
            </label>
          </div>
          
          {/* 操作按鈕 */}
          <div className="flex gap-2">
            {selectedMemories.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                刪除選中 ({selectedMemories.size})
              </button>
            )}
            
            <button
              onClick={handleExportMemories}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              匯出
            </button>
            
            <button
              onClick={handleCleanupExpired}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              清理過期
            </button>
          </div>
        </div>
      </div>

      {/* 記憶列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedMemories.size === filteredMemories.length && filteredMemories.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMemories(new Set(filteredMemories.map(m => m.id)));
                      } else {
                        setSelectedMemories(new Set());
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用戶ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  內容摘要
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  意圖
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  建立時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  到期時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMemories.map((memory) => (
                <tr key={memory.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedMemories.has(memory.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedMemories);
                        if (e.target.checked) {
                          newSelected.add(memory.id);
                        } else {
                          newSelected.delete(memory.id);
                        }
                        setSelectedMemories(newSelected);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {memory.userId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {memory.summary || memory.content}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      memory.intent === 'recommendation' ? 'bg-blue-100 text-blue-800' :
                      memory.intent === 'question' ? 'bg-green-100 text-green-800' :
                      memory.intent === 'gratitude' ? 'bg-yellow-100 text-yellow-800' :
                      memory.intent === 'booking' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {memory.intent || 'general'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(memory.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {memory.expiresAt ? 
                      new Date(memory.expiresAt).toLocaleDateString('zh-TW') :
                      '永不過期'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMemories.length === 0 && (
          <div className="text-center py-12">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到記憶</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || intentFilter || showExpired ? '嘗試調整搜尋條件' : '還沒有任何記憶資料'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryManagement;
