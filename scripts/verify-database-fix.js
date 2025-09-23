#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function verifyDatabaseFix() {
  console.log('🔍 驗證資料庫修復結果...')
  console.log('')

  try {
    // 1. 檢查 is_partner_store 欄位
    console.log('📋 檢查 is_partner_store 欄位...')
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
      
      if (firstStore.hasOwnProperty('is_partner_store')) {
        console.log('✅ is_partner_store 欄位已存在')
      } else {
        console.log('❌ is_partner_store 欄位不存在')
        return false
      }
    }

    // 2. 檢查肯塔基美語狀態
    console.log('🎯 檢查肯塔基美語狀態...')
    const { data: kentuckyData, error: kentuckyError } = await supabase
      .from('stores')
      .select('*')
      .ilike('store_name', '%肯塔基%')

    if (kentuckyError) {
      console.log('❌ 查詢肯塔基美語錯誤:', kentuckyError.message)
      return false
    }

    if (kentuckyData.length === 0) {
      console.log('❌ 沒有找到肯塔基美語記錄')
      return false
    }

    const kentucky = kentuckyData[0]
    console.log('📝 肯塔基美語狀態:', {
      id: kentucky.id,
      store_name: kentucky.store_name,
      is_partner_store: kentucky.is_partner_store
    })

    if (kentucky.is_partner_store) {
      console.log('✅ 肯塔基美語已設為特約商家')
    } else {
      console.log('❌ 肯塔基美語不是特約商家')
      return false
    }

    // 3. 統計特約商家數量
    console.log('📊 統計特約商家數量...')
    const { data: allStoresData, error: allStoresError } = await supabase
      .from('stores')
      .select('id, store_name, is_partner_store')

    if (allStoresError) {
      console.log('❌ 查詢所有商家錯誤:', allStoresError.message)
      return false
    }

    const partnerStores = allStoresData.filter(store => store.is_partner_store)
    console.log(`📈 特約商家總數: ${partnerStores.length}`)
    
    if (partnerStores.length > 0) {
      console.log('📋 特約商家列表:')
      partnerStores.forEach(store => {
        console.log(`  - ${store.store_name} (ID: ${store.id})`)
      })
    }

    console.log('')
    console.log('🎉 資料庫修復驗證成功！')
    console.log('✅ is_partner_store 欄位存在')
    console.log('✅ 肯塔基美語設為特約商家')
    console.log(`✅ 特約商家總數: ${partnerStores.length}`)
    
    return true

  } catch (error) {
    console.log('❌ 資料庫修復驗證失敗:', error.message)
    return false
  }
}

verifyDatabaseFix()
