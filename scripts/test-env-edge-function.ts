import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔍 檢查環境變數...');
    
    const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log('CLAUDE_API_KEY 存在:', !!CLAUDE_API_KEY);
    console.log('SUPABASE_URL 存在:', !!SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY 存在:', !!SUPABASE_ANON_KEY);
    console.log('SUPABASE_SERVICE_ROLE_KEY 存在:', !!SUPABASE_SERVICE_ROLE_KEY);

    const { session_id, message, user_meta } = await req.json();
    
    console.log('收到請求:', { session_id, message: message?.content, user_meta });

    // 測試資料庫寫入
    if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_URL) {
      console.log('🔄 測試資料庫寫入...');
      
      try {
        // 測試寫入 user_profiles
        const testUser = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            "Content-Type": "application/json",
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            external_id: `test-${Date.now()}`,
            display_name: '環境測試用戶',
            created_at: new Date().toISOString()
          })
        });
        
        console.log('用戶資料寫入狀態:', testUser.status);
        if (testUser.ok) {
          const result = await testUser.json();
          console.log('✅ 用戶資料寫入成功:', result);
        } else {
          const error = await testUser.text();
          console.error('❌ 用戶資料寫入失敗:', error);
        }
        
      } catch (e) {
        console.error('❌ 資料庫寫入測試失敗:', e.message);
      }
    }

    return new Response(
      JSON.stringify({
        response: "環境變數測試完成，請檢查日誌",
        sessionId: session_id || 'test-session',
        envCheck: {
          claudeApiKey: !!CLAUDE_API_KEY,
          supabaseUrl: !!SUPABASE_URL,
          supabaseAnonKey: !!SUPABASE_ANON_KEY,
          supabaseServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
