import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// 通用 Supabase 查詢 Hook
export function useSupabaseQuery<T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: options?.gcTime ?? 10 * 60 * 1000,
  })
}

// 通用 Supabase 變更 Hook
export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[][]
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      options?.onSuccess?.(data)
      // 使相關查詢失效
      options?.invalidateQueries?.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
    onError: options?.onError,
  })
}

// 聊天消息查詢 Hook
export function useChatMessages(sessionId: string) {
  return useSupabaseQuery(
    ['chat-messages', sessionId],
    async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    }
  )
}

// 用戶統計查詢 Hook
export function useUserStats() {
  return useSupabaseQuery(
    ['user-stats'],
    async () => {
      const { data, error } = await supabase
        .from('line_users')
        .select('count(*)')
        .eq('is_active', true)

      if (error) throw error
      return data
    }
  )
}

// 對話歷史查詢 Hook
export function useConversationHistory(page = 1, limit = 20) {
  return useSupabaseQuery(
    ['conversation-history', page.toString(), limit.toString()],
    async () => {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          line_users(line_display_name, line_avatar_url),
          chat_messages(count)
        `)
        .order('last_activity', { ascending: false })
        .range(from, to)

      if (error) throw error
      return data
    }
  )
}
