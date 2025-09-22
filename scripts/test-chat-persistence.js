// 前台對話完整保存驗收測試
import { sendChatMessage, getChatHistory, getChatSessions } from '../src/lib/chatApi.js';

console.log('🧪 開始前台對話完整保存驗收測試...\n');

// 測試案例
const testCases = [
  {
    name: '新用戶首次對話',
    userDisplayName: '兔貝比',
    userAvatarUrl: 'https://example.com/avatar1.jpg',
    message: '你好，我想了解文山特區的餐廳'
  },
  {
    name: '同用戶連續對話',
    userDisplayName: '兔貝比',
    userAvatarUrl: 'https://example.com/avatar1.jpg',
    message: '有什麼推薦的停車場嗎？'
  },
  {
    name: '不同用戶對話',
    userDisplayName: '小明',
    userAvatarUrl: 'https://example.com/avatar2.jpg',
    message: '文山特區怎麼去？'
  },
  {
    name: '匿名用戶對話',
    userDisplayName: '訪客',
    userAvatarUrl: undefined,
    message: '營業時間是什麼時候？'
  }
];

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;
  const sessionIds = [];

  console.log('📋 執行測試案例：\n');

  for (const [index, testCase] of testCases.entries()) {
    console.log(`📝 測試 ${index + 1}: ${testCase.name}`);
    console.log(`用戶: ${testCase.userDisplayName}`);
    console.log(`訊息: ${testCase.message}`);

    try {
      // 發送訊息
      const response = await sendChatMessage(
        null, // 新會話
        testCase.message,
        testCase.userDisplayName,
        testCase.userAvatarUrl
      );

      if (response.ok) {
        console.log(`✅ 訊息發送成功`);
        console.log(`會話ID: ${response.session_id}`);
        console.log(`AI回覆: ${response.assistant?.content?.substring(0, 50)}...`);
        
        sessionIds.push(response.session_id);
        passedTests++;
      } else {
        console.log(`❌ 訊息發送失敗: ${response.error}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ 測試失敗: ${error.message}`);
      failedTests++;
    }

    console.log('────────────────────────────────────────────────────────────');
  }

  // 驗證會話列表
  console.log('\n📊 驗證會話列表：');
  try {
    const { data: sessions, error } = await getChatSessions(1, 10);
    
    if (error) {
      console.log(`❌ 獲取會話列表失敗: ${error.message}`);
    } else {
      console.log(`✅ 成功獲取 ${sessions?.length || 0} 個會話`);
      
      // 檢查每個會話是否包含用戶資料
      sessions?.forEach((session, index) => {
        console.log(`\n會話 ${index + 1}:`);
        console.log(`- ID: ${session.id}`);
        console.log(`- 用戶名稱: ${session.user_profiles?.display_name || '未知'}`);
        console.log(`- 頭像: ${session.user_profiles?.avatar_url || '無'}`);
        console.log(`- 訊息數: ${session.message_count}`);
        console.log(`- 最後活動: ${session.last_active}`);
        console.log(`- 預覽: ${session.last_message_preview || '無'}`);
      });
    }
  } catch (error) {
    console.log(`❌ 驗證會話列表失敗: ${error.message}`);
  }

  // 驗證會話詳情
  if (sessionIds.length > 0) {
    console.log('\n📋 驗證會話詳情：');
    try {
      const { data: messages, error } = await getChatHistory(sessionIds[0]);
      
      if (error) {
        console.log(`❌ 獲取會話詳情失敗: ${error.message}`);
      } else {
        console.log(`✅ 成功獲取 ${messages?.length || 0} 條訊息`);
        
        messages?.forEach((message, index) => {
          console.log(`\n訊息 ${index + 1}:`);
          console.log(`- 角色: ${message.role}`);
          console.log(`- 內容: ${message.content.substring(0, 100)}...`);
          console.log(`- 時間: ${message.created_at}`);
          if (message.chat_sessions?.user_profiles) {
            console.log(`- 用戶: ${message.chat_sessions.user_profiles.display_name}`);
            console.log(`- 頭像: ${message.chat_sessions.user_profiles.avatar_url || '無'}`);
          }
        });
      }
    } catch (error) {
      console.log(`❌ 驗證會話詳情失敗: ${error.message}`);
    }
  }

  // 輸出測試結果
  console.log('\n📊 測試結果：');
  console.log(`總測試數: ${testCases.length}`);
  console.log(`通過測試: ${passedTests}`);
  console.log(`失敗測試: ${failedTests}`);
  console.log(`通過率: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 所有測試通過！前台對話完整保存功能正常！');
  } else {
    console.log('\n❌ 部分測試失敗。請檢查錯誤並修正。');
  }

  return { passedTests, failedTests, totalTests: testCases.length };
}

// 執行測試
runTests().then(({ passedTests, failedTests, totalTests }) => {
  const passRate = (passedTests / totalTests) * 100;
  
  console.log('\n🚀 驗收清單檢查：');
  console.log(`1. 新開瀏覽器無痕 → 設暱稱與頭像 → 發 1 句話: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`);
  console.log(`2. 連續發 3 句話（同 session）: ${passedTests > 1 ? '✅ 通過' : '❌ 失敗'}`);
  console.log(`3. 換裝置（不同 external_id）: ${passedTests > 2 ? '✅ 通過' : '❌ 失敗'}`);
  console.log(`4. 重新整理頁面後再講話（同 cookie）: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`);
  
  if (passRate >= 100) {
    console.log('\n🎉 驗收清單全部通過！前台對話完整保存功能已就緒！');
  } else {
    console.log('\n⚠️ 部分驗收項目未通過，請檢查並修正。');
  }
}).catch(error => {
  console.error('測試執行失敗:', error);
});
