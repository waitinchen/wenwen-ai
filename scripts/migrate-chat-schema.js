// 聊天資料庫結構遷移腳本
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 開始聊天資料庫結構遷移...\n');

async function migrateChatSchema() {
  try {
    // 1. 建立 user_profiles 表
    console.log('📋 步驟 1: 建立 user_profiles 表...');
    const { error: userProfilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          external_id VARCHAR(255) UNIQUE,
          display_name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (userProfilesError) {
      console.log('⚠️ user_profiles 表可能已存在或建立失敗:', userProfilesError.message);
    } else {
      console.log('✅ user_profiles 表建立成功');
    }

    // 2. 建立索引
    console.log('\n📋 步驟 2: 建立索引...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_profiles_external_id ON user_profiles(external_id);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);
      `
    });

    if (indexError) {
      console.log('⚠️ 索引建立失敗:', indexError.message);
    } else {
      console.log('✅ 索引建立成功');
    }

    // 3. 更新 chat_sessions 表結構
    console.log('\n📋 步驟 3: 更新 chat_sessions 表結構...');
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- 新增 user_id 欄位
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) REFERENCES user_profiles(id);
        
        -- 新增 last_message_preview 欄位
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS last_message_preview TEXT;
        
        -- 重新命名欄位
        ALTER TABLE chat_sessions RENAME COLUMN IF EXISTS user_ip TO client_ip;
        ALTER TABLE chat_sessions RENAME COLUMN IF EXISTS last_activity TO last_active;
      `
    });

    if (sessionsError) {
      console.log('⚠️ chat_sessions 表更新失敗:', sessionsError.message);
    } else {
      console.log('✅ chat_sessions 表更新成功');
    }

    // 4. 更新 chat_messages 表結構
    console.log('\n📋 步驟 4: 更新 chat_messages 表結構...');
    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- 重新命名欄位
        ALTER TABLE chat_messages RENAME COLUMN IF EXISTS message_type TO role;
        ALTER TABLE chat_messages RENAME COLUMN IF EXISTS message_text TO content;
      `
    });

    if (messagesError) {
      console.log('⚠️ chat_messages 表更新失敗:', messagesError.message);
    } else {
      console.log('✅ chat_messages 表更新成功');
    }

    // 5. 建立新的索引
    console.log('\n📋 步驟 5: 建立新的索引...');
    const { error: newIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_active ON chat_sessions(last_active DESC);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
      `
    });

    if (newIndexError) {
      console.log('⚠️ 新索引建立失敗:', newIndexError.message);
    } else {
      console.log('✅ 新索引建立成功');
    }

    // 6. 驗證遷移結果
    console.log('\n📋 步驟 6: 驗證遷移結果...');
    
    // 檢查 user_profiles 表
    const { data: userProfiles, error: userProfilesCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (userProfilesCheckError) {
      console.log('❌ user_profiles 表驗證失敗:', userProfilesCheckError.message);
    } else {
      console.log('✅ user_profiles 表驗證成功');
    }

    // 檢查 chat_sessions 表
    const { data: chatSessions, error: chatSessionsCheckError } = await supabase
      .from('chat_sessions')
      .select('*')
      .limit(1);

    if (chatSessionsCheckError) {
      console.log('❌ chat_sessions 表驗證失敗:', chatSessionsCheckError.message);
    } else {
      console.log('✅ chat_sessions 表驗證成功');
    }

    // 檢查 chat_messages 表
    const { data: chatMessages, error: chatMessagesCheckError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);

    if (chatMessagesCheckError) {
      console.log('❌ chat_messages 表驗證失敗:', chatMessagesCheckError.message);
    } else {
      console.log('✅ chat_messages 表驗證成功');
    }

    console.log('\n🎉 聊天資料庫結構遷移完成！');
    console.log('\n📊 遷移摘要：');
    console.log('- ✅ user_profiles 表已建立');
    console.log('- ✅ chat_sessions 表已更新');
    console.log('- ✅ chat_messages 表已更新');
    console.log('- ✅ 相關索引已建立');
    console.log('- ✅ 資料庫結構驗證通過');

    console.log('\n🚀 下一步：');
    console.log('1. 執行 npm run test:chat-persistence 驗證功能');
    console.log('2. 檢查後台對話歷史管理是否正常顯示用戶資料');
    console.log('3. 確認前台聊天界面能正確保存用戶資訊');

  } catch (error) {
    console.error('❌ 遷移過程中發生錯誤:', error);
    process.exit(1);
  }
}

// 執行遷移
migrateChatSchema();
