#!/usr/bin/env node

/**
 * 診斷對話歷史管理頁面空白問題
 */

import https from 'https';

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

// 測試 Supabase 表是否存在
async function testTable(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'vqcuwjfxoxjgsrueqodj.supabase.co',
      port: 443,
      path: `/rest/v1/${tableName}?select=*&limit=1`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          table: tableName,
          status: res.statusCode,
          data: data.substring(0, 200)
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 診斷對話歷史問題
async function diagnoseConversationHistory() {
  console.log('🔍 診斷對話歷史管理頁面空白問題...\n');
  
  // 1. 測試必要的表是否存在
  console.log('1️⃣ 檢查資料庫表是否存在:');
  const tables = ['chat_sessions', 'chat_messages', 'user_profiles', 'line_users'];
  
  for (const table of tables) {
    try {
      const result = await testTable(table);
      console.log(`   📋 ${table}: ${result.status === 200 ? '✅ 存在' : '❌ 不存在/錯誤'} (狀態: ${result.status})`);
      if (result.status !== 200) {
        console.log(`      錯誤: ${result.data}`);
      }
    } catch (error) {
      console.log(`   ❌ ${table}: 請求失敗 - ${error.message}`);
    }
  }
  
  console.log('\n2️⃣ 檢查 chat_sessions 表結構:');
  try {
    const result = await testTable('chat_sessions');
    if (result.status === 200) {
      console.log('   ✅ chat_sessions 表存在');
      // 嘗試獲取更多資料
      const detailResult = await testTable('chat_sessions?select=id,user_id,started_at,message_count&limit=5');
      console.log(`   📊 樣本資料: ${detailResult.data.substring(0, 100)}...`);
    } else {
      console.log(`   ❌ chat_sessions 表不存在或無法訪問`);
    }
  } catch (error) {
    console.log(`   ❌ 檢查失敗: ${error.message}`);
  }
  
  console.log('\n3️⃣ 檢查 user_profiles 表:');
  try {
    const result = await testTable('user_profiles');
    if (result.status === 200) {
      console.log('   ✅ user_profiles 表存在');
    } else {
      console.log(`   ❌ user_profiles 表不存在或無法訪問`);
    }
  } catch (error) {
    console.log(`   ❌ 檢查失敗: ${error.message}`);
  }
  
  console.log('\n4️⃣ 檢查前端組件邏輯:');
  console.log('   📁 檢查 src/components/admin/ConversationHistoryManager.tsx');
  console.log('   🔍 檢查 loadConversations 函數');
  console.log('   🔍 檢查 Supabase 查詢語法');
  
  console.log('\n5️⃣ 可能的問題原因:');
  console.log('   ❓ chat_sessions 表不存在');
  console.log('   ❓ user_profiles 表不存在');
  console.log('   ❓ JOIN 查詢語法錯誤');
  console.log('   ❓ 權限問題');
  console.log('   ❓ 表結構不匹配');
  
  console.log('\n6️⃣ 建議的修復步驟:');
  console.log('   1. 檢查 Supabase 資料庫表是否已建立');
  console.log('   2. 檢查表結構是否正確');
  console.log('   3. 檢查前端查詢語法');
  console.log('   4. 添加錯誤處理和回退邏輯');
  console.log('   5. 使用 Mock 資料作為備選方案');
}

// 執行診斷
diagnoseConversationHistory();
