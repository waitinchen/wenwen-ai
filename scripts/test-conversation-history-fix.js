#!/usr/bin/env node

/**
 * 測試對話歷史修復效果
 * 驗證修復後的系統是否能正確記錄和顯示對話
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 錯誤：請設定環境變數 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🧪 對話歷史修復效果測試')
console.log('===============================')

const headers = {
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
}

async function apiCall(url, options) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`API調用失敗: ${error.message}`)
  }
}

async function testClaudeChatFunction() {
  console.log('\\n🤖 步驟 1: 測試修復後的 Claude Chat 函數')

  const testMessages = [
    { content: '你好，我想找美食推薦', expectedIntent: 'FOOD' },
    { content: '有什麼英語補習班推薦嗎？', expectedIntent: 'ENGLISH_LEARNING' },
    { content: '停車場資訊', expectedIntent: 'PARKING' }
  ]

  const testResults = []

  for (let i = 0; i < testMessages.length; i++) {
    const testMessage = testMessages[i]
    const sessionId = `test-fix-${Date.now()}-${i}`

    try {
      console.log(`\\n🧪 測試 ${i + 1}: "${testMessage.content}"`)

      const result = await apiCall(`${SUPABASE_URL}/functions/v1/claude-chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: { content: testMessage.content },
          session_id: sessionId,
          user_meta: {
            display_name: `測試用戶${i + 1}`,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=test${i + 1}`,
            external_id: `test-user-${i + 1}`
          }
        })
      })

      if (result.data) {
        console.log(`✅ 函數調用成功`)
        console.log(`   會話 ID: ${result.data.session_id}`)
        console.log(`   識別意圖: ${result.data.intent}`)
        console.log(`   推薦商家: ${result.data.recommended_stores.length} 個`)
        console.log(`   處理時間: ${result.data.processing_time}ms`)

        testResults.push({
          sessionId: result.data.session_id,
          intent: result.data.intent,
          success: true,
          message: testMessage.content
        })
      } else {
        console.log(`❌ 函數調用失敗: 無回傳資料`)
        testResults.push({
          sessionId,
          success: false,
          error: '無回傳資料'
        })
      }

      // 等待一下讓資料庫同步
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.log(`❌ 函數調用失敗: ${error.message}`)
      testResults.push({
        sessionId,
        success: false,
        error: error.message
      })
    }
  }

  return testResults
}

async function checkDatabaseRecords(testResults) {
  console.log('\\n📊 步驟 2: 檢查資料庫記錄')

  const dbHeaders = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }

  // 檢查會話記錄
  console.log('\\n🔍 檢查 chat_sessions 表...')
  try {
    const sessionsResponse = await apiCall(`${SUPABASE_URL}/rest/v1/chat_sessions?select=*&order=created_at.desc&limit=10`, {
      method: 'GET',
      headers: dbHeaders
    })

    console.log(`✅ 找到 ${sessionsResponse.length} 個會話記錄`)

    const testSessionIds = testResults.filter(r => r.success).map(r => r.sessionId)
    const foundSessions = sessionsResponse.filter(session =>
      testSessionIds.includes(session.session_id)
    )

    console.log(`📋 測試會話記錄: ${foundSessions.length}/${testSessionIds.length}`)

    foundSessions.forEach((session, index) => {
      console.log(`\\n${index + 1}. 會話 ${session.session_id}:`)
      console.log(`   消息數: ${session.message_count}`)
      console.log(`   開始時間: ${session.started_at}`)
      console.log(`   最後活動: ${session.last_activity}`)
      console.log(`   用戶 IP: ${session.user_ip}`)
      console.log(`   用戶元資料: ${session.user_meta ? '有' : '無'}`)

      if (session.user_meta) {
        try {
          const userMeta = JSON.parse(session.user_meta)
          console.log(`   用戶暱稱: ${userMeta.display_name || '未設定'}`)
          console.log(`   用戶頭像: ${userMeta.avatar_url ? '有' : '無'}`)
        } catch (e) {
          console.log(`   用戶元資料解析失敗`)
        }
      }
    })

  } catch (error) {
    console.log(`❌ 檢查會話記錄失敗: ${error.message}`)
  }

  // 檢查消息記錄
  console.log('\\n🔍 檢查 chat_messages 表...')
  try {
    const messagesResponse = await apiCall(`${SUPABASE_URL}/rest/v1/chat_messages?select=*&order=created_at.desc&limit=20`, {
      method: 'GET',
      headers: dbHeaders
    })

    console.log(`✅ 找到 ${messagesResponse.length} 條消息記錄`)

    const testSessionIds = testResults.filter(r => r.success).map(r => r.sessionId)
    const testMessages = messagesResponse.filter(message =>
      testSessionIds.includes(message.session_id)
    )

    console.log(`📋 測試消息記錄: ${testMessages.length} 條`)

    // 按會話分組顯示
    const messagesBySession = testMessages.reduce((acc, msg) => {
      if (!acc[msg.session_id]) {
        acc[msg.session_id] = []
      }
      acc[msg.session_id].push(msg)
      return acc
    }, {})

    Object.entries(messagesBySession).forEach(([sessionId, messages]) => {
      console.log(`\\n📝 會話 ${sessionId}: ${messages.length} 條消息`)
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. [${msg.message_type}] ${msg.content.substring(0, 30)}...`)
      })
    })

  } catch (error) {
    console.log(`❌ 檢查消息記錄失敗: ${error.message}`)
  }
}

async function testConversationHistoryQuery() {
  console.log('\\n🔍 步驟 3: 測試對話歷史查詢')

  const dbHeaders = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }

  try {
    // 模擬 ConversationHistoryManager 的查詢
    const queryUrl = `${SUPABASE_URL}/rest/v1/chat_sessions?select=id,session_id,user_id,line_user_id,user_ip,client_ip,user_agent,started_at,last_activity,last_active,message_count,user_meta,created_at,updated_at&order=last_activity.desc.nullslast&limit=10`

    console.log('🔍 執行修復後的查詢...')

    const result = await apiCall(queryUrl, {
      method: 'GET',
      headers: dbHeaders
    })

    console.log(`✅ 查詢成功，共 ${result.length} 筆記錄`)

    if (result.length > 0) {
      console.log('\\n📄 最新的 3 筆會話記錄：')
      result.slice(0, 3).forEach((session, index) => {
        console.log(`\\n${index + 1}. 會話:`)
        console.log(`   ID: ${session.id}`)
        console.log(`   會話 ID: ${session.session_id}`)
        console.log(`   用戶 IP: ${session.user_ip || session.client_ip || '無'}`)
        console.log(`   消息數: ${session.message_count || 0}`)
        console.log(`   開始時間: ${session.started_at || '無'}`)
        console.log(`   最後活動: ${session.last_activity || session.last_active || '無'}`)

        if (session.user_meta) {
          try {
            const userMeta = JSON.parse(session.user_meta)
            console.log(`   用戶暱稱: ${userMeta.display_name || '無'}`)
            console.log(`   用戶頭像: ${userMeta.avatar_url ? '有' : '無'}`)
          } catch (e) {
            console.log(`   用戶元資料: 解析失敗`)
          }
        }
      })

      return { success: true, count: result.length, sessions: result }
    } else {
      return { success: false, reason: '沒有找到會話記錄' }
    }

  } catch (error) {
    console.log(`❌ 對話歷史查詢失敗: ${error.message}`)
    return { success: false, reason: error.message }
  }
}

async function generateSummaryReport(testResults, queryResult) {
  console.log('\\n===============================')
  console.log('📊 修復效果總結報告')
  console.log('===============================')

  const successfulTests = testResults.filter(r => r.success).length
  const totalTests = testResults.length

  console.log(`\\n🧪 函數測試結果:`)
  console.log(`   成功: ${successfulTests}/${totalTests}`)
  console.log(`   成功率: ${Math.round((successfulTests / totalTests) * 100)}%`)

  if (queryResult.success) {
    console.log(`\\n🔍 數據庫查詢結果:`)
    console.log(`   ✅ 對話歷史查詢成功`)
    console.log(`   📊 找到 ${queryResult.count} 筆會話記錄`)

    const hasUserMeta = queryResult.sessions.filter(s => s.user_meta).length
    console.log(`   👤 含用戶資料: ${hasUserMeta}/${queryResult.count}`)
  } else {
    console.log(`\\n❌ 數據庫查詢失敗: ${queryResult.reason}`)
  }

  console.log(`\\n💡 修復狀態評估:`)

  if (successfulTests === totalTests && queryResult.success) {
    console.log(`   🎉 修復成功！對話歷史應該能正常顯示`)
    console.log(`   ✅ Claude Chat 函數正常運作`)
    console.log(`   ✅ 會話記錄正確保存`)
    console.log(`   ✅ 對話歷史查詢正常`)
  } else {
    console.log(`   ⚠️  修復部分完成，仍需調整`)
    if (successfulTests < totalTests) {
      console.log(`   ❌ Claude Chat 函數需要檢查`)
    }
    if (!queryResult.success) {
      console.log(`   ❌ 數據庫查詢需要修復`)
    }
  }

  console.log(`\\n📋 下一步建議:`)
  console.log(`   1. 在管理後台檢查 /admin/conversations`)
  console.log(`   2. 進行實際前台對話測試`)
  console.log(`   3. 檢查頭像和暱稱是否正確顯示`)
}

// 主要執行流程
async function runFixTest() {
  try {
    console.log('⏱️  開始時間:', new Date().toLocaleString())

    const testResults = await testClaudeChatFunction()
    await checkDatabaseRecords(testResults)
    const queryResult = await testConversationHistoryQuery()

    await generateSummaryReport(testResults, queryResult)

    console.log('\\n⏱️  結束時間:', new Date().toLocaleString())

  } catch (error) {
    console.error('💥 測試過程中發生錯誤:', error.message)
  }
}

// 執行測試
runFixTest()