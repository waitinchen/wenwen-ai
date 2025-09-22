// 臨時模擬管理員認證 API
export interface AdminLoginData {
  token: string
  admin: {
    id: number
    email: string
    full_name: string
    role: string
    permissions: string[]
  }
  session: {
    expires_at: string
    created_at: string
  }
}

// 模擬的管理員數據
const mockAdmins = [
  {
    id: 1,
    email: 'admin@wenshancircle.com',
    password: 'admin123', // 直接存儲明文密碼用於模擬
    full_name: '系統管理員',
    role: 'super_admin',
    permissions: ['*']
  }
]

// 模擬的會話存儲
const sessions = new Map<string, any>()

export async function mockAdminLogin(email: string, password: string): Promise<AdminLoginData> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 查找管理員（直接比較明文密碼）
  const admin = mockAdmins.find(a => a.email === email && a.password === password)
  
  if (!admin) {
    throw new Error('管理員不存在或密碼錯誤')
  }
  
  // 生成會話令牌
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  
  // 儲存會話
  sessions.set(token, {
    admin_id: admin.id,
    expires_at: expiresAt,
    created_at: new Date().toISOString()
  })
  
  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      permissions: admin.permissions
    },
    session: {
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    }
  }
}

export async function mockAdminVerifyToken(token: string): Promise<AdminLoginData> {
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const session = sessions.get(token)
  if (!session) {
    throw new Error('無效的令牌')
  }
  
  // 檢查是否過期
  if (new Date(session.expires_at) < new Date()) {
    sessions.delete(token)
    throw new Error('令牌已過期')
  }
  
  const admin = mockAdmins.find(a => a.id === session.admin_id)
  if (!admin) {
    throw new Error('管理員不存在')
  }
  
  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      permissions: admin.permissions
    },
    session: {
      expires_at: session.expires_at,
      created_at: session.created_at
    }
  }
}

export async function mockAdminLogout(token: string): Promise<void> {
  sessions.delete(token)
}
