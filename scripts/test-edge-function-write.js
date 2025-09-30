#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunctionWrite() {
    console.log('🧪 測試 Edge Function 寫入功能...');
    
    try {
        // 生成測試用的 session_id
        const testSessionId = `test-write-${Date.now()}`;
        const testUserMeta = {
            external_id: `test-user-${Date.now()}`,
            display_name: '測試用戶',
            avatar_url: 'https://example.com/avatar.jpg'
        };
        
        console.log(`📝 測試會話ID: ${testSessionId}`);
        console.log(`👤 測試用戶: ${testUserMeta.display_name}`);
        
        // 調用 Edge Function
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: testSessionId,
                message: { 
                    role: 'user', 
                    content: '測試對話記錄寫入功能' 
                },
                user_meta: testUserMeta
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error);
            return;
        }
        
        console.log('✅ Edge Function 調用成功');
        console.log('📝 回應:', data.data.response.substring(0, 100) + '...');
        
        // 等待2秒讓資料庫寫入完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 檢查是否寫入成功
        console.log('\n🔍 檢查資料庫寫入結果...');
        
        // 檢查 chat_sessions
        const { data: sessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('session_id', testSessionId);
        
        if (sessionError) {
            console.error('❌ 查詢 chat_sessions 失敗:', sessionError);
        } else {
            console.log(`✅ chat_sessions: 找到 ${sessions.length} 筆記錄`);
            if (sessions.length > 0) {
                console.log(`   - 會話ID: ${sessions[0].session_id}`);
                console.log(`   - 消息數: ${sessions[0].message_count}`);
                console.log(`   - 最後活動: ${sessions[0].last_activity}`);
            }
        }
        
        // 檢查 chat_messages
        const { data: messages, error: messageError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessions.length > 0 ? sessions[0].id : testSessionId);
        
        if (messageError) {
            console.error('❌ 查詢 chat_messages 失敗:', messageError);
        } else {
            console.log(`✅ chat_messages: 找到 ${messages.length} 筆記錄`);
            messages.forEach((msg, index) => {
                console.log(`   ${index + 1}. 類型: ${msg.message_type}, 內容: ${msg.content.substring(0, 50)}...`);
            });
        }
        
        // 檢查 user_profiles
        const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('external_id', testUserMeta.external_id);
        
        if (profileError) {
            console.error('❌ 查詢 user_profiles 失敗:', profileError);
            console.log('💡 這表示 user_profiles 表可能不存在，需要先執行 SQL 創建表');
        } else {
            console.log(`✅ user_profiles: 找到 ${profiles.length} 筆記錄`);
            if (profiles.length > 0) {
                console.log(`   - 用戶ID: ${profiles[0].id}`);
                console.log(`   - 外部ID: ${profiles[0].external_id}`);
                console.log(`   - 顯示名稱: ${profiles[0].display_name}`);
            }
        }
        
        // 總結
        console.log('\n📊 測試結果總結:');
        if (sessions.length > 0 && messages.length > 0) {
            console.log('✅ 對話記錄寫入成功！');
        } else {
            console.log('❌ 對話記錄寫入失敗！');
            console.log('💡 建議檢查：');
            console.log('   1. user_profiles 表是否存在');
            console.log('   2. Edge Function 環境變數是否正確');
            console.log('   3. 資料庫權限是否足夠');
        }
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
    }
}

testEdgeFunctionWrite();
