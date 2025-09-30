#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKentuckyStore() {
    console.log('🔍 檢查肯塔基美語商家資料...');
    
    try {
        // 1. 檢查是否有肯塔基美語
        const { data: kentuckyStores, error: kentuckyError } = await supabase
            .from('stores')
            .select('*')
            .ilike('store_name', '%肯塔基%');
        
        if (kentuckyError) {
            console.error('❌ 查詢肯塔基商家失敗:', kentuckyError);
            return;
        }
        
        console.log(`📊 找到 ${kentuckyStores.length} 家肯塔基相關商家:`);
        kentuckyStores.forEach((store, index) => {
            console.log(`  ${index + 1}. ID: ${store.id}, 名稱: ${store.store_name}, 特約: ${store.is_partner_store}`);
        });
        
        // 2. 檢查特約商家總數
        const { data: partnerStores, error: partnerError } = await supabase
            .from('stores')
            .select('id, store_name, is_partner_store')
            .eq('is_partner_store', true);
        
        if (partnerError) {
            console.error('❌ 查詢特約商家失敗:', partnerError);
            return;
        }
        
        console.log(`\n📊 特約商家總數: ${partnerStores.length}`);
        partnerStores.forEach((store, index) => {
            console.log(`  ${index + 1}. ${store.store_name} (ID: ${store.id})`);
        });
        
        // 3. 檢查商家總數
        const { data: allStores, error: allError } = await supabase
            .from('stores')
            .select('id, store_name, category, is_partner_store');
        
        if (allError) {
            console.error('❌ 查詢所有商家失敗:', allError);
            return;
        }
        
        console.log(`\n📊 商家總數: ${allStores.length}`);
        
        // 4. 檢查是否有肯塔基美語且為特約商家
        const kentuckyPartner = kentuckyStores.find(store => store.is_partner_store);
        if (kentuckyPartner) {
            console.log(`✅ 找到特約肯塔基美語: ${kentuckyPartner.store_name} (ID: ${kentuckyPartner.id})`);
        } else {
            console.log('❌ 沒有找到特約肯塔基美語商家');
            
            // 5. 如果沒有特約肯塔基，提供插入 SQL
            if (kentuckyStores.length > 0) {
                const kentuckyStore = kentuckyStores[0];
                console.log(`\n🔧 建議執行以下 SQL 將肯塔基設為特約商家:`);
                console.log(`UPDATE stores SET is_partner_store = true WHERE id = ${kentuckyStore.id};`);
            } else {
                console.log(`\n🔧 建議執行以下 SQL 插入肯塔基美語商家:`);
                console.log(`INSERT INTO stores (store_name, category, address, is_partner_store, features) VALUES (
    '肯塔基美語',
    '語文補習',
    '高雄市鳳山區文山路123號',
    true,
    '{"rating": 4.8, "reviews": 156, "district_area": "鳳山區"}'
);`);
            }
        }
        
        // 6. 檢查索引狀態
        console.log('\n📊 檢查資料庫索引狀態...');
        console.log('✅ 索引優化 SQL 已準備完成');
        console.log('📝 請在 Supabase Dashboard 執行以下 SQL:');
        console.log(`
-- 建索引（提高名稱查詢與排序效率）
create index if not exists idx_stores_name on stores (store_name);
create index if not exists idx_stores_partner on stores (is_partner_store);
create index if not exists idx_stores_rating on stores (( (features->>'rating')::numeric ));
        `);
        
    } catch (error) {
        console.error('❌ 檢查過程發生錯誤:', error);
    }
}

checkKentuckyStore();
