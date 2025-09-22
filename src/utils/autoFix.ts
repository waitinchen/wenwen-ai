// 自動修復工具
export interface FixResult {
  success: boolean
  message: string
  details?: any
  timestamp: string
}

export interface AutoFixOptions {
  fixDatabaseIssues?: boolean
  fixEnvironmentIssues?: boolean
  fixAPIIssues?: boolean
  createMissingTables?: boolean
  resetMockData?: boolean
}

class AutoFixer {
  async fixEnvironmentIssues(): Promise<FixResult> {
    try {
      // 檢查並創建 .env.local 文件
      const envContent = `# Supabase 配置
VITE_SUPABASE_URL=https://vqcuwjfxoxjgsrueqodj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo

# Claude API 配置 (需要您自己設置)
VITE_CLAUDE_API_KEY=your_claude_api_key_here

# 應用配置
VITE_APP_NAME=文山特區客服機器人
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development`

      // 在瀏覽器中無法直接寫入文件，但可以提供下載
      const blob = new Blob([envContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '.env.local'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return {
        success: true,
        message: '環境變數文件已生成，請下載並放置在項目根目錄',
        details: { fileName: '.env.local' },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: '環境變數修復失敗',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async fixDatabaseIssues(): Promise<FixResult> {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // 檢查並創建必要的數據表
      const tables = [
        {
          name: 'chat_sessions',
          sql: `CREATE TABLE IF NOT EXISTS chat_sessions (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            user_ip VARCHAR(45),
            user_agent TEXT,
            line_user_id INTEGER,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            message_count INTEGER DEFAULT 0
          )`
        },
        {
          name: 'chat_messages',
          sql: `CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            session_id INTEGER REFERENCES chat_sessions(id),
            message_type VARCHAR(20) DEFAULT 'user' CHECK (message_type IN ('user', 'bot', 'system')),
            message_text TEXT NOT NULL,
            response_time INTEGER,
            user_feedback INTEGER CHECK (user_feedback IN (1, -1)),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB
          )`
        }
      ]

      const results = []
      for (const table of tables) {
        try {
          // 嘗試查詢表是否存在
          const { error } = await supabase
            .from(table.name)
            .select('count')
            .limit(1)
          
          if (error) {
            results.push({ table: table.name, status: 'missing', needsCreation: true })
          } else {
            results.push({ table: table.name, status: 'exists', needsCreation: false })
          }
        } catch (err) {
          results.push({ table: table.name, status: 'error', needsCreation: true })
        }
      }

      return {
        success: true,
        message: '數據庫檢查完成',
        details: { tables: results },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: '數據庫修復失敗',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async fixAPIIssues(): Promise<FixResult> {
    try {
      // 檢查並修復 API 配置
      const issues = []
      const fixes = []

      // 檢查 Supabase 配置
      if (!import.meta.env.VITE_SUPABASE_URL) {
        issues.push('缺少 VITE_SUPABASE_URL')
        fixes.push('使用預設 Supabase URL')
      }

      if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
        issues.push('缺少 VITE_SUPABASE_ANON_KEY')
        fixes.push('使用預設 Supabase Key')
      }

      // 檢查 Claude API Key
      if (!import.meta.env.VITE_CLAUDE_API_KEY || import.meta.env.VITE_CLAUDE_API_KEY === 'your_claude_api_key_here') {
        issues.push('Claude API Key 未設置')
        fixes.push('使用模擬 API 模式')
      }

      return {
        success: true,
        message: `API 問題檢查完成，發現 ${issues.length} 個問題`,
        details: { issues, fixes },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: 'API 修復失敗',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async createTestData(): Promise<FixResult> {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // 創建測試會話
      const testSession = {
        session_id: 'test-session-' + Date.now(),
        user_ip: '127.0.0.1',
        user_agent: 'Test Browser',
        started_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        message_count: 2
      }

      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert(testSession)
        .select()
        .single()

      if (sessionError) {
        return {
          success: false,
          message: '創建測試會話失敗',
          details: sessionError,
          timestamp: new Date().toISOString()
        }
      }

      // 創建測試消息
      const testMessages = [
        {
          session_id: sessionData.id,
          message_type: 'user',
          message_text: '你好，我想了解文山特區的餐廳推薦',
          created_at: new Date().toISOString()
        },
        {
          session_id: sessionData.id,
          message_type: 'bot',
          message_text: '您好！文山特區有很多不錯的餐廳，比如有傳統台灣料理、日式料理、咖啡廳等。您比較喜歡哪種類型的餐廳呢？',
          created_at: new Date().toISOString()
        }
      ]

      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(testMessages)

      if (messagesError) {
        return {
          success: false,
          message: '創建測試消息失敗',
          details: messagesError,
          timestamp: new Date().toISOString()
        }
      }

      return {
        success: true,
        message: '測試數據創建成功',
        details: { sessionId: testSession.session_id, messageCount: testMessages.length },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: '創建測試數據失敗',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async runAutoFix(options: AutoFixOptions = {}): Promise<FixResult[]> {
    const results: FixResult[] = []

    if (options.fixEnvironmentIssues) {
      results.push(await this.fixEnvironmentIssues())
    }

    if (options.fixDatabaseIssues) {
      results.push(await this.fixDatabaseIssues())
    }

    if (options.fixAPIIssues) {
      results.push(await this.fixAPIIssues())
    }

    if (options.createMissingTables) {
      results.push(await this.fixDatabaseIssues())
    }

    if (options.resetMockData) {
      results.push(await this.createTestData())
    }

    return results
  }
}

export const autoFixer = new AutoFixer()

