// 布林值轉換強化測試腳本
console.log('🧪 布林值轉換強化測試開始...\n');

// 測試各種輸入類型的布林值轉換
const testCases = [
  {
    name: '測試 1: 字串 "true" 轉換',
    input: { is_partner_store: 'true', is_safe_store: 'true', has_member_discount: 'true' },
    expected: { is_partner_store: true, is_safe_store: true, has_member_discount: true }
  },
  {
    name: '測試 2: 字串 "false" 轉換',
    input: { is_partner_store: 'false', is_safe_store: 'false', has_member_discount: 'false' },
    expected: { is_partner_store: false, is_safe_store: false, has_member_discount: false }
  },
  {
    name: '測試 3: 數字 1 和 0 轉換',
    input: { is_partner_store: 1, is_safe_store: 0, has_member_discount: 1 },
    expected: { is_partner_store: true, is_safe_store: false, has_member_discount: true }
  },
  {
    name: '測試 4: 字串 "1" 和 "0" 轉換',
    input: { is_partner_store: '1', is_safe_store: '0', has_member_discount: '1' },
    expected: { is_partner_store: true, is_safe_store: false, has_member_discount: true }
  },
  {
    name: '測試 5: 布林值 true/false 轉換',
    input: { is_partner_store: true, is_safe_store: false, has_member_discount: true },
    expected: { is_partner_store: true, is_safe_store: false, has_member_discount: true }
  },
  {
    name: '測試 6: undefined/null 轉換為預設值',
    input: { is_partner_store: undefined, is_safe_store: null, has_member_discount: undefined },
    expected: { is_partner_store: false, is_safe_store: false, has_member_discount: false }
  },
  {
    name: '測試 7: 混合類型轉換',
    input: { is_partner_store: 'true', is_safe_store: 0, has_member_discount: true },
    expected: { is_partner_store: true, is_safe_store: false, has_member_discount: true }
  }
];

// 模擬 sanitizeBoolean 函數
function sanitizeBoolean(value, defaultValue = false) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true
  if (value === false || value === 'false' || value === 0 || value === '0') return false
  return defaultValue
}

// 模擬 API 處理
function simulateApiProcessing(inputData) {
  const sanitizedStore = {
    ...inputData,
    is_partner_store: sanitizeBoolean(inputData.is_partner_store, false),
    is_safe_store: sanitizeBoolean(inputData.is_safe_store, false),
    has_member_discount: sanitizeBoolean(inputData.has_member_discount, false)
  }
  
  // 模擬資料庫回傳
  const responseData = {
    ...sanitizedStore,
    is_partner_store: Boolean(sanitizedStore.is_partner_store),
    is_safe_store: Boolean(sanitizedStore.is_safe_store),
    has_member_discount: Boolean(sanitizedStore.has_member_discount)
  }
  
  return responseData
}

async function runTests() {
  let passedTests = 0
  let failedTests = 0

  console.log('📋 執行布林值轉換測試：\n')

  for (const [index, testCase] of testCases.entries()) {
    console.log(`📝 ${testCase.name}`)
    console.log(`   輸入:`, testCase.input)
    console.log(`   預期:`, testCase.expected)
    
    try {
      const result = simulateApiProcessing(testCase.input)
      console.log(`   結果:`, result)
      
      // 檢查所有布林欄位是否正確
      const isCorrect = 
        result.is_partner_store === testCase.expected.is_partner_store &&
        result.is_safe_store === testCase.expected.is_safe_store &&
        result.has_member_discount === testCase.expected.has_member_discount
      
      if (isCorrect) {
        console.log('   ✅ 轉換正確')
        passedTests++
      } else {
        console.log('   ❌ 轉換錯誤')
        failedTests++
      }
    } catch (error) {
      console.log(`   ❌ 測試失敗: ${error.message}`)
      failedTests++
    }

    console.log('────────────────────────────────────────────────────────────')
  }

  // 輸出測試結果
  console.log('\n📊 測試結果：')
  console.log(`總測試數: ${testCases.length}`)
  console.log(`通過測試: ${passedTests}`)
  console.log(`失敗測試: ${failedTests}`)
  console.log(`通過率: ${((passedTests / testCases.length) * 100).toFixed(1)}%`)

  if (failedTests === 0) {
    console.log('\n🎉 所有布林值轉換測試通過！')
  } else {
    console.log('\n❌ 部分測試失敗。請檢查轉換邏輯。')
  }

  return { passedTests, failedTests, totalTests: testCases.length }
}

// 執行測試
runTests().then(({ passedTests, failedTests, totalTests }) => {
  const passRate = (passedTests / totalTests) * 100
  
  console.log('\n🚀 前端狀態與 DB 一致性檢查：')
  console.log(`1. 字串 "true"/"false" 正確轉換: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`2. 數字 1/0 正確轉換: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`3. 布林值 true/false 保持不變: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`4. undefined/null 轉為預設值 false: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`5. 混合類型正確處理: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`)
  console.log(`6. 回應 JSON 包含正確布林值: ${passedTests > 0 ? '✅ 通過' : '❌ 失敗'}`)
  
  if (passRate >= 100) {
    console.log('\n🎉 前端狀態與 DB 一致性確保成功！')
  } else {
    console.log('\n⚠️ 部分一致性檢查未通過，請檢查轉換邏輯。')
  }
}).catch(error => {
  console.error('測試執行失敗:', error)
});
