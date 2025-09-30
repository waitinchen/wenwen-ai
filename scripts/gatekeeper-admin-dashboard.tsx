/**
 * 把關系統管理後台 - React 組件
 * 監控和管理五層架構管理師的運作狀況
 */

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// 把關系統狀態介面
interface GatekeeperStatus {
  id: string;
  session_id: string;
  user_message: string;
  original_response: string;
  final_response: string;
  corrections: string[];
  validation_results: any[];
  timestamp: string;
  status: 'PASSED' | 'CORRECTED' | 'BLOCKED';
}

// 把關統計介面
interface GatekeeperStats {
  totalSessions: number;
  passedSessions: number;
  correctedSessions: number;
  blockedSessions: number;
  averageCorrections: number;
  topIssues: Array<{ issue: string; count: number }>;
}

const GatekeeperAdminDashboard: React.FC = () => {
  const [gatekeeperLogs, setGatekeeperLogs] = useState<GatekeeperStatus[]>([]);
  const [stats, setStats] = useState<GatekeeperStats | null>(null);
  const [selectedSession, setSelectedSession] = useState<GatekeeperStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入把關日誌
  const loadGatekeeperLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gatekeeping_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      setGatekeeperLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入統計資料
  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('gatekeeping_logs')
        .select('*');

      if (error) throw error;

      const totalSessions = data.length;
      const passedSessions = data.filter(log => log.corrections.length === 0).length;
      const correctedSessions = data.filter(log => log.corrections.length > 0).length;
      const blockedSessions = data.filter(log => log.status === 'BLOCKED').length;
      
      const averageCorrections = data.reduce((sum, log) => sum + log.corrections.length, 0) / totalSessions;
      
      // 統計常見問題
      const issueCounts: { [key: string]: number } = {};
      data.forEach(log => {
        log.corrections.forEach(correction => {
          const issue = correction.split(':')[1]?.trim() || correction;
          issueCounts[issue] = (issueCounts[issue] || 0) + 1;
        });
      });
      
      const topIssues = Object.entries(issueCounts)
        .map(([issue, count]) => ({ issue, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalSessions,
        passedSessions,
        correctedSessions,
        blockedSessions,
        averageCorrections: Math.round(averageCorrections * 100) / 100,
        topIssues
      });
    } catch (err) {
      console.error('載入統計失敗:', err);
    }
  };

  useEffect(() => {
    loadGatekeeperLogs();
    loadStats();
    
    // 每30秒重新載入
    const interval = setInterval(() => {
      loadGatekeeperLogs();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 格式化時間
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'text-green-600 bg-green-100';
      case 'CORRECTED': return 'text-yellow-600 bg-yellow-100';
      case 'BLOCKED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        錯誤: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🔒 把關系統管理後台
      </h1>

      {/* 統計概覽 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">總會話數</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalSessions}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">通過會話</h3>
            <p className="text-3xl font-bold text-green-600">{stats.passedSessions}</p>
            <p className="text-sm text-gray-500">
              {Math.round((stats.passedSessions / stats.totalSessions) * 100)}%
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">修正會話</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.correctedSessions}</p>
            <p className="text-sm text-gray-500">
              {Math.round((stats.correctedSessions / stats.totalSessions) * 100)}%
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">平均修正數</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.averageCorrections}</p>
          </div>
        </div>
      )}

      {/* 常見問題統計 */}
      {stats && stats.topIssues.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 常見問題統計</h2>
          <div className="space-y-2">
            {stats.topIssues.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{item.issue}</span>
                <span className="text-sm font-semibold text-blue-600">{item.count} 次</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 把關日誌列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">📋 把關日誌</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  會話ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用戶訊息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  修正數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gatekeeperLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.session_id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.user_message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.corrections.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedSession(log)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      查看詳情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳情模態框 */}
      {selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                🔍 會話詳情 - {selectedSession.session_id}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">用戶訊息:</h4>
                  <p className="text-gray-600 p-3 bg-gray-50 rounded">{selectedSession.user_message}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700">原始回應:</h4>
                  <p className="text-gray-600 p-3 bg-gray-50 rounded">{selectedSession.original_response}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700">最終回應:</h4>
                  <p className="text-gray-600 p-3 bg-gray-50 rounded">{selectedSession.final_response}</p>
                </div>
                
                {selectedSession.corrections.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700">修正項目:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedSession.corrections.map((correction, index) => (
                        <li key={index} className="text-red-600 text-sm">{correction}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-gray-700">驗證結果:</h4>
                  <div className="space-y-2">
                    {selectedSession.validation_results.map((result, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded">
                        <span className="font-medium text-blue-800">Layer {result.layer}: {result.name}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.isValid ? '通過' : '失敗'}
                        </span>
                        {result.issues && result.issues.length > 0 && (
                          <div className="mt-1 text-sm text-red-600">
                            問題: {result.issues.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatekeeperAdminDashboard;
