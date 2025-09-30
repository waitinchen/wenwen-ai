#!/bin/bash

echo "========================================"
echo "🚀 WEN 1.4.0 Edge Functions 部署腳本"
echo "========================================"

echo ""
echo "📋 部署前檢查..."

# 檢查必要文件
if [ ! -f "supabase/functions/response-script-management/index.ts" ]; then
    echo "❌ 缺少 response-script-management 函數文件"
    exit 1
else
    echo "✅ response-script-management 函數文件存在"
fi

if [ ! -f "supabase/functions/claude-chat-v3/index.ts" ]; then
    echo "❌ 缺少 claude-chat-v3 函數文件"
    exit 1
else
    echo "✅ claude-chat-v3 函數文件存在"
fi

# 檢查Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI 未安裝"
    echo "請安裝: npm install -g supabase"
    exit 1
else
    echo "✅ Supabase CLI 已安裝"
fi

echo ""
echo "🔧 開始部署 Edge Functions..."

echo ""
echo "📤 部署回應腳本管理API..."
if supabase functions deploy response-script-management --project-ref vqcuwjfxoxjgsrueqodj; then
    echo "✅ response-script-management 部署成功"
else
    echo "❌ response-script-management 部署失敗"
    exit 1
fi

echo ""
echo "📤 部署Claude Chat V3..."
if supabase functions deploy claude-chat-v3 --project-ref vqcuwjfxoxjgsrueqodj; then
    echo "✅ claude-chat-v3 部署成功"
else
    echo "❌ claude-chat-v3 部署失敗"
    exit 1
fi

echo ""
echo "🎉 所有 Edge Functions 部署完成！"
echo "========================================"
echo "📊 部署摘要:"
echo "  - response-script-management ✅"
echo "  - claude-chat-v3 ✅"
echo "========================================"

echo ""
echo "🔗 函數端點:"
echo "  - Response Script Management: https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/response-script-management"
echo "  - Claude Chat V3: https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat-v3"

echo ""
echo "📋 後續步驟:"
echo "  1. 執行部署後測試腳本"
echo "  2. 更新前端API端點配置"
echo "  3. 執行完整系統測試"

read -p "按任意鍵繼續..."