import { invokeEdgeFunction } from './client'
import { executeSupabaseQuery, supabase } from './database'
import type {
  AdminManagementPayload,
  AdminRequestFilters,
  QuickQuestionInput,
  QuickQuestionRecord
} from './types'

const ADMIN_MANAGEMENT_FUNCTION = 'admin-management'

const transformToResponse = <T>(payload: unknown) => payload as { data: T }

const callAdminManagement = async <T>(
  payload: AdminManagementPayload
): Promise<{ data: T }> => {
  return invokeEdgeFunction(ADMIN_MANAGEMENT_FUNCTION, payload, {
    requiresAdmin: true,
    transform: transformToResponse<T>
  })
}

export async function adminRequest<T = unknown>(
  action: string,
  table: string,
  data?: unknown,
  id?: number,
  filters?: AdminRequestFilters
): Promise<T> {
  const response = await callAdminManagement<T>({
    action,
    table,
    data,
    id,
    filters
  })

  return response.data
}

export async function adminManagement(
  action: string,
  table: string,
  data?: unknown,
  id?: number,
  filters?: AdminRequestFilters
) {
  return callAdminManagement({
    action,
    table,
    data,
    id,
    filters
  })
}

// Quick Questions
export function getQuickQuestions() {
  return adminRequest<QuickQuestionRecord[]>('list', 'quick_questions', undefined, undefined, {
    orderBy: 'display_order',
    orderDirection: 'asc'
  })
}

export function createQuickQuestion(question: QuickQuestionInput) {
  return adminRequest<QuickQuestionRecord>('create', 'quick_questions', question)
}

export function updateQuickQuestion(id: number, question: QuickQuestionInput) {
  return adminRequest<QuickQuestionRecord>('update', 'quick_questions', question, id)
}

export function deleteQuickQuestion(id: number) {
  return adminRequest('delete', 'quick_questions', undefined, id)
}

export function bulkUpdateQuickQuestions(items: QuickQuestionRecord[]) {
  return adminRequest('bulk_update', 'quick_questions', items)
}

// Activities
export function getActivities() {
  return adminRequest('list', 'activities', undefined, undefined, {
    orderBy: 'created_at',
    orderDirection: 'desc'
  })
}

export function createActivity(activity: unknown) {
  return adminRequest('create', 'activities', activity)
}

export function updateActivity(id: number, activity: unknown) {
  return adminRequest('update', 'activities', activity, id)
}

export function deleteActivity(id: number) {
  return adminRequest('delete', 'activities', undefined, id)
}

// Interaction Filters
export function getInteractionFilters() {
  return adminRequest('list', 'interaction_filters', undefined, undefined, {
    orderBy: 'created_at',
    orderDirection: 'desc'
  })
}

export function createInteractionFilter(filter: unknown) {
  return adminRequest('create', 'interaction_filters', filter)
}

export function updateInteractionFilter(id: number, filter: unknown) {
  return adminRequest('update', 'interaction_filters', filter, id)
}

export function deleteInteractionFilter(id: number) {
  return adminRequest('delete', 'interaction_filters', undefined, id)
}

// Personality Configs
export function getPersonalityConfigs() {
  return adminRequest('list', 'personality_configs', undefined, undefined, {
    orderBy: 'created_at',
    orderDirection: 'desc'
  })
}

export function createPersonalityConfig(config: unknown) {
  return adminRequest('create', 'personality_configs', config)
}

export function updatePersonalityConfig(id: number, config: unknown) {
  return adminRequest('update', 'personality_configs', config, id)
}

export function deletePersonalityConfig(id: number) {
  return adminRequest('delete', 'personality_configs', undefined, id)
}

export async function activatePersonalityConfig(id: number) {
  await executeSupabaseQuery(
    supabase
      .from('personality_configs')
      .update({ is_active: false })
      .neq('id', 0),
    '重置人格配置狀態失敗'
  )

  return adminRequest('update', 'personality_configs', { is_active: true }, id)
}
