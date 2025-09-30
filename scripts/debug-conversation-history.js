#!/usr/bin/env node

/**
 * 對話歷史管理除錯腳本
 * 診斷為什麼無法顯示前台對話記錄
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 錯誤：請設定環境變數 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🔍 對話歷史管理除錯開始')
console.log('===============================')

async function apiCall(url, options) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`API調用失敗: ${error.message}`)
  }
}

async function checkDatabaseTables() {
  console.log('\\n📊 步驟 1: 檢查數據庫表格')

  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }

  try {
    // 檢查 chat_sessions 表格
    console.log('\\n🔍 檢查 chat_sessions 表格...')
    const sessionsResponse = await apiCall(`${SUPABASE_URL}/rest/v1/chat_sessions?select=*&limit=5`, {
      method: 'GET',
      headers
    })
    console.log(`✅ chat_sessions 表格存在，共 ${sessionsResponse.length} 筆記錄`)
    if (sessionsResponse.length > 0) {
      console.log('   樣本記錄：', JSON.stringify(sessionsResponse[0], null, 2))
    }

    // 檢查 chat_messages 表格
    console.log('\\n🔍 檢查 chat_messages 表格...')
    const messagesResponse = await apiCall(`${SUPABASE_URL}/rest/v1/chat_messages?select=*&limit=5`, {
      method: 'GET',
      headers
    })
    console.log(`✅ chat_messages 表格存在，共 ${messagesResponse.length} 筆記錄`)
    if (messagesResponse.length > 0) {
      console.log('   樣本記錄：', JSON.stringify(messagesResponse[0], null, 2))
    }

    return { sessions: sessionsResponse, messages: messagesResponse }
  } catch (error) {
    console.error('❌ 數據庫檢查失敗:', error.message)
    return null
  }
}

async function testConversationHistoryQuery() {
  console.log('\\n📋 步驟 2: 測試對話歷史查詢')

  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }

  try {
    // 模擬 ConversationHistoryManager 的查詢
    const queryUrl = `${SUPABASE_URL}/rest/v1/chat_sessions?select=id,user_id,line_user_id,user_ip,user_agent,started_at,last_activity,message_count,user_meta,line_users(id,line_uid,line_display_name,line_avatar_url)&order=last_activity.desc&limit=100`

    console.log('🔍 執行查詢:', queryUrl)

    const result = await apiCall(queryUrl, {
      method: 'GET',
      headers
    })

    console.log(`✅ 查詢成功，共 ${result.length} 筆記錄`)

    if (result.length > 0) {
      console.log('\\n📄 前 3 筆記錄：')
      result.slice(0, 3).forEach((session, index) => {
        console.log(`\\n${index + 1}. 會話 ID: ${session.id}`)
        console.log(`   用戶 ID: ${session.user_id || '無'}`)
        console.log(`   LINE 用戶 ID: ${session.line_user_id || '無'}`)
        console.log(`   用戶 IP: ${session.user_ip || '無'}`)
        console.log(`   開始時間: ${session.started_at || '無'}`)
        console.log(`   最後活動: ${session.last_activity || '無'}`)
        console.log(`   消息數量: ${session.message_count || 0}`)
        console.log(`   用戶元數據: ${session.user_meta || '無'}`)
        console.log(`   LINE 用戶: ${session.line_users ? JSON.stringify(session.line_users) : '無'}`)
      })
    }

    return result
  } catch (error) {
    console.error('❌ 對話歷史查詢失敗:', error.message)
    return []
  }
}

async function testChatMessagesQuery() {
  console.log('\\n💬 步驟 3: 測試聊天消息查詢')

  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }

  try {
    const result = await apiCall(`${SUPABASE_URL}/rest/v1/chat_messages?select=*&order=created_at.desc&limit=10`, {
      method: 'GET',
      headers
    })

    console.log(`✅ 聊天消息查詢成功，共 ${result.length} 筆記錄`)

    if (result.length > 0) {
      console.log('\\n📄 最新 5 條消息：')
      result.slice(0, 5).forEach((message, index) => {
        console.log(`\\n${index + 1}. 消息 ID: ${message.id}`)
        console.log(`   會話 ID: ${message.session_id}`)
        console.log(`   消息類型: ${message.message_type}`)
        console.log(`   內容: ${message.content.substring(0, 50)}...`)
        console.log(`   創建時間: ${message.created_at}`)
      })

      // 分析會話分布
      const sessionCounts = result.reduce((acc, msg) => {
        acc[msg.session_id] = (acc[msg.session_id] || 0) + 1
        return acc
      }, {})

      console.log('\\n📊 會話消息分布：')
      Object.entries(sessionCounts).forEach(([sessionId, count]) => {
        console.log(`   ${sessionId}: ${count} 條消息`)
      })
    }

    return result
  } catch (error) {
    console.error('❌ 聊天消息查詢失敗:', error.message)
    return []
  }
}

async function testEdgeFunctionIntegration() {
  console.log('\\n🔌 步驟 4: 測試 Edge Function 整合')

  try {
    const testMessage = {
      message: { content: '你好，測試消息' },
      session_id: `test-debug-${Date.now()}`
    }

    console.log('🧪 發送測試消息到 claude-chat...')

    const result = await apiCall(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    })

    console.log('✅ Edge Function 測試成功')
    console.log(`   會話 ID: ${result.data.session_id}`)
    console.log(`   意圖: ${result.data.intent}`)
    console.log(`   推薦商家數: ${result.data.recommended_stores.length}`)

    // 等待一下讓數據庫同步
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 檢查是否有新記錄
    console.log('\\n🔍 檢查新生成的記錄...')
    await checkNewRecords(testMessage.session_id)

    return result
  } catch (error) {
    console.error('❌ Edge Function 測試失敗:', error.message)
    return null
  }
}

async function checkNewRecords(sessionId) {
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }

  try {
    // 檢查會話記錄
    const sessionResult = await apiCall(`${SUPABASE_URL}/rest/v1/chat_sessions?session_id=eq.${sessionId}`, {
      method: 'GET',
      headers
    })

    if (sessionResult.length > 0) {
      console.log('✅ 找到新的會話記錄')
      console.log('   ', JSON.stringify(sessionResult[0], null, 2))
    } else {
      console.log('❌ 沒有找到新的會話記錄')
    }

    // 檢查消息記錄
    const messageResult = await apiCall(`${SUPABASE_URL}/rest/v1/chat_messages?session_id=eq.${sessionId}`, {
      method: 'GET',
      headers
    })

    if (messageResult.length > 0) {
      console.log(`✅ 找到 ${messageResult.length} 條新消息記錄`)
      messageResult.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.message_type}: ${msg.content.substring(0, 30)}...`)
      })
    } else {
      console.log('❌ 沒有找到新的消息記錄')
    }

  } catch (error) {
    console.error('❌ 檢查新記錄失敗:', error.message)
  }
}

async function analyzeIssues(sessions, messages) {
  console.log('\\n🔬 步驟 5: 問題分析')

  const issues = []

  // 檢查欄位不匹配問題
  if (sessions.length > 0) {
    const sampleSession = sessions[0]

    console.log('\\n📋 檢查欄位對應：')

    // 檢查關鍵欄位
    const requiredFields = [
      'id', 'session_id', 'user_id', 'user_ip', 'user_agent',
      'started_at', 'last_activity', 'message_count', 'user_meta'
    ]

    const missingFields = []
    const existingFields = Object.keys(sampleSession)

    requiredFields.forEach(field => {
      if (!existingFields.includes(field)) {
        missingFields.push(field)
      }
    })

    if (missingFields.length > 0) {
      issues.push(`缺少欄位: ${missingFields.join(', ')}`)
      console.log(`❌ 缺少欄位: ${missingFields.join(', ')}`)
    } else {
      console.log('✅ 所有必要欄位都存在')
    }

    // 檢查欄位名稱不匹配
    const fieldMappings = [
      { old: 'client_ip', new: 'user_ip' },
      { old: 'last_active', new: 'last_activity' }
    ]

    fieldMappings.forEach(({ old, new: newField }) => {
      if (existingFields.includes(old) && !existingFields.includes(newField)) {
        issues.push(`欄位名稱不匹配: ${old} 應為 ${newField}`)
        console.log(`⚠️  欄位名稱不匹配: ${old} 應為 ${newField}`)
      }
    })
  }

  // 檢查會話和消息的關聯
  if (sessions.length > 0 && messages.length > 0) {
    const sessionIds = sessions.map(s => s.id || s.session_id)
    const messageSessionIds = [...new Set(messages.map(m => m.session_id))]

    const orphanMessages = messageSessionIds.filter(id => !sessionIds.includes(id))

    if (orphanMessages.length > 0) {
      issues.push(`孤立消息: ${orphanMessages.length} 個會話的消息沒有對應的會話記錄`)
      console.log(`⚠️  孤立消息: ${orphanMessages.length} 個會話的消息沒有對應的會話記錄`)
    } else {
      console.log('✅ 會話和消息關聯正常')
    }
  }

  // 檢查時間格式
  if (sessions.length > 0) {
    const sampleSession = sessions[0]
    const timeFields = ['started_at', 'last_activity', 'created_at']

    timeFields.forEach(field => {
      if (sampleSession[field]) {
        const timeValue = sampleSession[field]
        if (isNaN(Date.parse(timeValue))) {
          issues.push(`時間格式錯誤: ${field} = ${timeValue}`)
          console.log(`❌ 時間格式錯誤: ${field} = ${timeValue}`)
        }
      }
    })
  }

  return issues
}

async function generateSolution(issues) {
  console.log('\\n💡 步驟 6: 生成解決方案')

  if (issues.length === 0) {
    console.log('🎉 沒有發現問題，對話歷史應該能正常顯示')
    return
  }

  console.log('\\n🔧 發現的問題：')
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`)
  })

  console.log('\\n📋 建議的解決方案：')

  let solutionCount = 1

  if (issues.some(issue => issue.includes('缺少欄位') || issue.includes('不匹配'))) {
    console.log(`   ${solutionCount}. 修復 ConversationHistoryManager 的查詢邏輯`)
    console.log(`      - 更新 Supabase 查詢的欄位名稱`)
    console.log(`      - 添加容錯處理和預設值`)
    solutionCount++
  }

  if (issues.some(issue => issue.includes('孤立消息'))) {
    console.log(`   ${solutionCount}. 修復會話記錄機制`)
    console.log(`      - 確保 Edge Function 正確創建會話記錄`)
    console.log(`      - 添加會話記錄的驗證邏輯`)
    solutionCount++
  }

  if (issues.some(issue => issue.includes('時間格式'))) {
    console.log(`   ${solutionCount}. 修復時間處理`)
    console.log(`      - 標準化時間格式為 ISO 8601`)
    console.log(`      - 添加時間解析的容錯機制`)
    solutionCount++
  }

  console.log(`   ${solutionCount}. 添加更好的錯誤處理和日誌`)
  console.log(`      - 在 ConversationHistoryManager 中添加詳細日誌`)
  console.log(`      - 提供更清晰的錯誤信息`)
}

// 主要執行流程
async function runDiagnosis() {
  try {
    console.log('⏱️  開始時間:', new Date().toLocaleString())

    const dbResult = await checkDatabaseTables()

    if (!dbResult) {
      console.log('💥 無法連接到數據庫，請檢查環境變數設定')
      return
    }

    const sessions = await testConversationHistoryQuery()
    const messages = await testChatMessagesQuery()

    await testEdgeFunctionIntegration()

    const issues = await analyzeIssues(sessions, messages)
    await generateSolution(issues)

    console.log('\\n===============================')
    console.log('📊 診斷摘要')
    console.log('===============================')
    console.log(`🗂️  會話記錄: ${sessions.length} 筆`)
    console.log(`💬 消息記錄: ${messages.length} 筆`)
    console.log(`❗ 發現問題: ${issues.length} 個`)

    if (issues.length === 0) {
      console.log('\\n🎉 恭喜！沒有發現技術問題')
      console.log('💡 如果對話歷史仍不顯示，可能是前端組件刷新問題')
    } else {
      console.log('\\n⚠️  需要修復以上問題才能正常顯示對話歷史')
    }

    console.log('\\n⏱️  結束時間:', new Date().toLocaleString())

  } catch (error) {
    console.error('💥 診斷過程中發生錯誤:', error.message)
  }
}

// 執行診斷
runDiagnosis()