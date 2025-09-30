#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

// 使用 Service Role Key 創建客戶端
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testServiceRoleKey() {
    console.log('🔍 測試 Service Role Key 權限...');
    
    try {
        // 測試 1: 寫入 user_profiles
        console.log('\n📝 1. 測試寫入 user_profiles...');
        const testUserId = `test-service-role-${Date.now()}`;
        
        const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .insert({
                external_id: testUserId,
                display_name: 'Service Role 測試用戶',
                created_at: new Date().toISOString()
            })
            .select();
        
        if (userError) {
            console.error('❌ user_profiles 寫入失敗:', userError.message);
        } else {
            console.log('✅ user_profiles 寫入成功:', userData);
        }
        
        // 測試 2: 寫入 chat_sessions
        console.log('\n📝 2. 測試寫入 chat_sessions...');
        const sessionId = `test-session-${Date.now()}`;
        
        const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({
                session_id: sessionId,
                user_ip: '127.0.0.1',
                user_agent: 'Service Role Test',
                started_at: new Date().toISOString(),
                last_activity: new Date().toISOString(),
                message_count: 0
            })
            .select();
        
        if (sessionError) {
            console.error('❌ chat_sessions 寫入失敗:', sessionError.message);
        } else {
            console.log('✅ chat_sessions 寫入成功:', sessionData);
        }
        
        // 測試 3: 寫入 chat_messages
        console.log('\n📝 3. 測試寫入 chat_messages...');
        let messageError = null;
        if (sessionData && sessionData.length > 0) {
            const { data: messageData, error: msgError } = await supabase
                .from('chat_messages')
                .insert([
                    {
                        session_id: sessionData[0].id,
                        message_type: 'user',
                        content: 'Service Role 測試用戶訊息',
                        created_at: new Date().toISOString()
                    },
                    {
                        session_id: sessionData[0].id,
                        message_type: 'bot',
                        content: 'Service Role 測試 AI 回應',
                        created_at: new Date().toISOString()
                    }
                ])
                .select();
            
            messageError = msgError;
            if (messageError) {
                console.error('❌ chat_messages 寫入失敗:', messageError.message);
            } else {
                console.log('✅ chat_messages 寫入成功:', messageData);
            }
        }
        
        // 測試 4: 清理測試資料
        console.log('\n🧹 4. 清理測試資料...');
        if (userData && userData.length > 0) {
            await supabase.from('user_profiles').delete().eq('id', userData[0].id);
            console.log('✅ 測試資料清理完成');
        }
        
        console.log('\n📊 測試結果總結:');
        console.log('Service Role Key 權限:', {
            user_profiles: !userError,
            chat_sessions: !sessionError,
            chat_messages: !messageError
        });
        
        if (!userError && !sessionError && !messageError) {
            console.log('\n🎉 Service Role Key 權限正常！');
            console.log('💡 請將此 Key 設定到 Edge Function 環境變數中：');
            console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`);
        } else {
            console.log('\n❌ Service Role Key 權限有問題，需要檢查');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        return false;
    }
}

testServiceRoleKey();
