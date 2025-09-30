/**
 * 資料層模組 - 統一管理 Supabase 資料存取
 * 負責：stores, chat_sessions, chat_messages, user_profiles 的 CRUD 操作
 */

import { safeFetch } from "./utils/safe-fetch.ts";

export interface UserMeta {
  external_id: string;
  display_name: string;
  avatar_url?: string;
}

export interface StoreData {
  id: number;
  store_name: string;
  category: string;
  address: string;
  phone: string;
  business_hours: string;
  is_partner_store: boolean;
  features: any;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  id: string;
  user_id: number;
  started_at: string;
  last_activity: string;
  message_count: number;
  user_meta: UserMeta;
}

export class DataLayer {
  private supabaseUrl: string;
  private anonKey: string;
  private serviceRoleKey: string;

  constructor(supabaseUrl: string, anonKey: string, serviceRoleKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.anonKey = anonKey;
    this.serviceRoleKey = serviceRoleKey;
  }

  /**
   * 確保用戶存在，如果不存在則創建
   */
  async ensureUserExists(userMeta: UserMeta, sessionId: string): Promise<number> {
    console.log(`[${sessionId}] 👤 檢查用戶資料: ${userMeta.external_id}`);

    try {
      // 查詢現有用戶
      const existingUserResponse = await safeFetch(
        `${this.supabaseUrl}/rest/v1/user_profiles?external_id=eq.${userMeta.external_id}`,
        {
          headers: {
            'Authorization': `Bearer ${this.anonKey}`,
            'apikey': this.anonKey
          }
        }
      );

      if (existingUserResponse.ok) {
        const existingUsers = await existingUserResponse.json();
        if (existingUsers.length > 0) {
          console.log(`[${sessionId}] ✅ 找到現有用戶: ${existingUsers[0].id}`);
          return existingUsers[0].id;
        }
      }

      // 創建新用戶
      const newUserResponse = await safeFetch(`${this.supabaseUrl}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.serviceRoleKey}`,
          'apikey': this.serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          external_id: userMeta.external_id,
          display_name: userMeta.display_name,
          avatar_url: userMeta.avatar_url || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (newUserResponse.ok) {
        const newUsers = await newUserResponse.json();
        console.log(`[${sessionId}] ✅ 創建新用戶: ${newUsers[0].id}`);
        return newUsers[0].id;
      } else {
        throw new Error(`創建用戶失敗: ${newUserResponse.status}`);
      }

    } catch (error) {
      console.error(`[${sessionId}] ❌ 用戶資料處理失敗:`, error);
      throw error;
    }
  }

  /**
   * 確保會話存在，如果不存在則創建
   */
  async ensureSessionExists(sessionId: string, userId: number, userMeta: UserMeta): Promise<SessionData> {
    console.log(`[${sessionId}] 💬 檢查會話資料`);

    try {
      // 查詢現有會話
      const existingSessionResponse = await safeFetch(
        `${this.supabaseUrl}/rest/v1/chat_sessions?id=eq.${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.anonKey}`,
            'apikey': this.anonKey
          }
        }
      );

      if (existingSessionResponse.ok) {
        const existingSessions = await existingSessionResponse.json();
        if (existingSessions.length > 0) {
          console.log(`[${sessionId}] ✅ 找到現有會話`);
          return existingSessions[0];
        }
      }

      // 創建新會話
      const newSessionResponse = await safeFetch(`${this.supabaseUrl}/rest/v1/chat_sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.serviceRoleKey}`,
          'apikey': this.serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: sessionId,
          user_id: userId,
          line_user_id: userMeta.external_id,
          user_ip: '0.0.0.0',
          user_agent: 'wen-v2.0',
          started_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          message_count: 0,
          user_meta: userMeta
        })
      });

      if (newSessionResponse.ok) {
        const newSessions = await newSessionResponse.json();
        console.log(`[${sessionId}] ✅ 創建新會話`);
        return newSessions[0];
      } else {
        throw new Error(`創建會話失敗: ${newSessionResponse.status}`);
      }

    } catch (error) {
      console.error(`[${sessionId}] ❌ 會話資料處理失敗:`, error);
      throw error;
    }
  }

  /**
   * 根據類別查詢商家資料
   */
  async getStoresByCategory(category: string, limit: number = 5, sessionId: string): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🏪 查詢類別商家: ${category}`);

    try {
      const response = await safeFetch(
        `${this.supabaseUrl}/rest/v1/stores?category=eq.${encodeURIComponent(category)}&order=is_partner_store.desc,rating.desc&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.anonKey}`,
            'apikey': this.anonKey
          }
        }
      );

      if (response.ok) {
        const stores = await response.json();
        console.log(`[${sessionId}] ✅ 找到 ${stores.length} 家 ${category} 商家`);
        return stores;
      } else {
        console.error(`[${sessionId}] ❌ 查詢商家失敗: ${response.status}`);
        return [];
      }

    } catch (error) {
      console.error(`[${sessionId}] ❌ 查詢商家異常:`, error);
      return [];
    }
  }

  /**
   * 根據店名查詢商家資料
   */
  async getStoresByName(storeName: string, sessionId: string): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🔍 查詢店名商家: ${storeName}`);

    try {
      const response = await safeFetch(
        `${this.supabaseUrl}/rest/v1/stores?store_name=eq.${encodeURIComponent(storeName)}&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.anonKey}`,
            'apikey': this.anonKey
          }
        }
      );

      if (response.ok) {
        const stores = await response.json();
        console.log(`[${sessionId}] ✅ 找到 ${stores.length} 家名為 ${storeName} 的商家`);
        return stores;
      } else {
        console.error(`[${sessionId}] ❌ 查詢店名商家失敗: ${response.status}`);
        return [];
      }

    } catch (error) {
      console.error(`[${sessionId}] ❌ 查詢店名商家異常:`, error);
      return [];
    }
  }

  /**
   * 查詢特約商家
   */
  async getPartnerStores(limit: number = 5, sessionId: string): Promise<StoreData[]> {
    console.log(`[${sessionId}] ⭐ 查詢特約商家`);

    try {
      const response = await safeFetch(
        `${this.supabaseUrl}/rest/v1/stores?is_partner_store=eq.true&order=rating.desc&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.anonKey}`,
            'apikey': this.anonKey
          }
        }
      );

      if (response.ok) {
        const stores = await response.json();
        console.log(`[${sessionId}] ✅ 找到 ${stores.length} 家特約商家`);
        return stores;
      } else {
        console.error(`[${sessionId}] ❌ 查詢特約商家失敗: ${response.status}`);
        return [];
      }

    } catch (error) {
      console.error(`[${sessionId}] ❌ 查詢特約商家異常:`, error);
      return [];
    }
  }

  /**
   * 查詢一般商家（按評分排序）
   */
  async getGeneralStores(limit: number = 3, sessionId: string): Promise<StoreData[]> {
    console.log(`[${sessionId}] 🌟 查詢一般商家`);

    try {
      const response = await safeFetch(
        `${this.supabaseUrl}/rest/v1/stores?order=is_partner_store.desc,rating.desc&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.anonKey}`,
            'apikey': this.anonKey
          }
        }
      );

      if (response.ok) {
        const stores = await response.json();
        console.log(`[${sessionId}] ✅ 找到 ${stores.length} 家一般商家`);
        return stores;
      } else {
        console.error(`[${sessionId}] ❌ 查詢一般商家失敗: ${response.status}`);
        return [];
      }

    } catch (error) {
      console.error(`[${sessionId}] ❌ 查詢一般商家異常:`, error);
      return [];
    }
  }

  /**
   * 記錄聊天訊息
   */
  async logMessage(
    sessionId: string,
    userId: number,
    role: 'user' | 'assistant',
    content: string,
    metadata: any,
    sessionIdForLog: string
  ): Promise<void> {
    console.log(`[${sessionIdForLog}] 📝 記錄訊息: ${role}`);

    try {
      const response = await safeFetch(`${this.supabaseUrl}/rest/v1/chat_messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.serviceRoleKey}`,
          'apikey': this.serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation,resolution=merge-duplicates'
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          role,
          content,
          metadata,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error(`[${sessionIdForLog}] ❌ 記錄訊息失敗: ${response.status}`);
      } else {
        console.log(`[${sessionIdForLog}] ✅ 訊息記錄成功`);
      }

    } catch (error) {
      console.error(`[${sessionIdForLog}] ❌ 記錄訊息異常:`, error);
    }
  }

  /**
   * 更新會話統計
   */
  async updateSessionStats(
    sessionId: string,
    messageCount: number,
    sessionIdForLog: string
  ): Promise<void> {
    console.log(`[${sessionIdForLog}] 📊 更新會話統計`);

    try {
      const response = await safeFetch(
        `${this.supabaseUrl}/rest/v1/chat_sessions?id=eq.${sessionId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.serviceRoleKey}`,
            'apikey': this.serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message_count: messageCount,
            last_activity: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        console.error(`[${sessionIdForLog}] ❌ 更新會話統計失敗: ${response.status}`);
      } else {
        console.log(`[${sessionIdForLog}] ✅ 會話統計更新成功`);
      }

    } catch (error) {
      console.error(`[${sessionIdForLog}] ❌ 更新會話統計異常:`, error);
    }
  }
}
