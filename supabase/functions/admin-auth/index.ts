Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, email, password, token } = await req.json();
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            console.error('Missing Supabase configuration', {
                hasServiceRoleKey: !!serviceRoleKey,
                hasSupabaseUrl: !!supabaseUrl
            });
            return new Response(JSON.stringify({
                error: {
                    code: 'CONFIGURATION_ERROR',
                    message: 'Supabase service role credentials are not configured'
                }
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const headers = {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        };

        let result;

        switch (action) {
            case 'login':
                if (!email || !password) {
                    throw new Error('Email and password are required');
                }

                console.log('Attempting login for:', email);

                // 查找管理員
                const adminUrl = `${supabaseUrl}/rest/v1/admins?email=eq.${encodeURIComponent(email)}&is_active=eq.true&limit=1`;
                const adminResponse = await fetch(adminUrl, {
                    method: 'GET',
                    headers
                });

                if (!adminResponse.ok) {
                    const errorText = await adminResponse.text();
                    console.error('Admin query failed:', errorText);
                    throw new Error('Database query failed');
                }

                const admins = await adminResponse.json();
                console.log('Admin query result:', admins.length > 0 ? 'Found admin' : 'No admin found');
                
                if (admins.length === 0) {
                    throw new Error('管理員不存在或已被禁用');
                }

                const admin = admins[0];
                console.log('Admin role:', admin.role);

                // 計算輸入密碼的SHA-256哈希
                const encoder = new TextEncoder();
                const data = encoder.encode(password);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                console.log('Password hash calculated');

                // 驗證密碼哈希
                if (admin.password_hash !== passwordHash) {
                    console.log('Password verification failed');
                    throw new Error('密碼錯誤');
                }

                console.log('Password verified successfully');

                // 生成session token
                const sessionToken = crypto.randomUUID();
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24小時後過期

                // 儲存session到數據庫
                const sessionData = {
                    admin_id: admin.id,
                    session_token: sessionToken,
                    expires_at: expiresAt,
                    created_at: new Date().toISOString()
                };

                const sessionUrl = `${supabaseUrl}/rest/v1/admin_sessions`;
                const sessionResponse = await fetch(sessionUrl, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(sessionData)
                });

                if (!sessionResponse.ok) {
                    const errorText = await sessionResponse.text();
                    console.error('Session creation failed:', errorText);
                    throw new Error('Failed to create session');
                }

                console.log('Session created successfully');

                result = {
                    token: sessionToken,
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        full_name: admin.full_name,
                        role: admin.role
                    },
                    expires_at: expiresAt
                };
                break;

            case 'verify':
                if (!token) {
                    throw new Error('Token is required');
                }

                // 驗證token - 使用JOIN查詢獲取管理員資訊
                const verifyUrl = `${supabaseUrl}/rest/v1/admin_sessions?session_token=eq.${encodeURIComponent(token)}&select=*,admins(*)&limit=1`;
                const verifyResponse = await fetch(verifyUrl, {
                    method: 'GET',
                    headers
                });

                if (!verifyResponse.ok) {
                    const errorText = await verifyResponse.text();
                    console.error('Token verification failed:', errorText);
                    throw new Error('Token verification failed');
                }

                const sessions = await verifyResponse.json();
                if (sessions.length === 0) {
                    throw new Error('Invalid token');
                }

                const session = sessions[0];

                // 檢查是否過期
                if (new Date(session.expires_at) < new Date()) {
                    // 刪除過期的session
                    const deleteUrl = `${supabaseUrl}/rest/v1/admin_sessions?session_token=eq.${encodeURIComponent(token)}`;
                    await fetch(deleteUrl, {
                        method: 'DELETE',
                        headers
                    });
                    throw new Error('Token expired');
                }

                result = {
                    token,
                    admin: {
                        id: session.admins.id,
                        email: session.admins.email,
                        full_name: session.admins.full_name,
                        role: session.admins.role
                    },
                    expires_at: session.expires_at
                };
                break;

            case 'logout':
                if (!token) {
                    throw new Error('Token is required');
                }

                // 刪除session
                const logoutUrl = `${supabaseUrl}/rest/v1/admin_sessions?session_token=eq.${encodeURIComponent(token)}`;
                const logoutResponse = await fetch(logoutUrl, {
                    method: 'DELETE',
                    headers
                });

                if (!logoutResponse.ok) {
                    console.error('Logout failed, but continuing');
                }

                result = { success: true };
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin auth error:', error);

        const errorResponse = {
            error: {
                code: 'ADMIN_AUTH_ERROR',
                message: error.message || 'Authentication failed'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
