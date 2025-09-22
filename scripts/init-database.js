#!/usr/bin/env node

/**
 * 資料庫初始化腳本
 * 用於在正式環境中創建必要的資料表結構
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY 環境變數')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initDatabase() {
  console.log('🚀 開始初始化資料庫...')
  console.log('📍 資料庫 URL:', supabaseUrl)

  try {
    // 1. 檢查 stores 表是否存在 is_partner_store 欄位
    console.log('\n📋 檢查 stores 表結構...')
    
    const { data: storesData, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1)

    if (storesError) {
      console.log('⚠️ stores 表不存在或無法訪問，需要創建表結構')
      console.log('請在 Supabase 控制台中執行 database-structure.sql 腳本')
    } else {
      console.log('✅ stores 表存在')
      
      // 檢查是否有 is_partner_store 欄位
      if (storesData.length > 0 && storesData[0].hasOwnProperty('is_partner_store')) {
        console.log('✅ is_partner_store 欄位已存在')
      } else {
        console.log('⚠️ is_partner_store 欄位不存在，需要添加')
        console.log('請在 Supabase 控制台中執行以下 SQL:')
        console.log('ALTER TABLE stores ADD COLUMN is_partner_store BOOLEAN DEFAULT false;')
      }
    }

    // 2. 檢查其他必要的表
    const tables = ['line_users', 'chat_sessions', 'chat_messages', 'admins', 'ai_configs', 'training_data', 'faqs', 'quick_questions', 'activities', 'interaction_filters']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`⚠️ ${table} 表不存在`)
        } else {
          console.log(`✅ ${table} 表存在`)
        }
      } catch (err) {
        console.log(`⚠️ ${table} 表檢查失敗:`, err.message)
      }
    }

    // 3. 測試插入測試數據
    console.log('\n🧪 測試資料庫連接...')
    
    const testData = {
      store_name: '測試商家',
      owner: '測試',
      role: '測試',
      category: '測試',
      address: '測試地址',
      phone: '000-000-0000',
      business_hours: '測試時間',
      services: '測試服務',
      features: '測試特色',
      is_safe_store: false,
      has_member_discount: false,
      is_partner_store: false,
      facebook_url: '',
      website_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: insertData, error: insertError } = await supabase
      .from('stores')
      .insert([testData])
      .select()

    if (insertError) {
      console.log('❌ 插入測試數據失敗:', insertError.message)
    } else {
      console.log('✅ 插入測試數據成功')
      
      // 刪除測試數據
      const { error: deleteError } = await supabase
        .from('stores')
        .delete()
        .eq('id', insertData[0].id)
      
      if (deleteError) {
        console.log('⚠️ 刪除測試數據失敗:', deleteError.message)
      } else {
        console.log('✅ 測試數據已清理')
      }
    }

    console.log('\n🎉 資料庫初始化完成！')
    console.log('\n📝 下一步：')
    console.log('1. 在 Supabase 控制台中執行 database-structure.sql')
    console.log('2. 確保所有表結構正確創建')
    console.log('3. 運行 npm run build 構建專案')
    console.log('4. 部署到正式環境')

  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error.message)
    process.exit(1)
  }
}

initDatabase()
