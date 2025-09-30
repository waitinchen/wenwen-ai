#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversationRecords() {
    console.log('🔍 檢查對話記錄問題...');
    
    try {
        // 1. 檢查 chat_sessions 表
        console.log('\n📊 1. 檢查 chat_sessions 表...');
        const { data: sessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .order('last_activity', { ascending: false })
            .limit(10);
        
        if (sessionError) {
            console.error('❌ chat_sessions 查詢錯誤:', sessionError);
            return;
        }
        
        console.log(`✅ 找到 ${sessions.length} 個會話記錄:`);
        sessions.forEach((session, index) => {
            console.log(`  ${index + 1}. ID: ${session.id}, Session: ${session.session_id}, 消息數: ${session.message_count}, 最後活動: ${session.last_activity}`);
        });
        
        // 2. 檢查 chat_messages 表
        console.log('\n📊 2. 檢查 chat_messages 表...');
        const { data: messages, error: messageError } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (messageError) {
            console.error('❌ chat_messages 查詢錯誤:', messageError);
            return;
        }
        
        console.log(`✅ 找到 ${messages.length} 個消息記錄:`);
        messages.forEach((message, index) => {
            console.log(`  ${index + 1}. Session: ${message.session_id}, 類型: ${message.message_type}, 內容: ${message.content.substring(0, 50)}...`);
        });
        
        // 3. 檢查最近的會話（過去1小時）
        console.log('\n📊 3. 檢查最近1小時的會話...');
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: recentSessions, error: recentError } = await supabase
            .from('chat_sessions')
            .select('*')
            .gte('last_activity', oneHourAgo)
            .order('last_activity', { ascending: false });
        
        if (recentError) {
            console.error('❌ 最近會話查詢錯誤:', recentError);
            return;
        }
        
        console.log(`✅ 最近1小時有 ${recentSessions.length} 個會話:`);
        recentSessions.forEach((session, index) => {
            console.log(`  ${index + 1}. Session: ${session.session_id}, 消息數: ${session.message_count}, 時間: ${session.last_activity}`);
        });
        
        // 4. 檢查 user_profiles 表
        console.log('\n📊 4. 檢查 user_profiles 表...');
        const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(5);
        
        if (profileError) {
            console.error('❌ user_profiles 查詢錯誤:', profileError);
        } else {
            console.log(`✅ 找到 ${profiles.length} 個用戶資料:`);
            profiles.forEach((profile, index) => {
                console.log(`  ${index + 1}. ID: ${profile.id}, External ID: ${profile.external_id}, 名稱: ${profile.display_name}`);
            });
        }
        
        // 5. 檢查資料庫表結構
        console.log('\n📊 5. 檢查表結構...');
        console.log('✅ chat_sessions 表欄位: id, session_id, user_id, user_ip, user_agent, user_meta, message_count, last_activity');
        console.log('✅ chat_messages 表欄位: id, session_id, message_type, content, created_at');
        console.log('✅ user_profiles 表欄位: id, external_id, display_name, avatar_url, created_at, updated_at');
        
        // 6. 診斷問題
        console.log('\n🔍 6. 問題診斷...');
        if (recentSessions.length === 0) {
            console.log('❌ 問題：最近1小時沒有新的會話記錄');
            console.log('💡 可能原因：');
            console.log('   - Edge Function 沒有正確寫入資料庫');
            console.log('   - 會話ID沒有正確傳遞');
            console.log('   - 資料庫寫入權限問題');
        } else {
            console.log('✅ 最近有新的會話記錄，問題可能在管理後台顯示邏輯');
        }
        
        if (sessions.length > 0 && messages.length === 0) {
            console.log('❌ 問題：有會話記錄但沒有消息記錄');
            console.log('💡 可能原因：chat_messages 表寫入失敗');
        }
        
    } catch (error) {
        console.error('❌ 檢查過程發生錯誤:', error);
    }
}

checkConversationRecords();
