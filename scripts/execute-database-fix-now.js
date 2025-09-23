#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function executeDatabaseFix() {
  console.log('🔧 執行資料庫結構修復...')
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
      return false
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
          console.log('🎯 肯塔基美語當前狀態:', {
            id: kentucky.id,
            store_name: kentucky.store_name,
            is_partner_store: kentucky.is_partner_store
          })
          
          if (kentucky.is_partner_store) {
            console.log('✅ 肯塔基美語已設為特約商家')
            return true
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
              return false
            } else {
              console.log('✅ 成功將肯塔基美語設為特約商家')
              console.log('📝 更新結果:', updateData[0])
              return true
            }
          }
        } else {
          console.log('❌ 無法找到肯塔基美語記錄')
          return false
        }
      } else {
        console.log('❌ is_partner_store 欄位不存在！')
        console.log('')
        console.log('🚨 需要手動執行 SQL 修復！')
        console.log('')
        console.log('📋 執行步驟:')
        console.log('1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/sql')
        console.log('2. 複製以下 SQL 並執行:')
        console.log('')
        console.log('ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN DEFAULT false;')
        console.log("UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';")
        console.log('')
        console.log('3. 確認執行成功')
        console.log('')
        console.log('⚠️ 由於權限限制，無法自動執行 DDL 語句')
        return false
      }
    }

    return false

  } catch (error) {
    console.log('❌ 資料庫修復執行失敗:', error.message)
    return false
  }
}

executeDatabaseFix().then(success => {
  if (success) {
    console.log('')
    console.log('🎉 資料庫修復成功！')
    console.log('🎯 下一步: 執行 Edge Function 修復')
  } else {
    console.log('')
    console.log('⚠️ 資料庫修復需要手動執行')
    console.log('🔧 請前往 Supabase Dashboard 執行 SQL 修復')
    console.log('')
    console.log('📋 修復後請執行: node scripts/verify-database-fix.js')
  }
})
