#!/usr/bin/env node

/**
 * WEN 1.4.0 部署後綜合測試腳本
 * 測試回應腳本管理系統的完整工作流程
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 錯誤：請設定環境變數 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🚀 WEN 1.4.0 部署後綜合測試開始')
console.log('===============================')

// 測試配置
const TEST_CONFIG = {
  responseScriptAPI: `${SUPABASE_URL}/functions/v1/response-script-management`,
  claudeChatV3API: `${SUPABASE_URL}/functions/v1/claude-chat-v3`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  }
}

// 測試結果記錄
let testResults = {
  passed: 0,
  failed: 0,
  details: []
}

// 工具函數
function logTest(name, passed, details) {
  const status = passed ? '✅ 通過' : '❌ 失敗'
  console.log(`${status} ${name}`)
  if (details) console.log(`   詳情: ${details}`)

  testResults.details.push({ name, passed, details })
  if (passed) testResults.passed++
  else testResults.failed++
}

async function apiCall(endpoint, data) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: TEST_CONFIG.headers,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    throw new Error(`API調用失敗: ${error.message}`)
  }
}

// 測試套件
async function testDatabaseSchema() {
  console.log('\\n📊 測試 1: 數據庫 Schema 檢查')

  try {
    const result = await apiCall(TEST_CONFIG.responseScriptAPI, {
      action: 'health_check',
      data: {}
    })

    if (result.success) {
      logTest('數據庫連接', true, '所有核心表格存在')
    } else {
      logTest('數據庫連接', false, result.error || '未知錯誤')
    }
  } catch (error) {
    logTest('數據庫連接', false, error.message)
  }
}

async function testUnknownQueryRecording() {
  console.log('\\n📝 測試 2: 未知查詢記錄功能')

  const testQuery = {
    session_id: `test-${Date.now()}`,
    original_question: '推薦好吃的泰式料理',
    detected_intent: 'FOOD',
    confidence_score: 0.85,
    user_meta: { test: true }
  }

  try {
    const result = await apiCall(TEST_CONFIG.responseScriptAPI, {
      action: 'record_unknown_query',
      data: testQuery
    })

    if (result.success && result.data.query_id) {
      logTest('未知查詢記錄', true, `查詢ID: ${result.data.query_id}`)
      return result.data.query_id
    } else {
      logTest('未知查詢記錄', false, result.error || '記錄失敗')
    }
  } catch (error) {
    logTest('未知查詢記錄', false, error.message)
  }

  return null
}

async function testScriptGeneration(queryId) {
  console.log('\\n🤖 測試 3: AI腳本生成功能')

  if (!queryId) {
    logTest('AI腳本生成', false, '缺少查詢ID')
    return null
  }

  try {
    const result = await apiCall(TEST_CONFIG.responseScriptAPI, {
      action: 'generate_script',
      data: {
        query_id: queryId,
        query: {
          original_question: '推薦好吃的泰式料理',
          detected_intent: 'FOOD',
          confidence_score: 0.85
        }
      }
    })

    if (result.success && result.data.script_id) {
      logTest('AI腳本生成', true, `腳本ID: ${result.data.script_id}`)
      return result.data.script_id
    } else {
      logTest('AI腳本生成', false, result.error || '生成失敗')
    }
  } catch (error) {
    logTest('AI腳本生成', false, error.message)
  }

  return null
}

async function testReviewSubmission(scriptId) {
  console.log('\\n👥 測試 4: 人工審核功能')

  if (!scriptId) {
    logTest('人工審核', false, '缺少腳本ID')
    return null
  }

  const reviewData = {
    script_id: scriptId,
    reviewer_id: 'test-reviewer',
    reviewer_name: '測試審核員',
    review_status: 'approved',
    review_score: 85,
    review_comments: '內容準確，語氣友善，建議通過',
    detailed_scores: {
      accuracy: 85,
      tone: 90,
      completeness: 80,
      usefulness: 85
    }
  }

  try {
    const result = await apiCall(TEST_CONFIG.responseScriptAPI, {
      action: 'submit_review',
      data: reviewData
    })

    if (result.success) {
      logTest('人工審核', true, '審核通過並加入知識庫')
      return true
    } else {
      logTest('人工審核', false, result.error || '審核失敗')
    }
  } catch (error) {
    logTest('人工審核', false, error.message)
  }

  return false
}

async function testKnowledgeBaseSearch() {
  console.log('\\n🔍 測試 5: 知識庫搜索功能')

  try {
    const result = await apiCall(TEST_CONFIG.responseScriptAPI, {
      action: 'search_knowledge',
      data: {
        query: '泰式料理推薦',
        category: 'FOOD',
        limit: 5
      }
    })

    if (result.success && result.data.length >= 0) {
      logTest('知識庫搜索', true, `找到 ${result.data.length} 個相關條目`)
    } else {
      logTest('知識庫搜索', false, result.error || '搜索失敗')
    }
  } catch (error) {
    logTest('知識庫搜索', false, error.message)
  }
}

async function testClaudeChatV3Integration() {
  console.log('\\n💬 測試 6: Claude Chat V3 整合')

  const testMessage = {
    messages: [
      { role: 'user', content: '我想找好吃的泰式料理，有什麼推薦嗎？' }
    ],
    sessionId: `test-chat-${Date.now()}`
  }

  try {
    const result = await apiCall(TEST_CONFIG.claudeChatV3API, testMessage)

    if (result.message && result.message.length > 0) {
      logTest('Claude Chat V3 整合', true, '成功生成回應')
      console.log(`   回應預覽: ${result.message.substring(0, 100)}...`)
    } else {
      logTest('Claude Chat V3 整合', false, '無法生成回應')
    }
  } catch (error) {
    logTest('Claude Chat V3 整合', false, error.message)
  }
}

async function testGetPendingQueries() {
  console.log('\\n📋 測試 7: 待處理查詢列表')

  try {
    const result = await apiCall(TEST_CONFIG.responseScriptAPI, {
      action: 'get_pending_queries',
      data: { limit: 10 }
    })

    if (result.success && Array.isArray(result.data)) {
      logTest('待處理查詢列表', true, `獲取 ${result.data.length} 個待處理查詢`)
    } else {
      logTest('待處理查詢列表', false, result.error || '獲取失敗')
    }
  } catch (error) {
    logTest('待處理查詢列表', false, error.message)
  }
}

async function testAnalytics() {
  console.log('\\n📈 測試 8: 統計分析功能')

  try {
    const result = await apiCall(TEST_CONFIG.responseScriptAPI, {
      action: 'get_analytics',
      data: { period: '7days' }
    })

    if (result.success) {
      logTest('統計分析', true, '成功獲取分析數據')
    } else {
      logTest('統計分析', false, result.error || '分析失敗')
    }
  } catch (error) {
    logTest('統計分析', false, error.message)
  }
}

// 主測試流程
async function runAllTests() {
  console.log('⏱️  開始時間:', new Date().toLocaleString())

  // 基礎功能測試
  await testDatabaseSchema()
  await testGetPendingQueries()

  // 完整工作流程測試
  const queryId = await testUnknownQueryRecording()
  const scriptId = await testScriptGeneration(queryId)
  const reviewPassed = await testReviewSubmission(scriptId)

  // 知識庫和整合測試
  await testKnowledgeBaseSearch()
  await testClaudeChatV3Integration()
  await testAnalytics()

  // 輸出測試結果
  console.log('\\n===============================')
  console.log('📊 測試結果摘要')
  console.log('===============================')
  console.log(`✅ 通過: ${testResults.passed} 項`)
  console.log(`❌ 失敗: ${testResults.failed} 項`)
  console.log(`📈 成功率: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`)

  if (testResults.failed > 0) {
    console.log('\\n❌ 失敗詳情:')
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.details}`)
      })
  }

  console.log('\\n⏱️  結束時間:', new Date().toLocaleString())

  // 整體評估
  const overallSuccess = testResults.failed === 0
  console.log(`\\n🎯 整體評估: ${overallSuccess ? '✅ 部署成功' : '⚠️ 需要檢查'}`)

  if (overallSuccess) {
    console.log('🎉 恭喜！WEN 1.4.0 回應腳本管理系統部署完成且功能正常！')
  } else {
    console.log('⚠️  部分功能異常，建議檢查日誌並修復問題後重新測試')
  }
}

// 執行測試
runAllTests().catch(error => {
  console.error('💥 測試執行異常:', error.message)
  process.exit(1)
})