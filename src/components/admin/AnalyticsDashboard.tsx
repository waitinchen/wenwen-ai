import React from 'react'
import { BarChart3, TrendingUp, Users, MessageCircle, Shield, Activity, CheckCircle, XCircle } from 'lucide-react'

interface AnalyticsDashboardProps {
  dashboardStats: any
  conversationTrends: any[]
  popularQuestions: any[]
  usageHeatmap: any[]
  userSatisfaction: any
  blockedStats: any
}

const AnalyticsDashboard = ({
  dashboardStats,
  conversationTrends,
  popularQuestions,
  usageHeatmap,
  userSatisfaction,
  blockedStats
}: AnalyticsDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* 核心指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總對話數</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalConversations || 0}</p>
              <p className="text-xs text-gray-500 mt-1">過去30天</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總消息數</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalMessages || 0}</p>
              <p className="text-xs text-gray-500 mt-1">平均每次 {dashboardStats.averageMessagesPerConversation || 0} 則</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">活躍用戶</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.uniqueUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">獨立用戶數</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">攔截問題</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.blockedQuestions || 0}</p>
              <p className="text-xs text-gray-500 mt-1">無關話題攔截</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* 熱門問題分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">熱門問題 Top 10</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {popularQuestions.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-900">{item.question}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{item.count} 次</div>
                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 使用時段熱度圖 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">24小時使用熱度</h3>
          </div>
          <div className="p-6">
            {/* 響應式熱力圖佈局 */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-12 gap-1">
              {usageHeatmap.map((hour) => {
                const maxConversations = Math.max(...usageHeatmap.map(h => h.conversations))
                const intensity = maxConversations > 0 ? hour.conversations / maxConversations : 0
                const bgIntensity = Math.max(0.1, intensity)
                
                return (
                  <div key={hour.hour} className="text-center">
                    <div 
                      className="w-full h-8 md:h-10 rounded mb-1 flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer"
                      style={{
                        backgroundColor: `rgba(6, 199, 85, ${bgIntensity})`,
                        color: intensity > 0.5 ? 'white' : 'black'
                      }}
                      title={`${hour.label}: ${hour.conversations} 次對話`}
                    >
                      <span className="hidden sm:inline">{hour.conversations}</span>
                      <span className="sm:hidden text-xs">{hour.conversations > 9 ? '9+' : hour.conversations}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      <span className="hidden md:inline">{hour.hour}</span>
                      <span className="md:hidden">{hour.hour && typeof hour.hour === 'string' ? hour.hour.split(':')[0] : hour.hour}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* 熱力圖說明 */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>低</span>
              <div className="flex items-center gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
                  <div
                    key={intensity}
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: `rgba(6, 199, 85, ${intensity})` }}
                  />
                ))}
              </div>
              <span>高</span>
            </div>
          </div>
        </div>
      </div>

      {/* 用戶滿意度和攔截統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">用戶滿意度</h3>
          </div>
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-600">
                {userSatisfaction.satisfactionRate || 0}%
              </div>
              <div className="text-sm text-gray-500">總體滿意度</div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">滿意</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {userSatisfaction.helpful || 0} 次
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-700">不滿意</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {userSatisfaction.notHelpful || 0} 次
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">攔截問題統計</h3>
          </div>
          <div className="p-6">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-red-600">
                {blockedStats.total || 0}
              </div>
              <div className="text-sm text-gray-500">總攔截次數</div>
            </div>
            <div className="space-y-3">
              {blockedStats.byFilter?.slice(0, 5).map((filter: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{filter.filter}</span>
                  <span className="text-sm font-medium text-gray-900">{filter.count} 次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 最近被攔截的問題 */}
      {blockedStats.recentBlocked?.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">最近被攔截的問題</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">問題內容</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">過濾器</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">攔截時間</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blockedStats.recentBlocked.slice(0, 10).map((blocked: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {blocked.question}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {blocked.filter || '未知'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blocked.blockedAt).toLocaleString('zh-TW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
