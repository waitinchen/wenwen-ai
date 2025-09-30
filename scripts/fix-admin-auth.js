import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminAuth() {
  try {
    console.log('🔧 修復管理員認證問題...');
    
    // 1. 檢查現有管理員
    const { data: admins, error: adminError } = await supabase.from('admins').select('*');
    
    if (adminError) {
      console.error('❌ 檢查管理員失敗:', adminError);
      return;
    }
    
    console.log('📊 現有管理員數量:', admins.length);
    
    if (admins.length === 0) {
      console.log('❌ 沒有管理員帳號，需要先創建');
      return;
    }
    
    const admin = admins[0];
    console.log('👤 使用管理員:', admin.email);
    
    // 2. 創建新的會話
    const sessionToken = 'admin-session-' + Date.now();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: admin.id,
        session_token: sessionToken,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (sessionError) {
      console.error('❌ 創建會話失敗:', sessionError);
      return;
    }
    
    console.log('✅ 測試會話創建成功!');
    console.log('🔑 Session Token:', sessionToken);
    console.log('');
    console.log('📋 下一步操作:');
    console.log('1. 打開瀏覽器開發者工具 (F12)');
    console.log('2. 進入 Application > Local Storage');
    console.log('3. 設置 admin_token = "' + sessionToken + '"');
    console.log('4. 刷新管理後台頁面');
    console.log('');
    
  } catch (error) {
    console.error('❌ 修復失敗:', error);
  }
}

fixAdminAuth();
