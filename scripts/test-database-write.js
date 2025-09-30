#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseWrite() {
    console.log('🔍 測試 Edge Function 的資料庫寫入功能...');
    
    try {
        // 1. 測試 Edge Function 調用
        console.log('\n📝 1. 測試 Edge Function 調用...');
        const testSessionId = `test-db-write-${Date.now()}`;
        const testMessage = '測試資料庫寫入功能';
        
        console.log(`會話ID: ${testSessionId}`);
        console.log(`測試訊息: ${testMessage}`);
        
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: testSessionId,
                message: { role: 'user', content: testMessage },
                user_meta: {
                    external_id: 'test-db-user',
                    display_name: '資料庫測試用戶',
                    avatar_url: 'https://example.com/avatar.jpg'
                }
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error.message);
            return false;
        }
        
        console.log('✅ Edge Function 調用成功');
        const response = data?.data || data;
        console.log('回應:', response?.response?.substring(0, 100) + '...');
        
        // 檢查資料結構
        console.log('完整回應結構:', JSON.stringify(data, null, 2));
        
        // 2. 檢查資料庫是否寫入成功
        console.log('\n🔍 2. 檢查資料庫寫入結果...');
        
        // 檢查 chat_sessions
        const { data: sessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('session_id', testSessionId);
        
        if (sessionError) {
            console.error('❌ 查詢會話失敗:', sessionError.message);
        } else {
            console.log(`✅ 找到 ${sessions.length} 筆會話記錄`);
            if (sessions.length > 0) {
                const session = sessions[0];
                console.log(`   會話ID: ${session.session_id}`);
                console.log(`   用戶ID: ${session.user_id}`);
                console.log(`   消息數: ${session.message_count}`);
                console.log(`   最後活動: ${session.last_activity}`);
                console.log(`   用戶元資料: ${session.user_meta}`);
            }
        }
        
        // 檢查 chat_messages
        const { data: messages, error: messageError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessions[0]?.id);
        
        if (messageError) {
            console.error('❌ 查詢消息失敗:', messageError.message);
        } else {
            console.log(`✅ 找到 ${messages.length} 筆消息記錄`);
            messages.forEach((msg, i) => {
                console.log(`   ${i + 1}. ${msg.message_type}: ${msg.content.substring(0, 50)}...`);
            });
        }
        
        // 檢查 user_profiles
        const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('external_id', 'test-db-user');
        
        if (profileError) {
            console.error('❌ 查詢用戶資料失敗:', profileError.message);
        } else {
            console.log(`✅ 找到 ${profiles.length} 筆用戶資料`);
            if (profiles.length > 0) {
                const profile = profiles[0];
                console.log(`   外部ID: ${profile.external_id}`);
                console.log(`   顯示名稱: ${profile.display_name}`);
                console.log(`   頭像: ${profile.avatar_url}`);
            }
        }
        
        // 3. 分析結果
        console.log('\n📊 3. 資料庫寫入分析:');
        
        const sessionSuccess = sessions.length > 0;
        const messageSuccess = messages.length >= 2; // 至少要有用戶和AI的消息
        const profileSuccess = profiles.length > 0;
        
        console.log(`   會話記錄: ${sessionSuccess ? '✅' : '❌'}`);
        console.log(`   消息記錄: ${messageSuccess ? '✅' : '❌'}`);
        console.log(`   用戶資料: ${profileSuccess ? '✅' : '❌'}`);
        
        if (sessionSuccess && messageSuccess && profileSuccess) {
            console.log('\n✅ 資料庫寫入功能正常！');
            console.log('💡 對話記錄沒有新資料的原因可能是：');
            console.log('   - 用戶沒有進行新的對話');
            console.log('   - 前端沒有正確調用 Edge Function');
            console.log('   - 會話ID沒有正確傳遞');
        } else {
            console.log('\n❌ 資料庫寫入功能異常！');
            console.log('💡 需要檢查：');
            if (!sessionSuccess) console.log('   - Edge Function 的會話寫入邏輯');
            if (!messageSuccess) console.log('   - Edge Function 的消息寫入邏輯');
            if (!profileSuccess) console.log('   - Edge Function 的用戶資料寫入邏輯');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行測試
testDatabaseWrite().then(success => {
    if (success) {
        console.log('\n✅ 測試完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 測試失敗！');
        process.exit(1);
    }
});
