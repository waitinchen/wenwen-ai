// 最簡化測試函數
export default async (req) => {
  console.log("✅ Function triggered");
  
  // 檢查環境變數
  console.log("Env vars:", {
    hasServiceKey: !!Deno.env.get("SERVICE_ROLE_KEY"),
    keyLength: Deno.env.get("SERVICE_ROLE_KEY")?.length,
    supabaseUrl: !!Deno.env.get("SUPABASE_URL"),
    claudeApiKey: !!Deno.env.get("CLAUDE_API_KEY")
  });
  
  return new Response(JSON.stringify({ 
    status: "OK", 
    message: "Basic test successful",
    timestamp: new Date().toISOString(),
    envCheck: {
      hasServiceKey: !!Deno.env.get("SERVICE_ROLE_KEY"),
      keyLength: Deno.env.get("SERVICE_ROLE_KEY")?.length,
      supabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      claudeApiKey: !!Deno.env.get("CLAUDE_API_KEY")
    }
  }), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
  });
}
