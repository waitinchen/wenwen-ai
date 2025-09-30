#!/usr/bin/env node

/**
 * 檢查對話歷史修復狀態
 * 快速診斷修復是否成功
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 請先設定環境變數: set SUPABASE_SERVICE_ROLE_KEY=your_key')
  process.exit(1)
}

console.log('🔍 檢查對話歷史修復狀態')
console.log('========================')
console.log(`檢查時間: ${new Date().toLocaleString()}`)

async function checkStatus() {
  const dbHeaders = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }

  let score = 0
  const maxScore = 6

  try {
    // 1. 檢查 claude-chat 函數是否正常
    console.log('\\n🤖 檢查 Claude Chat 函數...')
    try {
      const chatResponse = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: { content: '健康檢查' },
          session_id: `health-check-${Date.now()}`
        })
      })

      if (chatResponse.ok) {
        console.log('✅ Claude Chat 函數運行正常')
        score++
      } else {
        console.log(`❌ Claude Chat 函數異常: ${chatResponse.status}`)
      }
    } catch (error) {
      console.log(`❌ Claude Chat 函數無法訪問: ${error.message}`)
    }

    // 2. 檢查 chat_sessions 表格
    console.log('\\n📊 檢查 chat_sessions 表格...')
    try {
      const sessionsResponse = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?select=count&limit=1`, {
        method: 'GET',
        headers: { ...dbHeaders, 'Prefer': 'count=exact' }
      })

      if (sessionsResponse.ok) {
        const count = sessionsResponse.headers.get('content-range')?.split('/')[1] || '0'
        console.log(`✅ chat_sessions 表格可訪問，共 ${count} 筆記錄`)
        if (parseInt(count) > 0) score++
      } else {
        console.log(`❌ chat_sessions 表格訪問失敗: ${sessionsResponse.status}`)
      }
    } catch (error) {
      console.log(`❌ chat_sessions 表格檢查失敗: ${error.message}`)
    }

    // 3. 檢查 chat_messages 表格
    console.log('\\n💬 檢查 chat_messages 表格...')
    try {
      const messagesResponse = await fetch(`${SUPABASE_URL}/rest/v1/chat_messages?select=count&limit=1`, {
        method: 'GET',
        headers: { ...dbHeaders, 'Prefer': 'count=exact' }
      })

      if (messagesResponse.ok) {
        const count = messagesResponse.headers.get('content-range')?.split('/')[1] || '0'
        console.log(`✅ chat_messages 表格可訪問，共 ${count} 筆記錄`)
        if (parseInt(count) > 0) score++
      } else {
        console.log(`❌ chat_messages 表格訪問失敗: ${messagesResponse.status}`)
      }
    } catch (error) {
      console.log(`❌ chat_messages 表格檢查失敗: ${error.message}`)
    }

    // 4. 檢查最近的會話記錄
    console.log('\\n⏰ 檢查最近的會話記錄...')
    try {
      const recentSessions = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?select=*&order=created_at.desc&limit=5`, {
        method: 'GET',
        headers: dbHeaders
      })

      if (recentSessions.ok) {
        const sessions = await recentSessions.json()
        console.log(`✅ 最近 5 筆會話記錄:`)

        if (sessions.length > 0) {
          score++
          sessions.forEach((session, index) => {
            const timeAgo = Math.floor((Date.now() - new Date(session.created_at || session.started_at).getTime()) / 60000)
            console.log(`   ${index + 1}. ${session.session_id} (${timeAgo}分鐘前, ${session.message_count || 0}條消息)`)
          })
        } else {
          console.log('   沒有找到會話記錄')
        }
      } else {
        console.log(`❌ 無法獲取會話記錄: ${recentSessions.status}`)
      }
    } catch (error) {
      console.log(`❌ 會話記錄檢查失敗: ${error.message}`)
    }

    // 5. 檢查管理後台查詢兼容性
    console.log('\\n🔍 檢查管理後台查詢兼容性...')
    try {
      const adminQuery = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?select=id,session_id,user_id,user_ip,client_ip,started_at,last_activity,last_active,message_count,user_meta&order=last_activity.desc.nullslast,last_active.desc.nullslast,created_at.desc&limit=5`, {
        method: 'GET',
        headers: dbHeaders
      })

      if (adminQuery.ok) {
        const adminSessions = await adminQuery.json()
        console.log(`✅ 管理後台查詢兼容，可查詢 ${adminSessions.length} 筆記錄`)
        score++

        if (adminSessions.length > 0) {
          console.log('   樣本記錄:')
          adminSessions.slice(0, 2).forEach((session, index) => {
            console.log(`   ${index + 1}. 會話: ${session.session_id || session.id}`)
            console.log(`      用戶IP: ${session.user_ip || session.client_ip || '未知'}`)
            console.log(`      消息數: ${session.message_count || 0}`)
            console.log(`      用戶資料: ${session.user_meta ? '有' : '無'}`)
          })
        }
      } else {
        console.log(`❌ 管理後台查詢失敗: ${adminQuery.status}`)
      }
    } catch (error) {
      console.log(`❌ 管理後台查詢檢查失敗: ${error.message}`)
    }

    // 6. 檢查用戶資料記錄功能
    console.log('\\n👤 檢查用戶資料記錄功能...')
    try {
      const sessionsWithMeta = await fetch(`${SUPABASE_URL}/rest/v1/chat_sessions?select=user_meta&user_meta=not.is.null&limit=5`, {
        method: 'GET',
        headers: dbHeaders
      })

      if (sessionsWithMeta.ok) {
        const metaSessions = await sessionsWithMeta.json()
        console.log(`✅ 找到 ${metaSessions.length} 個含用戶資料的會話`)
        if (metaSessions.length > 0) {
          score++
          console.log('   用戶資料樣本:')
          metaSessions.slice(0, 2).forEach((session, index) => {
            try {
              const userMeta = JSON.parse(session.user_meta)
              console.log(`   ${index + 1}. 暱稱: ${userMeta.display_name || '無'}, 頭像: ${userMeta.avatar_url ? '有' : '無'}`)
            } catch (e) {
              console.log(`   ${index + 1}. 用戶資料解析失敗`)
            }
          })
        } else {
          console.log('   沒有找到含用戶資料的會話')
        }
      } else {
        console.log(`❌ 用戶資料檢查失敗: ${sessionsWithMeta.status}`)
      }
    } catch (error) {
      console.log(`❌ 用戶資料檢查失敗: ${error.message}`)
    }

    // 結果評估
    console.log('\\n========================')
    console.log('📊 修復狀態評估')
    console.log('========================')
    console.log(`得分: ${score}/${maxScore}`)

    if (score >= 5) {
      console.log('🎉 修復成功！對話歷史應該能正常顯示')
      console.log('💡 建議：')
      console.log('   1. 到管理後台 /admin/conversations 檢查')
      console.log('   2. 進行前台對話測試')
      console.log('   3. 檢查頭像和暱稱顯示')
    } else if (score >= 3) {
      console.log('⚠️  修復部分成功，需要進一步檢查')
      console.log('💡 可能的問題：')
      if (score < 2) console.log('   - Claude Chat 函數可能未正確部署')
      if (score < 4) console.log('   - 數據庫記錄功能可能有問題')
      console.log('💡 建議重新執行修復腳本')
    } else {
      console.log('❌ 修復失敗，需要手動檢查')
      console.log('💡 建議：')
      console.log('   1. 檢查 Supabase 連接是否正常')
      console.log('   2. 檢查 Service Role Key 是否正確')
      console.log('   3. 檢查表格權限設定')
    }

    console.log('\\n⏱️  檢查完成時間:', new Date().toLocaleString())

  } catch (error) {
    console.error('💥 狀態檢查失敗:', error.message)
  }
}

checkStatus()