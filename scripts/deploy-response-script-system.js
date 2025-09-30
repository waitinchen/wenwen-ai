/**
 * 回應腳本管理系統 - 完整部署腳本
 * 版本: WEN 1.4.0
 * 功能: 部署完整的知識庫工作流程系統
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

class ResponseScriptSystemDeployer {
  constructor() {
    this.deploymentResults = []
  }

  async deployCompleteSystem() {
    console.log('🚀 開始部署回應腳本管理系統')
    console.log('=' .repeat(60))

    try {
      // 1. 部署數據庫結構
      await this.deployDatabaseSchema()
      
      // 2. 部署 Edge Functions
      await this.deployEdgeFunctions()
      
      // 3. 初始化系統配置
      await this.initializeSystemConfig()
      
      // 4. 創建示例數據
      await this.createSampleData()
      
      // 5. 驗證部署結果
      await this.verifyDeployment()
      
      // 6. 生成部署報告
      this.generateDeploymentReport()
      
    } catch (error) {
      console.error('❌ 部署過程中發生錯誤:', error)
    }
  }

  async deployDatabaseSchema() {
    console.log('\n📊 步驟 1: 部署數據庫結構')
    console.log('-'.repeat(40))

    try {
      // 讀取 SQL schema 文件
      const schemaSQL = readFileSync('scripts/response-script-management-schema.sql', 'utf8')
      
      // 分割 SQL 語句
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      console.log(`  📝 準備執行 ${statements.length} 個 SQL 語句`)

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            // 如果是表已存在的錯誤，忽略
            if (error.message.includes('already exists') || error.message.includes('relation already exists')) {
              this.addDeploymentResult('DATABASE_SCHEMA', true, `語句 ${i + 1}: 表已存在，跳過`)
            } else {
              this.addDeploymentResult('DATABASE_SCHEMA', false, `語句 ${i + 1} 執行失敗: ${error.message}`)
            }
          } else {
            this.addDeploymentResult('DATABASE_SCHEMA', true, `語句 ${i + 1}: 執行成功`)
          }
        } catch (error) {
          this.addDeploymentResult('DATABASE_SCHEMA', false, `語句 ${i + 1} 執行異常: ${error.message}`)
        }
      }

    } catch (error) {
      this.addDeploymentResult('DATABASE_SCHEMA', false, `讀取 SQL 文件失敗: ${error.message}`)
    }
  }

  async deployEdgeFunctions() {
    console.log('\n🔌 步驟 2: 部署 Edge Functions')
    console.log('-'.repeat(40))

    try {
      // 檢查 response-script-management Edge Function 是否存在
      const { data: functions, error: listError } = await supabase
        .from('edge_functions')
        .select('name')
        .eq('name', 'response-script-management')

      if (listError) {
        this.addDeploymentResult('EDGE_FUNCTIONS', false, `檢查 Edge Functions 失敗: ${listError.message}`)
        return
      }

      if (functions.length === 0) {
        this.addDeploymentResult('EDGE_FUNCTIONS', false, `response-script-management Edge Function 不存在，需要手動部署`)
      } else {
        this.addDeploymentResult('EDGE_FUNCTIONS', true, `response-script-management Edge Function 已存在`)
      }

      // 檢查 claude-chat Edge Function
      const { data: claudeFunctions, error: claudeError } = await supabase
        .from('edge_functions')
        .select('name')
        .eq('name', 'claude-chat')

      if (claudeError) {
        this.addDeploymentResult('EDGE_FUNCTIONS', false, `檢查 claude-chat Edge Function 失敗: ${claudeError.message}`)
      } else if (claudeFunctions.length === 0) {
        this.addDeploymentResult('EDGE_FUNCTIONS', false, `claude-chat Edge Function 不存在`)
      } else {
        this.addDeploymentResult('EDGE_FUNCTIONS', true, `claude-chat Edge Function 已存在`)
      }

    } catch (error) {
      this.addDeploymentResult('EDGE_FUNCTIONS', false, `Edge Functions 檢查失敗: ${error.message}`)
    }
  }

  async initializeSystemConfig() {
    console.log('\n⚙️ 步驟 3: 初始化系統配置')
    console.log('-'.repeat(40))

    try {
      // 檢查系統配置表是否存在
      const { data: configs, error } = await supabase
        .from('system_configurations')
        .select('config_key')
        .limit(1)

      if (error) {
        this.addDeploymentResult('SYSTEM_CONFIG', false, `系統配置表不存在: ${error.message}`)
        return
      }

      // 插入或更新系統配置
      const systemConfigs = [
        {
          config_key: 'review_thresholds',
          config_value: {
            min_confidence: 0.7,
            auto_approve_score: 90,
            manual_review_score: 70
          },
          config_description: '審核閾值設定',
          config_category: 'review'
        },
        {
          config_key: 'generation_settings',
          config_value: {
            max_response_length: 500,
            tone: 'friendly',
            language: 'zh-TW'
          },
          config_description: 'AI生成設定',
          config_category: 'generation'
        },
        {
          config_key: 'workflow_rules',
          config_value: {
            auto_assign: true,
            review_timeout_days: 7,
            priority_keywords: ['urgent', 'error', 'complaint']
          },
          config_description: '工作流程規則',
          config_category: 'workflow'
        },
        {
          config_key: 'knowledge_quality',
          config_value: {
            min_usage_for_promotion: 10,
            success_rate_threshold: 0.8,
            deprecate_after_days: 90
          },
          config_description: '知識庫品質控制',
          config_category: 'knowledge'
        }
      ]

      for (const config of systemConfigs) {
        const { error: upsertError } = await supabase
          .from('system_configurations')
          .upsert(config, { onConflict: 'config_key' })

        if (upsertError) {
          this.addDeploymentResult('SYSTEM_CONFIG', false, `配置 ${config.config_key} 設置失敗: ${upsertError.message}`)
        } else {
          this.addDeploymentResult('SYSTEM_CONFIG', true, `配置 ${config.config_key} 設置成功`)
        }
      }

    } catch (error) {
      this.addDeploymentResult('SYSTEM_CONFIG', false, `系統配置初始化失敗: ${error.message}`)
    }
  }

  async createSampleData() {
    console.log('\n📝 步驟 4: 創建示例數據')
    console.log('-'.repeat(40))

    try {
      // 創建示例問題類型
      const sampleQuestionTypes = [
        {
          type_name: '美食推薦',
          description: '用戶詢問餐廳或美食推薦',
          category: 'FOOD',
          keywords: ['美食', '餐廳', '推薦', '好吃', '料理'],
          intent_pattern: 'FOOD_RECOMMENDATION',
          is_active: true,
          priority: 10
        },
        {
          type_name: '英語學習',
          description: '用戶詢問英語學習相關問題',
          category: 'EDUCATION',
          keywords: ['英語', '美語', '補習班', '學習', '課程'],
          intent_pattern: 'ENGLISH_LEARNING',
          is_active: true,
          priority: 9
        },
        {
          type_name: '停車查詢',
          description: '用戶詢問停車相關資訊',
          category: 'PARKING',
          keywords: ['停車', '停車場', '車位', '停車費'],
          intent_pattern: 'PARKING_INQUIRY',
          is_active: true,
          priority: 8
        }
      ]

      for (const questionType of sampleQuestionTypes) {
        const { error } = await supabase
          .from('question_types')
          .upsert(questionType, { onConflict: 'type_name' })

        if (error) {
          this.addDeploymentResult('SAMPLE_DATA', false, `問題類型 ${questionType.type_name} 創建失敗: ${error.message}`)
        } else {
          this.addDeploymentResult('SAMPLE_DATA', true, `問題類型 ${questionType.type_name} 創建成功`)
        }
      }

      // 創建示例回應腳本
      const sampleResponseScripts = [
        {
          question_type_id: '美食推薦',
          script_name: '美食推薦標準回應',
          script_content: '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：\n\n1. **{store_name}**\n   📍 {address}\n   🏷️ {category}\n   ⭐ 評分：{rating}/5\n\n這些都是我精挑細選的優質店家，希望對你有幫助！',
          script_type: 'TEMPLATE',
          variables: {
            store_name: 'string',
            address: 'string',
            category: 'string',
            rating: 'number'
          },
          conditions: {
            intent: 'FOOD',
            confidence_threshold: 0.7
          },
          version: '1.0',
          is_active: true,
          usage_count: 0,
          success_rate: 0
        },
        {
          question_type_id: '英語學習',
          script_name: '英語學習推薦回應',
          script_content: '我超推薦**肯塔基美語**的啦！✨ 他們真的是文山特區最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。\n\n**聯絡方式：** LINE ID: kentuckyschool\n\n希望對你有幫助！有什麼問題隨時找我喔～',
          script_type: 'TEXT',
          variables: {},
          conditions: {
            intent: 'ENGLISH_LEARNING',
            confidence_threshold: 0.8
          },
          version: '1.0',
          is_active: true,
          usage_count: 0,
          success_rate: 0
        }
      ]

      for (const script of sampleResponseScripts) {
        const { error } = await supabase
          .from('response_scripts')
          .upsert(script, { onConflict: 'script_name' })

        if (error) {
          this.addDeploymentResult('SAMPLE_DATA', false, `回應腳本 ${script.script_name} 創建失敗: ${error.message}`)
        } else {
          this.addDeploymentResult('SAMPLE_DATA', true, `回應腳本 ${script.script_name} 創建成功`)
        }
      }

    } catch (error) {
      this.addDeploymentResult('SAMPLE_DATA', false, `示例數據創建失敗: ${error.message}`)
    }
  }

  async verifyDeployment() {
    console.log('\n✅ 步驟 5: 驗證部署結果')
    console.log('-'.repeat(40))

    try {
      // 驗證數據庫表
      const requiredTables = [
        'unknown_user_queries',
        'generated_response_scripts',
        'script_review_records',
        'training_knowledge_base',
        'script_usage_analytics',
        'review_workflow',
        'system_configurations',
        'question_types',
        'response_scripts'
      ]

      for (const tableName of requiredTables) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          this.addDeploymentResult('VERIFICATION', false, `表 ${tableName} 驗證失敗: ${error.message}`)
        } else {
          this.addDeploymentResult('VERIFICATION', true, `表 ${tableName} 驗證成功`)
        }
      }

      // 驗證系統配置
      const { data: configs, error: configError } = await supabase
        .from('system_configurations')
        .select('config_key')
        .limit(5)

      if (configError) {
        this.addDeploymentResult('VERIFICATION', false, `系統配置驗證失敗: ${configError.message}`)
      } else {
        this.addDeploymentResult('VERIFICATION', true, `系統配置驗證成功，找到 ${configs.length} 個配置項`)
      }

    } catch (error) {
      this.addDeploymentResult('VERIFICATION', false, `部署驗證失敗: ${error.message}`)
    }
  }

  addDeploymentResult(category, success, message) {
    this.deploymentResults.push({
      category,
      success,
      message,
      timestamp: new Date().toISOString()
    })

    const status = success ? '✅' : '❌'
    console.log(`  ${status} ${message}`)
  }

  generateDeploymentReport() {
    console.log('\n📋 部署報告')
    console.log('=' .repeat(60))

    const categories = [...new Set(this.deploymentResults.map(r => r.category))]
    
    for (const category of categories) {
      const categoryResults = this.deploymentResults.filter(r => r.category === category)
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

    const overallSuccess = this.deploymentResults.filter(r => r.success).length
    const overallTotal = this.deploymentResults.length
    const overallRate = Math.round((overallSuccess / overallTotal) * 100)

    console.log(`\n🎯 總體部署結果:`)
    console.log(`   總部署項目: ${overallTotal}`)
    console.log(`   成功項目: ${overallSuccess}`)
    console.log(`   成功率: ${overallRate}%`)

    if (overallRate >= 90) {
      console.log(`\n🎉 系統部署成功！回應腳本管理系統已就緒。`)
      console.log(`\n📝 下一步操作:`)
      console.log(`   1. 部署 response-script-management Edge Function`)
      console.log(`   2. 更新前端管理界面`)
      console.log(`   3. 運行完整測試驗收`)
    } else if (overallRate >= 70) {
      console.log(`\n⚠️  系統基本部署成功，但需要修復部分問題。`)
    } else {
      console.log(`\n❌ 系統部署存在嚴重問題，需要修復後重新部署。`)
    }
  }
}

// 執行部署
const deployer = new ResponseScriptSystemDeployer()
deployer.deployCompleteSystem().catch(console.error)