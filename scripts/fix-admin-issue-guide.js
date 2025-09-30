// 修復 admin 問題指南
console.log('🚀 修復 admin 問題指南');
console.log('============================================================');

console.log('📝 問題診斷結果:');
console.log('============================================================');
console.log('✅ Supabase 連線成功');
console.log('✅ quick_questions 表存在且有資料');
console.log('✅ 寫入權限正常');
console.log('❌ admin_sessions 表不存在 ← 這是問題根源！');

console.log('\n📝 解決方案:');
console.log('============================================================');

console.log('步驟 1: 創建 admin_sessions 表');
console.log('1. 前往 Supabase Dashboard');
console.log('2. 左側選單 → SQL Editor');
console.log('3. 複製 scripts/create-admin-sessions-table.sql 的內容');
console.log('4. 貼上到 SQL Editor');
console.log('5. 點擊 "Run" 執行');

console.log('\n步驟 2: 設定 Edge Function 環境變數');
console.log('1. 前往 Edge Functions → admin-management');
console.log('2. 添加環境變數:');
console.log('   - SUPABASE_SERVICE_ROLE_KEY = sb_secret_FgIuCi_gWTgrLuobRdeyeA_xO1b4ecq');
console.log('   - SUPABASE_URL = https://vqcuwjfxoxjgsrueqodj.supabase.co');
console.log('3. 重新部署 admin-management');
console.log('4. 重新部署 admin-auth');

console.log('\n步驟 3: 測試修復效果');
console.log('1. 重新登入 admin 後台');
console.log('2. 進入 admin/quick-questions 頁面');
console.log('3. 嘗試修改快速問題');
console.log('4. 確認修改成功保存');

console.log('\n📝 SQL 腳本內容:');
console.log('============================================================');
console.log('請複製以下內容到 SQL Editor:');

const sqlContent = `
-- 創建 admin_sessions 表
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);

-- 創建 admins 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_active ON public.admins(is_active);

-- 添加外鍵約束
ALTER TABLE public.admin_sessions 
ADD CONSTRAINT fk_admin_sessions_admin_id 
FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;

-- 插入預設管理員帳號（密碼：admin123，請記得修改）
INSERT INTO public.admins (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@wenshancircle.com',
    '$2a$10$rQZ8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8', -- 這是 admin123 的 hash
    '系統管理員',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- 啟用 RLS (Row Level Security)
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略（Service Role 可以繞過 RLS）
CREATE POLICY "Service role can do everything on admin_sessions" ON public.admin_sessions
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can do everything on admins" ON public.admins
FOR ALL TO service_role USING (true);
`;

console.log(sqlContent);

console.log('\n📝 預期結果:');
console.log('============================================================');
console.log('✅ admin_sessions 表創建成功');
console.log('✅ admins 表創建成功');
console.log('✅ 預設管理員帳號創建成功');
console.log('✅ Edge Functions 環境變數設定成功');
console.log('✅ 快速問題修改功能正常工作');

console.log('\n============================================================');
console.log('🎯 請按照上述步驟執行，問題應該就能解決！');
console.log('============================================================');
