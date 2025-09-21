import { supabase } from '@/lib/supabase'
import { AdminAuthError, ApiError } from './errors'

const ADMIN_TOKEN_STORAGE_KEY = 'admin_token'
const UNAUTHORIZED_PATTERNS = [
  /未授權/i,
  /權限不足/i,
  /unauthorized/i,
  /請先登入/i,
  /authentication_required/i
]

const isBrowser = typeof window !== 'undefined'

type EdgeFunctionBody = Record<string, unknown>

type EdgeTransform<T> = (payload: unknown) => T

interface EdgeInvokeOptions<T> {
  requiresAdmin?: boolean
  transform?: EdgeTransform<T>
  onUnauthorized?: () => void
}

const defaultTransform = <T,>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const dataPayload = payload as { data: T }
    return dataPayload.data
  }
  return payload as T
}

const sanitizeBody = (body: EdgeFunctionBody): EdgeFunctionBody =>
  Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined)
  )

const shouldResetSession = (message: string | undefined): boolean => {
  if (!message) return false
  return UNAUTHORIZED_PATTERNS.some(pattern => pattern.test(message))
}

export const getStoredAdminToken = (): string | null => {
  if (!isBrowser) return null
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
}

export const storeAdminToken = (token: string): void => {
  if (!isBrowser) return
  window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token)
}

export const clearStoredAdminToken = (): void => {
  if (!isBrowser) return
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
}

const requireAdminToken = (): string => {
  const token = getStoredAdminToken()
  if (!token) {
    throw new AdminAuthError('未登入或登入已過期')
  }
  return token
}

const handleUnauthorized = (callback?: () => void) => {
  clearStoredAdminToken()
  if (callback) {
    callback()
    return
  }
  if (isBrowser) {
    window.location.reload()
  }
}

export async function invokeEdgeFunction<T>(
  functionName: string,
  body: EdgeFunctionBody,
  options: EdgeInvokeOptions<T> = {}
): Promise<T> {
  const { requiresAdmin = false, transform = defaultTransform, onUnauthorized } = options

  const payload: EdgeFunctionBody = sanitizeBody({ ...body })

  if (requiresAdmin) {
    payload.token ??= requireAdminToken()
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload
  })

  if (error) {
    if (requiresAdmin && shouldResetSession(error.message)) {
      handleUnauthorized(onUnauthorized)
      throw new AdminAuthError('管理員身份驗證失敗', error)
    }

    throw new ApiError(error.message || `Edge function ${functionName} 呼叫失敗`, error)
  }

  if (requiresAdmin) {
    const responseError = (data as { error?: { message?: string } })?.error
    if (responseError && shouldResetSession(responseError.message)) {
      handleUnauthorized(onUnauthorized)
      throw new AdminAuthError(responseError.message ?? '管理員身份驗證失敗')
    }
  }

  if (data === null || data === undefined) {
    throw new ApiError(`Edge function ${functionName} 沒有返回資料`)
  }

  return transform(data)
}

export {
  ADMIN_TOKEN_STORAGE_KEY
}
