import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 深度話題腳本配置
const deepTopicScripts = [
  {
    trigger_question: '告訴我妳的服務範圍',
    script_content: `嗨！我是高文文，您的鳳山文山特區專屬小助手！😊

🌟 **我的核心服務範圍**：
• 🍽️ **美食推薦** - 為您推薦文山特區優質餐廳、咖啡廳、特色小吃
• 🅿️ **停車資訊** - 提供便利停車場位置、收費資訊、停車建議
• 🏪 **商家情報** - 介紹當地特色商店、服務店家、營業資訊
• 📍 **生活指南** - 協助您探索文山特區的生活便利設施

✨ **我的特色**：
• 基於實際商家數據，提供準確可靠的推薦
• 語氣親切友善，就像您的在地朋友
• 誠實告知資訊來源，不提供虛假資訊
• 持續學習更新，為您提供最新情報

💬 **您可以這樣問我**：
"有什麼好吃的餐廳？"、"哪裡可以停車？"、"附近有什麼商店？"

有什麼想了解的嗎？我很樂意為您服務！🤗`,
    category: '服務介紹',
    is_active: true,
    display_order: 1
  },
  {
    trigger_question: '請推薦鳳山區美食情報',
    script_content: `🍽️ **鳳山文山特區美食推薦** 🍽️

我為您精選了文山特區的優質美食！基於實際商家數據，確保推薦的準確性：

🏆 **熱門推薦餐廳**：
• **STORY Restaurant** - 精致料理，適合特殊場合
• **Da Da's Kitchen** - 義大利料理專家，溫馨用餐環境
• **Ease** - 輕食選擇，健康美味兼具
• **拼鍋命** - 麻辣鍋專門店，嗜辣者的天堂
• **珍好味職人鍋物 鳳山旗艦店** - 涮海鍋物，新鮮海鮮

🍣 **日式料理專區**：
• **スシロー壽司郎 高雄鳳山店** - 迴轉壽司，新鮮美味
• **一燒丼飯專賣** - 日式丼飯，分量十足
• **一魂 いざかや** - 居酒屋氛圍，日式小食
• **夜葉食堂鳳山店** - 正宗日式料理
• **食事 處櫻廷** - 居酒屋體驗
• **金太郎壽司** - 壽司專門店

💡 **用餐小貼士**：
• 建議提前訂位，特別是週末時段
• 部分餐廳有特殊營業時間，建議先確認
• 如有特殊飲食需求，可提前詢問店家

🎯 **還想了解更多？** 可以問我：
"有什麼適合聚餐的餐廳？"、"有推薦的早餐店嗎？"、"哪裡有宵夜？"

希望這些推薦對您有幫助！有其他美食問題隨時問我喔～😊`,
    category: '美食推薦',
    is_active: true,
    display_order: 2
  },
  {
    trigger_question: '查詢鳳山區停車資訊',
    script_content: `🅿️ **鳳山文山特區停車資訊** 🅿️

文山特區有完善的停車設施！我為您整理了實用的停車資訊：

📍 **主要停車場推薦**：
• **鳳山車站地下停車場** - 交通便利，靠近大眾運輸
• **大東文化藝術中心地下停車場** - 靠近文化景點
• **衛武營地下停車場** - 鄰近衛武營國家藝術文化中心
• **鳳山運動園區地下立體停車場** - 靠近運動設施
• **鳳山區公所附屬停車場** - 政府機關周邊

📊 **停車場統計**：
文山特區共有 **38個停車場**，提供充足的停車空間

💡 **停車小貼士**：
• 建議提前規劃停車路線，避開尖峰時段
• 部分停車場有營業時間限制，請注意開放時間
• 地下停車場通常較為安全，建議優先選擇
• 機車停車位請向各停車場確認

🔍 **特殊需求**：
• 如需殘障車位，請提前詢問停車場管理員
• 大型車輛停車需求，建議選擇專門停車場
• 充電樁服務請向各停車場確認

⚠️ **重要提醒**：
• 我目前沒有各停車場的詳細收費資訊
• 建議直接詢問停車場管理員或使用Google Maps查詢
• 路邊停車格資訊請向當地相關單位確認

🎯 **還需要什麼資訊？** 可以問我：
"哪裡停車比較方便？"、"停車場營業時間？"、"有免費停車場嗎？"

希望這些資訊對您的停車規劃有幫助！有其他問題隨時問我～🚗`,
    category: '停車資訊',
    is_active: true,
    display_order: 3
  }
]

async function createDeepTopicScripts() {
  console.log('🔧 開始創建深度話題腳本...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const script of deepTopicScripts) {
      console.log(`\n📝 創建腳本: ${script.trigger_question}`)
      
      // 檢查是否已存在相同觸發問題的腳本
      const { data: existingScript, error: checkError } = await supabase
        .from('response_script_drafts')
        .select('*')
        .eq('trigger_question', script.trigger_question)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ 檢查失敗: ${checkError.message}`)
        errorCount++
        continue
      }
      
      if (existingScript) {
        // 更新現有腳本
        const { error: updateError } = await supabase
          .from('response_script_drafts')
          .update({
            script_content: script.script_content,
            category: script.category,
            is_active: script.is_active,
            display_order: script.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingScript.id)
        
        if (updateError) {
          console.error(`❌ 更新失敗: ${updateError.message}`)
          errorCount++
        } else {
          console.log(`✅ 更新成功: ${script.trigger_question}`)
          console.log(`   分類: ${script.category}`)
          console.log(`   內容長度: ${script.script_content.length} 字元`)
          successCount++
        }
      } else {
        // 創建新腳本
        const { data: insertData, error: insertError } = await supabase
          .from('response_script_drafts')
          .insert({
            trigger_question: script.trigger_question,
            script_content: script.script_content,
            category: script.category,
            is_active: script.is_active,
            display_order: script.display_order,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
        
        if (insertError) {
          console.error(`❌ 創建失敗: ${insertError.message}`)
          errorCount++
        } else {
          console.log(`✅ 創建成功: ${script.trigger_question}`)
          console.log(`   分類: ${script.category}`)
          console.log(`   內容長度: ${script.script_content.length} 字元`)
          successCount++
        }
      }
    }
    
    console.log(`\n📊 創建結果: 成功 ${successCount} 個，失敗 ${errorCount} 個`)
    
    // 驗證創建結果
    console.log('\n🔍 驗證創建結果...')
    const { data: allScripts, error: verifyError } = await supabase
      .from('response_script_drafts')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (verifyError) {
      console.error('❌ 驗證失敗:', verifyError.message)
    } else {
      console.log(`✅ 驗證成功，目前有 ${allScripts.length} 個回應腳本:`)
      allScripts.forEach((script, index) => {
        console.log(`   ${index + 1}. [${script.category}] ${script.trigger_question}`)
        console.log(`      狀態: ${script.is_active ? '啟用' : '禁用'}`)
        console.log(`      內容: ${script.script_content.substring(0, 50)}...`)
      })
    }
    
    if (successCount === deepTopicScripts.length) {
      console.log('\n🎉 深度話題腳本創建完成！')
      console.log('📝 腳本特色:')
      console.log('   ✅ 語氣親切友善，符合高文文個性')
      console.log('   ✅ 基於實際商家數據，避免幻覺')
      console.log('   ✅ 提供實用建議和引導')
      console.log('   ✅ 結構清晰，易於閱讀')
      console.log('   ✅ 包含後續互動引導')
    }
    
  } catch (error) {
    console.error('❌ 創建過程發生錯誤:', error)
  }
}

// 執行創建
createDeepTopicScripts()
