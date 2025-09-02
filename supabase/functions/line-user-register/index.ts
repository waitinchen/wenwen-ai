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
        // 解析请求数据
        const requestData = await req.json();
        const { line_uid, line_display_name, line_avatar_url } = requestData;

        // 验证必需参数
        if (!line_uid || !line_display_name) {
            throw new Error('line_uid and line_display_name are required');
        }

        console.log('收到LINE用户注册请求:', { line_uid, line_display_name, line_avatar_url });

        // 获取Supabase配置
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const dbHeaders = {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        };

        // 检查用户是否已存在
        const checkUserResponse = await fetch(`${supabaseUrl}/rest/v1/line_users?line_uid=eq.${line_uid}`, {
            headers: dbHeaders
        });

        if (!checkUserResponse.ok) {
            throw new Error('Failed to check existing user');
        }

        const existingUsers = await checkUserResponse.json();
        let user = null;
        let message = '';

        if (existingUsers.length > 0) {
            // 用户已存在，更新信息
            const existingUser = existingUsers[0];
            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/line_users?id=eq.${existingUser.id}`, {
                method: 'PATCH',
                headers: dbHeaders,
                body: JSON.stringify({
                    line_display_name: line_display_name,
                    line_avatar_url: line_avatar_url,
                    last_interaction_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update user');
            }

            // 获取更新后的用户信息
            const updatedUserResponse = await fetch(`${supabaseUrl}/rest/v1/line_users?id=eq.${existingUser.id}`, {
                headers: dbHeaders
            });

            if (updatedUserResponse.ok) {
                const updatedUsers = await updatedUserResponse.json();
                user = updatedUsers[0];
            }

            message = 'LINE用户信息已更新';
            console.log('LINE用户已更新:', user?.line_display_name);
        } else {
            // 创建新用户
            const createResponse = await fetch(`${supabaseUrl}/rest/v1/line_users`, {
                method: 'POST',
                headers: dbHeaders,
                body: JSON.stringify({
                    line_uid: line_uid,
                    line_display_name: line_display_name,
                    line_avatar_url: line_avatar_url,
                    is_active: true,
                    first_interaction_at: new Date().toISOString(),
                    last_interaction_at: new Date().toISOString(),
                    total_conversations: 0
                })
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                console.error('Create user error:', errorText);
                throw new Error(`Failed to create user: ${errorText}`);
            }

            // 获取创建的用户信息
            const newUserResponse = await fetch(`${supabaseUrl}/rest/v1/line_users?line_uid=eq.${line_uid}`, {
                headers: dbHeaders
            });

            if (newUserResponse.ok) {
                const newUsers = await newUserResponse.json();
                user = newUsers[0];
            }

            message = 'LINE用户注册成功';
            console.log('新LINE用户已创建:', user?.line_display_name);
        }

        // 返回成功响应
        const result = {
            data: {
                user: user,
                message: message
            }
        };

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('LINE user register error:', error);

        const errorResponse = {
            error: {
                code: 'LINE_USER_REGISTER_ERROR',
                message: error.message || 'LINE用户注册失败'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
