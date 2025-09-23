#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import CryptoJS from 'crypto-js';

const prisma = new PrismaClient();
const ENCRYPTION_KEY = 'wenwen-memory-key-2025';

async function testMemorySystem() {
  console.log('🧪 測試高文文記憶系統...');
  
  try {
    // 測試資料庫連接
    console.log('🔗 測試資料庫連接...');
    await prisma.$connect();
    console.log('✅ 資料庫連接成功');

    // 測試創建記憶
    console.log('\n📝 測試創建記憶...');
    const testMemory = await prisma.memoryItem.create({
      data: {
        userId: 'test-user-001',
        sessionId: 'test-session-001',
        content: CryptoJS.AES.encrypt('用戶詢問文山特區推薦餐廳', ENCRYPTION_KEY).toString(),
        summary: CryptoJS.AES.encrypt('詢問餐廳推薦', ENCRYPTION_KEY).toString(),
        intent: 'recommendation',
        keywords: JSON.stringify(['餐廳', '推薦', '文山特區']),
        meta: JSON.stringify({
          wordCount: 12,
          timestamp: new Date().toISOString(),
          processingVersion: '1.0'
        }),
        encrypted: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ 記憶創建成功:', testMemory.id);

    // 測試查詢記憶
    console.log('\n🔍 測試查詢記憶...');
    const memories = await prisma.memoryItem.findMany({
      where: { userId: 'test-user-001' },
      take: 5
    });
    console.log(`✅ 查詢到 ${memories.length} 個記憶`);

    // 測試解密
    console.log('\n🔓 測試解密記憶...');
    if (memories.length > 0) {
      const memory = memories[0];
      const decryptedContent = CryptoJS.AES.decrypt(memory.content, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      const decryptedSummary = CryptoJS.AES.decrypt(memory.summary, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      console.log('✅ 解密成功:');
      console.log('  內容:', decryptedContent);
      console.log('  摘要:', decryptedSummary);
    }

    // 測試統計
    console.log('\n📊 測試統計功能...');
    const totalCount = await prisma.memoryItem.count();
    const activeCount = await prisma.memoryItem.count({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    console.log(`✅ 統計結果: 總數 ${totalCount}, 有效 ${activeCount}`);

    // 測試意圖分布
    const intentStats = await prisma.memoryItem.groupBy({
      by: ['intent'],
      _count: { intent: true }
    });
    console.log('✅ 意圖分布:', intentStats);

    console.log('\n🎉 記憶系統測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMemorySystem();
