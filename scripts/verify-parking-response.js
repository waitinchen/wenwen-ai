#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyParkingResponse() {
    console.log('🔍 檢查高文文停車場資訊回覆的正確性...');
    
    try {
        // 1. 查詢所有停車場資料
        console.log('\n📊 1. 查詢資料庫中的停車場資料...');
        const { data: allParking, error: allError } = await supabase
            .from('stores')
            .select('*')
            .eq('category', '停車場');
        
        if (allError) {
            console.error('❌ 查詢失敗:', allError.message);
            return false;
        }
        
        console.log(`✅ 資料庫中共有 ${allParking.length} 筆停車場資料`);
        
        // 2. 檢查高文文提到的三個停車場
        console.log('\n🔍 2. 檢查高文文提到的停車場...');
        
        const mentionedParking = [
            '文山公園停車場',
            '鳳山區公所停車場', 
            '鳳山火車站停車場'
        ];
        
        let foundCount = 0;
        const actualParking = [];
        
        mentionedParking.forEach(parkingName => {
            const found = allParking.find(p => 
                p.store_name.includes(parkingName) || 
                parkingName.includes(p.store_name)
            );
            
            if (found) {
                foundCount++;
                actualParking.push(found);
                console.log(`✅ 找到: ${found.store_name}`);
            } else {
                console.log(`❌ 未找到: ${parkingName}`);
            }
        });
        
        console.log(`\n📊 高文文提到的停車場: ${foundCount}/${mentionedParking.length} 個存在於資料庫中`);
        
        // 3. 檢查停車場資訊的準確性
        console.log('\n🔍 3. 檢查停車場資訊的準確性...');
        
        actualParking.forEach((parking, i) => {
            console.log(`\n--- 停車場 ${i + 1}: ${parking.store_name} ---`);
            console.log(`資料庫地址: ${parking.address || '無'}`);
            console.log(`資料庫營業時間: ${parking.business_hours || '無'}`);
            console.log(`資料庫服務: ${parking.services || '無'}`);
            
            try {
                const features = JSON.parse(parking.features);
                console.log(`資料庫車位數: ${features.capacity || '無'}`);
                console.log(`資料庫費率: ${features.hourly_rate || '無'}`);
            } catch (e) {
                console.log(`資料庫特色: ${parking.features}`);
            }
        });
        
        // 4. 對比高文文的回覆
        console.log('\n📋 4. 高文文回覆內容對比:');
        
        const aiResponse = {
            '文山公園停車場': {
                address: '位於文山路上',
                hourly_rate: '每小時20元',
                daily_max: '每天最高收費100元',
                hours: '上午7點至晚上10點',
                capacity: '200個停車位'
            },
            '鳳山區公所停車場': {
                address: '位於文化路上',
                hourly_rate: '每小時20元',
                daily_max: '每天最高收費100元',
                hours: '上午7點至晚上10點',
                capacity: '150個停車位'
            },
            '鳳山火車站停車場': {
                address: '位於中山東路上',
                hourly_rate: '每小時20元',
                daily_max: '每天最高收費100元',
                hours: '上午6點至晚上10點',
                capacity: '300個停車位'
            }
        };
        
        // 5. 分析正確性
        console.log('\n📊 5. 正確性分析:');
        
        let accuracyScore = 0;
        let totalChecks = 0;
        
        actualParking.forEach(parking => {
            const parkingName = parking.store_name;
            const aiInfo = aiResponse[parkingName];
            
            if (aiInfo) {
                console.log(`\n🔍 檢查 ${parkingName}:`);
                
                // 檢查地址
                totalChecks++;
                const dbAddress = parking.address || '';
                if (aiInfo.address.includes('文山路') && dbAddress.includes('文山')) {
                    console.log(`✅ 地址相符: ${aiInfo.address}`);
                    accuracyScore++;
                } else if (aiInfo.address.includes('文化路') && dbAddress.includes('文化')) {
                    console.log(`✅ 地址相符: ${aiInfo.address}`);
                    accuracyScore++;
                } else if (aiInfo.address.includes('中山東路') && dbAddress.includes('中山')) {
                    console.log(`✅ 地址相符: ${aiInfo.address}`);
                    accuracyScore++;
                } else {
                    console.log(`❌ 地址不符: AI說${aiInfo.address}, 資料庫是${dbAddress}`);
                }
                
                // 檢查車位數
                totalChecks++;
                try {
                    const features = JSON.parse(parking.features);
                    const dbCapacity = features.capacity || '';
                    const aiCapacity = aiInfo.capacity.replace('個停車位', '');
                    
                    if (dbCapacity === aiCapacity) {
                        console.log(`✅ 車位數相符: ${aiInfo.capacity}`);
                        accuracyScore++;
                    } else {
                        console.log(`❌ 車位數不符: AI說${aiInfo.capacity}, 資料庫是${dbCapacity}`);
                    }
                } catch (e) {
                    console.log(`❌ 無法解析車位數資訊`);
                }
                
                // 檢查費率
                totalChecks++;
                try {
                    const features = JSON.parse(parking.features);
                    const dbRate = features.hourly_rate || '';
                    
                    if (dbRate.includes('20元') && aiInfo.hourly_rate.includes('20元')) {
                        console.log(`✅ 費率相符: ${aiInfo.hourly_rate}`);
                        accuracyScore++;
                    } else {
                        console.log(`❌ 費率不符: AI說${aiInfo.hourly_rate}, 資料庫是${dbRate}`);
                    }
                } catch (e) {
                    console.log(`❌ 無法解析費率資訊`);
                }
            }
        });
        
        const accuracyPercentage = totalChecks > 0 ? (accuracyScore / totalChecks * 100).toFixed(1) : 0;
        
        console.log(`\n📊 正確性評估:`);
        console.log(`   正確項目: ${accuracyScore}/${totalChecks}`);
        console.log(`   正確率: ${accuracyPercentage}%`);
        
        // 6. 總結
        console.log('\n📋 6. 總結:');
        
        if (foundCount === 0) {
            console.log('❌ 高文文提到的停車場都不存在於資料庫中');
            console.log('💡 這可能是因為：');
            console.log('   - 停車場名稱不匹配');
            console.log('   - 資料庫中的停車場名稱不同');
            console.log('   - 高文文使用了舊的或錯誤的資訊');
        } else if (foundCount < mentionedParking.length) {
            console.log(`⚠️ 高文文提到的 ${mentionedParking.length - foundCount} 個停車場不存在於資料庫中`);
        } else {
            console.log('✅ 高文文提到的所有停車場都存在於資料庫中');
        }
        
        if (accuracyPercentage >= 80) {
            console.log('✅ 停車場資訊基本正確');
        } else if (accuracyPercentage >= 60) {
            console.log('⚠️ 停車場資訊部分正確，需要改進');
        } else {
            console.log('❌ 停車場資訊多處錯誤，需要修正');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 檢查過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行檢查
verifyParkingResponse().then(success => {
    if (success) {
        console.log('\n✅ 檢查完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 檢查失敗！');
        process.exit(1);
    }
});
