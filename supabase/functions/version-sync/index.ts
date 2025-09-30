/**
 * 版號同步 API
 * 用於前台自動獲取最新版號
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 從 Edge Function 環境變數獲取 Supabase 配置
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 獲取最新版號資訊
    const versionInfo = await getLatestVersion(supabase)
    
    return new Response(
      JSON.stringify({
        success: true,
        data: versionInfo
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('版號同步錯誤:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500,
      },
    )
  }
})

/**
 * 獲取最新版號資訊
 */
async function getLatestVersion(supabase: any) {
  // 從 claude-chat Edge Function 獲取版本資訊
  const versionInfo = {
    version: 'WEN 1.4.6',
    buildTime: new Date().toISOString(),
    buildNumber: `20250929-${String(Date.now()).slice(-3)}`,
    releaseDate: '2025-09-29',
    environment: 'production',
    features: [
      'COVERAGE_STATS意圖修復',
      '全面性原則性回應策略框架',
      '統計資料庫查詢優化',
      '回應格式標準化',
      '雙軌回應機制',
      '意圖分類層級化優化'
    ]
  }

  return versionInfo
}

