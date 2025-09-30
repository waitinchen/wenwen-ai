#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
    console.log('🔍 檢查資料庫表結構...');
    
    try {
        // 檢查 chat_sessions 表結構
        console.log('\n📝 檢查 chat_sessions 表結構...');
        const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .limit(1);
        
        if (sessionError) {
            console.error('❌ chat_sessions 查詢失敗:', sessionError.message);
        } else {
            console.log('✅ chat_sessions 表存在');
            if (sessionData && sessionData.length > 0) {
                console.log('欄位:', Object.keys(sessionData[0]));
            }
        }
        
        // 檢查 chat_messages 表結構
        console.log('\n📝 檢查 chat_messages 表結構...');
        const { data: messageData, error: messageError } = await supabase
            .from('chat_messages')
            .select('*')
            .limit(1);
        
        if (messageError) {
            console.error('❌ chat_messages 查詢失敗:', messageError.message);
        } else {
            console.log('✅ chat_messages 表存在');
            if (messageData && messageData.length > 0) {
                console.log('欄位:', Object.keys(messageData[0]));
            }
        }
        
        // 檢查 user_profiles 表結構
        console.log('\n📝 檢查 user_profiles 表結構...');
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);
        
        if (profileError) {
            console.error('❌ user_profiles 查詢失敗:', profileError.message);
        } else {
            console.log('✅ user_profiles 表存在');
            if (profileData && profileData.length > 0) {
                console.log('欄位:', Object.keys(profileData[0]));
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 檢查過程中發生錯誤:', error.message);
        return false;
    }
}

checkTableStructure();
