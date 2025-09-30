#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testParkingFix() {
    console.log('🅿️ 測試停車場查詢修復...');
    
    try {
        // 測試停車場查詢
        console.log('\n📝 測試停車場查詢...');
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'test-parking-session',
                message: { role: 'user', content: '停車資訊' },
                user_meta: {
                    external_id: 'test-user-parking',
                    display_name: '測試用戶'
                }
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error.message);
            return false;
        }
        
        const response = data?.data || data;
        console.log('✅ 收到回應:');
        console.log('回應內容:', response.response.substring(0, 200) + '...');
        console.log('推薦清單:', response.recommendation.length, '家');
        
        if (response.recommendation.length > 0) {
            console.log('\n📋 推薦的停車場:');
            response.recommendation.forEach((rec, i) => {
                console.log(`${i + 1}. ${rec.name || rec.store_name}`);
                console.log(`   分類: ${rec.category}`);
                console.log(`   特約: ${rec.is_partner_store ? '是' : '否'}`);
            });
            
            // 檢查是否包含真實停車場資料
            const hasRealParking = response.recommendation.some(rec => 
                rec.category === '停車場' && rec.store_name && rec.address
            );
            
            if (hasRealParking) {
                console.log('\n✅ 成功使用真實停車場資料！');
            } else {
                console.log('\n❌ 仍在使用假資料或沒有停車場資料');
            }
        } else {
            console.log('\n❌ 沒有推薦清單');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
        return false;
    }
}

// 執行測試
testParkingFix().then(success => {
    if (success) {
        console.log('\n✅ 測試完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 測試失敗！');
        process.exit(1);
    }
});
