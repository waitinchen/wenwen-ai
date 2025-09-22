import React, { useState } from 'react'
import { 
  Tag, 
  Calendar, 
  Clock, 
  GitBranch, 
  GitCommit, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Bug, 
  Zap, 
  Shield, 
  Palette,
  Code,
  Filter,
  Search
} from 'lucide-react'
import { VersionManager, ChangelogEntry, VersionInfo } from '@/config/version'
import { cn } from '@/lib/utils'

const VersionManagement: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedImpact, setSelectedImpact] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const currentVersion = VersionManager.getCurrentVersion()
  const versionHistory = VersionManager.getVersionHistory()
  const changelog = VersionManager.getChangelog(selectedVersion || undefined)
  const todayUpdates = VersionManager.getTodayUpdates()

  // 過濾更新日誌
  const filteredChangelog = changelog.filter(entry => {
    const matchesType = !selectedType || entry.type === selectedType
    const matchesImpact = !selectedImpact || entry.impact === selectedImpact
    const matchesSearch = !searchTerm || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesImpact && matchesSearch
  })

  // 獲取類型圖標
  const getTypeIcon = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'feature': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'bugfix': return <Bug className="w-4 h-4 text-red-500" />
      case 'hotfix': return <Zap className="w-4 h-4 text-orange-500" />
      case 'security': return <Shield className="w-4 h-4 text-purple-500" />
      case 'performance': return <Zap className="w-4 h-4 text-blue-500" />
      case 'ui': return <Palette className="w-4 h-4 text-pink-500" />
      case 'refactor': return <Code className="w-4 h-4 text-gray-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  // 獲取影響程度顏色
  const getImpactColor = (impact: ChangelogEntry['impact']) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 獲取狀態顏色
  const getStatusColor = (status: ChangelogEntry['status']) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800'
      case 'testing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* 當前版本信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">版本管理</h1>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="font-semibold">當前版本: {currentVersion.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>發布日期: {currentVersion.releaseDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>構建時間: {new Date(currentVersion.buildTime).toLocaleString('zh-TW')}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">
              <div>構建號: {currentVersion.buildNumber}</div>
              <div>環境: {currentVersion.environment}</div>
              {currentVersion.gitCommit && (
                <div className="flex items-center gap-1 mt-1">
                  <GitCommit className="w-3 h-3" />
                  <span className="font-mono text-xs">{currentVersion.gitCommit.substring(0, 8)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 今日更新統計 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日更新</p>
              <p className="text-2xl font-bold text-blue-600">{todayUpdates.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">新功能</p>
              <p className="text-2xl font-bold text-green-600">
                {changelog.filter(e => e.type === 'feature').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">修復問題</p>
              <p className="text-2xl font-bold text-red-600">
                {changelog.filter(e => e.type === 'bugfix').length}
              </p>
            </div>
            <Bug className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總更新數</p>
              <p className="text-2xl font-bold text-purple-600">{changelog.length}</p>
            </div>
            <Info className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 過濾器 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">過濾器:</span>
          </div>
          
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有版本</option>
            {versionHistory.map(version => (
              <option key={version.version} value={version.version}>
                {version.version}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有類型</option>
            <option value="feature">新功能</option>
            <option value="bugfix">修復問題</option>
            <option value="hotfix">緊急修復</option>
            <option value="security">安全更新</option>
            <option value="performance">性能優化</option>
            <option value="ui">界面優化</option>
            <option value="refactor">代碼重構</option>
          </select>

          <select
            value={selectedImpact}
            onChange={(e) => setSelectedImpact(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">所有影響</option>
            <option value="critical">嚴重</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索更新..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm w-48"
            />
          </div>
        </div>
      </div>

      {/* 更新日誌列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">更新日誌</h2>
          <p className="text-sm text-gray-600">共 {filteredChangelog.length} 條記錄</p>
        </div>
        
        <div className="divide-y">
          {filteredChangelog.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(entry.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{entry.title}</h3>
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full border',
                      getImpactColor(entry.impact)
                    )}>
                      {entry.impact}
                    </span>
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getStatusColor(entry.status)
                    )}>
                      {entry.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>版本: {entry.version}</span>
                    <span>分類: {entry.category}</span>
                    <span>作者: {entry.author}</span>
                    <span>日期: {entry.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VersionManagement
