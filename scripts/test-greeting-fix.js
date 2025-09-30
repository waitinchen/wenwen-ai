/**
 * 問候語修復測試腳本
 * 版本: WEN 1.4.1
 * 功能: 測試問候語回應修復
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(supabaseUrl, supabaseKey)

class GreetingFixTester {
  constructor() {
    this.testResults = []
  }

  async testGreetingScenarios() {
    console.log('🧪 開始問候語修復測試')
    console.log('=' .repeat(50))

    const testCases = [
      {
        message: '嗨! 你好',
        expectedIntent: 'VAGUE_CHAT',
        description: '基本問候語'
      },
      {
        message: '你好',
        expectedIntent: 'VAGUE_CHAT', 
        description: '簡單問候語'
      },
      {
        message: '嗨',
        expectedIntent: 'VAGUE_CHAT',
        description: '單字問候語'
      },
      {
        message: '哈囉',
        expectedIntent: 'VAGUE_CHAT',
        description: '哈囉問候語'
      },
      {
        message: 'hello',
        expectedIntent: 'VAGUE_CHAT',
        description: '英文問候語'
      },
      {
        message: '好的',
        expectedIntent: 'CONFIRMATION',
        description: '確認回應'
      },
      {
        message: '可以',
        expectedIntent: 'CONFIRMATION',
        description: '確認回應'
      },
      {
        message: '有什麼美食推薦？',
        expectedIntent: 'FOOD',
        description: '美食查詢'
      }
    ]

    for (const testCase of testCases) {
      await this.testSingleCase(testCase)
    }

    this.generateTestReport()
  }

  async testSingleCase(testCase) {
    console.log(`\n📝 測試: ${testCase.description}`)
    console.log(`   輸入: "${testCase.message}"`)
    console.log(`   預期意圖: ${testCase.expectedIntent}`)

    try {
      const testData = {
        message: { content: testCase.message },
        session_id: `test-greeting-${Date.now()}`,
        user_meta: { external_id: 'test-user' }
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/claude-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()

      if (response.ok && data.data) {
        const actualIntent = data.data.intent
        const confidence = data.data.confidence
        const responseText = data.data.response

        const isCorrect = actualIntent === testCase.expectedIntent
        const status = isCorrect ? '✅' : '❌'

        console.log(`   實際意圖: ${actualIntent}`)
        console.log(`   信心度: ${confidence}`)
        console.log(`   結果: ${status}`)

        if (!isCorrect) {
          console.log(`   ❌ 錯誤: 預期 ${testCase.expectedIntent}，實際 ${actualIntent}`)
        }

        console.log(`   回應: ${responseText.substring(0, 100)}...`)

        this.addTestResult(testCase.description, isCorrect, {
          input: testCase.message,
          expectedIntent: testCase.expectedIntent,
          actualIntent,
          confidence,
          response: responseText
        })

      } else {
        console.log(`   ❌ API 調用失敗: ${data.error || response.statusText}`)
        this.addTestResult(testCase.description, false, {
          input: testCase.message,
          error: data.error || response.statusText
        })
      }

    } catch (error) {
      console.log(`   ❌ 測試異常: ${error.message}`)
      this.addTestResult(testCase.description, false, {
        input: testCase.message,
        error: error.message
      })
    }
  }

  addTestResult(description, success, details) {
    this.testResults.push({
      description,
      success,
      details,
      timestamp: new Date().toISOString()
    })
  }

  generateTestReport() {
    console.log('\n📋 測試報告')
    console.log('=' .repeat(50))

    const successCount = this.testResults.filter(r => r.success).length
    const totalCount = this.testResults.length
    const successRate = Math.round((successCount / totalCount) * 100)

    console.log(`\n🎯 總體結果:`)
    console.log(`   總測試項目: ${totalCount}`)
    console.log(`   成功項目: ${successCount}`)
    console.log(`   成功率: ${successRate}%`)

    console.log(`\n📊 詳細結果:`)
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      console.log(`   ${index + 1}. ${status} ${result.description}`)
      if (!result.success) {
        console.log(`      錯誤: ${result.details.error || '意圖分類錯誤'}`)
      }
    })

    if (successRate >= 90) {
      console.log(`\n🎉 問候語修復測試通過！`)
    } else if (successRate >= 70) {
      console.log(`\n⚠️  問候語修復基本成功，但需要進一步優化。`)
    } else {
      console.log(`\n❌ 問候語修復失敗，需要重新檢查邏輯。`)
    }

    // 特別檢查問候語測試
    const greetingTests = this.testResults.filter(r => 
      r.details.input && (
        r.details.input.includes('嗨') || 
        r.details.input.includes('你好') || 
        r.details.input.includes('哈囉') ||
        r.details.input.includes('hello')
      )
    )

    const greetingSuccess = greetingTests.filter(r => r.success).length
    const greetingTotal = greetingTests.length

    console.log(`\n👋 問候語專項測試:`)
    console.log(`   問候語測試項目: ${greetingTotal}`)
    console.log(`   問候語成功項目: ${greetingSuccess}`)
    console.log(`   問候語成功率: ${Math.round((greetingSuccess / greetingTotal) * 100)}%`)

    if (greetingSuccess === greetingTotal) {
      console.log(`   🎉 所有問候語測試都通過！`)
    } else {
      console.log(`   ❌ 部分問候語測試失敗，需要修復。`)
    }
  }
}

// 執行測試
const tester = new GreetingFixTester()
tester.testGreetingScenarios().catch(console.error)


