import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpecificIssues() {
  console.log('🔍 測試特定問題...\n');

  // 測試 1: 英語學習推薦
  console.log('📚 測試 1: 英語學習推薦');
  try {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `test-english-${Date.now()}`,
        message: { role: 'user', content: '我想學英語' },
        user_meta: { 
          external_id: 'test-user-english',
          display_name: '英語學習測試用戶',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }
    });

    if (error) {
      console.error('❌ 英語學習測試失敗:', error);
    } else {
      console.log('✅ 英語學習測試成功');
      console.log('回應:', data.response);
      console.log('推薦清單:', data.recommendation?.map(r => r.name) || []);
      console.log('調試資訊:', data.debug);
    }
  } catch (err) {
    console.error('❌ 英語學習測試異常:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 2: 停車資訊
  console.log('🅿️ 測試 2: 停車資訊');
  try {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `test-parking-${Date.now()}`,
        message: { role: 'user', content: '停車資訊' },
        user_meta: { 
          external_id: 'test-user-parking',
          display_name: '停車資訊測試用戶',
          avatar_url: 'https://example.com/avatar.jpg'
        }
      }
    });

    if (error) {
      console.error('❌ 停車資訊測試失敗:', error);
    } else {
      console.log('✅ 停車資訊測試成功');
      console.log('回應:', data.response);
      console.log('推薦清單:', data.recommendation?.map(r => r.name) || []);
      console.log('調試資訊:', data.debug);
    }
  } catch (err) {
    console.error('❌ 停車資訊測試異常:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 3: 檢查資料庫中的停車場資料
  console.log('🗄️ 測試 3: 檢查資料庫中的停車場資料');
  try {
    const { data: parkingData, error: parkingError } = await supabase
      .from('stores')
      .select('id, store_name, category, address, phone, features')
      .eq('category', '停車場')
      .limit(5);

    if (parkingError) {
      console.error('❌ 停車場資料查詢失敗:', parkingError);
    } else {
      console.log('✅ 停車場資料查詢成功');
      console.log('停車場數量:', parkingData.length);
      parkingData.forEach((parking, index) => {
        console.log(`${index + 1}. ${parking.store_name} - ${parking.address}`);
      });
    }
  } catch (err) {
    console.error('❌ 停車場資料查詢異常:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 測試 4: 檢查資料庫中的肯塔基美語
  console.log('🎓 測試 4: 檢查資料庫中的肯塔基美語');
  try {
    const { data: kentuckyData, error: kentuckyError } = await supabase
      .from('stores')
      .select('id, store_name, category, address, phone, features, is_partner_store')
      .ilike('store_name', '%肯塔基%')
      .limit(3);

    if (kentuckyError) {
      console.error('❌ 肯塔基美語資料查詢失敗:', kentuckyError);
    } else {
      console.log('✅ 肯塔基美語資料查詢成功');
      console.log('肯塔基美語數量:', kentuckyData.length);
      kentuckyData.forEach((store, index) => {
        console.log(`${index + 1}. ${store.store_name} - ${store.address} (特約: ${store.is_partner_store})`);
      });
    }
  } catch (err) {
    console.error('❌ 肯塔基美語資料查詢異常:', err.message);
  }
}

testSpecificIssues().catch(console.error);
