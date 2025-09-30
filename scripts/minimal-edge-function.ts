import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    console.log("🔍 測試 Edge Function 基本功能...");
    
    // 檢查環境變數
    const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

    console.log("環境變數檢查:");
    console.log("- CLAUDE_API_KEY:", !!CLAUDE_API_KEY);
    console.log("- SUPABASE_URL:", !!SUPABASE_URL);
    console.log("- SUPABASE_ANON_KEY:", !!SUPABASE_ANON_KEY);
    console.log("- SERVICE_ROLE_KEY:", !!SERVICE_ROLE_KEY);

    const { session_id, message, user_meta } = await req.json();
    
    console.log("收到請求:", { session_id, message: message?.content, user_meta });

    return new Response(
      JSON.stringify({
        response: "測試成功！Edge Function 基本功能正常",
        sessionId: session_id || "test-session",
        debug: {
          envVars: {
            claudeApiKey: !!CLAUDE_API_KEY,
            supabaseUrl: !!SUPABASE_URL,
            supabaseAnonKey: !!SUPABASE_ANON_KEY,
            serviceRoleKey: !!SERVICE_ROLE_KEY
          }
        }
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
});
