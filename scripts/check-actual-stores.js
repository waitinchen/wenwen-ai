#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActualStores() {
    console.log('🔍 檢查實際的商家資料...');
    
    try {
        // 1. 檢查 stores 表
        const { data: stores, error: storesError } = await supabase
            .from('stores')
            .select('*');
        
        if (storesError) {
            console.error('❌ 查詢 stores 表失敗:', storesError.message);
            return false;
        }
        
        console.log(`\n📊 stores 表統計:`);
        console.log(`   總數: ${stores.length} 家`);
        
        if (stores.length > 0) {
            console.log('\n📋 前10筆商家:');
            stores.slice(0, 10).forEach((store, i) => {
                console.log(`   ${i + 1}. ${store.store_name}`);
                console.log(`      分類: ${store.category || '未分類'}`);
                console.log(`      特約: ${store.is_partner_store ? '是' : '否'}`);
                console.log(`      安心: ${store.is_safe_store ? '是' : '否'}`);
                console.log(`      優惠: ${store.has_member_discount ? '是' : '否'}`);
                console.log('---');
            });
            
            // 分析分類分布
            const categoryStats = {};
            stores.forEach(store => {
                const category = store.category || '未分類';
                categoryStats[category] = (categoryStats[category] || 0) + 1;
            });
            
            console.log('\n📊 分類分布:');
            Object.keys(categoryStats).sort((a, b) => categoryStats[b] - categoryStats[a]).forEach(category => {
                console.log(`   ${category}: ${categoryStats[category]} 家`);
            });
        }
        
        // 2. 檢查是否有其他相關表
        console.log('\n🔍 檢查其他可能的表...');
        const possibleTables = ['merchants', 'businesses', 'restaurants', 'shops'];
        
        for (const tableName of possibleTables) {
            try {
                const { data, error } = await supabase.from(tableName).select('*').limit(1);
                if (error) {
                    console.log(`❌ ${tableName}: 不存在`);
                } else {
                    console.log(`✅ ${tableName}: 存在 (${data.length} 筆資料)`);
                }
            } catch (e) {
                console.log(`❌ ${tableName}: 查詢異常`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 檢查過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行檢查
checkActualStores().then(success => {
    if (success) {
        console.log('\n✅ 檢查完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 檢查失敗！');
        process.exit(1);
    }
});
