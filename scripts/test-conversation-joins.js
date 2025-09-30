#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJoins() {
    console.log('🔍 測試對話記錄JOIN查詢...');

    try {
        // 測試新的JOIN查詢
        const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .select(`
                id,
                session_id,
                user_id,
                line_user_id,
                user_ip,
                user_agent,
                started_at,
                last_activity,
                message_count,
                user_profiles (
                    id,
                    display_name,
                    avatar_url
                ),
                line_users (
                    id,
                    line_user_id,
                    display_name,
                    picture_url
                )
            `)
            .limit(5);

        if (sessionError) {
            console.error('❌ JOIN查詢失敗:', sessionError);
            return;
        }

        console.log(`✅ 成功查詢到 ${sessionData.length} 筆對話記錄`);

        sessionData.forEach((session, i) => {
            console.log(`\n📋 對話記錄 ${i + 1}:`);
            console.log(`  Session ID: ${session.session_id || session.id}`);
            console.log(`  User ID: ${session.user_id || 'null'}`);
            console.log(`  LINE User ID: ${session.line_user_id || 'null'}`);

            if (session.user_profiles) {
                console.log(`  ✅ User Profile: ${session.user_profiles.display_name}`);
                console.log(`  ✅ User Avatar: ${session.user_profiles.avatar_url || 'null'}`);
            } else {
                console.log(`  ❌ User Profile: null`);
            }

            if (session.line_users) {
                console.log(`  ✅ LINE User: ${session.line_users.display_name}`);
                console.log(`  ✅ LINE Avatar: ${session.line_users.picture_url || 'null'}`);
            } else {
                console.log(`  ❌ LINE User: null`);
            }
        });

        console.log('\n🔍 檢查所有用戶和LINE用戶...');

        // 檢查 user_profiles 表
        const { data: userProfiles, error: userError } = await supabase
            .from('user_profiles')
            .select('*');
        console.log(`User Profiles: ${userProfiles?.length || 0} 筆`);
        userProfiles?.forEach(user => {
            console.log(`  - ${user.display_name} (ID: ${user.id})`);
        });

        // 檢查 line_users 表
        const { data: lineUsers, error: lineError } = await supabase
            .from('line_users')
            .select('*');
        console.log(`LINE Users: ${lineUsers?.length || 0} 筆`);
        lineUsers?.forEach(user => {
            console.log(`  - ${user.display_name} (ID: ${user.id}, UID: ${user.line_user_id})`);
        });

    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

testJoins();