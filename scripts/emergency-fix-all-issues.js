#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function emergencyFixAllIssues() {
  console.log('🚨 緊急修復所有問題...')
  console.log('')

  // 1. 檢查資料庫結構
  console.log('📋 1. 檢查資料庫結構...')
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
        console.log('-- 添加 is_partner_store 欄位')
        console.log('ALTER TABLE stores ADD COLUMN is_partner_store BOOLEAN DEFAULT false;')
        console.log('')
        console.log('-- 將肯塔基美語設為特約商家')
        console.log("UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';")
        console.log('')
        console.log('📋 執行位置: Supabase Dashboard > SQL Editor')
      } else {
        console.log('✅ is_partner_store 欄位已存在')
        
        // 檢查肯塔基美語狀態
        const { data: kentuckyData, error: kentuckyError } = await supabase
          .from('stores')
          .select('*')
          .ilike('store_name', '%肯塔基%')

        if (!kentuckyError && kentuckyData.length > 0) {
          const kentucky = kentuckyData[0]
          if (!kentucky.is_partner_store) {
            console.log('⚠️ 肯塔基美語不是特約商家！')
            console.log('🔧 請執行: UPDATE stores SET is_partner_store = true WHERE store_name ILIKE \'%肯塔基%\';')
          } else {
            console.log('✅ 肯塔基美語已設為特約商家')
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ 資料庫檢查失敗:', error.message)
  }

  console.log('')
  
  // 2. 測試 Edge Function
  console.log('🤖 2. 測試 Edge Function...')
  try {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        message: '我想學美語',
        sessionId: 'emergency-test',
        line_uid: 'test-user'
      }
    })

    if (error) {
      console.log('❌ Edge Function 錯誤:', error.message)
    } else {
      const response = data?.data?.response || data?.response || data
      console.log('📝 回應:', response.substring(0, 200) + '...')
      
      if (response.includes('肯塔基') || response.includes('Kentucky')) {
        console.log('✅ Edge Function 正確推薦肯塔基美語')
      } else {
        console.log('❌ Edge Function 沒有推薦肯塔基美語！')
        console.log('')
        console.log('🔧 緊急修復步驟:')
        console.log('1. 前往 Supabase Dashboard > Edge Functions > claude-chat')
        console.log('2. 點擊 "Deploy" 按鈕重新部署')
        console.log('3. 確認部署成功')
        console.log('4. 重新測試')
      }
    }
  } catch (error) {
    console.log('❌ Edge Function 測試失敗:', error.message)
  }

  console.log('')
  
  // 3. 總結修復建議
  console.log('📋 3. 修復總結:')
  console.log('')
  console.log('🚨 緊急修復清單:')
  console.log('1. 資料庫: 添加 is_partner_store 欄位')
  console.log('2. 資料庫: 將肯塔基美語設為特約商家')
  console.log('3. Edge Function: 重新部署 claude-chat')
  console.log('')
  console.log('🎯 修復後預期結果:')
  console.log('- 管理後台顯示 "特約商家: 1"')
  console.log('- 前台查詢 "我想學美語" 優先推薦肯塔基美語')
  console.log('- 所有英語相關查詢都推薦肯塔基美語')
  console.log('')
  console.log('⚡ 修復優先級: 最高！立即執行！')
}

emergencyFixAllIssues()
