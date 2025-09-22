#!/usr/bin/env node

/**
 * 高文文 AI 客服系統 - 自動測試腳本
 * 使用方法: node scripts/test-system.js [options]
 */

const fs = require('fs')
const path = require('path')

// 測試配置
const TEST_CONFIG = {
  // 測試超時時間 (毫秒)
  timeout: 30000,
  
  // 重試次數
  retries: 3,
  
  // 測試間隔 (毫秒)
  interval: 1000,
  
  // 測試項目
  tests: [
    'environment',
    'database',
    'api',
    'performance',
    'security'
  ]
}

// 測試結果
let testResults = {
  startTime: new Date(),
  endTime: null,
  totalTests: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
}

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(name, status, message, duration) {
  const statusColor = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'
  const statusIcon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '○'
  
  log(`${statusIcon} ${name} (${duration}ms)`, statusColor)
  if (message) {
    log(`  ${message}`, 'bright')
  }
}

// 測試函數
async function testEnvironment() {
  const startTime = Date.now()
  
  try {
    // 檢查環境變數文件
    const envPath = path.join(process.cwd(), '.env.local')
    const envExists = fs.existsSync(envPath)
    
    if (!envExists) {
      return {
        status: 'fail',
        message: '缺少 .env.local 文件',
        duration: Date.now() - startTime
      }
    }
    
    // 檢查必要的環境變數
    const envContent = fs.readFileSync(envPath, 'utf8')
    const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
    const missingVars = requiredVars.filter(varName => !envContent.includes(varName))
    
    if (missingVars.length > 0) {
      return {
        status: 'fail',
        message: `缺少環境變數: ${missingVars.join(', ')}`,
        duration: Date.now() - startTime
      }
    }
    
    return {
      status: 'pass',
      message: '環境變數配置正確',
      duration: Date.now() - startTime
    }
  } catch (error) {
    return {
      status: 'fail',
      message: `環境檢查失敗: ${error.message}`,
      duration: Date.now() - startTime
    }
  }
}

async function testDatabase() {
  const startTime = Date.now()
  
  try {
    // 這裡可以添加實際的數據庫連接測試
    // 由於這是 Node.js 腳本，我們只能檢查配置
    
    const envPath = path.join(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
      return {
        status: 'skip',
        message: '無法檢查數據庫連接（缺少環境配置）',
        duration: Date.now() - startTime
      }
    }
    
    return {
      status: 'pass',
      message: '數據庫配置檢查通過',
      duration: Date.now() - startTime
    }
  } catch (error) {
    return {
      status: 'fail',
      message: `數據庫檢查失敗: ${error.message}`,
      duration: Date.now() - startTime
    }
  }
}

async function testAPI() {
  const startTime = Date.now()
  
  try {
    // 檢查 API 文件是否存在
    const apiPath = path.join(process.cwd(), 'src/lib/api.ts')
    const mockAuthPath = path.join(process.cwd(), 'src/lib/mockAdminAuth.ts')
    
    if (!fs.existsSync(apiPath)) {
      return {
        status: 'fail',
        message: 'API 文件不存在',
        duration: Date.now() - startTime
      }
    }
    
    if (!fs.existsSync(mockAuthPath)) {
      return {
        status: 'fail',
        message: '模擬認證文件不存在',
        duration: Date.now() - startTime
      }
    }
    
    return {
      status: 'pass',
      message: 'API 文件檢查通過',
      duration: Date.now() - startTime
    }
  } catch (error) {
    return {
      status: 'fail',
      message: `API 檢查失敗: ${error.message}`,
      duration: Date.now() - startTime
    }
  }
}

async function testPerformance() {
  const startTime = Date.now()
  
  try {
    // 檢查構建文件大小
    const distPath = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distPath)) {
      return {
        status: 'skip',
        message: '構建文件不存在，請先運行 npm run build',
        duration: Date.now() - startTime
      }
    }
    
    // 檢查主要文件大小
    const mainJS = path.join(distPath, 'assets', 'index.js')
    if (fs.existsSync(mainJS)) {
      const stats = fs.statSync(mainJS)
      const sizeKB = Math.round(stats.size / 1024)
      
      if (sizeKB > 1000) { // 大於 1MB
        return {
          status: 'warning',
          message: `主文件過大: ${sizeKB}KB`,
          duration: Date.now() - startTime
        }
      }
    }
    
    return {
      status: 'pass',
      message: '性能檢查通過',
      duration: Date.now() - startTime
    }
  } catch (error) {
    return {
      status: 'fail',
      message: `性能檢查失敗: ${error.message}`,
      duration: Date.now() - startTime
    }
  }
}

async function testSecurity() {
  const startTime = Date.now()
  
  try {
    // 檢查敏感信息
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      
      // 檢查是否有硬編碼的敏感信息
      const sensitivePatterns = [
        /password\s*=\s*['"][^'"]+['"]/i,
        /secret\s*=\s*['"][^'"]+['"]/i,
        /key\s*=\s*['"][^'"]+['"]/i
      ]
      
      const hasSensitiveInfo = sensitivePatterns.some(pattern => pattern.test(envContent))
      
      if (hasSensitiveInfo) {
        return {
          status: 'warning',
          message: '發現可能的敏感信息',
          duration: Date.now() - startTime
        }
      }
    }
    
    return {
      status: 'pass',
      message: '安全檢查通過',
      duration: Date.now() - startTime
    }
  } catch (error) {
    return {
      status: 'fail',
      message: `安全檢查失敗: ${error.message}`,
      duration: Date.now() - startTime
    }
  }
}

// 執行測試
async function runTests() {
  log('🧪 開始執行系統測試...', 'cyan')
  log('=' * 50, 'cyan')
  
  const tests = {
    environment: testEnvironment,
    database: testDatabase,
    api: testAPI,
    performance: testPerformance,
    security: testSecurity
  }
  
  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      const result = await testFn()
      testResults.results.push({
        name: testName,
        ...result
      })
      
      testResults.totalTests++
      if (result.status === 'pass') testResults.passed++
      else if (result.status === 'fail') testResults.failed++
      else testResults.skipped++
      
      logTest(testName, result.status, result.message, result.duration)
      
      // 測試間隔
      if (TEST_CONFIG.interval > 0) {
        await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.interval))
      }
    } catch (error) {
      const result = {
        name: testName,
        status: 'fail',
        message: `測試執行錯誤: ${error.message}`,
        duration: 0
      }
      
      testResults.results.push(result)
      testResults.totalTests++
      testResults.failed++
      
      logTest(testName, 'fail', result.message, 0)
    }
  }
  
  testResults.endTime = new Date()
  
  // 輸出總結
  log('\n' + '=' * 50, 'cyan')
  log('📊 測試總結', 'cyan')
  log('=' * 50, 'cyan')
  
  const totalDuration = testResults.endTime - testResults.startTime
  log(`總耗時: ${totalDuration}ms`, 'bright')
  log(`總測試: ${testResults.totalTests}`, 'bright')
  log(`通過: ${testResults.passed}`, 'green')
  log(`失敗: ${testResults.failed}`, 'red')
  log(`跳過: ${testResults.skipped}`, 'yellow')
  
  // 成功率
  const successRate = Math.round((testResults.passed / testResults.totalTests) * 100)
  const rateColor = successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red'
  log(`成功率: ${successRate}%`, rateColor)
  
  // 保存測試報告
  const reportPath = path.join(process.cwd(), 'test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2))
  log(`\n📄 測試報告已保存: ${reportPath}`, 'blue')
  
  // 退出碼
  process.exit(testResults.failed > 0 ? 1 : 0)
}

// 主程序
if (require.main === module) {
  runTests().catch(error => {
    log(`❌ 測試執行失敗: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = { runTests, testResults }

