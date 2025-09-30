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
  version: 'WEN 1.4.6',
  buildNumber: '20250930-001',
  releaseDate: '2025-09-30',
  buildTime: new Date().toISOString(),
  environment: 'production',
  gitCommit: process.env.VITE_GIT_COMMIT || 'critical-fixes-and-spa-routing',
  gitBranch: process.env.VITE_GIT_BRANCH || 'fix/wenwen-debug-sprint'
}

// 版本歷史記錄
export const VERSION_HISTORY: VersionInfo[] = [
  {
    version: 'WEN 1.4.6',
    buildNumber: '20250930-001',
    releaseDate: '2025-09-30',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'critical-fixes-and-spa-routing',
    gitBranch: 'fix/wenwen-debug-sprint'
  },
  {
    version: 'WEN 1.4.0',
    buildNumber: '20250925-001',
    releaseDate: '2025-09-25',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'response-script-management-system',
    gitBranch: 'fix/wenwen-debug-sprint'
  },
  {
    version: 'WEN 1.3.0',
    buildNumber: '20250103-001',
    releaseDate: '2025-01-03',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'five-layer-architecture-upgrade',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.2.0',
    buildNumber: '20250923-011',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'voice-soul-engine-v2-architecture',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.1.8',
    buildNumber: '20250923-010',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'ai-hallucination-emergency-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.1.7',
    buildNumber: '20250923-009',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'universal-ai-hallucination-prevention',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.1.6',
    buildNumber: '20250923-008',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'english-recommendation-optimization',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.1.5',
    buildNumber: '20250923-007',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'ai-hallucination-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.1.4',
    buildNumber: '20250923-006',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'admin-backend-query-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.1.1',
    buildNumber: '20250923-005',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'parking-data-import-and-category-optimization',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.1.0',
    buildNumber: '20250923-004',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'major-fallback-service-role-upgrade',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.0.9',
    buildNumber: '20250923-003',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'service-role-fallback-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.0.8',
    buildNumber: '20250923-002',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'recommendation-fallback-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.0.7',
    buildNumber: '20250923-001',
    releaseDate: '2025-09-23',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'recommendation-list-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.0.6',
    buildNumber: '20250922-003',
    releaseDate: '2025-09-22',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'conversation-history-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.0.5',
    buildNumber: '20250922-002',
    releaseDate: '2025-09-22',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'claude-api-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.0.4',
    buildNumber: '20250922-001',
    releaseDate: '2025-09-22',
    buildTime: new Date().toISOString(),
    environment: 'production',
    gitCommit: 'partner-stores-fix',
    gitBranch: 'main'
  },
  {
    version: 'WEN 1.0.3',
    buildNumber: '20250122-010',
    releaseDate: '2025-01-22',
    buildTime: '2025-01-22T14:00:00.000Z',
    environment: 'production',
    gitCommit: 'eval-system',
    gitBranch: 'main'
  },
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
    id: 'critical-fixes-and-spa-routing-20250930',
    version: 'WEN 1.4.6',
    date: '2025-09-30',
    type: 'bugfix',
    category: '系統修復',
    title: '關鍵修復與SPA路由配置：解決跨類別幻覺與404問題',
    description: '實施12個關鍵修復：跨類別幻覺防護、FAQ降權機制、MEDICAL vs FOOD競爭修正、PARKING優先級確保、CONFIRMATION安全網增強、統計查詢修復、前端SPA路由配置等。徹底解決藥局查詢推薦補習班問題，修復admin頁面刷新404錯誤',
    author: 'C謀',
    impact: 'critical',
    status: 'completed'
  },
  {
    id: 'response-script-management-system-20250925',
    version: 'WEN 1.4.0',
    date: '2025-09-25',
    type: 'feature',
    category: '知識管理系統',
    title: '回應腳本管理系統：完整知識庫工作流程',
    description: '實現完整的「發現新用戶提問類型(合理意圖) → 寫出回應腳本 → 人類審核驗收(採納) → 納入高文文專用知識庫(存放到後臺訓練資料裡)」工作流程。包含7個核心數據表、回應腳本管理API、React管理後台、知識庫服務、Claude Chat V3整合等完整系統',
    author: 'C謀',
    impact: 'critical',
    status: 'completed'
  },
  {
    id: 'voice-soul-engine-v2-architecture-20250923',
    version: 'WEN 1.2.0',
    date: '2025-09-23',
    type: 'feature',
    category: 'AI架構',
    title: '語氣靈引擎 v2.0：五層架構設計實現',
    description: '實現「資料優先 × 語氣誠實 × 靈格有溫度」核心哲學，建立五層架構：資料層(嚴格驗證)、語意理解層(意圖分類)、推薦策略層(多策略選擇)、語氣生成層(冷資料+熱模板)、回饋層(完整記錄)，徹底解決AI幻覺問題並提升互動溫度',
    author: 'C謀',
    impact: 'critical',
    status: 'completed'
  },
  {
    id: 'ai-hallucination-emergency-fix-20250923',
    version: 'WEN 1.1.8',
    date: '2025-09-23',
    type: 'hotfix',
    category: 'AI功能',
    title: 'AI幻覺緊急修復：強化空資料處理與防幻覺約束',
    description: '緊急修復AI幻覺問題，強化空資料處理邏輯，新增3條具體防幻覺約束規則，防止AI編造「好客食堂」、「福源小館」、「阿村魯肉飯」等不存在的商家，確保推薦資訊真實性',
    author: 'C謀',
    impact: 'critical',
    status: 'completed'
  },
  {
    id: 'universal-ai-hallucination-prevention-20250923',
    version: 'WEN 1.1.7',
    date: '2025-09-23',
    type: 'bugfix',
    category: 'AI功能',
    title: '通用 AI 幻覺防護機制：全面防護方案',
    description: '建立通用 AI 幻覺防護原則，實施資料庫查詢防護機制、資料驗證機制、強化 System Prompt 防幻覺約束、錯誤處理透明化，確保推薦資訊真實性和準確性，提升系統可靠性',
    author: 'C謀',
    impact: 'critical',
    status: 'completed'
  },
  {
    id: 'english-recommendation-optimization-20250923',
    version: 'WEN 1.1.6',
    date: '2025-09-23',
    type: 'feature',
    category: 'AI功能',
    title: '英語推薦邏輯優化：首次只推薦肯塔基美語一家',
    description: '優化英語學習查詢推薦邏輯，首次查詢只推薦肯塔基美語一家，除非用戶明確追問更多選擇。追問時會用關鍵字搜索商家資料庫提供更多教育培訓商家推薦，提升推薦精準度和用戶體驗',
    author: 'C謀',
    impact: 'medium',
    status: 'completed'
  },
  {
    id: 'ai-hallucination-fix-20250923',
    version: 'WEN 1.1.5',
    date: '2025-09-23',
    type: 'bugfix',
    category: 'AI功能',
    title: '修復AI幻覺問題：防止虛構商家推薦',
    description: '修復高文文推薦虛構商家問題，強化System Prompt防幻覺機制，增強英語學習推薦邏輯，確保只推薦真實存在的商家資料，防止AI自行編造不存在的商家名稱和地址',
    author: 'C謀',
    impact: 'critical',
    status: 'completed'
  },
  {
    id: 'admin-backend-query-fix-20250923',
    version: 'WEN 1.1.4',
    date: '2025-09-23',
    type: 'bugfix',
    category: '管理後台',
    title: '修復管理後台對話記錄查詢問題',
    description: '修復管理後台對話記錄無法顯示問題，修正資料庫欄位名稱不匹配（client_ip→user_ip, last_active→last_activity），移除不存在的欄位查詢，添加詳細錯誤日誌，確保管理後台顯示真實資料庫記錄',
    author: 'C謀',
    impact: 'high',
    status: 'completed'
  },
  {
    id: 'food-recommendation-logic-fix-20250923',
    version: 'WEN 1.1.4',
    date: '2025-09-23',
    type: 'bugfix',
    category: 'AI功能',
    title: '修復美食查詢推薦錯誤問題',
    description: '修復美食查詢時錯誤推薦教育機構問題，添加美食查詢專門邏輯，修復 Fallback 機制過於激進問題，增強 System Prompt 防止 AI 幻覺，確保美食查詢只推薦餐飲美食類別',
    author: 'C謀',
    impact: 'critical',
    status: 'completed'
  },
  {
    id: 'parking-data-import-and-category-optimization-20250923',
    version: 'WEN 1.1.1',
    date: '2025-09-23',
    type: 'feature',
    category: '資料管理',
    title: '停車場資料匯入與商家分類優化',
    description: '匯入高雄市鳳山區38筆停車場資料，建立兩層分類架構（8個大分類），修復餐飲美食分類統計問題，優化管理後台分類顯示，建立訓練資料同步機制',
    author: 'C謀',
    impact: 'high',
    status: 'completed'
  },
  {
    id: 'major-fallback-service-role-upgrade-20250923',
    version: 'WEN 1.1.0',
    date: '2025-09-23',
    type: 'feature',
    category: 'AI功能',
    title: '重大升級：推薦系統完全穩定化與對話記錄優化',
    description: '實現推薦清單永不為空機制，支援英語查詢和一般查詢的智能 fallback，全面採用 Service Role Key 避免 RLS 限制，對話記錄系統完全正常化，Edge Function 穩定性大幅提升',
    author: 'C謀',
    impact: 'critical',
    status: 'deployed'
  },
  {
    id: 'service-role-fallback-fix-20250923',
    version: 'WEN 1.0.9',
    date: '2025-09-23',
    type: 'bugfix',
    category: 'AI功能',
    title: '補強推薦系統穩定性與資料庫寫入',
    description: '實施推薦清單永不為空 fallback 機制，改用 Service Role Key 進行資料庫寫入避免 RLS 限制，增強 Edge Function 穩定性，確保對話記錄正常保存',
    author: 'C謀',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'recommendation-fallback-fix-20250923',
    version: 'WEN 1.0.8',
    date: '2025-09-23',
    type: 'bugfix',
    category: 'AI功能',
    title: '修復推薦清單 fallback 機制',
    description: '修復 Edge Function 推薦清單為空問題，增強 fallback 機制確保肯塔基美語必入列，改善推薦系統穩定性',
    author: 'C謀',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'recommendation-list-fix-20250923',
    version: 'WEN 1.0.7',
    date: '2025-09-23',
    type: 'bugfix',
    category: 'AI功能',
    title: '修復推薦清單為空問題',
    description: '修復 Edge Function 推薦清單為空的問題，增強商家查詢邏輯，確保肯塔基美語必入列，添加詳細日誌追蹤，改善推薦系統穩定性',
    author: 'C謀',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'conversation-history-fix-20250922',
    version: 'WEN 1.0.6',
    date: '2025-09-22',
    type: 'bugfix',
    category: '管理後台',
    title: '修復對話歷史管理頁面空白問題',
    description: '修復對話歷史管理頁面完全空白問題，移除不存在的 user_profiles 表依賴，添加錯誤處理和 Mock 資料回退邏輯，確保管理後台正常運作',
    author: 'C謀',
    impact: 'high',
    status: 'deployed'
  },
  {
    id: 'claude-api-fix-20250922',
    version: 'WEN 1.0.5',
    date: '2025-09-22',
    type: 'bugfix',
    category: 'AI功能',
    title: '修復高文文系統繁忙問題',
    description: '修復高文文無法回應問題，啟用真實 Edge Function API，修復前端 API 調用邏輯，確保高文文能正常回應用戶查詢',
    author: 'C謀',
    impact: 'critical',
    status: 'deployed'
  },
  {
    id: 'partner-stores-fix-20250922',
    version: 'WEN 1.0.4',
    date: '2025-09-22',
    type: 'bugfix',
    category: '特約商家管理',
    title: '修復特約商家無法保存問題',
    description: '修復特約商家狀態無法保存的問題，強化布林值轉換邏輯，確保前端狀態與DB一致性，建立自動驗收腳本',
    author: 'C謀',
    impact: 'high',
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
