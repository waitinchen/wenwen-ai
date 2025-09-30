/**
 * 回應腳本管理系統 - 完整測試驗收腳本
 * 版本: WEN 1.4.0
 * 功能: 測試完整的知識庫工作流程
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

class ResponseScriptSystemTester {
  constructor() {
    this.testResults = []
    this.apiBase = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1'
  }

  async runAllTests() {
    console.log('🚀 開始回應腳本管理系統完整測試驗收')
    console.log('=' .repeat(60))

    try {
      // 1. 測試數據庫結構
      await this.testDatabaseSchema()
      
      // 2. 測試 API 端點
      await this.testAPIEndpoints()
      
      // 3. 測試完整工作流程
      await this.testCompleteWorkflow()
      
      // 4. 測試知識庫整合
      await this.testKnowledgeBaseIntegration()
      
      // 5. 測試 Claude Chat V3 整合
      await this.testClaudeChatV3Integration()

      // 6. 生成測試報告
      this.generateTestReport()

    } catch (error) {
      console.error('❌ 測試過程中發生錯誤:', error)
    }
  }

  async testDatabaseSchema() {
    console.log('\n📊 測試 1: 數據庫結構驗證')
    console.log('-'.repeat(40))

    const requiredTables = [
      'unknown_user_queries',
      'generated_response_scripts', 
      'script_review_records',
      'training_knowledge_base',
      'script_usage_analytics',
      'review_workflow',
      'system_configurations'
    ]

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          this.addTestResult('DATABASE_SCHEMA', false, `表 ${tableName} 不存在或無法訪問: ${error.message}`)
        } else {
          this.addTestResult('DATABASE_SCHEMA', true, `表 ${tableName} 存在且可訪問`)
        }
      } catch (error) {
        this.addTestResult('DATABASE_SCHEMA', false, `表 ${tableName} 測試失敗: ${error.message}`)
      }
    }
  }

  async testAPIEndpoints() {
    console.log('\n🔌 測試 2: API 端點驗證')
    console.log('-'.repeat(40))
    
    const endpoints = [
      { method: 'GET', path: '/response-script-management/question-types', name: '獲取問題類型' },
      { method: 'POST', path: '/response-script-management/question-types', name: '創建問題類型', data: {
        type_name: '測試問題類型',
        description: '測試用問題類型',
        category: 'TEST',
        keywords: ['測試', 'test'],
        intent_pattern: 'TEST_PATTERN',
        priority: 1
      }},
      { method: 'GET', path: '/response-script-management/response-scripts', name: '獲取回應腳本' },
      { method: 'GET', path: '/response-script-management/script-reviews', name: '獲取腳本審核' },
      { method: 'GET', path: '/response-script-management/stats', name: '獲取統計數據' }
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.apiBase}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: endpoint.data ? JSON.stringify(endpoint.data) : undefined
        })

        const data = await response.json()
        
        if (response.ok) {
          this.addTestResult('API_ENDPOINTS', true, `${endpoint.name} (${endpoint.method} ${endpoint.path}) - 成功`)
        } else {
          this.addTestResult('API_ENDPOINTS', false, `${endpoint.name} (${endpoint.method} ${endpoint.path}) - 失敗: ${data.error || response.statusText}`)
        }
      } catch (error) {
        this.addTestResult('API_ENDPOINTS', false, `${endpoint.name} (${endpoint.method} ${endpoint.path}) - 錯誤: ${error.message}`)
      }
    }
  }

  async testCompleteWorkflow() {
    console.log('\n🔄 測試 3: 完整工作流程驗證')
    console.log('-'.repeat(40))

    try {
      // Step 1: 記錄未知查詢
      console.log('  📝 Step 1: 記錄未知查詢')
      const unknownQuery = {
        session_id: 'test-session-' + Date.now(),
        original_question: '測試問題：有什麼好吃的餐廳推薦嗎？',
        detected_intent: 'FOOD',
        confidence_score: 0.85,
        analysis_result: {
          keywords: ['好吃', '餐廳', '推薦'],
          sentiment: 'positive',
          complexity: 'medium',
          category_suggestion: 'FOOD'
        },
        is_reasonable_intent: true,
        status: 'pending'
      }

      const { data: queryData, error: queryError } = await supabase
        .from('unknown_user_queries')
        .insert([unknownQuery])
        .select()
        .single()

      if (queryError) {
        this.addTestResult('WORKFLOW', false, `記錄未知查詢失敗: ${queryError.message}`)
        return
      }

      this.addTestResult('WORKFLOW', true, `未知查詢記錄成功 (ID: ${queryData.id})`)

      // Step 2: 生成回應腳本
      console.log('  🤖 Step 2: 生成回應腳本')
      const responseScript = {
        query_id: queryData.id,
        intent_type: 'FOOD',
        intent_category: '美食推薦',
        response_template: '嘿！我為你推薦幾家不錯的餐廳：\n\n1. **{store_name}**\n   📍 {address}\n   ⭐ 評分：{rating}/5\n\n希望對你有幫助！',
        response_variables: {
          store_name: 'string',
          address: 'string', 
          rating: 'number'
        },
        generated_by: 'AI',
        generation_model: 'claude-3-sonnet',
        generation_confidence: 0.9,
        script_metadata: {
          tone: 'friendly',
          style: 'informative',
          target_audience: 'general'
        },
        related_intents: ['FOOD', 'RECOMMENDATION']
      }

      const { data: scriptData, error: scriptError } = await supabase
        .from('generated_response_scripts')
        .insert([responseScript])
        .select()
        .single()

      if (scriptError) {
        this.addTestResult('WORKFLOW', false, `生成回應腳本失敗: ${scriptError.message}`)
        return
      }

      this.addTestResult('WORKFLOW', true, `回應腳本生成成功 (ID: ${scriptData.id})`)

      // Step 3: 人工審核
      console.log('  👨‍💼 Step 3: 人工審核')
      const reviewRecord = {
        script_id: scriptData.id,
        reviewer_id: 'test-reviewer-001',
        reviewer_name: '測試審核員',
        reviewer_role: 'admin',
        review_status: 'approved',
        review_score: 85,
        review_comments: '腳本內容合適，語氣友善，可以通過',
        improvement_suggestions: '可以增加更多餐廳選擇',
        detailed_scores: {
          accuracy: 90,
          tone: 85,
          usefulness: 88,
          safety: 95
        }
      }

      const { data: reviewData, error: reviewError } = await supabase
        .from('script_review_records')
        .insert([reviewRecord])
        .select()
        .single()

      if (reviewError) {
        this.addTestResult('WORKFLOW', false, `人工審核失敗: ${reviewError.message}`)
        return
      }

      this.addTestResult('WORKFLOW', true, `人工審核完成 (ID: ${reviewData.id})`)

      // Step 4: 加入知識庫
      console.log('  📚 Step 4: 加入知識庫')
      const knowledgeEntry = {
        source_type: 'reviewed_script',
        source_script_id: scriptData.id,
        source_review_id: reviewData.id,
        intent_pattern: 'FOOD_RECOMMENDATION',
        intent_keywords: ['好吃', '餐廳', '推薦', '美食'],
        intent_category: 'FOOD',
        intent_subcategory: '推薦',
        response_template: responseScript.response_template,
        response_examples: [
          '嘿！我為你推薦幾家不錯的餐廳：',
          '文山特區有很多美食選擇呢～'
        ],
        template_variables: responseScript.response_variables,
        usage_conditions: {
          time_of_day: 'any',
          user_type: 'general',
          context: 'food_inquiry'
        },
        priority_score: 80,
        quality_score: 85.0,
        status: 'active',
        version: '1.0',
        approved_at: new Date().toISOString(),
        approved_by: 'test-reviewer-001'
      }

      const { data: knowledgeData, error: knowledgeError } = await supabase
        .from('training_knowledge_base')
        .insert([knowledgeEntry])
        .select()
        .single()

      if (knowledgeError) {
        this.addTestResult('WORKFLOW', false, `加入知識庫失敗: ${knowledgeError.message}`)
        return
      }

      this.addTestResult('WORKFLOW', true, `知識庫條目創建成功 (ID: ${knowledgeData.id})`)

      // Step 5: 記錄使用統計
      console.log('  📊 Step 5: 記錄使用統計')
      const usageAnalytics = {
        knowledge_id: knowledgeData.id,
        session_id: unknownQuery.session_id,
        user_question: unknownQuery.original_question,
        matched_intent: 'FOOD',
        confidence_score: 0.85,
        generated_response: '嘿！我為你推薦幾家不錯的餐廳...',
        response_time_ms: 1200,
        user_feedback: 'positive',
        user_rating: 4,
        system_confidence: 0.9,
        context_relevance: 0.88
      }

      const { data: usageData, error: usageError } = await supabase
        .from('script_usage_analytics')
        .insert([usageAnalytics])
        .select()
        .single()

      if (usageError) {
        this.addTestResult('WORKFLOW', false, `記錄使用統計失敗: ${usageError.message}`)
        return
      }

      this.addTestResult('WORKFLOW', true, `使用統計記錄成功 (ID: ${usageData.id})`)

      // 清理測試數據
      await this.cleanupTestData([queryData.id, scriptData.id, reviewData.id, knowledgeData.id, usageData.id])

    } catch (error) {
      this.addTestResult('WORKFLOW', false, `完整工作流程測試失敗: ${error.message}`)
    }
  }

  async testKnowledgeBaseIntegration() {
    console.log('\n🧠 測試 4: 知識庫整合驗證')
    console.log('-'.repeat(40))

    try {
      // 測試知識庫查詢
      const { data: knowledgeEntries, error } = await supabase
        .from('training_knowledge_base')
        .select('*')
        .eq('status', 'active')
        .limit(5)

      if (error) {
        this.addTestResult('KNOWLEDGE_BASE', false, `知識庫查詢失敗: ${error.message}`)
        return
      }

      this.addTestResult('KNOWLEDGE_BASE', true, `知識庫查詢成功，找到 ${knowledgeEntries.length} 條記錄`)

      // 測試智能匹配
      const testQuery = '有什麼好吃的餐廳推薦嗎？'
      const matchingEntries = knowledgeEntries.filter(entry => 
        entry.intent_keywords.some(keyword => 
          testQuery.includes(keyword)
        )
      )

      this.addTestResult('KNOWLEDGE_BASE', matchingEntries.length > 0, 
        `智能匹配測試: 查詢「${testQuery}」匹配到 ${matchingEntries.length} 條記錄`)

    } catch (error) {
      this.addTestResult('KNOWLEDGE_BASE', false, `知識庫整合測試失敗: ${error.message}`)
    }
  }

  async testClaudeChatV3Integration() {
    console.log('\n🤖 測試 5: Claude Chat V3 整合驗證')
    console.log('-'.repeat(40))

    try {
      // 測試 Claude Chat V3 API
      const testMessage = {
        message: { content: '有什麼美食推薦？' },
        session_id: 'test-claude-v3-' + Date.now(),
        user_meta: { external_id: 'test-user' }
      }

      const response = await fetch(`${this.apiBase}/claude-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo`
        },
        body: JSON.stringify(testMessage)
      })

      const data = await response.json()

      if (response.ok && data.data) {
        this.addTestResult('CLAUDE_CHAT_V3', true, `Claude Chat V3 回應成功: ${data.data.intent}`)
        
        if (data.data.recommended_stores && data.data.recommended_stores.length > 0) {
          this.addTestResult('CLAUDE_CHAT_V3', true, `推薦商家數量: ${data.data.recommended_stores.length}`)
        }
      } else {
        this.addTestResult('CLAUDE_CHAT_V3', false, `Claude Chat V3 回應失敗: ${data.error || response.statusText}`)
      }

    } catch (error) {
      this.addTestResult('CLAUDE_CHAT_V3', false, `Claude Chat V3 整合測試失敗: ${error.message}`)
    }
  }

  async cleanupTestData(ids) {
    try {
      // 清理測試數據（按依賴順序）
      const tables = [
        'script_usage_analytics',
        'training_knowledge_base', 
        'script_review_records',
        'generated_response_scripts',
        'unknown_user_queries'
      ]

      for (const table of tables) {
        for (const id of ids) {
          await supabase
            .from(table)
            .delete()
            .eq('id', id)
        }
      }
    } catch (error) {
      console.warn('清理測試數據時發生錯誤:', error.message)
    }
  }

  addTestResult(category, success, message) {
    this.testResults.push({
      category,
      success,
      message,
      timestamp: new Date().toISOString()
    })

    const status = success ? '✅' : '❌'
    console.log(`  ${status} ${message}`)
  }

  generateTestReport() {
    console.log('\n📋 測試報告')
    console.log('=' .repeat(60))
    
    const categories = [...new Set(this.testResults.map(r => r.category))]
    
    for (const category of categories) {
      const categoryResults = this.testResults.filter(r => r.category === category)
      const successCount = categoryResults.filter(r => r.success).length
      const totalCount = categoryResults.length
      const successRate = Math.round((successCount / totalCount) * 100)

      console.log(`\n📊 ${category}:`)
      console.log(`   成功率: ${successRate}% (${successCount}/${totalCount})`)
      
      const failedTests = categoryResults.filter(r => !r.success)
      if (failedTests.length > 0) {
        console.log(`   ❌ 失敗項目:`)
        failedTests.forEach(test => {
          console.log(`      - ${test.message}`)
        })
      }
    }

    const overallSuccess = this.testResults.filter(r => r.success).length
    const overallTotal = this.testResults.length
    const overallRate = Math.round((overallSuccess / overallTotal) * 100)

    console.log(`\n🎯 總體測試結果:`)
    console.log(`   總測試項目: ${overallTotal}`)
    console.log(`   成功項目: ${overallSuccess}`)
    console.log(`   成功率: ${overallRate}%`)

    if (overallRate >= 90) {
      console.log(`\n🎉 系統驗收通過！回應腳本管理系統運行正常。`)
    } else if (overallRate >= 70) {
      console.log(`\n⚠️  系統基本正常，但需要修復部分問題。`)
    } else {
      console.log(`\n❌ 系統存在嚴重問題，需要修復後重新測試。`)
    }

    console.log('\n📝 詳細測試記錄:')
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      console.log(`   ${index + 1}. ${status} [${result.category}] ${result.message}`)
    })
  }
}

// 執行測試
const tester = new ResponseScriptSystemTester()
tester.runAllTests().catch(console.error)