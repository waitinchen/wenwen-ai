import { invokeEdgeFunction } from './client'
import type { AdminLoginData } from './types'

interface AdminAuthResponse {
  token: string
  admin: AdminLoginData['admin']
  expires_at?: string
  session?: AdminLoginData['session']
}

const normalizeAdminAuthResponse = (response: AdminAuthResponse): AdminLoginData => {
  const session = response.session ?? {
    expires_at: response.expires_at ?? '',
    created_at: new Date().toISOString()
  }

  return {
    token: response.token,
    admin: {
      ...response.admin,
      permissions: response.admin.permissions ?? []
    },
    expires_at: response.expires_at,
    session
  }
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginData> {
  const result = await invokeEdgeFunction<AdminAuthResponse>('admin-auth', {
    action: 'login',
    email,
    password
  })

  return normalizeAdminAuthResponse(result)
}

export async function adminVerifyToken(token: string): Promise<AdminLoginData> {
  const result = await invokeEdgeFunction<AdminAuthResponse>('admin-auth', {
    action: 'verify',
    token
  })

  return normalizeAdminAuthResponse({
    ...result,
    token
  })
}

export async function adminLogout(token: string): Promise<void> {
  await invokeEdgeFunction('admin-auth', {
    action: 'logout',
    token
  })
}
