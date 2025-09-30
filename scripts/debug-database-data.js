/**
 * 診斷資料庫資料問題
 * 檢查 stores 表的實際資料狀況
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

async function debugDatabaseData() {
  console.log('🔍 診斷資料庫資料問題...\n');
  
  try {
    // 1. 檢查 stores 表總數
    console.log('1️⃣ 檢查 stores 表總數...');
    const totalResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=count`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    if (totalResponse.ok) {
      const totalCount = totalResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
      console.log(`✅ stores 表總數: ${totalCount}`);
    } else {
      console.log(`❌ 總數查詢失敗: ${totalResponse.status}`);
    }
    
    // 2. 檢查 approval 狀態分布
    console.log('\n2️⃣ 檢查 approval 狀態分布...');
    const approvalResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=approval`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (approvalResponse.ok) {
      const approvalData = await approvalResponse.json();
      const approvalStats = approvalData.reduce((acc, item) => {
        acc[item.approval] = (acc[item.approval] || 0) + 1;
        return acc;
      }, {});
      console.log('✅ approval 狀態分布:');
      Object.entries(approvalStats).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    } else {
      console.log(`❌ approval 查詢失敗: ${approvalResponse.status}`);
    }
    
    // 3. 檢查 approved 商家的詳細資訊
    console.log('\n3️⃣ 檢查 approved 商家...');
    const approvedResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=id,store_name,approval,is_trusted,is_partner_store&approval=eq.approved&limit=5`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (approvedResponse.ok) {
      const approvedData = await approvedResponse.json();
      console.log(`✅ approved 商家數量: ${approvedData.length}`);
      if (approvedData.length > 0) {
        console.log('✅ approved 商家範例:');
        approvedData.forEach((store, i) => {
          console.log(`   ${i+1}. ${store.store_name} (trusted: ${store.is_trusted}, partner: ${store.is_partner_store})`);
        });
      } else {
        console.log('⚠️ 沒有 approved 商家');
      }
    } else {
      console.log(`❌ approved 查詢失敗: ${approvedResponse.status}`);
    }
    
    // 4. 檢查 discount_info 欄位
    console.log('\n4️⃣ 檢查 discount_info 欄位...');
    const discountResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=id,discount_info&approval=eq.approved&discount_info=not.is.null&limit=3`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (discountResponse.ok) {
      const discountData = await discountResponse.json();
      console.log(`✅ 有 discount_info 的商家: ${discountData.length}`);
      if (discountData.length > 0) {
        console.log('✅ discount_info 範例:');
        discountData.forEach((store, i) => {
          console.log(`   ${i+1}. ${store.discount_info}`);
        });
      }
    } else {
      console.log(`❌ discount_info 查詢失敗: ${discountResponse.status}`);
    }
    
    // 5. 檢查所有商家的範例資料
    console.log('\n5️⃣ 檢查所有商家範例...');
    const sampleResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=*&limit=2`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (sampleResponse.ok) {
      const sampleData = await sampleResponse.json();
      console.log(`✅ 所有商家範例 (${sampleData.length} 筆):`);
      sampleData.forEach((store, i) => {
        console.log(`   ${i+1}. ${store.store_name || '無名稱'}`);
        console.log(`       approval: ${store.approval}`);
        console.log(`       is_trusted: ${store.is_trusted}`);
        console.log(`       is_partner_store: ${store.is_partner_store}`);
        console.log(`       discount_info: ${store.discount_info ? '有' : '無'}`);
      });
    } else {
      console.log(`❌ 範例查詢失敗: ${sampleResponse.status}`);
    }
    
  } catch (error) {
    console.log(`❌ 診斷過程發生錯誤: ${error.message}`);
  }
  
  console.log('\n🎯 診斷完成！');
  console.log('\n💡 可能的原因:');
  console.log('1. stores 表沒有資料');
  console.log('2. 所有商家的 approval 都不是 "approved"');
  console.log('3. 欄位名稱與代碼中的不同');
  console.log('4. 資料庫權限問題');
}

// 執行診斷
debugDatabaseData().catch(console.error);
