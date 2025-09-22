# 環境變數配置說明

## 問題
如果頁面顯示空白，通常是因為缺少必要的環境變數。

## 解決方案

### 1. 創建環境變數文件
在項目根目錄創建 `.env.local` 文件：

```bash
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Claude API 配置
VITE_CLAUDE_API_KEY=your_claude_api_key_here

# 應用配置
VITE_APP_NAME=文山特區客服機器人
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

### 2. 獲取 Supabase 配置
1. 前往 [Supabase](https://supabase.com)
2. 創建新專案或選擇現有專案
3. 在專案設定中找到 API 設定
4. 複製 Project URL 和 anon public key

### 3. 獲取 Claude API Key
1. 前往 [Anthropic Console](https://console.anthropic.com)
2. 創建 API Key
3. 複製 API Key

### 4. 重啟開發服務器
```bash
npm run dev
```

## 臨時解決方案
如果暫時沒有 Supabase 配置，應用會使用預設值並顯示警告訊息，但基本界面應該可以正常顯示。

## 注意事項
- 不要將 `.env.local` 文件提交到版本控制
- 確保所有環境變數都以 `VITE_` 開頭
- 重啟開發服務器後環境變數才會生效

