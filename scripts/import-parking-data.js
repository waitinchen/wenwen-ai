#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';
import fs from 'fs';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importParkingData() {
    console.log('🅿️ 開始匯入停車場資料...');
    
    try {
        // 1. 讀取 Excel 檔案
        console.log('\n📖 1. 讀取 Excel 檔案...');
        const filePath = '高雄市鳳山區停車場場域資料庫.xlsx';
        
        if (!fs.existsSync(filePath)) {
            console.error(`❌ 檔案不存在: ${filePath}`);
            return false;
        }
        
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // 使用第一個工作表
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`✅ 成功讀取 Excel 檔案，共 ${jsonData.length} 筆資料`);
        console.log(`📋 工作表名稱: ${sheetName}`);
        
        // 2. 檢查資料結構
        console.log('\n🔍 2. 檢查資料結構...');
        if (jsonData.length > 0) {
            console.log('📋 欄位名稱:');
            Object.keys(jsonData[0]).forEach((key, i) => {
                console.log(`   ${i + 1}. ${key}`);
            });
            
            console.log('\n📋 前3筆資料範例:');
            jsonData.slice(0, 3).forEach((row, i) => {
                console.log(`\n第 ${i + 1} 筆:`);
                Object.keys(row).forEach(key => {
                    console.log(`   ${key}: ${row[key]}`);
                });
            });
        }
        
        // 3. 資料清理和轉換
        console.log('\n🔧 3. 資料清理和轉換...');
        const parkingStores = [];
        
        jsonData.forEach((row, index) => {
            try {
                // 根據實際的 Excel 欄位名稱進行映射
                const storeName = row['name'] || row['停車場名稱'] || row['場域名稱'] || `停車場_${index + 1}`;
                const address = row['address'] || row['地址'] || row['場域地址'] || row['位置'] || '';
                const phone = row['phone'] || row['電話'] || row['聯絡電話'] || '';
                const businessHours = row['operating_hours'] || row['營業時間'] || row['開放時間'] || row['時間'] || '';
                const capacity = row['parking_spaces'] || row['車位數'] || row['容量'] || row['總車位'] || '';
                const hourlyRate = row['hourly_rate'] || row['費率'] || row['收費標準'] || row['價格'] || '';
                
                // 建構 features JSON
                const features = {
                    capacity: capacity,
                    hourly_rate: hourlyRate,
                    parking_type: '停車場',
                    district_area: '鳳山區',
                    rating: 4.0, // 預設評分
                    reviews: 0
                };
                
                // 建構 services 文字
                const services = `停車服務${capacity ? `、${capacity}個車位` : ''}${hourlyRate ? `、${hourlyRate}` : ''}`;
                
                const store = {
                    store_name: storeName,
                    category: '停車場',
                    address: address,
                    phone: phone,
                    business_hours: businessHours,
                    services: services,
                    features: JSON.stringify(features),
                    is_safe_store: false,
                    has_member_discount: false,
                    is_partner_store: false,
                    owner: '鳳山區公所',
                    role: '停車場管理'
                };
                
                parkingStores.push(store);
                
            } catch (error) {
                console.warn(`⚠️ 處理第 ${index + 1} 筆資料時發生錯誤:`, error.message);
            }
        });
        
        console.log(`✅ 成功轉換 ${parkingStores.length} 筆停車場資料`);
        
        // 4. 檢查是否已存在停車場資料
        console.log('\n🔍 4. 檢查現有停車場資料...');
        const { data: existingParking, error: checkError } = await supabase
            .from('stores')
            .select('id, store_name')
            .eq('category', '停車場');
        
        if (checkError) {
            console.error('❌ 檢查現有資料失敗:', checkError.message);
            return false;
        }
        
        console.log(`📊 現有停車場資料: ${existingParking.length} 筆`);
        
        if (existingParking.length > 0) {
            console.log('⚠️ 發現現有停車場資料:');
            existingParking.forEach(parking => {
                console.log(`   - ${parking.store_name}`);
            });
            
            // 詢問是否要清除現有資料
            console.log('\n💡 建議: 先清除現有停車場資料，再匯入新資料');
        }
        
        // 5. 清除現有停車場資料（如果需要）
        if (existingParking.length > 0) {
            console.log('\n🗑️ 5. 清除現有停車場資料...');
            const { error: deleteError } = await supabase
                .from('stores')
                .delete()
                .eq('category', '停車場');
            
            if (deleteError) {
                console.error('❌ 清除現有資料失敗:', deleteError.message);
                return false;
            }
            
            console.log(`✅ 已清除 ${existingParking.length} 筆現有停車場資料`);
        }
        
        // 6. 匯入新資料
        console.log('\n📥 6. 匯入停車場資料...');
        let successCount = 0;
        let errorCount = 0;
        
        // 分批匯入，避免一次匯入太多資料
        const batchSize = 10;
        for (let i = 0; i < parkingStores.length; i += batchSize) {
            const batch = parkingStores.slice(i, i + batchSize);
            
            const { data, error } = await supabase
                .from('stores')
                .insert(batch)
                .select('id, store_name');
            
            if (error) {
                console.error(`❌ 匯入第 ${i + 1}-${Math.min(i + batchSize, parkingStores.length)} 筆資料失敗:`, error.message);
                errorCount += batch.length;
            } else {
                console.log(`✅ 成功匯入第 ${i + 1}-${Math.min(i + batchSize, parkingStores.length)} 筆資料`);
                successCount += data.length;
            }
        }
        
        console.log(`\n📊 匯入結果:`);
        console.log(`   成功: ${successCount} 筆`);
        console.log(`   失敗: ${errorCount} 筆`);
        
        // 7. 驗證匯入結果
        console.log('\n🔍 7. 驗證匯入結果...');
        const { data: finalParking, error: verifyError } = await supabase
            .from('stores')
            .select('id, store_name, address, features')
            .eq('category', '停車場');
        
        if (verifyError) {
            console.error('❌ 驗證失敗:', verifyError.message);
            return false;
        }
        
        console.log(`✅ 最終停車場資料: ${finalParking.length} 筆`);
        
        if (finalParking.length > 0) {
            console.log('\n📋 前5筆匯入的停車場:');
            finalParking.slice(0, 5).forEach((parking, i) => {
                console.log(`   ${i + 1}. ${parking.store_name}`);
                console.log(`      地址: ${parking.address || '無'}`);
                try {
                    const features = JSON.parse(parking.features);
                    console.log(`      車位數: ${features.capacity || '無'}`);
                    console.log(`      費率: ${features.hourly_rate || '無'}`);
                } catch (e) {
                    console.log(`      特色: ${parking.features}`);
                }
                console.log('---');
            });
        }
        
        // 8. 更新分類統計
        console.log('\n📊 8. 更新分類統計...');
        const { data: allStores, error: statsError } = await supabase
            .from('stores')
            .select('category');
        
        if (statsError) {
            console.error('❌ 獲取統計資料失敗:', statsError.message);
        } else {
            const categoryStats = {};
            allStores.forEach(store => {
                const category = store.category || '未分類';
                categoryStats[category] = (categoryStats[category] || 0) + 1;
            });
            
            console.log('\n📊 最新分類統計:');
            Object.keys(categoryStats).sort((a, b) => categoryStats[b] - categoryStats[a]).forEach(category => {
                console.log(`   ${category}: ${categoryStats[category]} 家`);
            });
        }
        
        console.log('\n🎉 停車場資料匯入完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 匯入過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行匯入
importParkingData().then(success => {
    if (success) {
        console.log('\n✅ 匯入成功完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 匯入失敗！');
        process.exit(1);
    }
});
