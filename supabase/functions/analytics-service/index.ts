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
        const { action, dateRange, filters } = await req.json();
        
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const headers = {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        };

        let result;

        switch (action) {
            case 'dashboard_stats':
                // 獲取基本統計數據
                const [sessionsResponse, messagesResponse, blockedResponse] = await Promise.all([
                    fetch(`${supabaseUrl}/rest/v1/chat_sessions?select=*`, { headers }),
                    fetch(`${supabaseUrl}/rest/v1/chat_messages?select=*`, { headers }),
                    fetch(`${supabaseUrl}/rest/v1/blocked_questions?select=*`, { headers })
                ]);
                
                const sessions = await sessionsResponse.json();
                const messages = await messagesResponse.json();
                const blocked = await blockedResponse.json();
                
                const uniqueUsers = new Set(sessions.map(s => s.user_ip)).size;
                const totalConversations = sessions.length;
                const totalMessages = messages.length;
                const averageMessagesPerConversation = totalConversations > 0 ? Math.round(totalMessages / totalConversations * 100) / 100 : 0;
                const blockedQuestions = blocked.length;
                
                result = {
                    totalConversations,
                    totalMessages,
                    uniqueUsers,
                    averageMessagesPerConversation,
                    blockedQuestions
                };
                break;
                
            case 'conversation_trends':
                // 對話趨勢分析（簡化版本）
                const trendsResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?select=created_at&order=created_at.desc`, { headers });
                const trendsData = await trendsResponse.json();
                
                const dailyStats = {};
                trendsData.forEach(session => {
                    const date = new Date(session.created_at).toISOString().split('T')[0];
                    dailyStats[date] = (dailyStats[date] || 0) + 1;
                });
                
                result = Object.entries(dailyStats)
                    .map(([date, count]) => ({ date, conversations: count }))
                    .slice(0, 30);
                break;
                
            case 'popular_questions':
                // 熱門問題分析
                const questionsResponse = await fetch(`${supabaseUrl}/rest/v1/chat_messages?select=content&message_type=eq.user&order=created_at.desc&limit=1000`, { headers });
                const questionsData = await questionsResponse.json();
                
                const questionCounts = {};
                questionsData.forEach(msg => {
                    const content = msg.content.toLowerCase();
                    questionCounts[content] = (questionCounts[content] || 0) + 1;
                });
                
                const total = questionsData.length;
                result = Object.entries(questionCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([question, count]) => ({
                        question,
                        count,
                        percentage: Math.round((count / total) * 100 * 100) / 100
                    }));
                break;
                
            case 'usage_heatmap':
                // 24小時使用熱度圖
                const heatmapResponse = await fetch(`${supabaseUrl}/rest/v1/chat_sessions?select=created_at`, { headers });
                const heatmapData = await heatmapResponse.json();
                
                const hourlyStats = Array(24).fill(0).map((_, i) => ({ hour: i, conversations: 0, label: `${i}:00` }));
                
                heatmapData.forEach(session => {
                    const hour = new Date(session.created_at).getHours();
                    hourlyStats[hour].conversations++;
                });
                
                result = hourlyStats;
                break;
                
            case 'user_satisfaction':
                // 用戶滿意度統計
                const satisfactionResponse = await fetch(`${supabaseUrl}/rest/v1/chat_messages?select=is_helpful&message_type=eq.bot&is_helpful=not.is.null`, { headers });
                const satisfactionData = await satisfactionResponse.json();
                
                const helpful = satisfactionData.filter(msg => msg.is_helpful).length;
                const notHelpful = satisfactionData.filter(msg => !msg.is_helpful).length;
                const total = satisfactionData.length;
                const satisfactionRate = total > 0 ? Math.round((helpful / total) * 100) : 0;
                
                result = {
                    helpful,
                    notHelpful,
                    total,
                    satisfactionRate
                };
                break;
                
            case 'blocked_questions_stats':
                // 被攔截問題統計
                const blockedStatsResponse = await fetch(`${supabaseUrl}/rest/v1/blocked_questions?select=*,interaction_filters(filter_name)&order=blocked_at.desc`, { headers });
                const blockedStatsData = await blockedStatsResponse.json();
                
                const filterCounts = {};
                blockedStatsData.forEach(blocked => {
                    const filterName = blocked.interaction_filters?.filter_name || '未知過濾器';
                    filterCounts[filterName] = (filterCounts[filterName] || 0) + 1;
                });
                
                const byFilter = Object.entries(filterCounts)
                    .sort(([,a], [,b]) => b - a)
                    .map(([filter, count]) => ({ filter, count }));
                
                result = {
                    total: blockedStatsData.length,
                    byFilter,
                    recentBlocked: blockedStatsData.slice(0, 10).map(blocked => ({
                        question: blocked.original_question,
                        filter: blocked.interaction_filters?.filter_name || '未知',
                        blockedAt: blocked.blocked_at
                    }))
                };
                break;
                
            default:
                throw new Error(`Unknown analytics action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Analytics service error:', error);

        const errorResponse = {
            error: {
                code: 'ANALYTICS_SERVICE_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});