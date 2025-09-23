#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function fixDatabaseSchema() {
  console.log('🔧 修復資料庫結構...')
  console.log('')

  try {
    // 1. 檢查 stores 表結構
    console.log('📋 檢查 stores 表結構...')
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1)

    if (storesError) {
      console.log('❌ stores 表錯誤:', storesError.message)
      return
    }

    console.log('✅ stores 表存在')
    
    if (storesData.length > 0) {
      const firstStore = storesData[0]
      console.log('📝 檢查欄位:')
      console.log('  - is_partner_store:', firstStore.hasOwnProperty('is_partner_store'))
      console.log('  - is_safe_store:', firstStore.hasOwnProperty('is_safe_store'))
      console.log('  - has_member_discount:', firstStore.hasOwnProperty('has_member_discount'))
      
      if (!firstStore.hasOwnProperty('is_partner_store')) {
        console.log('')
        console.log('⚠️ is_partner_store 欄位不存在！')
        console.log('🔧 請在 Supabase 控制台中執行以下 SQL:')
        console.log('')
        console.log('-- 添加 is_partner_store 欄位')
        console.log('ALTER TABLE stores ADD COLUMN is_partner_store BOOLEAN DEFAULT false;')
        console.log('')
        console.log('-- 將肯塔基美語設為特約商家')
        console.log("UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';")
        console.log('')
        console.log('-- 驗證更新結果')
        console.log("SELECT id, store_name, is_partner_store FROM stores WHERE store_name ILIKE '%肯塔基%';")
        console.log('')
        console.log('📋 或者使用 Supabase Dashboard:')
        console.log('1. 前往 Supabase Dashboard > Table Editor > stores')
        console.log('2. 點擊 "Add Column"')
        console.log('3. 欄位名稱: is_partner_store')
        console.log('4. 類型: boolean')
        console.log('5. 預設值: false')
        console.log('6. 點擊 "Save"')
        console.log('')
        console.log('7. 然後編輯肯塔基美語的記錄')
        console.log('8. 將 is_partner_store 設為 true')
      } else {
        console.log('✅ is_partner_store 欄位已存在')
        
        // 檢查肯塔基美語的狀態
        const { data: kentuckyData, error: kentuckyError } = await supabase
          .from('stores')
          .select('*')
          .ilike('store_name', '%肯塔基%')

        if (!kentuckyError && kentuckyData.length > 0) {
          const kentucky = kentuckyData[0]
          console.log('')
          console.log('🎯 肯塔基美語狀態:')
          console.log(`  - is_partner_store: ${kentucky.is_partner_store}`)
          
          if (!kentucky.is_partner_store) {
            console.log('⚠️ 肯塔基美語不是特約商家！')
            console.log('🔧 請執行以下 SQL 修復:')
            console.log("UPDATE stores SET is_partner_store = true WHERE store_name ILIKE '%肯塔基%';")
          } else {
            console.log('✅ 肯塔基美語已設為特約商家')
          }
        }
      }
    }

  } catch (error) {
    console.log('❌ 修復失敗:', error.message)
  }
}

fixDatabaseSchema()
