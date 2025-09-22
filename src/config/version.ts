// 版本管理配置
export interface VersionInfo {
  version: string
  buildNumber: string
  releaseDate: string
  buildTime: string
  environment: 'development' | 'staging' | 'production'
  gitCommit?: string
  gitBranch?: string
}

export interface ChangelogEntry {
  id: string
  version: string
  date: string
  type: 'feature' | 'bugfix' | 'hotfix' | 'security' | 'performance' | 'ui' | 'refactor'
  category: string
  title: string
  description: string
  author: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  status: 'completed' | 'testing' | 'deployed'
}

// 當前版本信息
export const CURRENT_VERSION: VersionInfo = {
  version: 'WEN 1.0.3',
  buildNumber: '20250122-010',
  releaseDate: '2025-01-22',
  buildTime: new Date().toISOString(),
  environment: 'production',
  gitCommit: process.env.VITE_GIT_COMMIT || 'eval-system',
  gitBranch: process.env.VITE_GIT_BRANCH || 'main'
}

// 版本歷史記錄
export const VERSION_HISTORY: VersionInfo[] = [
  {
    version: 'WEN 1.0.0',
    buildNumber: '20250122-001',
    releaseDate: '2025-01-22',
    buildTime: '2025-01-22T14:00:00.000Z',
    environment: 'production',
    gitCommit: 'initial-release',
    gitBranch: 'main'
  }
]

// 更新日誌
export const CHANGELOG: ChangelogEntry[] = [
  {
    id: 'wen-1-0-4-432',
    version: 'WEN 1.0.4',
    date: '2025-09-22',
    type: 'feature',
    category: '系統更新',
    title: '版本更新',
    description: '版本更新',
    author: '開發團隊',
    impact: 'medium',
    status: 'deployed'
  },
  {
    id: 'eval-system-20250122',
    version: 'WEN 1.0.3',
    date: '2025-01-22',
    type: 'feature',
    category: '測試系統',
    title: '建立高文文自動驗收系統',
    description: '建立完整的自動化測試框架，包含測試集、驗收跑者腳本，可自動驗證高文文回應品質和意圖識別準確性',
    author: 'C謀',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'intro-fix-20250122',
    version: 'WEN 1.0.2',
    date: '2025-01-22',
    type: 'bugfix',
    category: 'AI功能',
    title: '修復自介卡死問題',
    description: '移除固定自介，改為條件觸發。只在第一次對話或明確詢問時才給完整自介，一般問候改為簡短回應＋快捷選項',
    author: 'C謀',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'parking-integration-20250122',
    version: 'WEN 1.0.1',
    date: '2025-01-22',
    type: 'feature',
    category: 'AI功能',
    title: '新增停車場推薦功能整合',
    description: '整合高雄市鳳山區38個停車場資料，高文文可智能推薦停車場，包含距離、價格、特色篩選，並提供導航選項',
    author: 'C謀',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'wen-1-0-0-001',
    version: 'WEN 1.0.0',
    date: '2025-01-22',
    type: 'feature',
    category: '核心功能',
    title: '初始版本發布',
    description: '文山特區智慧管理系統正式上線，包含完整的商家管理、對話歷史、AI客服等功能',
    author: '開發團隊',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'wen-1-0-0-002',
    version: 'WEN 1.0.0',
    date: '2025-01-22',
    type: 'feature',
    category: '商家管理',
    title: '特約商家功能',
    description: '新增特約商家標記功能，支援優先推薦特約商家，包含UI界面和數據持久化',
    author: '開發團隊',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'wen-1-0-0-003',
    version: 'WEN 1.0.0',
    date: '2025-01-22',
    type: 'feature',
    category: '用戶體驗',
    title: '保持登入狀態功能',
    description: '管理員登入頁面新增「保持登入狀態」選項，支援localStorage和sessionStorage兩種模式',
    author: '開發團隊',
    impact: 'medium',
    status: 'deployed'
  },
  {
    id: 'wen-1-0-0-004',
    version: 'WEN 1.0.0',
    date: '2025-01-22',
    type: 'ui',
    category: '界面優化',
    title: '登入頁面UI更新',
    description: '將登入頁面盾牌圖標替換為高文文頭像，標題更新為「高文文智能客服-高雄鳳山區」',
    author: '開發團隊',
    impact: 'medium',
    status: 'deployed'
  },
  {
    id: 'wen-1-0-0-005',
    version: 'WEN 1.0.0',
    date: '2025-01-22',
    type: 'bugfix',
    category: '數據持久化',
    title: '模擬數據持久化修復',
    description: '修復特約商家狀態無法保存的問題，實現localStorage自動保存和載入機制',
    author: '開發團隊',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'wen-1-0-0-006',
    version: 'WEN 1.0.0',
    date: '2025-01-22',
    type: 'bugfix',
    category: '對話顯示',
    title: '對話內容格式修復',
    description: '修復對話內容顯示過多換行的問題，優化消息格式和排版',
    author: '開發團隊',
    impact: 'medium',
    status: 'deployed'
  },
  {
    id: 'wen-1-0-0-007',
    version: 'WEN 1.0.0',
    date: '2025-01-22',
    type: 'refactor',
    category: '代碼優化',
    title: 'TypeScript編譯優化',
    description: '修復多個TypeScript編譯錯誤，優化代碼結構和類型定義',
    author: '開發團隊',
    impact: 'low',
    status: 'deployed'
  }
]

// 版本管理工具函數
export class VersionManager {
  // 獲取當前版本
  static getCurrentVersion(): VersionInfo {
    return CURRENT_VERSION
  }

  // 獲取版本歷史
  static getVersionHistory(): VersionInfo[] {
    return VERSION_HISTORY
  }

  // 獲取更新日誌
  static getChangelog(version?: string): ChangelogEntry[] {
    if (version) {
      return CHANGELOG.filter(entry => entry.version === version)
    }
    return CHANGELOG
  }

  // 獲取今日更新
  static getTodayUpdates(): ChangelogEntry[] {
    const today = new Date().toISOString().split('T')[0]
    return CHANGELOG.filter(entry => entry.date === today)
  }

  // 獲取按類型分組的更新
  static getUpdatesByType(type: ChangelogEntry['type']): ChangelogEntry[] {
    return CHANGELOG.filter(entry => entry.type === type)
  }

  // 獲取按影響程度分組的更新
  static getUpdatesByImpact(impact: ChangelogEntry['impact']): ChangelogEntry[] {
    return CHANGELOG.filter(entry => entry.impact === impact)
  }

  // 生成版本號
  static generateVersionNumber(major: number, minor: number, patch: number): string {
    return `WEN ${major}.${minor}.${patch}`
  }

  // 生成構建號
  static generateBuildNumber(): string {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '')
    return `${dateStr}-${timeStr}`
  }
}
