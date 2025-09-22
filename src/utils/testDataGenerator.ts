import { supabase } from '@/lib/supabase'

export interface TestConversationData {
  sessionId: string
  userIp: string
  userAgent: string
  lineUserId?: number
  messages: Array<{
    type: 'user' | 'bot'
    text: string
    responseTime?: number
  }>
}

export class TestDataGenerator {
  private static instance: TestDataGenerator
  private isGenerating = false

  static getInstance(): TestDataGenerator {
    if (!TestDataGenerator.instance) {
      TestDataGenerator.instance = new TestDataGenerator()
    }
    return TestDataGenerator.instance
  }

  async generateTestConversations(count: number = 10): Promise<void> {
    if (this.isGenerating) {
      console.log('正在生成測試數據中，請稍候...')
      return
    }

    this.isGenerating = true
    console.log(`開始生成 ${count} 個測試對話...`)

    try {
      // 先創建一些 LINE 用戶
      const lineUsers = await this.createLineUsers(5)
      
      // 生成測試對話
      const conversations = this.generateConversationData(count, lineUsers)
      
      // 插入到數據庫
      await this.insertConversations(conversations)
      
      console.log(`✅ 成功生成 ${count} 個測試對話`)
    } catch (error) {
      console.error('❌ 生成測試數據失敗:', error)
    } finally {
      this.isGenerating = false
    }
  }

  private async createLineUsers(count: number): Promise<number[]> {
    const userIds: number[] = []
    
    for (let i = 0; i < count; i++) {
      const { data, error } = await supabase
        .from('line_users')
        .insert({
          line_uid: `test_user_${i + 1}`,
          line_display_name: `測試用戶${i + 1}`,
          line_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
          is_active: true,
          total_conversations: Math.floor(Math.random() * 10) + 1
        })
        .select('id')
        .single()

      if (!error && data) {
        userIds.push(data.id)
      }
    }

    return userIds
  }

  private generateConversationData(count: number, lineUserIds: number[]): TestConversationData[] {
    const conversations: TestConversationData[] = []
    const sampleQuestions = [
      '文山特區有什麼好吃的餐廳？',
      '停車資訊',
      '最近的活動有哪些？',
      '商場營業時間',
      '有推薦的咖啡廳嗎？',
      '交通怎麼去？',
      '附近有什麼景點？',
      '有優惠活動嗎？',
      '客服電話是多少？',
      '如何成為會員？'
    ]

    const sampleAnswers = [
      '文山特區有很多美食選擇！推薦您幾家：\n1. 文山牛肉麵 - 招牌紅燒牛肉麵\n2. 老街豆花 - 傳統手工豆花\n3. 夜市小吃 - 各種台灣特色小吃',
      '停車資訊如下：\n• 公有停車場：每小時20元\n• 路邊停車：每小時20元，限時3小時\n• 商場停車：每小時15-20元',
      '目前有以下活動：\n• 週末市集：每週六日\n• 美食節：本月舉辦中\n• 會員優惠：消費滿500送50',
      '商場營業時間：\n• 平日：10:00-22:00\n• 假日：09:00-23:00\n• 部分店家可能有所不同',
      '推薦幾家優質咖啡廳：\n1. 星巴克 - 24小時營業\n2. 路易莎咖啡 - 環境舒適\n3. 85度C - 價格實惠'
    ]

    for (let i = 0; i < count; i++) {
      const sessionId = `test_session_${Date.now()}_${i}`
      const userIp = i % 3 === 0 ? 'unknown-client' : `192.168.1.${100 + i}`
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      const lineUserId = lineUserIds[Math.floor(Math.random() * lineUserIds.length)]
      
      // 生成 2-5 條消息的對話
      const messageCount = Math.floor(Math.random() * 4) + 2
      const messages: Array<{
        type: 'user' | 'bot'
        text: string
        responseTime?: number
      }> = []
      
      for (let j = 0; j < messageCount; j++) {
        if (j % 2 === 0) {
          // 用戶消息
          const question = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)]
          messages.push({
            type: 'user' as const,
            text: question || '測試問題'
          })
        } else {
          // AI 回應
          const answer = sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)]
          messages.push({
            type: 'bot' as const,
            text: answer || '測試回答',
            responseTime: Math.floor(Math.random() * 2000) + 500
          })
        }
      }

      conversations.push({
        sessionId,
        userIp,
        userAgent,
        lineUserId: lineUserId || 0,
        messages
      })
    }

    return conversations
  }

  private async insertConversations(conversations: TestConversationData[]): Promise<void> {
    for (const conversation of conversations) {
      try {
        // 插入會話
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            session_id: conversation.sessionId,
            user_ip: conversation.userIp,
            user_agent: conversation.userAgent,
            line_user_id: conversation.lineUserId,
            started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            last_activity: new Date().toISOString(),
            message_count: conversation.messages.length
          })
          .select('id')
          .single()

        if (sessionError) {
          console.error('插入會話失敗:', sessionError)
          continue
        }

        // 插入消息
        const messageInserts = conversation.messages.map((message, index) => ({
          session_id: sessionData.id,
          message_type: message.type,
          message_text: message.text,
          response_time: message.responseTime,
          created_at: new Date(Date.now() - (conversation.messages.length - index) * 60000).toISOString()
        }))

        const { error: messagesError } = await supabase
          .from('chat_messages')
          .insert(messageInserts)

        if (messagesError) {
          console.error('插入消息失敗:', messagesError)
        }
      } catch (error) {
        console.error('插入對話數據失敗:', error)
      }
    }
  }

  async clearTestData(): Promise<void> {
    try {
      console.log('正在清除測試數據...')
      
      // 刪除測試消息
      await supabase
        .from('chat_messages')
        .delete()
        .like('session_id', 'test_session_%')

      // 刪除測試會話
      await supabase
        .from('chat_sessions')
        .delete()
        .like('session_id', 'test_session_%')

      // 刪除測試用戶
      await supabase
        .from('line_users')
        .delete()
        .like('line_uid', 'test_user_%')

      console.log('✅ 測試數據清除完成')
    } catch (error) {
      console.error('❌ 清除測試數據失敗:', error)
    }
  }

  async getDataStats(): Promise<{
    sessions: number
    messages: number
    lineUsers: number
  }> {
    try {
      const [sessionsResult, messagesResult, usersResult] = await Promise.all([
        supabase.from('chat_sessions').select('count', { count: 'exact' }),
        supabase.from('chat_messages').select('count', { count: 'exact' }),
        supabase.from('line_users').select('count', { count: 'exact' })
      ])

      return {
        sessions: sessionsResult.count || 0,
        messages: messagesResult.count || 0,
        lineUsers: usersResult.count || 0
      }
    } catch (error) {
      console.error('獲取數據統計失敗:', error)
      return { sessions: 0, messages: 0, lineUsers: 0 }
    }
  }
}

// 導出單例實例
export const testDataGenerator = TestDataGenerator.getInstance()

