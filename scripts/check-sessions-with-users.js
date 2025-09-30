#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSessionsWithUsers() {
    console.log('🔍 檢查有用戶資料的對話記錄...');

    try {
        // 查找有 user_id 或 line_user_id 的會話
        const { data: sessionsWithUsers, error } = await supabase
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
            .or('user_id.not.is.null,line_user_id.not.is.null')
            .limit(10);

        if (error) {
            console.error('❌ 查詢失敗:', error);
            return;
        }

        console.log(`✅ 找到 ${sessionsWithUsers.length} 筆有用戶資料的對話記錄:`);

        sessionsWithUsers.forEach((session, i) => {
            console.log(`\n📋 對話記錄 ${i + 1}:`);
            console.log(`  Session ID: ${session.session_id || session.id}`);
            console.log(`  User ID: ${session.user_id || 'null'}`);
            console.log(`  LINE User ID: ${session.line_user_id || 'null'}`);

            if (session.user_profiles) {
                console.log(`  ✅ User Profile: ${session.user_profiles.display_name || '(no name)'}`);
                console.log(`  ✅ User Avatar: ${session.user_profiles.avatar_url || 'null'}`);
            }

            if (session.line_users) {
                console.log(`  ✅ LINE User: ${session.line_users.display_name || '(no name)'}`);
                console.log(`  ✅ LINE Avatar: ${session.line_users.picture_url || 'null'}`);
            }

            if (!session.user_profiles && !session.line_users) {
                console.log(`  ❌ 無法加載用戶資料 (可能是外鍵關聯問題)`);
            }
        });

    } catch (error) {
        console.error('❌ 測試失敗:', error);
    }
}

checkSessionsWithUsers();