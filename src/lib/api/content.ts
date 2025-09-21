import { invokeEdgeFunction } from './client'

type ContentValidationAction =
  | 'check-content'
  | 'batch-check'
  | 'get-warnings'
  | 'resolve-warning'
  | 'get-all-warnings'

interface ContentValidationPayload {
  action: ContentValidationAction
  content?: string
  contentType?: string
  sourceTable?: string
  sourceId?: number
  batchCheck?: unknown[]
}

const invokeContentValidation = <T>(payload: ContentValidationPayload) =>
  invokeEdgeFunction<T>('content-validation', payload)

export function validateContent(
  content: string,
  contentType: string,
  sourceTable?: string,
  sourceId?: number
) {
  return invokeContentValidation<{ hasWarnings: boolean; warningsCount: number; warnings: unknown[] }>({
    action: 'check-content',
    content,
    contentType,
    sourceTable,
    sourceId
  })
}

export function getContentWarnings(sourceTable?: string, sourceId?: number) {
  return invokeContentValidation<unknown[]>({
    action: 'get-warnings',
    sourceTable,
    sourceId
  })
}

export function getAllContentWarnings() {
  return invokeContentValidation<unknown[]>({
    action: 'get-all-warnings'
  })
}

export function resolveContentWarning(warningId: number) {
  return invokeContentValidation<{ success: boolean }>({
    action: 'resolve-warning',
    sourceId: warningId
  })
}

export function batchValidateContent(items: unknown[]) {
  return invokeContentValidation<{ results: unknown[] }>({
    action: 'batch-check',
    batchCheck: items
  })
}
