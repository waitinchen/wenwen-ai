#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function autoFixAllIssues() {
  console.log('🚀 自動修復所有問題開始...')
  console.log('')

  let databaseFixed = false
  let edgeFunctionFixed = false

  // 1. 檢查並修復資料庫
  console.log('📋 步驟 1: 檢查資料庫結構...')
  try {
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1)

    if (storesError) {
      console.log('❌ stores 表錯誤:', storesError.message)
    } else if (storesData.length > 0) {
      const firstStore = storesData[0]
      if (!firstStore.hasOwnProperty('is_partner_store')) {
        console.log('❌ is_partner_store 欄位不存在！')
        console.log('')
        console.log('🔧 請立即執行以下 SQL 修復:')
        console.log('')
        console.log('-- 複製以下 SQL 到 Supabase Dashboard > SQL Editor 執行')
        console.log('ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN DEFAULT false;')
        console.log("UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';")
        console.log('')
        console.log('📋 執行位置: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/sql')
      } else {
        console.log('✅ is_partner_store 欄位已存在')
        
        // 檢查肯塔基美語狀態
        const { data: kentuckyData, error: kentuckyError } = await supabase
          .from('stores')
          .select('*')
          .ilike('store_name', '%肯塔基%')

        if (!kentuckyError && kentuckyData.length > 0) {
          const kentucky = kentuckyData[0]
          if (kentucky.is_partner_store) {
            console.log('✅ 肯塔基美語已設為特約商家')
            databaseFixed = true
          } else {
            console.log('⚠️ 肯塔基美語不是特約商家！')
            console.log('🔧 請執行: UPDATE stores SET is_partner_store = true WHERE store_name ILIKE \'%肯塔基%\';')
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ 資料庫檢查失敗:', error.message)
  }

  console.log('')
  
  // 2. 檢查 Edge Function
  console.log('🤖 步驟 2: 檢查 Edge Function...')
  try {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        message: '我想學美語',
        sessionId: 'auto-fix-test',
        line_uid: 'test-user'
      }
    })

    if (error) {
      console.log('❌ Edge Function 錯誤:', error.message)
    } else {
      const response = data?.data?.response || data?.response || data
      console.log('📝 回應:', response.substring(0, 100) + '...')
      
      if (response.includes('肯塔基') || response.includes('Kentucky')) {
        console.log('✅ Edge Function 正確推薦肯塔基美語')
        edgeFunctionFixed = true
      } else {
        console.log('❌ Edge Function 沒有推薦肯塔基美語！')
        console.log('')
        console.log('🔧 請立即重新部署 Edge Function:')
        console.log('1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions')
        console.log('2. 找到 claude-chat 函數')
        console.log('3. 點擊 "Deploy" 按鈕')
        console.log('4. 確認部署成功')
      }
    }
  } catch (error) {
    console.log('❌ Edge Function 測試失敗:', error.message)
  }

  console.log('')
  
  // 3. 修復狀態總結
  console.log('📊 修復狀態總結:')
  console.log('─'.repeat(40))
  console.log('資料庫修復:', databaseFixed ? '✅ 完成' : '❌ 需要手動修復')
  console.log('Edge Function 修復:', edgeFunctionFixed ? '✅ 完成' : '❌ 需要重新部署')
  console.log('─'.repeat(40))

  if (databaseFixed && edgeFunctionFixed) {
    console.log('🎉 所有問題已修復！')
    console.log('')
    console.log('✅ 修復結果:')
    console.log('- 資料庫: is_partner_store 欄位正常')
    console.log('- 肯塔基美語: 已設為特約商家')
    console.log('- Edge Function: 優先推薦邏輯生效')
    console.log('')
    console.log('🎯 現在可以測試:')
    console.log('1. 管理後台應該顯示 "特約商家: 1"')
    console.log('2. 前台查詢 "我想學美語" 應該優先推薦肯塔基美語')
  } else {
    console.log('⚠️ 部分問題需要手動修復')
    console.log('')
    console.log('🔧 下一步行動:')
    if (!databaseFixed) {
      console.log('1. 執行資料庫 SQL 修復')
    }
    if (!edgeFunctionFixed) {
      console.log('2. 重新部署 Edge Function')
    }
    console.log('3. 重新執行此腳本驗證')
  }

  console.log('')
  console.log('📋 詳細修復指南: scripts/COMPLETE_FIX_CHECKLIST.md')
}

autoFixAllIssues()
