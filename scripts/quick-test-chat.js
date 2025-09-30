#!/usr/bin/env node

/**
 * 快速測試腳本 - 檢查對話歷史修復是否成功
 * 這個腳本會快速測試基本功能，適合修復後立即驗證
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 請先設定環境變數: set SUPABASE_SERVICE_ROLE_KEY=your_key')
  process.exit(1)
}

console.log('⚡ 快速測試對話歷史修復')
console.log('========================')

async function quickTest() {
  const headers = {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }

  try {
    // 1. 快速測試聊天功能
    console.log('\\n🤖 測試聊天功能...')
    const chatResponse = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: { content: '你好，測試對話歷史修復' },
        session_id: `quick-test-${Date.now()}`,
        user_meta: {
          display_name: '測試用戶',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
        }
      })
    })

    if (chatResponse.ok) {
      const chatData = await chatResponse.json()
      console.log('✅ 聊天功能正常')
      console.log(`   會話ID: ${chatData.data.session_id}`)

      // 2. 等待資料庫同步
      console.log('\\n⏱️  等待資料庫同步...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 3. 檢查會話是否記錄
      console.log('\\n🔍 檢查會話記錄...')
      const dbHeaders = {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }

      const sessionCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/chat_sessions?session_id=eq.${chatData.data.session_id}`,
        { headers: dbHeaders }
      )

      if (sessionCheck.ok) {
        const sessions = await sessionCheck.json()
        if (sessions.length > 0) {
          console.log('✅ 會話記錄正常')
          console.log(`   記錄到的會話: ${sessions[0].session_id}`)
          console.log(`   消息數: ${sessions[0].message_count}`)
          console.log(`   用戶資料: ${sessions[0].user_meta ? '有' : '無'}`)

          // 4. 檢查管理後台查詢
          console.log('\\n📋 測試管理後台查詢...')
          const adminQuery = await fetch(
            `${SUPABASE_URL}/rest/v1/chat_sessions?select=*&order=last_activity.desc.nullslast&limit=5`,
            { headers: dbHeaders }
          )

          if (adminQuery.ok) {
            const adminData = await adminQuery.json()
            console.log('✅ 管理後台查詢正常')
            console.log(`   可查詢到 ${adminData.length} 個會話`)

            console.log('\\n🎉 修復驗證成功！')
            console.log('========================')
            console.log('✅ 聊天功能正常運作')
            console.log('✅ 會話記錄正確保存')
            console.log('✅ 管理後台查詢正常')
            console.log('\\n💡 現在可以到管理後台 /admin/conversations 查看對話歷史')

          } else {
            console.log('❌ 管理後台查詢失敗')
          }
        } else {
          console.log('❌ 未找到會話記錄')
        }
      } else {
        console.log('❌ 無法檢查會話記錄')
      }

    } else {
      console.log('❌ 聊天功能異常')
    }

  } catch (error) {
    console.error('💥 測試失敗:', error.message)
  }
}

quickTest()