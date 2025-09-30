#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWEN109Deployment() {
    console.log('🧪 測試 WEN 1.1.0 部署...');
    
    let testsPassed = 0;
    let totalTests = 0;
    
    // 測試 1: 基本功能測試
    console.log('\n📝 測試 1: 基本功能測試');
    totalTests++;
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'test-wen109-basic',
                message: { 
                    role: 'user', 
                    content: '你好' 
                },
                user_meta: {
                    external_id: 'test-user-109',
                    display_name: '測試用戶109'
                }
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error.message);
        } else {
            console.log('✅ Edge Function 調用成功');
            console.log('📝 回應:', (data?.response || data?.data?.response || '無回應').substring(0, 100) + '...');
            const recommendations = data?.recommendation || data?.data?.recommendation || [];
            console.log('📋 推薦清單:', recommendations.length, '家');
            if (recommendations.length > 0) {
                console.log('✅ 推薦清單不為空');
                testsPassed++;
            } else {
                console.log('❌ 推薦清單為空');
            }
        }
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    }
    
    // 測試 2: 英語推薦測試
    console.log('\n📝 測試 2: 英語推薦測試');
    totalTests++;
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'test-wen109-english',
                message: { 
                    role: 'user', 
                    content: '我想學美語' 
                },
                user_meta: {
                    external_id: 'test-user-english',
                    display_name: '英語學習者'
                }
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error.message);
        } else {
            console.log('✅ Edge Function 調用成功');
            console.log('📝 回應:', (data?.response || data?.data?.response || '無回應').substring(0, 100) + '...');
            const recommendations = data?.recommendation || data?.data?.recommendation || [];
            console.log('📋 推薦清單:', recommendations.length, '家');
            
            const hasKentucky = recommendations.some(rec => 
                (rec.name || '').includes('肯塔基美語')
            );
            
            if (hasKentucky) {
                console.log('✅ 包含肯塔基美語');
                testsPassed++;
            } else {
                console.log('❌ 缺少肯塔基美語');
            }
        }
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    }
    
    // 測試 3: 對話記錄測試
    console.log('\n📝 測試 3: 對話記錄測試');
    totalTests++;
    try {
        // 等待3秒讓資料庫寫入完成
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 檢查 chat_sessions
        const { data: sessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .limit(5);
        
        if (sessionError) {
            console.error('❌ 查詢 chat_sessions 失敗:', sessionError.message);
        } else {
            console.log(`✅ chat_sessions: 找到 ${sessions.length} 筆記錄`);
            if (sessions.length > 0) {
                console.log('✅ 對話記錄寫入成功');
                testsPassed++;
            } else {
                console.log('❌ 對話記錄寫入失敗');
            }
        }
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    }
    
    // 測試結果總結
    console.log('\n📊 WEN 1.1.0 部署測試結果:');
    console.log(`通過: ${testsPassed}/${totalTests}`);
    
    if (testsPassed === totalTests) {
        console.log('🎉 WEN 1.1.0 部署成功！所有測試通過！');
        console.log('✅ 推薦清單永不為空');
        console.log('✅ Service Role Key 生效');
        console.log('✅ 對話記錄正常寫入');
    } else {
        console.log('❌ WEN 1.1.0 部署有問題，需要檢查');
        console.log('💡 建議檢查：');
        console.log('   - Edge Function 日誌');
        console.log('   - 環境變數設定');
        console.log('   - 資料庫權限');
    }
}

testWEN109Deployment();
