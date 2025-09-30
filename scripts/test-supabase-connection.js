// 測試 Supabase 連線和權限
import { createClient } from '@supabase/supabase-js';

console.log('🔍 測試 Supabase 連線和權限');
console.log('============================================================');

// 請替換為您的實際 Supabase 設定
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_FgIuCi_gWTgrLuobRdeyeA_xO1b4ecq';

async function testSupabaseConnection() {
  console.log('📝 測試 Supabase 連線...');
  
  if (SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.log('❌ 請先在腳本中設定正確的 SUPABASE_SERVICE_ROLE_KEY');
    console.log('   前往 Supabase Dashboard → Settings → API');
    console.log('   複製 service_role key 並替換腳本中的值');
    return;
  }
  
  try {
    // 創建 Supabase 客戶端
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('✅ Supabase 客戶端創建成功');
    
    // 測試 1: 檢查 quick_questions 表
    console.log('\n📝 測試 1: 檢查 quick_questions 表...');
    const { data: questions, error: questionsError } = await supabase
      .from('quick_questions')
      .select('*')
      .limit(5);
    
    if (questionsError) {
      console.log('❌ quick_questions 表查詢失敗:', questionsError.message);
      if (questionsError.message.includes('relation "quick_questions" does not exist')) {
        console.log('   → 表不存在，需要創建 quick_questions 表');
      } else if (questionsError.message.includes('permission denied')) {
        console.log('   → 權限不足，檢查 Service Role Key');
      }
    } else {
      console.log('✅ quick_questions 表查詢成功');
      console.log('   找到', questions.length, '筆記錄');
      if (questions.length > 0) {
        console.log('   範例記錄:', questions[0]);
      }
    }
    
    // 測試 2: 檢查 admin_sessions 表
    console.log('\n📝 測試 2: 檢查 admin_sessions 表...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('admin_sessions')
      .select('*')
      .limit(5);
    
    if (sessionsError) {
      console.log('❌ admin_sessions 表查詢失敗:', sessionsError.message);
      if (sessionsError.message.includes('relation "admin_sessions" does not exist')) {
        console.log('   → 表不存在，需要創建 admin_sessions 表');
      }
    } else {
      console.log('✅ admin_sessions 表查詢成功');
      console.log('   找到', sessions.length, '筆記錄');
    }
    
    // 測試 3: 檢查 admins 表
    console.log('\n📝 測試 3: 檢查 admins 表...');
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*')
      .limit(5);
    
    if (adminsError) {
      console.log('❌ admins 表查詢失敗:', adminsError.message);
      if (adminsError.message.includes('relation "admins" does not exist')) {
        console.log('   → 表不存在，需要創建 admins 表');
      }
    } else {
      console.log('✅ admins 表查詢成功');
      console.log('   找到', admins.length, '筆記錄');
    }
    
    // 測試 4: 測試寫入權限
    console.log('\n📝 測試 4: 測試寫入權限...');
    const testData = {
      question: '測試問題 - ' + new Date().toISOString(),
      display_order: 999,
      is_enabled: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('quick_questions')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.log('❌ 寫入測試失敗:', insertError.message);
      if (insertError.message.includes('permission denied')) {
        console.log('   → 寫入權限不足，檢查 RLS 設定');
      }
    } else {
      console.log('✅ 寫入測試成功');
      console.log('   插入的記錄:', insertData[0]);
      
      // 清理測試資料
      const { error: deleteError } = await supabase
        .from('quick_questions')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.log('⚠️ 清理測試資料失敗:', deleteError.message);
      } else {
        console.log('✅ 測試資料清理完成');
      }
    }
    
  } catch (error) {
    console.log('❌ 連線測試失敗:', error.message);
  }
}

// 提供修復建議
function provideFixSuggestions() {
  console.log('\n📝 修復建議:');
  console.log('============================================================');
  
  console.log('如果表不存在:');
  console.log('1. 前往 Supabase Dashboard → SQL Editor');
  console.log('2. 執行建表語句');
  console.log('3. 確認表結構正確');
  
  console.log('\n如果權限不足:');
  console.log('1. 檢查 RLS (Row Level Security) 設定');
  console.log('2. 確認 Service Role 有 bypass RLS 權限');
  console.log('3. 檢查 Service Role Key 是否正確');
  
  console.log('\n如果連線失敗:');
  console.log('1. 確認 SUPABASE_URL 正確');
  console.log('2. 確認 SUPABASE_SERVICE_ROLE_KEY 正確');
  console.log('3. 檢查網路連線');
}

// 執行測試
testSupabaseConnection().then(() => {
  provideFixSuggestions();
  
  console.log('\n============================================================');
  console.log('🎯 測試完成！請根據上述結果進行修復。');
  console.log('============================================================');
});
