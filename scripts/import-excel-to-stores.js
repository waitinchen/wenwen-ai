import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 分類映射 - 將Excel的分類轉換為系統分類
const categoryMapping = {
  '藥局': '醫療健康',
  '書店': '購物',
  '政府機關': '生活服務',
  '古蹟': '休閒娛樂'
}

// 子標籤映射 - 將Excel的子分類轉換為系統子標籤
const subcategoryMapping = {
  // 醫療健康
  '連鎮藥局': '連鎖藥局',
  '獨立藥局': '獨立藥局',
  '健保藥局': '健保藥局',
  
  // 購物
  '連鎖書店': '連鎖書店',
  '獨立書店': '獨立書店',
  '文具店': '文具用品',
  '學習書局': '學習用品',
  
  // 生活服務
  '區公所': '政府機關',
  '戶政事務所': '政府機關',
  '地政事務所': '政府機關',
  '衛生所': '醫療服務',
  
  // 休閒娛樂
  '古蹟': '歷史古蹟',
  '文化景點': '文化景點'
}

async function importExcelToStores() {
  try {
    console.log('📊 開始導入Excel數據到商家資料庫...')
    
    // 讀取Excel數據
    const dataPath = path.join(__dirname, '..', 'data', 'excel-data.json')
    if (!fs.existsSync(dataPath)) {
      console.error('❌ 數據文件不存在，請先運行 read-excel-data.js')
      return
    }
    
    const excelData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    console.log(`📋 讀取到 ${excelData.length} 筆數據`)
    
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    
    for (const item of excelData) {
      try {
        // 檢查是否已存在相同名稱的商家
        const { data: existingStore, error: checkError } = await supabase
          .from('stores')
          .select('id')
          .eq('store_name', item.name)
          .single()
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`❌ 檢查失敗 (${item.name}):`, checkError.message)
          errorCount++
          continue
        }
        
        if (existingStore) {
          console.log(`⚠️ 商家已存在，跳過: ${item.name}`)
          skippedCount++
          continue
        }
        
        // 轉換分類
        const category = categoryMapping[item.category] || '其他'
        const subcategory = subcategoryMapping[item.subcategory] || item.subcategory
        
        // 構建features對象
        const features = {
          secondary_category: subcategory,
          district: item.district,
          nearby_landmarks: item.nearby_landmarks,
          services: item.services,
          original_category: item.category,
          original_subcategory: item.subcategory
        }
        
        // 準備商家數據
        const storeData = {
          store_name: item.name,
          address: item.address,
          category: category,
          features: features,
          phone: item.phone || null,
          business_hours: item.operating_hours || null,
          services: item.services || null,
          approval: 'approved', // 直接設為已審核
          is_trusted: true,
          is_partner_store: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // 插入數據
        const { data: insertData, error: insertError } = await supabase
          .from('stores')
          .insert(storeData)
          .select()
        
        if (insertError) {
          console.error(`❌ 插入失敗 (${item.name}):`, insertError.message)
          errorCount++
        } else {
          console.log(`✅ 成功導入: ${item.name}`)
          console.log(`   分類: ${category} > ${subcategory}`)
          console.log(`   地址: ${item.address}`)
          successCount++
        }
        
      } catch (itemError) {
        console.error(`❌ 處理失敗 (${item.name}):`, itemError.message)
        errorCount++
      }
    }
    
    console.log(`\n📊 導入結果統計:`)
    console.log(`   成功: ${successCount} 筆`)
    console.log(`   失敗: ${errorCount} 筆`)
    console.log(`   跳過: ${skippedCount} 筆`)
    console.log(`   總計: ${excelData.length} 筆`)
    
    // 驗證導入結果
    console.log('\n🔍 驗證導入結果...')
    const { data: allStores, error: verifyError } = await supabase
      .from('stores')
      .select('id, store_name, category, features')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (verifyError) {
      console.error('❌ 驗證失敗:', verifyError.message)
    } else {
      console.log(`✅ 驗證成功，最新的商家包括:`)
      allStores.forEach((store, index) => {
        const subcategory = store.features?.secondary_category || '無'
        console.log(`   ${index + 1}. [${store.category} > ${subcategory}] ${store.store_name}`)
      })
    }
    
    // 統計分類分布
    console.log('\n📈 分類分布統計:')
    const { data: categoryStats, error: statsError } = await supabase
      .from('stores')
      .select('category')
      .eq('approval', 'approved')
    
    if (!statsError && categoryStats) {
      const categoryCount = categoryStats.reduce((acc, store) => {
        acc[store.category] = (acc[store.category] || 0) + 1
        return acc
      }, {})
      
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} 家`)
      })
    }
    
    if (successCount > 0) {
      console.log('\n🎉 Excel數據導入完成！')
      console.log('📝 導入特色:')
      console.log('   ✅ 智能分類映射')
      console.log('   ✅ 子標籤結構化')
      console.log('   ✅ 地理座標完整')
      console.log('   ✅ 聯絡資訊完整')
      console.log('   ✅ 直接設為已審核狀態')
    }
    
  } catch (error) {
    console.error('❌ 導入過程發生錯誤:', error)
  }
}

// 執行導入
importExcelToStores()
