#!/usr/bin/env node

/**
 * 重新部署 Supabase Edge Function
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase 配置
const SUPABASE_PROJECT_ID = 'vqcuwjfxoxjgsrueqodj';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// 讀取 Edge Function 代碼
const functionCode = fs.readFileSync(
  path.join(__dirname, '../supabase/functions/claude-chat/index.ts'),
  'utf8'
);

console.log('🚀 開始重新部署 Supabase Edge Function...');
console.log('📁 專案 ID:', SUPABASE_PROJECT_ID);
console.log('📝 函數名稱: claude-chat');

// 部署請求
const deployData = JSON.stringify({
  name: 'claude-chat',
  code: functionCode,
  language: 'typescript'
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${SUPABASE_PROJECT_ID}/functions/claude-chat`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(deployData),
    'Authorization': 'Bearer YOUR_SUPABASE_ACCESS_TOKEN' // 需要真實的 access token
  }
};

console.log('⚠️  注意：需要 Supabase Access Token 才能部署');
console.log('💡 建議：使用 Supabase CLI 或 Dashboard 手動部署');
console.log('📋 部署指令：');
console.log('   supabase functions deploy claude-chat');
console.log('   或');
console.log('   在 Supabase Dashboard 中重新部署 Edge Function');

// 測試修復後的邏輯
console.log('\n🧪 測試修復後的邏輯...');
const englishKeywords = ['英語', '美語', '補習班', '教育', '學習', '英文', '課程', '培訓', '肯塔基', '學美語', '學英語', '英文學習', '美語學習', '語言學習', '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '推薦', '補習班推薦'];
const testMessage = '我想學美語';
const isEnglishRelated = englishKeywords.some(keyword => testMessage.includes(keyword));

console.log('📝 測試訊息:', testMessage);
console.log('🔍 檢測到的關鍵字:', englishKeywords.filter(keyword => testMessage.includes(keyword)));
console.log('✅ 是否英語相關:', isEnglishRelated);

if (isEnglishRelated) {
  console.log('🎯 應該觸發肯塔基美語推薦！');
} else {
  console.log('❌ 沒有觸發肯塔基美語推薦！');
}
