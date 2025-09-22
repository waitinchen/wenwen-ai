// 系統健康檢查工具
export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error'
  message: string
  details?: any
  timestamp: string
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error'
  checks: HealthCheckResult[]
  timestamp: string
}

class HealthChecker {
  private results: HealthCheckResult[] = []

  async checkDatabaseConnection(): Promise<HealthCheckResult> {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('count')
        .limit(1)

      if (error) {
        return {
          status: 'error',
          message: '數據庫連接失敗',
          details: error,
          timestamp: new Date().toISOString()
        }
      }

      return {
        status: 'healthy',
        message: '數據庫連接正常',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        message: '數據庫連接異常',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async checkEdgeFunctions(): Promise<HealthCheckResult> {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // 測試 admin-auth Edge Function
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: { action: 'verify', token: 'test' }
      })

      if (error && error.message?.includes('Edge Function returned a non-2xx status code')) {
        return {
          status: 'warning',
          message: 'Edge Functions 未部署，使用模擬 API',
          details: error,
          timestamp: new Date().toISOString()
        }
      }

      return {
        status: 'healthy',
        message: 'Edge Functions 正常',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'warning',
        message: 'Edge Functions 異常，已切換到模擬模式',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async checkEnvironmentVariables(): Promise<HealthCheckResult> {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ]

    const missingVars = requiredVars.filter(varName => !import.meta.env[varName])

    if (missingVars.length > 0) {
      return {
        status: 'warning',
        message: `缺少環境變數: ${missingVars.join(', ')}`,
        details: { missing: missingVars, usingDefaults: true },
        timestamp: new Date().toISOString()
      }
    }

    return {
      status: 'healthy',
      message: '環境變數配置正常',
      timestamp: new Date().toISOString()
    }
  }

  async checkAPIEndpoints(): Promise<HealthCheckResult> {
    try {
      // 測試聊天 API
      const { sendMessage } = await import('@/lib/api')
      
      // 發送測試消息
      const testResponse = await sendMessage('測試連接', 'test-session-' + Date.now())
      
      if (testResponse && testResponse.response) {
        return {
          status: 'healthy',
          message: 'API 端點正常',
          details: { testResponse: testResponse.response.substring(0, 50) },
          timestamp: new Date().toISOString()
        }
      }

      return {
        status: 'error',
        message: 'API 端點無回應',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'API 端點測試失敗',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async checkDataIntegrity(): Promise<HealthCheckResult> {
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // 檢查數據表是否存在
      const tables = ['chat_sessions', 'chat_messages', 'line_users', 'admins']
      const results = []

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        results.push({ table, exists: !error })
      }

      const missingTables = results.filter(r => !r.exists).map(r => r.table)

      if (missingTables.length > 0) {
        return {
          status: 'error',
          message: `缺少數據表: ${missingTables.join(', ')}`,
          details: { results },
          timestamp: new Date().toISOString()
        }
      }

      return {
        status: 'healthy',
        message: '數據完整性正常',
        details: { tablesChecked: tables.length },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        message: '數據完整性檢查失敗',
        details: error,
        timestamp: new Date().toISOString()
      }
    }
  }

  async runAllChecks(): Promise<SystemHealth> {
    this.results = []

    // 執行所有檢查
    this.results.push(await this.checkEnvironmentVariables())
    this.results.push(await this.checkDatabaseConnection())
    this.results.push(await this.checkDataIntegrity())
    this.results.push(await this.checkEdgeFunctions())
    this.results.push(await this.checkAPIEndpoints())

    // 計算整體狀態
    const hasErrors = this.results.some(r => r.status === 'error')
    const hasWarnings = this.results.some(r => r.status === 'warning')
    
    let overall: 'healthy' | 'warning' | 'error' = 'healthy'
    if (hasErrors) overall = 'error'
    else if (hasWarnings) overall = 'warning'

    return {
      overall,
      checks: this.results,
      timestamp: new Date().toISOString()
    }
  }
}

export const healthChecker = new HealthChecker()

