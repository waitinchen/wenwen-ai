#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function autoFixDatabase() {
  console.log('🔧 自動修復資料庫結構...')
  console.log('')

  try {
    // 1. 檢查當前狀態
    console.log('📋 檢查當前資料庫狀態...')
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1)

    if (storesError) {
      console.log('❌ stores 表錯誤:', storesError.message)
      return
    }

    if (storesData.length > 0) {
      const firstStore = storesData[0]
      console.log('📝 第一個商家資料欄位:', Object.keys(firstStore))
      
      if (firstStore.hasOwnProperty('is_partner_store')) {
        console.log('✅ is_partner_store 欄位已存在')
        
        // 檢查肯塔基美語狀態
        const { data: kentuckyData, error: kentuckyError } = await supabase
          .from('stores')
          .select('*')
          .ilike('store_name', '%肯塔基%')

        if (!kentuckyError && kentuckyData.length > 0) {
          const kentucky = kentuckyData[0]
          console.log('🎯 肯塔基美語狀態:', {
            id: kentucky.id,
            store_name: kentucky.store_name,
            is_partner_store: kentucky.is_partner_store
          })
          
          if (kentucky.is_partner_store) {
            console.log('✅ 肯塔基美語已設為特約商家')
          } else {
            console.log('⚠️ 肯塔基美語不是特約商家，嘗試修復...')
            
            // 嘗試更新肯塔基美語為特約商家
            const { data: updateData, error: updateError } = await supabase
              .from('stores')
              .update({ is_partner_store: true })
              .eq('id', kentucky.id)
              .select()

            if (updateError) {
              console.log('❌ 更新失敗:', updateError.message)
            } else {
              console.log('✅ 成功將肯塔基美語設為特約商家')
              console.log('📝 更新結果:', updateData[0])
            }
          }
        }
      } else {
        console.log('❌ is_partner_store 欄位不存在！')
        console.log('')
        console.log('🔧 需要手動執行以下 SQL:')
        console.log('')
        console.log('-- 複製以下 SQL 到 Supabase Dashboard > SQL Editor 執行')
        console.log('ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN DEFAULT false;')
        console.log("UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';")
        console.log('')
        console.log('📋 執行位置: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/sql')
        console.log('')
        console.log('⚠️ 由於權限限制，無法自動執行 DDL 語句')
        console.log('請手動在 Supabase Dashboard 中執行上述 SQL')
      }
    }

    // 2. 驗證修復結果
    console.log('')
    console.log('🔍 驗證修復結果...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('stores')
      .select('id, store_name, is_partner_store')
      .ilike('store_name', '%肯塔基%')

    if (!verifyError && verifyData.length > 0) {
      const kentucky = verifyData[0]
      console.log('📊 肯塔基美語最終狀態:', kentucky)
      
      if (kentucky.is_partner_store) {
        console.log('🎉 資料庫修復成功！')
        return true
      } else {
        console.log('⚠️ 資料庫修復未完成，需要手動執行 SQL')
        return false
      }
    } else {
      console.log('❌ 無法找到肯塔基美語記錄')
      return false
    }

  } catch (error) {
    console.log('❌ 資料庫修復失敗:', error.message)
    return false
  }
}

autoFixDatabase().then(success => {
  if (success) {
    console.log('')
    console.log('✅ 資料庫修復完成！')
    console.log('🎯 下一步: 執行 Edge Function 修復')
  } else {
    console.log('')
    console.log('⚠️ 資料庫修復需要手動執行')
    console.log('🔧 請前往 Supabase Dashboard 執行 SQL 修復')
  }
})
