#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function initMemoryDatabase() {
  console.log('🧠 初始化高文文記憶資料庫...');
  
  try {
    // 確保資料目錄存在
    const dataDir = path.join(__dirname, '..', 'data', 'memory');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ 創建資料目錄:', dataDir);
    }

    // 生成 Prisma Client
    console.log('📦 生成 Prisma Client...');
    const { execSync } = await import('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 執行資料庫遷移
    console.log('🗄️ 執行資料庫遷移...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // 測試資料庫連接
    console.log('🔗 測試資料庫連接...');
    await prisma.$connect();
    console.log('✅ 資料庫連接成功');

    // 創建測試記憶（可選）
    console.log('📝 創建測試記憶...');
    const testMemory = await prisma.memoryItem.create({
      data: {
        userId: 'test-user-001',
        sessionId: 'test-session-001',
        content: '這是高文文的記憶系統測試資料',
        summary: '記憶系統測試',
        intent: 'general',
        keywords: JSON.stringify(['測試', '記憶', '系統']),
        meta: JSON.stringify({
          wordCount: 12,
          timestamp: new Date().toISOString(),
          processingVersion: '1.0'
        }),
        encrypted: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天後過期
      }
    });

    console.log('✅ 測試記憶創建成功:', testMemory.id);

    // 獲取統計資訊
    const memoryCount = await prisma.memoryItem.count();
    console.log('📊 資料庫統計:');
    console.log(`  - 記憶總數: ${memoryCount}`);
    console.log(`  - 資料庫位置: ${dataDir}/wenwen-memory.db`);

    console.log('🎉 高文文記憶資料庫初始化完成！');
    
  } catch (error) {
    console.error('❌ 初始化失敗:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 執行初始化
initMemoryDatabase();
