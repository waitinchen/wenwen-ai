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

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        console.log(`Daily reset job started at ${new Date().toISOString()}`);
        console.log(`Resetting conversation limits for date: ${today}`);

        // 1. 重置昨天被限制的用戶狀態
        const resetResponse = await fetch(`${supabaseUrl}/rest/v1/user_daily_conversations?conversation_date=eq.${yesterday}&is_blocked=eq.true`, {
            method: 'PATCH',
            headers: dbHeaders,
            body: JSON.stringify({
                is_blocked: false,
                updated_at: new Date().toISOString()
            })
        });

        if (!resetResponse.ok) {
            const error = await resetResponse.text();
            console.error('Failed to reset blocked users:', error);
        } else {
            console.log('Successfully reset blocked users from yesterday');
        }

        // 2. 清理過期的追問會話記錄（超過24小時的未完成會話）
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const cleanupResponse = await fetch(`${supabaseUrl}/rest/v1/user_clarification_sessions?created_at=lt.${oneDayAgo}&is_completed=eq.false`, {
            method: 'PATCH',
            headers: dbHeaders,
            body: JSON.stringify({
                is_completed: true,
                updated_at: new Date().toISOString()
            })
        });

        if (!cleanupResponse.ok) {
            const error = await cleanupResponse.text();
            console.error('Failed to cleanup expired clarification sessions:', error);
        } else {
            console.log('Successfully cleaned up expired clarification sessions');
        }

        // 3. 清理超過30天的舊對話記錄（可選，節省儲存空間）
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const deleteOldResponse = await fetch(`${supabaseUrl}/rest/v1/user_daily_conversations?conversation_date=lt.${thirtyDaysAgo}`, {
            method: 'DELETE',
            headers: dbHeaders
        });

        if (!deleteOldResponse.ok) {
            const error = await deleteOldResponse.text();
            console.error('Failed to delete old conversation records:', error);
        } else {
            console.log('Successfully deleted old conversation records (older than 30 days)');
        }

        // 4. 生成每日統計報告
        const statsResponse = await fetch(`${supabaseUrl}/rest/v1/user_daily_conversations?conversation_date=eq.${yesterday}`, {
            headers: dbHeaders
        });

        let dailyStats = {
            date: yesterday,
            totalUsers: 0,
            totalConversations: 0,
            blockedUsers: 0,
            averageConversationsPerUser: 0
        };

        if (statsResponse.ok) {
            const records = await statsResponse.json();
            dailyStats = {
                date: yesterday,
                totalUsers: records.length,
                totalConversations: records.reduce((sum, record) => sum + record.conversation_count, 0),
                blockedUsers: records.filter(record => record.is_blocked).length,
                averageConversationsPerUser: records.length > 0 ? Math.round((records.reduce((sum, record) => sum + record.conversation_count, 0) / records.length) * 100) / 100 : 0
            };
        }

        console.log('Daily statistics:', dailyStats);

        const result = {
            success: true,
            timestamp: new Date().toISOString(),
            message: 'Daily reset job completed successfully',
            statistics: dailyStats
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Daily reset job error:', error);

        const errorResponse = {
            error: {
                code: 'DAILY_RESET_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});