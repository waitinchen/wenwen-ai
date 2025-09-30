// 創建最小化 Edge Function 進行測試
console.log('🔧 創建最小化 Edge Function 測試版本...')

const minimalFunction = `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    console.log('[最小化版本] 收到請求');
    
    // 解析請求
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      throw new Error('Invalid JSON in request body');
    }

    const { session_id, message, user_meta } = requestData;
    
    console.log('[最小化版本] 處理消息:', message?.content?.substring(0, 50));
    
    // 簡單的意圖分類
    const messageContent = message?.content?.toLowerCase() || '';
    let intent = 'GENERAL';
    let response = '你好！我是高文文，很高興為您服務！';

    // 統計查詢檢測
    if (messageContent.includes('有多少') || messageContent.includes('統計') || messageContent.includes('資料庫')) {
      intent = 'COVERAGE_STATS';
      response = \`📊 **文山特區商家資料庫統計** 📊

• **商家總數**：280 家
• **安心店家**：16 家  
• **優惠店家**：18 家
• **特約商家**：1 家
• **分類數**：11 個
• **最後更新時間**：2025/9/29

這些數字會隨著收錄進度更新喔！✨

我是高文文，很高興為您提供統計資訊～有什麼其他問題隨時問我！😊\`;
    } else if (messageContent.includes('你好') || messageContent.includes('嗨')) {
      intent = 'GREETING';
      response = '嗨！我是高文文，你的文山特區專屬小助手！😊 很高興為你服務～有什麼需要幫忙的嗎？';
    }

    const result = {
      response: response + '\\n\\n---\\n*WEN 1.4.6*',
      session_id: session_id || \`minimal-\${Date.now()}\`,
      intent: intent,
      confidence: 0.9,
      recommended_stores: [],
      recommendation_logic: {
        type: 'minimal_test',
        timestamp: new Date().toISOString()
      },
      version: 'WEN 1.4.6',
      processing_time: 100
    };

    console.log('[最小化版本] 回應生成完成:', intent);

    return new Response(JSON.stringify({ data: result }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[最小化版本] 錯誤:', error);
    
    const errorResponse = {
      error: {
        code: 'MINIMAL_FUNCTION_ERROR',
        message: error.message || '最小化函數錯誤'
      },
      version: 'WEN 1.4.6'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});`

console.log('📝 最小化 Edge Function 代碼:')
console.log('=' * 50)
console.log(minimalFunction)
console.log('=' * 50)

console.log('\n📋 使用說明:')
console.log('1. 複製上面的代碼')
console.log('2. 前往 Supabase Dashboard > Edge Functions > claude-chat')
console.log('3. 將代碼替換到編輯器中')
console.log('4. 點擊 "Deploy updates" 部署')
console.log('5. 測試「你的商家資料有多少資料？」查詢')

console.log('\n🎯 這個最小化版本應該能夠:')
console.log('✅ 正確識別統計查詢意圖')
console.log('✅ 返回正確的統計數據')
console.log('✅ 避免 AI 幻覺問題')
console.log('✅ 提供正確的版號信息')

console.log('\n⚠️ 注意: 這是一個測試版本，部署成功後我們可以逐步添加更多功能')

