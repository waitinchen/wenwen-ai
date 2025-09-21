import { invokeEdgeFunction } from './client'
import type { AnalyticsRequestPayload } from './types'

const ANALYTICS_FUNCTION = 'analytics-service'

const invokeAnalytics = <T>(payload: AnalyticsRequestPayload) =>
  invokeEdgeFunction<{ data: T }>(ANALYTICS_FUNCTION, payload, {
    requiresAdmin: true,
    transform: response => response as { data: T }
  })

export async function analyticsRequest<T = unknown>(
  action: string,
  dateRange?: unknown,
  filters?: Record<string, unknown>
): Promise<T> {
  const response = await invokeAnalytics<T>({
    action,
    dateRange,
    filters
  })

  return response.data
}

export function getDashboardStats(dateRange?: unknown) {
  return analyticsRequest('dashboard_stats', dateRange)
}

export function getConversationTrends(dateRange?: unknown) {
  return analyticsRequest('conversation_trends', dateRange)
}

export function getPopularQuestions(dateRange?: unknown) {
  return analyticsRequest('popular_questions', dateRange)
}

export function getUsageHeatmap(dateRange?: unknown) {
  return analyticsRequest('usage_heatmap', dateRange)
}

export function getUserSatisfaction(dateRange?: unknown) {
  return analyticsRequest('user_satisfaction', dateRange)
}

export function getBlockedQuestionsStats(dateRange?: unknown) {
  return analyticsRequest('blocked_questions_stats', dateRange)
}
