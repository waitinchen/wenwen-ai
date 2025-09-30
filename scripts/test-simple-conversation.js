#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleConversation() {
    console.log('🧪 測試簡單對話記錄...');
    
    try {
        // 生成簡單的測試會話
        const testSessionId = `simple-test-${Date.now()}`;
        
        console.log(`📝 測試會話ID: ${testSessionId}`);
        
        // 調用 Edge Function
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: testSessionId,
                message: { 
                    role: 'user', 
                    content: '你好，測試對話記錄' 
                },
                user_meta: {
                    external_id: `test-user-${Date.now()}`,
                    display_name: '測試用戶'
                }
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error);
            return;
        }
        
        console.log('✅ Edge Function 調用成功');
        console.log('📝 回應:', data.data.response.substring(0, 100) + '...');
        
        // 等待3秒讓資料庫寫入完成
        console.log('⏳ 等待資料庫寫入...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查是否寫入成功
        console.log('\n🔍 檢查資料庫寫入結果...');
        
        // 檢查 chat_sessions
        const { data: sessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('session_id', testSessionId);
        
        if (sessionError) {
            console.error('❌ 查詢 chat_sessions 失敗:', sessionError.message);
        } else {
            console.log(`✅ chat_sessions: 找到 ${sessions.length} 筆記錄`);
            if (sessions.length > 0) {
                console.log(`   - 會話ID: ${sessions[0].session_id}`);
                console.log(`   - 消息數: ${sessions[0].message_count}`);
                console.log(`   - 最後活動: ${sessions[0].last_activity}`);
                console.log(`   - 用戶元資料: ${sessions[0].user_meta}`);
            }
        }
        
        // 檢查 chat_messages
        if (sessions.length > 0) {
            const { data: messages, error: messageError } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessions[0].id);
            
            if (messageError) {
                console.error('❌ 查詢 chat_messages 失敗:', messageError.message);
            } else {
                console.log(`✅ chat_messages: 找到 ${messages.length} 筆記錄`);
                messages.forEach((msg, index) => {
                    console.log(`   ${index + 1}. 類型: ${msg.message_type}, 內容: ${msg.content.substring(0, 50)}...`);
                });
            }
        }
        
        // 檢查 user_profiles
        const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(5);
        
        if (profileError) {
            console.error('❌ 查詢 user_profiles 失敗:', profileError.message);
        } else {
            console.log(`✅ user_profiles: 找到 ${profiles.length} 筆記錄`);
            profiles.forEach((profile, index) => {
                console.log(`   ${index + 1}. ID: ${profile.id}, External ID: ${profile.external_id}, 名稱: ${profile.display_name}`);
            });
        }
        
        // 總結
        console.log('\n📊 測試結果總結:');
        if (sessions.length > 0 && sessions[0].message_count > 0) {
            console.log('✅ 對話記錄寫入成功！');
            console.log('🎉 管理後台應該能看到新的對話記錄了！');
        } else {
            console.log('❌ 對話記錄寫入仍然失敗！');
            console.log('💡 可能的原因：');
            console.log('   - Edge Function 中的資料庫寫入邏輯有問題');
            console.log('   - 環境變數配置不正確');
            console.log('   - 資料庫權限問題');
        }
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤:', error);
    }
}

testSimpleConversation();
