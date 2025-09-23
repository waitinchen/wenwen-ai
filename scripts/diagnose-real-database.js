#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function diagnoseDatabase() {
  console.log('🔍 診斷真實 Supabase 資料庫狀態...')
  console.log('📍 資料庫 URL:', SUPABASE_URL)
  console.log('')

  try {
    // 1. 檢查 stores 表是否存在
    console.log('📋 1. 檢查 stores 表...')
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(5)

    if (storesError) {
      console.log('❌ stores 表錯誤:', storesError.message)
      return
    }

    console.log('✅ stores 表存在')
    console.log('📊 商家總數:', storesData.length)
    
    if (storesData.length > 0) {
      console.log('📝 第一個商家資料:', JSON.stringify(storesData[0], null, 2))
      
      // 檢查是否有 is_partner_store 欄位
      if (storesData[0].hasOwnProperty('is_partner_store')) {
        console.log('✅ is_partner_store 欄位存在')
        
        // 統計特約商家數量
        const partnerStores = storesData.filter(store => store.is_partner_store)
        console.log('🏆 特約商家數量:', partnerStores.length)
        
        if (partnerStores.length > 0) {
          console.log('📋 特約商家列表:')
          partnerStores.forEach(store => {
            console.log(`  - ${store.store_name} (ID: ${store.id}) - is_partner_store: ${store.is_partner_store}`)
          })
        } else {
          console.log('⚠️ 沒有找到特約商家')
        }
      } else {
        console.log('❌ is_partner_store 欄位不存在！')
        console.log('🔧 需要執行 SQL: ALTER TABLE stores ADD COLUMN is_partner_store BOOLEAN DEFAULT false;')
      }
    }

    // 2. 檢查肯塔基美語的狀態
    console.log('')
    console.log('🎯 2. 檢查肯塔基美語狀態...')
    const { data: kentuckyData, error: kentuckyError } = await supabase
      .from('stores')
      .select('*')
      .ilike('store_name', '%肯塔基%')

    if (kentuckyError) {
      console.log('❌ 查詢肯塔基美語錯誤:', kentuckyError.message)
    } else if (kentuckyData.length === 0) {
      console.log('❌ 沒有找到肯塔基美語！')
    } else {
      console.log('✅ 找到肯塔基美語:')
      kentuckyData.forEach(store => {
        console.log(`  - ${store.store_name}`)
        console.log(`    ID: ${store.id}`)
        console.log(`    is_partner_store: ${store.is_partner_store}`)
        console.log(`    is_safe_store: ${store.is_safe_store}`)
        console.log(`    has_member_discount: ${store.has_member_discount}`)
        console.log(`    完整資料:`, JSON.stringify(store, null, 2))
      })
    }

    // 3. 檢查 Edge Function 狀態
    console.log('')
    console.log('🤖 3. 測試 Edge Function...')
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: '我想學美語',
          sessionId: 'test-session',
          line_uid: 'test-user'
        }
      })

      if (functionError) {
        console.log('❌ Edge Function 錯誤:', functionError.message)
      } else {
        console.log('✅ Edge Function 正常')
        console.log('📝 回應內容:', functionData?.data?.response || functionData)
      }
    } catch (error) {
      console.log('❌ Edge Function 測試失敗:', error.message)
    }

  } catch (error) {
    console.log('❌ 診斷失敗:', error.message)
  }
}

diagnoseDatabase()
