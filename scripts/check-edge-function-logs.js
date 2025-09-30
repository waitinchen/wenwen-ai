#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEdgeFunctionLogs() {
    console.log('🔍 檢查 Edge Function 日誌...');
    
    try {
        // 發送一個測試請求
        console.log('\n📝 發送測試請求...');
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'log-test-' + Date.now(),
                message: { role: 'user', content: '測試日誌' },
                user_meta: {
                    external_id: 'log-test-user',
                    display_name: '日誌測試用戶'
                }
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error);
            return false;
        }
        
        console.log('✅ Edge Function 調用成功');
        console.log('回應:', data?.response?.substring(0, 100) + '...');
        
        // 等待一下讓日誌生成
        console.log('\n⏳ 等待 3 秒讓日誌生成...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n💡 請手動檢查 Supabase Dashboard 的日誌：');
        console.log('1. 前往 https://supabase.com/dashboard');
        console.log('2. 選擇你的專案');
        console.log('3. 前往 Edge Functions > claude-chat');
        console.log('4. 點擊 Logs 標籤');
        console.log('5. 查看最新的日誌記錄');
        console.log('6. 尋找以下關鍵字：');
        console.log('   - "🔄 開始寫入用戶資料..."');
        console.log('   - "🔄 開始寫入會話資料..."');
        console.log('   - "會話寫入狀態:"');
        console.log('   - "消息寫入狀態:"');
        console.log('   - "❌" 或 "✅" 標記');
        
        return true;
        
    } catch (error) {
        console.error('❌ 檢查過程中發生錯誤:', error.message);
        return false;
    }
}

checkEdgeFunctionLogs();
