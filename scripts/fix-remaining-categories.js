#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRemainingCategories() {
    console.log('🔧 修復剩餘的分類...');
    
    try {
        // 1. 獲取所有商家
        const { data: merchants, error } = await supabase
            .from('stores')
            .select('id, store_name, category');
        
        if (error) {
            console.error('❌ 獲取商家資料失敗:', error.message);
            return false;
        }
        
        console.log(`✅ 找到 ${merchants.length} 家商家`);
        
        // 2. 定義剩餘分類的映射
        const remainingMappings = {
            '居家生活': '購物消費',
            '美食餐飲': '餐飲美食',
            '文具店': '購物消費',
            '美髮店': '生活服務',
            '修車廠': '生活服務',
            '義式料理': '餐飲美食',
            '台式料理': '餐飲美食',
            '港式飲茶': '餐飲美食'
        };
        
        // 3. 找出需要修復的商家
        const merchantsToFix = merchants.filter(merchant => 
            remainingMappings.hasOwnProperty(merchant.category)
        );
        
        console.log(`\n🔍 找到 ${merchantsToFix.length} 家需要修復的商家:`);
        merchantsToFix.forEach(merchant => {
            console.log(`   ${merchant.store_name}: ${merchant.category} → ${remainingMappings[merchant.category]}`);
        });
        
        // 4. 執行修復
        console.log('\n🔧 執行分類修復...');
        let fixedCount = 0;
        
        for (const merchant of merchantsToFix) {
            const newCategory = remainingMappings[merchant.category];
            const { error: updateError } = await supabase
                .from('stores')
                .update({ category: newCategory })
                .eq('id', merchant.id);
            
            if (updateError) {
                console.error(`❌ 修復商家 ${merchant.store_name} 失敗:`, updateError.message);
            } else {
                fixedCount++;
                console.log(`✅ ${merchant.store_name}: ${merchant.category} → ${newCategory}`);
            }
        }
        
        console.log(`\n✅ 成功修復 ${fixedCount} 家商家的分類`);
        
        // 5. 驗證最終結果
        console.log('\n🔍 驗證最終分類結果...');
        const { data: finalMerchants, error: verifyError } = await supabase
            .from('stores')
            .select('category')
            .not('category', 'is', null);
        
        if (verifyError) {
            console.error('❌ 驗證失敗:', verifyError.message);
            return false;
        }
        
        const finalStats = {};
        finalMerchants.forEach(merchant => {
            const category = merchant.category;
            finalStats[category] = (finalStats[category] || 0) + 1;
        });
        
        console.log('\n📊 最終分類統計:');
        Object.keys(finalStats).sort((a, b) => finalStats[b] - finalStats[a]).forEach(category => {
            console.log(`   ${category}: ${finalStats[category]} 家`);
        });
        
        // 6. 檢查是否還有未分類的
        const uncategorized = merchants.filter(m => 
            !m.category || 
            m.category.trim() === '' || 
            !['餐飲美食', '購物消費', '生活服務', '醫療保健', '教育培訓', '休閒娛樂', '住宿旅遊', '其他'].includes(m.category)
        );
        
        if (uncategorized.length > 0) {
            console.log('\n⚠️ 仍有未分類的商家:');
            uncategorized.forEach(merchant => {
                console.log(`   ${merchant.store_name}: "${merchant.category}"`);
            });
        } else {
            console.log('\n✅ 所有商家都已正確分類！');
        }
        
        console.log('\n🎉 分類修復完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 修復過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行修復
fixRemainingCategories().then(success => {
    if (success) {
        console.log('\n✅ 修復成功完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 修復失敗！');
        process.exit(1);
    }
});
