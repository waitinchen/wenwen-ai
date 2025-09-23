#!/usr/bin/env node

import { createMemoryProcessor } from '../src/lib/memoryProcessor.js';

async function testMemorySystem() {
  console.log('🧪 測試高文文記憶系統...');
  
  try {
    // 創建記憶處理器
    const processor = createMemoryProcessor('test-user-001', 'test-session-001');
    
    console.log('✅ 記憶處理器創建成功');
    
    // 測試處理並存儲記憶
    console.log('\n📝 測試記憶存儲...');
    await processor.processAndStore(
      '我想找文山特區的餐廳推薦',
      '我推薦你去文化路上的肯塔基美語附近的餐廳，那邊有很多好吃的！'
    );
    console.log('✅ 記憶存儲成功');
    
    // 測試記憶檢索
    console.log('\n🔍 測試記憶檢索...');
    const memoryContext = await processor.retrieveRelevantMemories('有什麼推薦的餐廳嗎？');
    console.log('檢索到的記憶上下文:', memoryContext.substring(0, 100) + '...');
    
    // 獲取記憶統計
    console.log('\n📊 獲取記憶統計...');
    const stats = await processor.getMemoryStats();
    console.log('記憶統計:', stats);
    
    // 測試清理過期記憶
    console.log('\n🧹 測試清理過期記憶...');
    const cleanedCount = await processor.cleanupExpiredMemories();
    console.log(`清理了 ${cleanedCount} 個過期記憶`);
    
    console.log('\n🎉 記憶系統測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

testMemorySystem();
