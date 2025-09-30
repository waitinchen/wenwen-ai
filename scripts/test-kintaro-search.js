/**
 * 測試金太郎壽司搜尋
 */

const testData = {
  message: { content: '金太郎壽司' },
  session_id: 'test-kintaro-search',
  user_meta: { external_id: 'test-user' }
};

fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('=== 金太郎壽司搜尋測試 ===');
  console.log('意圖:', data.data?.intent);
  console.log('信心度:', data.data?.confidence);
  console.log('推薦商家數量:', data.data?.recommended_stores?.length || 0);
  console.log('\n=== 推薦商家 ===');
  data.data?.recommended_stores?.forEach((store, index) => {
    console.log(`${index + 1}. ${store.name} - ${store.category}`);
  });
  console.log('\n=== 回應內容 ===');
  console.log(data.data?.response);
})
.catch(error => {
  console.error('測試失敗:', error);
});


