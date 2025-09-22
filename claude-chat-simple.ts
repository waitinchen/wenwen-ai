// 簡化版的 Claude Chat Edge Function
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
        const { message, sessionId, line_uid } = await req.json();
        
        if (!message) {
            throw new Error('Message is required');
        }

        console.log('收到聊天请求:', { message: message.substring(0, 50), sessionId, line_uid });

        const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
        
        if (!claudeApiKey) {
            throw new Error('Claude API key not configured');
        }

        // 生成或使用現有的session ID
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            currentSessionId = crypto.randomUUID();
        }

        // 系統提示詞
        const systemPrompt = '你是高文文，23歲的高雄女孩，文山特區商圈的專屬客服助理。你活潑、親切、專業，熟悉當地的美食、商店、交通和活動資訊。請友善地協助用戶解答關於商圈的問題。';

        // 調用Claude API
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        if (!claudeResponse.ok) {
            const error = await claudeResponse.text();
            console.error('Claude API error:', error);
            throw new Error('AI服務暫時無法使用，請稍後再試');
        }

        const claudeData = await claudeResponse.json();
        const aiResponse = claudeData.content[0].text;

        const response = {
            response: aiResponse,
            sessionId: currentSessionId,
            timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify({ data: response }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Claude chat error:', error);

        const errorResponse = {
            error: {
                code: 'CLAUDE_CHAT_ERROR',
                message: error.message || '聊天服務暫時無法使用'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

