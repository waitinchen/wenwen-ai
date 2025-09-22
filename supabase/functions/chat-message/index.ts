// 前台對話完整保存 API 處理器
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UserMeta {
  external_id: string
  display_name: string
  avatar_url?: string
}

interface ChatContext {
  client_ip?: string
  user_agent: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  session_id?: string
  message: ChatMessage
  user_meta: UserMeta
  context: ChatContext
}

interface ChatResponse {
  ok: boolean
  session_id: string
  assistant?: {
    content: string
  }
  error?: string
}

serve(async (req) => {
  // 處理 CORS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 初始化 Supabase 客戶端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 解析請求
    const { session_id, message, user_meta, context }: ChatRequest = await req.json()

    // 1) Upsert 使用者資料
    const { data: user, error: userError } = await supabaseClient
      .from('user_profiles')
      .upsert({
        external_id: user_meta.external_id || 'anon',
        display_name: user_meta.display_name || '訪客',
        avatar_url: user_meta.avatar_url || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'external_id'
      })
      .select()
      .single()

    if (userError) {
      console.error('Upsert 使用者失敗:', userError)
      throw new Error('無法建立使用者資料')
    }

    // 2) 處理會話
    let session
    if (session_id) {
      // 更新現有會話
      const { data: existingSession, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .update({
          last_active: new Date().toISOString()
        })
        .eq('id', session_id)
        .select()
        .single()

      if (sessionError) {
        console.error('更新會話失敗:', sessionError)
        throw new Error('無法更新會話')
      }
      session = existingSession
    } else {
      // 建立新會話
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          client_ip: context.client_ip || null,
          user_agent: context.user_agent || null
        })
        .select()
        .single()

      if (sessionError) {
        console.error('建立會話失敗:', sessionError)
        throw new Error('無法建立會話')
      }
      session = newSession
    }

    // 3) 儲存使用者訊息
    const { error: messageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: message.role,
        content: message.content
      })

    if (messageError) {
      console.error('儲存訊息失敗:', messageError)
      throw new Error('無法儲存訊息')
    }

    // 4) 呼叫 AI 模型 (模擬)
    const aiResponse = await callAIModel(message.content)

    // 5) 儲存 AI 回覆
    const { error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: 'assistant',
        content: aiResponse
      })

    if (aiMessageError) {
      console.error('儲存 AI 回覆失敗:', aiMessageError)
      throw new Error('無法儲存 AI 回覆')
    }

    // 6) 更新會話摘要
    const { error: updateError } = await supabaseClient
      .from('chat_sessions')
      .update({
        message_count: session.message_count + 2, // 使用者訊息 + AI 回覆
        last_message_preview: message.content.slice(0, 80)
      })
      .eq('id', session.id)

    if (updateError) {
      console.error('更新會話摘要失敗:', updateError)
      // 不拋出錯誤，因為主要功能已完成
    }

    // 回傳成功回應
    const response: ChatResponse = {
      ok: true,
      session_id: session.id,
      assistant: {
        content: aiResponse
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('聊天 API 錯誤:', error)
    
    const response: ChatResponse = {
      ok: false,
      session_id: '',
      error: error instanceof Error ? error.message : '未知錯誤'
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// 模擬 AI 模型呼叫
async function callAIModel(userMessage: string): Promise<string> {
  // 這裡應該呼叫真實的 Claude API
  // 目前先回傳模擬回應
  
  const responses = [
    '我是高文文，很高興為您服務！有什麼我可以幫助您的嗎？',
    '文山特區有很多優質的商家，我可以為您推薦！',
    '停車資訊我都很清楚，讓我為您查詢！',
    '歡迎來到文山特區，我是您的專屬客服！'
  ]
  
  // 簡單的關鍵字匹配
  if (userMessage.includes('停車')) {
    return '我來為您推薦文山特區的停車場！附近有幾個不錯的選擇，您比較偏好哪種類型呢？'
  }
  
  if (userMessage.includes('餐廳') || userMessage.includes('美食')) {
    return '文山特區有很多美食選擇！從傳統台灣料理到異國料理都有，您比較喜歡哪種口味呢？'
  }
  
  if (userMessage.includes('你好') || userMessage.includes('哈囉')) {
    return '哈囉！我是高文文，文山特區的專屬客服！今天有什麼可以為您服務的嗎？'
  }
  
  // 預設回應
  return responses[Math.floor(Math.random() * responses.length)]
}
