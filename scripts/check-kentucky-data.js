#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKentuckyData() {
    console.log('🔍 檢查資料庫中的肯塔基美語資料...');
    
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .ilike('store_name', '%肯塔基%');
    
    if (error) {
        console.log('❌ 查詢失敗:', error.message);
    } else {
        console.log('📊 找到', data.length, '筆肯塔基相關資料');
        data.forEach((store, i) => {
            console.log(`${i + 1}. 名稱: ${store.store_name}`);
            console.log(`   地址: ${store.address || '無地址'}`);
            console.log(`   類別: ${store.category || '無類別'}`);
            console.log(`   特約: ${store.is_partner_store ? '是' : '否'}`);
            console.log(`   特色: ${store.features || '無特色'}`);
            console.log('---');
        });
        
        if (data.length === 0) {
            console.log('❌ 沒有找到肯塔基美語的資料！');
            console.log('💡 這可能是問題的根源 - AI 沒有真實資料可以參考');
        }
    }
}

checkKentuckyData();
