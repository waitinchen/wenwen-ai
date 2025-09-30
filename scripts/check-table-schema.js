#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('🔍 檢查表格結構...');

    // 檢查 chat_sessions 表
    console.log('\n📋 chat_sessions 表:');
    try {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .limit(1);
        if (!error && data[0]) {
            console.log('  欄位:', Object.keys(data[0]));
        }
    } catch (e) {
        console.log('  查詢失敗:', e.message);
    }

    // 檢查 user_profiles 表
    console.log('\n📋 user_profiles 表:');
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .limit(1);
        if (!error && data[0]) {
            console.log('  欄位:', Object.keys(data[0]));
        }
    } catch (e) {
        console.log('  查詢失敗:', e.message);
    }

    // 檢查 line_users 表
    console.log('\n📋 line_users 表:');
    try {
        const { data, error } = await supabase
            .from('line_users')
            .select('*')
            .limit(1);
        if (!error && data[0]) {
            console.log('  欄位:', Object.keys(data[0]));
        }
    } catch (e) {
        console.log('  查詢失敗:', e.message);
    }

    // 測試簡單的查詢看看是否有關聯資料
    console.log('\n🔗 檢查關聯資料:');
    try {
        const { data: sessions } = await supabase
            .from('chat_sessions')
            .select('*');

        const sessionsWithUserIds = sessions?.filter(s => s.user_id) || [];
        const sessionsWithLineUserIds = sessions?.filter(s => s.line_user_id) || [];

        console.log(`  Chat Sessions 總數: ${sessions?.length || 0}`);
        console.log(`  有 user_id 的: ${sessionsWithUserIds.length}`);
        console.log(`  有 line_user_id 的: ${sessionsWithLineUserIds.length}`);

        if (sessionsWithUserIds.length > 0) {
            console.log('  User IDs:', sessionsWithUserIds.map(s => s.user_id));
        }
        if (sessionsWithLineUserIds.length > 0) {
            console.log('  LINE User IDs:', sessionsWithLineUserIds.map(s => s.line_user_id));
        }

    } catch (e) {
        console.log('  檢查失敗:', e.message);
    }
}

checkSchema();